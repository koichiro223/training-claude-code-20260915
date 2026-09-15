// 生活ログ追加/編集フォームのバリデーション（純粋関数）
// requirements §4 / design §5 / functional-design.md 5章 準拠。
// 日時：必須・パース可能（未来許容） / 体温：temperature 時は数値必須・30〜45℃ / メモ：最大500字。
import type { EventType, LogInput } from "@/types";
import {
  MEMO_MAX_LENGTH,
  TEMPERATURE_MIN,
  TEMPERATURE_MAX,
} from "@/lib/constants";
import { fromDatetimeLocalValue } from "@/lib/datetime";

/** フォームの生入力（UI が保持する文字列ベースの値） */
export interface LogFormValues {
  type: EventType;
  /** <input type="datetime-local"> の値（YYYY-MM-DDTHH:mm） */
  occurredAtLocal: string;
  /** 体温などの数値入力欄（文字列で保持） */
  value: string;
  memo: string;
}

/** フィールド単位のエラーメッセージ（日本語） */
export interface LogFormErrors {
  occurredAtLocal?: string;
  value?: string;
  memo?: string;
}

export interface LogFormValidationResult {
  /** エラーがなければ true */
  ok: boolean;
  errors: LogFormErrors;
  /** ok が true のときのみ、useLogEntries に渡せる入力を返す */
  input?: LogInput;
}

/**
 * フォーム値を検証し、問題なければ LogInput を組み立てて返す純粋関数。
 * 副作用なし・現在時刻に依存しない（未来日時も許容する）。
 */
export function validateLogForm(values: LogFormValues): LogFormValidationResult {
  const errors: LogFormErrors = {};

  // --- 日時：必須・パース可能 ---
  const occurredAt = fromDatetimeLocalValue(values.occurredAtLocal);
  if (!values.occurredAtLocal.trim()) {
    errors.occurredAtLocal = "日時を入力してください。";
  } else if (occurredAt === null) {
    errors.occurredAtLocal = "日時の形式が正しくありません。";
  }

  // --- 体温：temperature のときのみ数値必須・妥当範囲 ---
  let value: number | undefined;
  if (values.type === "temperature") {
    const raw = values.value.trim();
    if (!raw) {
      errors.value = "体温を入力してください。";
    } else {
      const parsed = Number(raw);
      if (!Number.isFinite(parsed)) {
        errors.value = "体温は数値で入力してください。";
      } else if (parsed < TEMPERATURE_MIN || parsed > TEMPERATURE_MAX) {
        errors.value = `体温は${TEMPERATURE_MIN}〜${TEMPERATURE_MAX}℃の範囲で入力してください。`;
      } else {
        value = parsed;
      }
    }
  }

  // --- メモ：任意・最大500字 ---
  const memo = values.memo.trim();
  if (memo.length > MEMO_MAX_LENGTH) {
    errors.memo = `メモは${MEMO_MAX_LENGTH}文字以内で入力してください。`;
  }

  const ok = Object.keys(errors).length === 0;
  if (!ok || occurredAt === null) {
    return { ok: false, errors };
  }

  const input: LogInput = {
    type: values.type,
    occurredAt,
  };
  if (value !== undefined) {
    input.value = value;
  }
  if (memo) {
    input.memo = memo;
  }

  return { ok: true, errors: {}, input };
}
