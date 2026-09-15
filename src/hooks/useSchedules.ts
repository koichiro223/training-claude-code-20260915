"use client";

// 予定用フック：BabyLogContext を購読（functional-design.md 4.2）
import { useContext, useMemo } from "react";
import { BabyLogContext } from "@/context/BabyLogContext";
import { sortSchedules } from "@/lib/domain/sort";
import type { LogEntry, Schedule, ScheduleInput } from "@/types";

export interface UseSchedules {
  schedules: Schedule[];
  sortedSchedules: Schedule[]; // 未完了 昇順 → 完了 後方
  add: (input: ScheduleInput) => void;
  update: (id: string, patch: Partial<ScheduleInput>) => void;
  remove: (id: string) => void;
  completeAsLog: (scheduleId: string) => void;
  uncomplete: (scheduleId: string) => void;
  /** doneLogId が指すログを返す（存在しなければ undefined） */
  findDoneLog: (schedule: Schedule) => LogEntry | undefined;
  isLoaded: boolean;
}

export function useSchedules(): UseSchedules {
  const ctx = useContext(BabyLogContext);
  if (!ctx) {
    throw new Error("useSchedules must be used within BabyLogProvider");
  }

  const sortedSchedules = useMemo(
    () => sortSchedules(ctx.schedules),
    [ctx.schedules],
  );

  const findDoneLog = (schedule: Schedule): LogEntry | undefined => {
    if (!schedule.doneLogId) return undefined;
    return ctx.logs.find((e) => e.id === schedule.doneLogId);
  };

  return {
    schedules: ctx.schedules,
    sortedSchedules,
    add: ctx.addSchedule,
    update: ctx.updateSchedule,
    remove: ctx.removeSchedule,
    completeAsLog: ctx.completeAsLog,
    uncomplete: ctx.uncomplete,
    findDoneLog,
    isLoaded: ctx.isLoaded,
  };
}
