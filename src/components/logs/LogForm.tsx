"use client";

// 生活ログ 追加/編集フォーム（design §3 LogForm）
// 種別 select / 日時 datetime-local（既定=マウント後の現在時刻）/ メモ / 体温数値欄（temperature 時）。
// 送信時に logFormSchema でバリデーション。add / update の呼び分けは呼び出し側に委譲。
import { useEffect, useId, useMemo, useState } from "react";
import type { EventType, LogEntry, LogInput } from "@/types";
import { EVENT_TYPES, EVENT_TYPE_LABELS, MEMO_MAX_LENGTH } from "@/lib/constants";
import { toDatetimeLocalValue } from "@/lib/datetime";
import { Button } from "@/components/ui/Button";
import {
  validateLogForm,
  type LogFormErrors,
  type LogFormValues,
} from "@/components/logs/logFormSchema";

interface LogFormProps {
  /** 編集対象。未指定なら新規追加フォーム。 */
  entry?: LogEntry;
  /** バリデーション済み入力を親へ渡す（add / update は親が実行） */
  onSubmit: (input: LogInput) => void;
  onCancel: () => void;
}

function buildInitialValues(entry?: LogEntry): LogFormValues {
  return {
    type: entry?.type ?? "feeding",
    // 新規時はマウント後に現在時刻を設定（SSR不整合回避のため空で開始）
    occurredAtLocal: entry ? toDatetimeLocalValue(entry.occurredAt) : "",
    value: entry?.value !== undefined ? String(entry.value) : "",
    memo: entry?.memo ?? "",
  };
}

export function LogForm({ entry, onSubmit, onCancel }: LogFormProps) {
  const isEdit = entry !== undefined;
  const [values, setValues] = useState<LogFormValues>(() =>
    buildInitialValues(entry),
  );
  const [errors, setErrors] = useState<LogFormErrors>({});

  const fieldId = useId();
  const typeId = `${fieldId}-type`;
  const occurredAtId = `${fieldId}-occurredAt`;
  const valueId = `${fieldId}-value`;
  const memoId = `${fieldId}-memo`;

  // 新規追加時、日時の既定値は現在時刻。new Date() は render 中に呼ばず、
  // マウント後に useEffect で設定する（SSR不整合 / react-hooks/purity 回避）。
  useEffect(() => {
    if (isEdit) return;
    // 現在時刻はブラウザ専用値のためマウント後に設定（SSR不整合回避）。
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValues((prev) => ({
      ...prev,
      occurredAtLocal: toDatetimeLocalValue(new Date().toISOString()),
    }));
  }, [isEdit]);

  const isTemperature = values.type === "temperature";
  const memoLength = useMemo(() => values.memo.length, [values.memo]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = validateLogForm(values);
    if (!result.ok || !result.input) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    onSubmit(result.input);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      noValidate
    >
      <h2 className="text-base font-semibold text-slate-700">
        {isEdit ? "記録を編集" : "記録を追加"}
      </h2>

      {/* 種別 */}
      <div className="space-y-1">
        <label htmlFor={typeId} className="block text-sm font-medium text-slate-700">
          種別
        </label>
        <select
          id={typeId}
          value={values.type}
          onChange={(e) =>
            setValues((prev) => ({
              ...prev,
              type: e.target.value as EventType,
            }))
          }
          className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
        >
          {EVENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {EVENT_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>

      {/* 日時 */}
      <div className="space-y-1">
        <label
          htmlFor={occurredAtId}
          className="block text-sm font-medium text-slate-700"
        >
          日時
        </label>
        <input
          id={occurredAtId}
          type="datetime-local"
          value={values.occurredAtLocal}
          onChange={(e) =>
            setValues((prev) => ({ ...prev, occurredAtLocal: e.target.value }))
          }
          aria-invalid={errors.occurredAtLocal ? true : undefined}
          aria-describedby={
            errors.occurredAtLocal ? `${occurredAtId}-error` : undefined
          }
          className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
        />
        {errors.occurredAtLocal ? (
          <p id={`${occurredAtId}-error`} className="text-xs text-rose-600">
            {errors.occurredAtLocal}
          </p>
        ) : null}
      </div>

      {/* 体温（temperature 時のみ） */}
      {isTemperature ? (
        <div className="space-y-1">
          <label
            htmlFor={valueId}
            className="block text-sm font-medium text-slate-700"
          >
            体温（℃）
          </label>
          <input
            id={valueId}
            type="number"
            inputMode="decimal"
            step="0.1"
            value={values.value}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, value: e.target.value }))
            }
            aria-invalid={errors.value ? true : undefined}
            aria-describedby={errors.value ? `${valueId}-error` : undefined}
            className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
          {errors.value ? (
            <p id={`${valueId}-error`} className="text-xs text-rose-600">
              {errors.value}
            </p>
          ) : null}
        </div>
      ) : null}

      {/* メモ */}
      <div className="space-y-1">
        <label htmlFor={memoId} className="block text-sm font-medium text-slate-700">
          メモ（任意）
        </label>
        <textarea
          id={memoId}
          value={values.memo}
          onChange={(e) =>
            setValues((prev) => ({ ...prev, memo: e.target.value }))
          }
          rows={3}
          maxLength={MEMO_MAX_LENGTH}
          aria-invalid={errors.memo ? true : undefined}
          aria-describedby={errors.memo ? `${memoId}-error` : undefined}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
        />
        <div className="flex items-center justify-between">
          {errors.memo ? (
            <p id={`${memoId}-error`} className="text-xs text-rose-600">
              {errors.memo}
            </p>
          ) : (
            <span />
          )}
          <span className="text-xs text-slate-400">
            {memoLength}/{MEMO_MAX_LENGTH}
          </span>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-1">
        <Button type="button" variant="secondary" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit" variant="primary">
          {isEdit ? "更新" : "追加"}
        </Button>
      </div>
    </form>
  );
}
