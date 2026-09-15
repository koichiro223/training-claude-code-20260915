// バルーン遊びの状態機械（functional-design.md 4.3 / glossary.md 3章）
// 画面ローカル・非永続。logs/schedules 状態や Context を一切購読しない。
import { useCallback, useEffect, useRef, useState } from "react";
import {
  BALLOON_COLORS,
  BALLOON_SIZE,
  COUNTDOWN_MAX,
  COUNTDOWN_MIN,
} from "@/lib/constants";
import { generateId } from "@/lib/id";

/** 遊びの状態（idle=未開始 / playing=プレイ中 / stopped=停止後） */
export type BalloonGameState = "idle" | "playing" | "stopped";

/** 非永続のビュー用バルーンモデル。位置は % で持ち領域サイズに依存しない。 */
export interface BalloonModel {
  id: string;
  /** 中心ではなく左上基準の水平位置（0..100 %） */
  xPct: number;
  /** 左上基準の垂直位置（0..100 %） */
  yPct: number;
  /** 直径（px） */
  size: number;
  /** 背景色（実値） */
  color: string;
  /** 数字色（背景に対しコントラスト確保） */
  textColor: string;
  /** 自動破裂の時刻（ms, epoch）。残り秒はここから算出する。 */
  expireAt: number;
  /** 生成時の総寿命（ms, = count*1000）。拡大進捗の分母に使う。 */
  durationMs: number;
}

/** カウントダウン再計算の間隔（ms）。約200〜250ms。 */
const TICK_INTERVAL_MS = 200;

/** バルーンが領域外にはみ出さないための余白（%）。 */
const POSITION_MARGIN_PCT = 8;

export interface UseBalloonGame {
  state: BalloonGameState;
  score: number;
  balloon: BalloonModel | null;
  remaining: number;
  /** 現在バルーンの生成からの経過時間（ms, 0..durationMs にクランプ）。拡大演出に使う。 */
  elapsedMs: number;
  start: () => void;
  stop: () => void;
  popCurrent: (id: string) => void;
}

/** COUNTDOWN_MIN..COUNTDOWN_MAX のランダム整数を返す（呼び出しはイベント/タイマー内のみ）。 */
function randomCount(): number {
  const span = COUNTDOWN_MAX - COUNTDOWN_MIN + 1;
  return COUNTDOWN_MIN + Math.floor(Math.random() * span);
}

/** 0..(100 - 2*margin) の範囲でランダムな座標（%）を返す。 */
function randomPositionPct(): number {
  const range = 100 - POSITION_MARGIN_PCT * 2;
  return POSITION_MARGIN_PCT + Math.random() * range;
}

/** expireAt から残り秒（0以上）を算出する。 */
function calcRemaining(expireAt: number, now: number): number {
  return Math.max(0, Math.ceil((expireAt - now) / 1000));
}

/** 生成からの経過時間（0..durationMs にクランプ）を算出する。 */
function calcElapsed(expireAt: number, durationMs: number, now: number): number {
  const startAt = expireAt - durationMs;
  return Math.min(durationMs, Math.max(0, now - startAt));
}

export function useBalloonGame(): UseBalloonGame {
  const [state, setState] = useState<BalloonGameState>("idle");
  const [score, setScore] = useState(0);
  const [balloon, setBalloon] = useState<BalloonModel | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);

  // stale closure 回避のため ref で最新値を保持する。
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scoreRef = useRef(0);
  const currentIdRef = useRef<string | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // 新しいバルーンを生成する（順序：サイズ→位置→色→カウント→ID）。
  // Date.now()/Math.random() を含むためイベント/タイマー内からのみ呼ぶ。
  const spawnBalloon = useCallback(() => {
    const size = BALLOON_SIZE;
    const xPct = randomPositionPct();
    const yPct = randomPositionPct();
    const palette = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
    const count = randomCount();
    const durationMs = count * 1000;
    const expireAt = Date.now() + durationMs;
    const id = generateId();

    currentIdRef.current = id;
    setBalloon({
      id,
      xPct,
      yPct,
      size,
      color: palette.background,
      textColor: palette.text,
      expireAt,
      durationMs,
    });
    setRemaining(count);
    // 新しいバルーンは初期サイズ（経過0）から膨らみ直す。
    setElapsedMs(0);
  }, []);

  const start = useCallback(() => {
    clearTimer();
    scoreRef.current = 0;
    setScore(0);
    setState("playing");
    spawnBalloon();
  }, [clearTimer, spawnBalloon]);

  const stop = useCallback(() => {
    clearTimer();
    currentIdRef.current = null;
    setBalloon(null);
    setElapsedMs(0);
    setState("stopped");
  }, [clearTimer]);

  // タップ破裂：現在バルーンID一致時のみ加点して次を生成（競合防止）。
  const popCurrent = useCallback(
    (id: string) => {
      if (currentIdRef.current !== id) return;
      scoreRef.current += 1;
      setScore(scoreRef.current);
      spawnBalloon();
    },
    [spawnBalloon],
  );

  // playing 中のみ時刻ベースでカウントダウンを回す。
  useEffect(() => {
    if (state !== "playing") return;

    const tick = () => {
      const current = balloon;
      if (current === null || currentIdRef.current !== current.id) return;
      const now = Date.now();
      const rem = calcRemaining(current.expireAt, now);
      setRemaining(rem);
      // 時刻ベースの経過時間を更新し、拡大演出を滑らかに進める。
      setElapsedMs(calcElapsed(current.expireAt, current.durationMs, now));
      if (rem <= 0) {
        // 自動破裂：スコア加算なしで次を生成。
        spawnBalloon();
      }
    };

    timerRef.current = setInterval(tick, TICK_INTERVAL_MS);
    return () => {
      clearTimer();
    };
  }, [state, balloon, spawnBalloon, clearTimer]);

  // アンマウント時にタイマー解除（プレイ中の画面離脱で自動終了・スコア非保持）。
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return { state, score, balloon, remaining, elapsedMs, start, stop, popCurrent };
}
