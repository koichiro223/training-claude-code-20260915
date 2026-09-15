"use client";

// 生活ログ 1件表示＋編集/削除操作（design §3 LogListItem）
// 種別ラベル・時刻・メモ（temperature は値℃）を表示。削除は ConfirmModal で確認 → remove。
import { useState } from "react";
import type { LogEntry } from "@/types";
import { EVENT_TYPE_LABELS } from "@/lib/constants";
import { formatTime } from "@/lib/datetime";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface LogListItemProps {
  entry: LogEntry;
  onEdit: (entry: LogEntry) => void;
  onDelete: (id: string) => void;
}

export function LogListItem({ entry, onEdit, onDelete }: LogListItemProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const label = EVENT_TYPE_LABELS[entry.type];
  const hasTemperature =
    entry.type === "temperature" && entry.value !== undefined;

  const handleConfirm = () => {
    setConfirmOpen(false);
    onDelete(entry.id);
  };

  return (
    <li className="rounded-xl bg-white px-4 py-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="font-medium text-slate-800">{label}</span>
            {hasTemperature ? (
              <span className="text-sm font-medium text-slate-600">
                {entry.value}℃
              </span>
            ) : null}
          </div>
          {entry.memo ? (
            <p className="whitespace-pre-wrap break-words text-sm text-slate-500">
              {entry.memo}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <time className="text-sm text-slate-500">
            {formatTime(entry.occurredAt)}
          </time>
          <div className="flex gap-1">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onEdit(entry)}
              aria-label={`${label}の記録を編集`}
            >
              編集
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmOpen(true)}
              aria-label={`${label}の記録を削除`}
              className="text-rose-600 hover:bg-rose-50"
            >
              削除
            </Button>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="記録を削除しますか？"
        message="この操作は取り消せません。"
        confirmLabel="削除する"
        cancelLabel="キャンセル"
        danger
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </li>
  );
}
