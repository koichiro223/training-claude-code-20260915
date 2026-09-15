// ドメイン型定義（functional-design.md 2章 / glossary.md 準拠）

/** イベント種別：生活ログと予定で共通 */
export type EventType =
  | "feeding" // 授乳（母乳）
  | "milk" // ミルク
  | "sleepStart" // 睡眠開始
  | "sleepEnd" // 睡眠終了
  | "diaperPee" // おむつ（おしっこ）
  | "diaperPoo" // おむつ（うんち）
  | "bath" // お風呂
  | "temperature" // 体温（value に測定値）
  | "memo"; // メモ（自由記述）

/** 生活ログ記録（1件の実績） */
export interface LogEntry {
  id: string;
  type: EventType;
  occurredAt: string; // ISO8601（UTC基準）
  title?: string;
  value?: number; // 体温など数値を伴う種別
  memo?: string;
  fromScheduleId?: string; // 実績化した場合の元予定ID
  createdAt: string; // ISO8601
  updatedAt: string; // ISO8601
}

/** 予定 */
export interface Schedule {
  id: string;
  type: EventType;
  title: string;
  scheduledAt: string; // ISO8601
  memo?: string;
  done: boolean;
  doneLogId?: string; // 実績化で生成した LogEntry の ID
  createdAt: string; // ISO8601
  updatedAt: string; // ISO8601
}

/** 生活ログの追加/編集入力（id・timestamps を除く） */
export interface LogInput {
  type: EventType;
  occurredAt: string; // ISO8601
  title?: string;
  value?: number;
  memo?: string;
  fromScheduleId?: string;
}

/** 予定の追加/編集入力（id・timestamps・完了状態を除く） */
export interface ScheduleInput {
  type: EventType;
  title: string;
  scheduledAt: string; // ISO8601
  memo?: string;
}
