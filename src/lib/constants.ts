// ドメイン・演出の固定値（development-guidelines.md §10）
import type { EventType } from "@/types";

// --- 永続化キー（functional-design.md 2.4） ---
export const STORAGE_KEYS = {
  logs: "babylog.logs",
  schedules: "babylog.schedules",
  schemaVersion: "babylog.schemaVersion",
} as const;

/** 現行のデータスキーマバージョン */
export const SCHEMA_VERSION = 1;

// --- 入力上限（functional-design.md 5章） ---
export const TITLE_MAX_LENGTH = 100;
export const MEMO_MAX_LENGTH = 500;

// --- 体温の妥当範囲（℃） ---
export const TEMPERATURE_MIN = 30;
export const TEMPERATURE_MAX = 45;

// --- イベント種別の日本語表示（glossary.md 2章） ---
export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  feeding: "授乳（母乳）",
  milk: "ミルク",
  sleepStart: "睡眠開始",
  sleepEnd: "睡眠終了",
  diaperPee: "おむつ（おしっこ）",
  diaperPoo: "おむつ（うんち）",
  bath: "お風呂",
  temperature: "体温",
  memo: "メモ",
};

/** 全イベント種別（select 等の列挙用、表示順） */
export const EVENT_TYPES: EventType[] = [
  "feeding",
  "milk",
  "sleepStart",
  "sleepEnd",
  "diaperPee",
  "diaperPoo",
  "bath",
  "temperature",
  "memo",
];

// --- バルーン遊び（functional-design.md 4.3 / development-guidelines.md 3.1） ---
export const COUNTDOWN_MIN = 3;
export const COUNTDOWN_MAX = 5;

/** バルーン初期直径（px）。発生時は見やすい大きめサイズ */
export const BALLOON_SIZE = 112;

/**
 * カウントダウン中の最大拡大倍率。
 * 発生直後は 1.0（初期サイズ）、破裂直前に BALLOON_MAX_SCALE 倍まで滑らかに膨らむ。
 */
export const BALLOON_MAX_SCALE = 1.6;

export interface BalloonColor {
  name: string;
  /** バルーン背景色（Tailwind クラス相当の実値） */
  background: string;
  /** 背景に対して数字が読めるテキスト色 */
  text: string;
}

/** バルーン色パレット（パステル調。各色で数字が読めるコントラストを確保） */
export const BALLOON_COLORS: BalloonColor[] = [
  { name: "pink", background: "#f9a8d4", text: "#831843" }, // pink-300 / pink-900
  { name: "sky", background: "#7dd3fc", text: "#0c4a6e" }, // sky-300 / sky-900
  { name: "yellow", background: "#fde047", text: "#713f12" }, // yellow-300 / yellow-900
  { name: "green", background: "#86efac", text: "#14532d" }, // green-300 / green-900
  { name: "purple", background: "#d8b4fe", text: "#581c87" }, // purple-300 / purple-900
  { name: "orange", background: "#fdba74", text: "#7c2d12" }, // orange-300 / orange-900
];
