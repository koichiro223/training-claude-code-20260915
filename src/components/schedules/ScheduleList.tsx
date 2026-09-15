"use client";

// 予定一覧（未完了昇順 → 完了後方。design.md §3）
import { ScheduleListItem } from "@/components/schedules/ScheduleListItem";
import type { LogEntry, Schedule } from "@/types";

interface ScheduleListProps {
  /** sortedSchedules（未完了 scheduledAt 昇順 → 完了 後方） */
  schedules: Schedule[];
  /** マウント後に取得した現在時刻（ms） */
  now: number | null;
  onComplete: (id: string) => void;
  onUncomplete: (id: string) => void;
  onEdit: (schedule: Schedule) => void;
  onRemove: (id: string) => void;
  /** 予定に対応する実績ログを引く */
  findDoneLog: (schedule: Schedule) => LogEntry | undefined;
}

export function ScheduleList({
  schedules,
  now,
  onComplete,
  onUncomplete,
  onEdit,
  onRemove,
  findDoneLog,
}: ScheduleListProps) {
  return (
    <ul className="space-y-2">
      {schedules.map((schedule) => (
        <ScheduleListItem
          key={schedule.id}
          schedule={schedule}
          now={now}
          onComplete={onComplete}
          onUncomplete={onUncomplete}
          onEdit={onEdit}
          onRemove={onRemove}
          doneLog={findDoneLog(schedule)}
        />
      ))}
    </ul>
  );
}
