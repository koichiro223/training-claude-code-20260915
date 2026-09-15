// 並べ替えの純粋関数（functional-design.md 4.1 / 4.2）
import type { LogEntry, Schedule } from "@/types";

/** 生活ログを occurredAt の降順（新しい順）で返す（非破壊） */
export function sortByOccurredAtDesc(entries: LogEntry[]): LogEntry[] {
  return [...entries].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );
}

/**
 * 予定を「未完了（scheduledAt 昇順）→ 完了（scheduledAt 降順）」の順で返す（非破壊）。
 */
export function sortSchedules(schedules: Schedule[]): Schedule[] {
  const pending = schedules
    .filter((s) => !s.done)
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );
  const done = schedules
    .filter((s) => s.done)
    .sort(
      (a, b) =>
        new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
    );
  return [...pending, ...done];
}
