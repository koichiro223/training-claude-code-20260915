// 実績化変換の純粋関数（functional-design.md 4.2）
import type { LogEntry, Schedule } from "@/types";

/**
 * 予定から実績（LogEntry）を生成する。
 * - type / title / memo は予定を引き継ぐ
 * - occurredAt は実施時刻（タップ時刻）
 * - fromScheduleId に元予定IDを保持
 */
export function buildLogFromSchedule(
  schedule: Schedule,
  now: string,
  newId: string,
): LogEntry {
  return {
    id: newId,
    type: schedule.type,
    occurredAt: now,
    title: schedule.title,
    memo: schedule.memo,
    fromScheduleId: schedule.id,
    createdAt: now,
    updatedAt: now,
  };
}
