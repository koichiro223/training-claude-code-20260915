"use client";

// 生活ログ用フック：BabyLogContext を購読（functional-design.md 4.1）
import { useContext, useMemo } from "react";
import { BabyLogContext } from "@/context/BabyLogContext";
import { sortByOccurredAtDesc } from "@/lib/domain/sort";
import type { LogEntry, LogInput } from "@/types";

export interface UseLogEntries {
  entries: LogEntry[];
  sortedEntries: LogEntry[]; // occurredAt 降順
  add: (input: LogInput) => void;
  update: (id: string, patch: Partial<LogInput>) => void;
  remove: (id: string) => void;
  isLoaded: boolean;
}

export function useLogEntries(): UseLogEntries {
  const ctx = useContext(BabyLogContext);
  if (!ctx) {
    throw new Error("useLogEntries must be used within BabyLogProvider");
  }

  const sortedEntries = useMemo(
    () => sortByOccurredAtDesc(ctx.logs),
    [ctx.logs],
  );

  return {
    entries: ctx.logs,
    sortedEntries,
    add: ctx.addLog,
    update: ctx.updateLog,
    remove: ctx.removeLog,
    isLoaded: ctx.isLoaded,
  };
}
