"use client";

// 1つのバルーン（functional-design.md 4.3）。円形・背景色・中央に残り数字。
// タップで onPop(id)。破裂は穏やかなアニメーション（激しい点滅を避ける）。
import { useEffect, useState } from "react";
import type { BalloonModel } from "@/hooks/useBalloonGame";
import { BALLOON_MAX_SCALE } from "@/lib/constants";

interface BalloonProps {
  balloon: BalloonModel;
  remaining: number;
  /** 生成からの経過時間（ms, 0..durationMs）。拡大進捗の算出に使う。 */
  elapsedMs: number;
  onPop: (id: string) => void;
}

export function Balloon({ balloon, remaining, elapsedMs, onPop }: BalloonProps) {
  // マウント直後に穏やかな出現アニメーション（scale/opacity）を有効化する。
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    // 出現演出のトリガ。render 中の setState を避けマウント後に設定する。
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEntered(true);
  }, []);

  // カウントダウン中に膨らむ演出：時刻ベースの経過割合から拡大倍率を算出する。
  // progress=0（発生直後）→ 1.0倍、progress=1（破裂直前）→ BALLOON_MAX_SCALE倍。
  const progress =
    balloon.durationMs > 0
      ? Math.min(1, Math.max(0, elapsedMs / balloon.durationMs))
      : 0;
  const growScale = 1 + (BALLOON_MAX_SCALE - 1) * progress;
  // 出現演出（entered）と肥大化演出（growScale）を掛け合わせる。
  const scale = (entered ? 1 : 0.85) * growScale;

  return (
    <button
      type="button"
      onClick={() => onPop(balloon.id)}
      aria-label={`バルーン 残り${remaining}`}
      className="absolute rounded-full shadow-md ring-2 ring-white/60 transition duration-200 ease-out focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-400 motion-reduce:transition-none"
      style={{
        left: `${balloon.xPct}%`,
        top: `${balloon.yPct}%`,
        width: `${balloon.size}px`,
        height: `${balloon.size}px`,
        backgroundColor: balloon.color,
        color: balloon.textColor,
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity: entered ? 1 : 0,
      }}
    >
      <span
        aria-hidden="true"
        className="flex h-full w-full items-center justify-center text-4xl font-bold tabular-nums select-none"
      >
        {remaining}
      </span>
    </button>
  );
}
