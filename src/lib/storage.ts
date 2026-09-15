// localStorage ラッパ（functional-design.md 5章 / architecture.md 2.3）
// 破損データ・スキーマ不一致・未知バージョンは「空として扱い、上書き保存しない」。
import type { EventType, LogEntry, Schedule } from "@/types";
import { SCHEMA_VERSION, STORAGE_KEYS } from "@/lib/constants";

/** 読み込み結果。ok=false の場合は破損等で読めなかったことを示す（自動上書きしない） */
export interface LoadResult<T> {
  ok: boolean;
  data: T;
  reason?: string;
}

const EVENT_TYPES: EventType[] = [
  "feeding",
  "milk",
  "sleepStart",
  "sleepEnd",
  "diaperPee",
  "diaperPoo",
  "bath",
  "temperature",
  "memo",
];

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function isEventType(v: unknown): v is EventType {
  return typeof v === "string" && (EVENT_TYPES as string[]).includes(v);
}

function isString(v: unknown): v is string {
  return typeof v === "string";
}

function isLogEntry(v: unknown): v is LogEntry {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    isString(o.id) &&
    isEventType(o.type) &&
    isString(o.occurredAt) &&
    isString(o.createdAt) &&
    isString(o.updatedAt) &&
    (o.title === undefined || isString(o.title)) &&
    (o.value === undefined || typeof o.value === "number") &&
    (o.memo === undefined || isString(o.memo)) &&
    (o.fromScheduleId === undefined || isString(o.fromScheduleId))
  );
}

function isSchedule(v: unknown): v is Schedule {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    isString(o.id) &&
    isEventType(o.type) &&
    isString(o.title) &&
    isString(o.scheduledAt) &&
    typeof o.done === "boolean" &&
    isString(o.createdAt) &&
    isString(o.updatedAt) &&
    (o.memo === undefined || isString(o.memo)) &&
    (o.doneLogId === undefined || isString(o.doneLogId))
  );
}

/** 保存済み schemaVersion を検証。現行と一致すれば true。 */
function isKnownSchemaVersion(): boolean {
  const raw = localStorage.getItem(STORAGE_KEYS.schemaVersion);
  // 未設定（新規利用）は現行として扱う
  if (raw === null) return true;
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed === SCHEMA_VERSION;
}

function loadArray<T>(
  key: string,
  guard: (v: unknown) => v is T,
): LoadResult<T[]> {
  if (!isBrowser()) return { ok: true, data: [] };

  if (!isKnownSchemaVersion()) {
    return {
      ok: false,
      data: [],
      reason: "未知のデータバージョンを検出しました。データを読み込めません。",
    };
  }

  const raw = localStorage.getItem(key);
  if (raw === null) return { ok: true, data: [] };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      ok: false,
      data: [],
      reason: "保存データを解析できませんでした（破損の可能性）。",
    };
  }

  if (!Array.isArray(parsed) || !parsed.every(guard)) {
    return {
      ok: false,
      data: [],
      reason: "保存データの形式が一致しません。",
    };
  }

  return { ok: true, data: parsed };
}

export function loadLogs(): LoadResult<LogEntry[]> {
  return loadArray(STORAGE_KEYS.logs, isLogEntry);
}

export function loadSchedules(): LoadResult<Schedule[]> {
  return loadArray(STORAGE_KEYS.schedules, isSchedule);
}

/** 保存結果。ok=false の場合は保存に失敗した（呼び出し側でロールバック＋通知） */
export interface SaveResult {
  ok: boolean;
  reason?: string;
}

function ensureSchemaVersion(): void {
  if (localStorage.getItem(STORAGE_KEYS.schemaVersion) === null) {
    localStorage.setItem(STORAGE_KEYS.schemaVersion, String(SCHEMA_VERSION));
  }
}

function saveArray<T>(key: string, data: T[]): SaveResult {
  if (!isBrowser()) return { ok: true };
  try {
    ensureSchemaVersion();
    localStorage.setItem(key, JSON.stringify(data));
    return { ok: true };
  } catch {
    return {
      ok: false,
      reason: "保存に失敗しました（保存容量の上限に達した可能性があります）。",
    };
  }
}

export function saveLogs(logs: LogEntry[]): SaveResult {
  return saveArray(STORAGE_KEYS.logs, logs);
}

export function saveSchedules(schedules: Schedule[]): SaveResult {
  return saveArray(STORAGE_KEYS.schedules, schedules);
}
