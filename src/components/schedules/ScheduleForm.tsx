"use client";

// 予定の追加/編集フォーム（design.md §3）
import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { EVENT_TYPES, EVENT_TYPE_LABELS, TITLE_MAX_LENGTH, MEMO_MAX_LENGTH } from "@/lib/constants";
import { nowIso, toDatetimeLocalValue } from "@/lib/datetime";
import type { EventType, Schedule, ScheduleInput } from "@/types";
import {
  validateScheduleForm,
  type ScheduleFormErrors,
} from "@/components/schedules/scheduleFormSchema";

interface ScheduleFormProps {
  /** 編集対象。未指定なら新規追加 */
  schedule?: Schedule;
  onSubmit: (input: ScheduleInput) => void;
  onCancel: () => void;
}

export function ScheduleForm({ schedule, onSubmit, onCancel }: ScheduleFormProps) {
  const isEdit = schedule !== undefined;
  const fieldId = useId();

  const [type, setType] = useState<EventType>(schedule?.type ?? EVENT_TYPES[0]);
  const [title, setTitle] = useState(schedule?.title ?? "");
  const [scheduledAtLocal, setScheduledAtLocal] = useState(
    schedule ? toDatetimeLocalValue(schedule.scheduledAt) : "",
  );
  const [memo, setMemo] = useState(schedule?.memo ?? "");
  const [errors, setErrors] = useState<ScheduleFormErrors>({});

  // 新規時の既定日時は現在時刻。ブラウザ専用値のためマウント後に設定（SSR不整合回避）。
  useEffect(() => {
    if (schedule) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setScheduledAtLocal(toDatetimeLocalValue(nowIso()));
  }, [schedule]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = validateScheduleForm({ type, title, scheduledAtLocal, memo });
    if (!result.ok || !result.input) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    onSubmit(result.input);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-4 shadow-sm" noValidate>
      <h2 className="text-base font-semibold text-slate-700">
        {isEdit ? "予定を編集" : "予定を追加"}
      </h2>

      {/* 種別 */}
      <div className="space-y-1">
        <label htmlFor={`${fieldId}-type`} className="block text-sm font-medium text-slate-600">
          種別
        </label>
        <select
          id={`${fieldId}-type`}
          value={type}
          onChange={(e) => setType(e.target.value as EventType)}
          className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
        >
          {EVENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {EVENT_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>

      {/* タイトル */}
      <div className="space-y-1">
        <label htmlFor={`${fieldId}-title`} className="block text-sm font-medium text-slate-600">
          タイトル
          <span className="ml-1 text-rose-600" aria-hidden="true">
            *
          </span>
        </label>
        <input
          id={`${fieldId}-title`}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={TITLE_MAX_LENGTH}
          required
          aria-required="true"
          aria-invalid={errors.title ? "true" : undefined}
          aria-describedby={errors.title ? `${fieldId}-title-error` : undefined}
          className="min-h-11 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
        />
        {errors.title ? (
          <p id={`${fieldId}-title-error`} className="text-sm text-rose-600">
            {errors.title}
          </p>
        ) : null}
      </div>

      {/* 日時 */}
      <div className="space-y-1">
        <label htmlFor={`${fieldId}-datetime`} className="block text-sm font-medium text-slate-600">
          日時
          <span className="ml-1 text-rose-600" aria-hidden="true">
            *
          </span>
        </label>
        <input
          id={`${fieldId}-datetime`}
          type="datetime-local"
          value={scheduledAtLocal}
          onChange={(e) => setScheduledAtLocal(e.target.value)}
          required
          aria-required="true"
          aria-invalid={errors.scheduledAtLocal ? "true" : undefined}
          aria-describedby={
            errors.scheduledAtLocal ? `${fieldId}-datetime-error` : undefined
          }
          className="min-h-11 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
        />
        {errors.scheduledAtLocal ? (
          <p id={`${fieldId}-datetime-error`} className="text-sm text-rose-600">
            {errors.scheduledAtLocal}
          </p>
        ) : null}
      </div>

      {/* メモ */}
      <div className="space-y-1">
        <label htmlFor={`${fieldId}-memo`} className="block text-sm font-medium text-slate-600">
          メモ
        </label>
        <textarea
          id={`${fieldId}-memo`}
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          maxLength={MEMO_MAX_LENGTH}
          rows={3}
          aria-invalid={errors.memo ? "true" : undefined}
          aria-describedby={errors.memo ? `${fieldId}-memo-error` : undefined}
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
        />
        {errors.memo ? (
          <p id={`${fieldId}-memo-error`} className="text-sm text-rose-600">
            {errors.memo}
          </p>
        ) : null}
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit" variant="primary">
          {isEdit ? "保存" : "追加"}
        </Button>
      </div>
    </form>
  );
}
