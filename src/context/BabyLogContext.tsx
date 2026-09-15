"use client";

// アプリ全体の単一状態源（functional-design.md 1章 / architecture.md 2.3）
// logs / schedules を保持し、localStorage と同期する。
import {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { LogEntry, LogInput, Schedule, ScheduleInput } from "@/types";
import { generateId } from "@/lib/id";
import { nowIso } from "@/lib/datetime";
import { buildLogFromSchedule } from "@/lib/domain/complete";
import {
  loadLogs,
  loadSchedules,
  saveLogs,
  saveSchedules,
} from "@/lib/storage";
import { STORAGE_KEYS } from "@/lib/constants";

/** 通知（読み込み/保存失敗など）1件 */
export interface Notice {
  id: string;
  kind: "error" | "info";
  message: string;
}

export interface BabyLogContextValue {
  logs: LogEntry[];
  schedules: Schedule[];
  isLoaded: boolean;
  notices: Notice[];
  dismissNotice: (id: string) => void;
  // logs 操作
  addLog: (input: LogInput) => void;
  updateLog: (id: string, patch: Partial<LogInput>) => void;
  removeLog: (id: string) => void;
  // schedules 操作
  addSchedule: (input: ScheduleInput) => void;
  updateSchedule: (id: string, patch: Partial<ScheduleInput>) => void;
  removeSchedule: (id: string) => void;
  completeAsLog: (scheduleId: string) => void;
  uncomplete: (scheduleId: string) => void;
}

export const BabyLogContext = createContext<BabyLogContextValue | null>(null);

export function BabyLogProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);

  // 保存済みか（破損時は保存を抑止するためのフラグ）
  const canPersistRef = useRef(true);

  const pushNotice = useCallback((kind: Notice["kind"], message: string) => {
    setNotices((prev) => [...prev, { id: generateId(), kind, message }]);
  }, []);

  const dismissNotice = useCallback((id: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // localStorage から読み込む（マウント後・SSR不整合回避）
  const loadAll = useCallback(() => {
    const logsRes = loadLogs();
    const schedulesRes = loadSchedules();
    setLogs(logsRes.data);
    setSchedules(schedulesRes.data);
    if (!logsRes.ok || !schedulesRes.ok) {
      // 破損等は上書きしないよう保存を抑止し、通知する
      canPersistRef.current = false;
      pushNotice(
        "error",
        logsRes.reason ??
          schedulesRes.reason ??
          "データの読み込みに失敗しました。",
      );
    } else {
      canPersistRef.current = true;
    }
    setIsLoaded(true);
  }, [pushNotice]);

  useEffect(() => {
    // localStorage はブラウザ専用のためマウント後に読み込む（SSR不整合回避）。
    // 初期 state を localStorage に同期させる意図的な setState。
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAll();
  }, [loadAll]);

  // 別タブでの更新に追従
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (
        e.key === STORAGE_KEYS.logs ||
        e.key === STORAGE_KEYS.schedules ||
        e.key === STORAGE_KEYS.schemaVersion ||
        e.key === null
      ) {
        loadAll();
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [loadAll]);

  // logs を保存（失敗時はロールバックして通知）
  const persistLogs = useCallback(
    (next: LogEntry[], prev: LogEntry[]) => {
      if (!canPersistRef.current) return;
      const res = saveLogs(next);
      if (!res.ok) {
        setLogs(prev);
        pushNotice("error", res.reason ?? "保存に失敗しました。");
      }
    },
    [pushNotice],
  );

  const persistSchedules = useCallback(
    (next: Schedule[], prev: Schedule[]) => {
      if (!canPersistRef.current) return;
      const res = saveSchedules(next);
      if (!res.ok) {
        setSchedules(prev);
        pushNotice("error", res.reason ?? "保存に失敗しました。");
      }
    },
    [pushNotice],
  );

  // --- logs 操作 ---
  const addLog = useCallback(
    (input: LogInput) => {
      const now = nowIso();
      const entry: LogEntry = {
        ...input,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };
      setLogs((prev) => {
        const next = [...prev, entry];
        persistLogs(next, prev);
        return next;
      });
    },
    [persistLogs],
  );

  const updateLog = useCallback(
    (id: string, patch: Partial<LogInput>) => {
      setLogs((prev) => {
        const next = prev.map((e) =>
          e.id === id ? { ...e, ...patch, updatedAt: nowIso() } : e,
        );
        persistLogs(next, prev);
        return next;
      });
    },
    [persistLogs],
  );

  const removeLog = useCallback(
    (id: string) => {
      // 実績化されたログなら、対応する予定を未完了に戻す（参照整合性 2.6）
      const target = logs.find((e) => e.id === id);
      const fromScheduleId = target?.fromScheduleId;

      setLogs((prev) => {
        const next = prev.filter((e) => e.id !== id);
        persistLogs(next, prev);
        return next;
      });

      if (fromScheduleId) {
        setSchedules((prev) => {
          const next = prev.map((s) =>
            s.id === fromScheduleId
              ? { ...s, done: false, doneLogId: undefined, updatedAt: nowIso() }
              : s,
          );
          persistSchedules(next, prev);
          return next;
        });
      }
    },
    [logs, persistLogs, persistSchedules],
  );

  // --- schedules 操作 ---
  const addSchedule = useCallback(
    (input: ScheduleInput) => {
      const now = nowIso();
      const schedule: Schedule = {
        ...input,
        id: generateId(),
        done: false,
        createdAt: now,
        updatedAt: now,
      };
      setSchedules((prev) => {
        const next = [...prev, schedule];
        persistSchedules(next, prev);
        return next;
      });
    },
    [persistSchedules],
  );

  const updateSchedule = useCallback(
    (id: string, patch: Partial<ScheduleInput>) => {
      setSchedules((prev) => {
        const next = prev.map((s) =>
          s.id === id ? { ...s, ...patch, updatedAt: nowIso() } : s,
        );
        persistSchedules(next, prev);
        return next;
      });
    },
    [persistSchedules],
  );

  const removeSchedule = useCallback(
    (id: string) => {
      setSchedules((prev) => {
        const next = prev.filter((s) => s.id !== id);
        persistSchedules(next, prev);
        return next;
      });
    },
    [persistSchedules],
  );

  // 実績化：logs と schedules を 1 アクションでまとめて更新（4.2）
  const completeAsLog = useCallback(
    (scheduleId: string) => {
      const schedule = schedules.find((s) => s.id === scheduleId);
      if (!schedule || schedule.done) return;

      const now = nowIso();
      const logId = generateId();
      const entry = buildLogFromSchedule(schedule, now, logId);

      setLogs((prev) => {
        const next = [...prev, entry];
        persistLogs(next, prev);
        return next;
      });
      setSchedules((prev) => {
        const next = prev.map((s) =>
          s.id === scheduleId
            ? { ...s, done: true, doneLogId: logId, updatedAt: now }
            : s,
        );
        persistSchedules(next, prev);
        return next;
      });
    },
    [schedules, persistLogs, persistSchedules],
  );

  // 完了取り消し：対応ログを削除してから参照をクリア（4.2 / 2.6）
  const uncomplete = useCallback(
    (scheduleId: string) => {
      const schedule = schedules.find((s) => s.id === scheduleId);
      if (!schedule || !schedule.done) return;
      const logId = schedule.doneLogId;

      if (logId) {
        setLogs((prev) => {
          const next = prev.filter((e) => e.id !== logId);
          persistLogs(next, prev);
          return next;
        });
      }
      setSchedules((prev) => {
        const next = prev.map((s) =>
          s.id === scheduleId
            ? { ...s, done: false, doneLogId: undefined, updatedAt: nowIso() }
            : s,
        );
        persistSchedules(next, prev);
        return next;
      });
    },
    [schedules, persistLogs, persistSchedules],
  );

  const value: BabyLogContextValue = {
    logs,
    schedules,
    isLoaded,
    notices,
    dismissNotice,
    addLog,
    updateLog,
    removeLog,
    addSchedule,
    updateSchedule,
    removeSchedule,
    completeAsLog,
    uncomplete,
  };

  return (
    <BabyLogContext.Provider value={value}>{children}</BabyLogContext.Provider>
  );
}
