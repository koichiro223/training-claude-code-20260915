"use client";

// 予定1件の表示＋実績化/取消/編集/削除（design.md §3）
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { EVENT_TYPE_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/datetime";
import type { LogEntry, Schedule } from "@/types";

interface ScheduleListItemProps {
  schedule: Schedule;
  /** マウント後に取得した現在時刻（ms）。null の間は遅れ判定しない */
  now: number | null;
  onComplete: (id: string) => void;
  onUncomplete: (id: string) => void;
  onEdit: (schedule: Schedule) => void;
  onRemove: (id: string) => void;
  /** 対応する実績ログ（存在すれば） */
  doneLog?: LogEntry;
}

export function ScheduleListItem({
  schedule,
  now,
  onComplete,
  onUncomplete,
  onEdit,
  onRemove,
  doneLog,
}: ScheduleListItemProps) {
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [confirmUncomplete, setConfirmUncomplete] = useState(false);

  const overdue =
    !schedule.done &&
    now !== null &&
    new Date(schedule.scheduledAt).getTime() < now;

  // 実績化後にログが編集されている場合は取り消しで警告
  const logEdited =
    doneLog !== undefined && doneLog.updatedAt > doneLog.createdAt;

  return (
    <li
      className={`rounded-xl border px-4 py-3 shadow-sm ${
        schedule.done
          ? "border-slate-200 bg-slate-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700">
              {EVENT_TYPE_LABELS[schedule.type]}
            </span>
            {schedule.done ? (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                完了
              </span>
            ) : null}
            {overdue ? (
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700">
                遅れ
              </span>
            ) : null}
          </div>
          <p
            className={`mt-1 font-medium ${
              schedule.done ? "text-slate-500 line-through" : "text-slate-800"
            }`}
          >
            {schedule.title}
          </p>
          <time className="text-sm text-slate-500">
            {formatDateTime(schedule.scheduledAt)}
          </time>
          {schedule.memo ? (
            <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-600">
              {schedule.memo}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap justify-end gap-2">
        {schedule.done ? (
          <Button
            variant="secondary"
            onClick={() => setConfirmUncomplete(true)}
          >
            完了を取り消す
          </Button>
        ) : (
          <Button variant="primary" onClick={() => onComplete(schedule.id)}>
            実績にする
          </Button>
        )}
        <Button variant="ghost" onClick={() => onEdit(schedule)}>
          編集
        </Button>
        <Button variant="ghost" onClick={() => setConfirmRemove(true)}>
          削除
        </Button>
      </div>

      <ConfirmModal
        open={confirmRemove}
        title="予定を削除しますか？"
        message={`「${schedule.title}」を削除します。この操作は取り消せません。`}
        confirmLabel="削除する"
        danger
        onConfirm={() => {
          setConfirmRemove(false);
          onRemove(schedule.id);
        }}
        onCancel={() => setConfirmRemove(false)}
      />

      <ConfirmModal
        open={confirmUncomplete}
        title="完了を取り消しますか？"
        message={
          logEdited
            ? "この予定から作成した生活ログは実績化後に編集されています。取り消すと、その生活ログは削除されます。"
            : "取り消すと、この予定から作成した生活ログは削除されます。"
        }
        confirmLabel="取り消す"
        danger
        onConfirm={() => {
          setConfirmUncomplete(false);
          onUncomplete(schedule.id);
        }}
        onCancel={() => setConfirmUncomplete(false)}
      />
    </li>
  );
}
