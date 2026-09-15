// 予定フォームのバリデーション（純粋関数）
// requirements/design §5：タイトル必須・トリム・最大100字、日時必須・パース可能（過去許容）、メモ最大500字。
import type { EventType, ScheduleInput } from "@/types";
import { fromDatetimeLocalValue, isValidDateTime } from "@/lib/datetime";
import { TITLE_MAX_LENGTH, MEMO_MAX_LENGTH } from "@/lib/constants";

/** フォームの生の入力値（画面の入力欄と1対1） */
export interface ScheduleFormValues {
  type: EventType;
  title: string;
  /** <input type="datetime-local"> の値（ローカル "YYYY-MM-DDTHH:mm"） */
  scheduledAtLocal: string;
  memo: string;
}

/** フィールドごとのエラーメッセージ（日本語） */
export interface ScheduleFormErrors {
  title?: string;
  scheduledAtLocal?: string;
  memo?: string;
}

export interface ScheduleValidationResult {
  /** エラーがなければ ScheduleInput（保存可能な形）を返す */
  input?: ScheduleInput;
  errors: ScheduleFormErrors;
  ok: boolean;
}

/**
 * フォーム入力を検証し、問題なければ保存用の ScheduleInput を返す純粋関数。
 * 日時はローカル値を ISO8601 に変換する。過去日時は許容する。
 */
export function validateScheduleForm(
  values: ScheduleFormValues,
): ScheduleValidationResult {
  const errors: ScheduleFormErrors = {};

  // タイトル：前後トリム・必須・最大100字
  const title = values.title.trim();
  if (title.length === 0) {
    errors.title = "タイトルを入力してください。";
  } else if (title.length > TITLE_MAX_LENGTH) {
    errors.title = `タイトルは${TITLE_MAX_LENGTH}文字以内で入力してください。`;
  }

  // 日時：必須・パース可能（過去許容）
  let scheduledAt: string | null = null;
  if (!values.scheduledAtLocal) {
    errors.scheduledAtLocal = "日時を入力してください。";
  } else {
    scheduledAt = fromDatetimeLocalValue(values.scheduledAtLocal);
    if (scheduledAt === null || !isValidDateTime(scheduledAt)) {
      errors.scheduledAtLocal = "日時の形式が正しくありません。";
    }
  }

  // メモ：任意・最大500字
  const memoTrimmed = values.memo.trim();
  if (memoTrimmed.length > MEMO_MAX_LENGTH) {
    errors.memo = `メモは${MEMO_MAX_LENGTH}文字以内で入力してください。`;
  }

  const ok = Object.keys(errors).length === 0;
  if (!ok || scheduledAt === null) {
    return { errors, ok: false };
  }

  const input: ScheduleInput = {
    type: values.type,
    title,
    scheduledAt,
    ...(memoTrimmed.length > 0 ? { memo: memoTrimmed } : {}),
  };

  return { input, errors, ok: true };
}
