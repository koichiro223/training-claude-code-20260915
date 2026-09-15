// 睡眠ペアリングの純粋関数（functional-design.md 2.2）
// 同日内の直近の未対応 sleepStart と sleepEnd を時系列でペアリングする。
import type { LogEntry } from "@/types";
import { localDateKey } from "@/lib/datetime";

export interface SleepPair {
  start: LogEntry;
  end: LogEntry;
  /** 睡眠時間（分） */
  durationMinutes: number;
}

export interface SleepPairingResult {
  pairs: SleepPair[];
  /** ペアにならなかった開始/終了（表示側で「時間算出不可」を示す） */
  unpairedStarts: LogEntry[];
  unpairedEnds: LogEntry[];
}

/**
 * sleepStart / sleepEnd を同日内・時系列でペアリングする。
 * ペアが揃わない（開始のみ／終了のみ）ものは unpaired として返す。
 */
export function pairSleep(entries: LogEntry[]): SleepPairingResult {
  const pairs: SleepPair[] = [];
  const unpairedStarts: LogEntry[] = [];
  const unpairedEnds: LogEntry[] = [];

  // 日付（ローカル暦日）ごとに分けて処理する
  const byDay = new Map<string, LogEntry[]>();
  for (const e of entries) {
    if (e.type !== "sleepStart" && e.type !== "sleepEnd") continue;
    const key = localDateKey(e.occurredAt);
    const list = byDay.get(key) ?? [];
    list.push(e);
    byDay.set(key, list);
  }

  for (const list of byDay.values()) {
    const chron = [...list].sort(
      (a, b) =>
        new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime(),
    );
    let pendingStart: LogEntry | null = null;
    for (const e of chron) {
      if (e.type === "sleepStart") {
        // 直前の未対応 start があればそれは孤立扱い
        if (pendingStart) unpairedStarts.push(pendingStart);
        pendingStart = e;
      } else {
        // sleepEnd
        if (pendingStart) {
          const durationMinutes = Math.max(
            0,
            Math.round(
              (new Date(e.occurredAt).getTime() -
                new Date(pendingStart.occurredAt).getTime()) /
                60000,
            ),
          );
          pairs.push({ start: pendingStart, end: e, durationMinutes });
          pendingStart = null;
        } else {
          unpairedEnds.push(e);
        }
      }
    }
    if (pendingStart) unpairedStarts.push(pendingStart);
  }

  return { pairs, unpairedStarts, unpairedEnds };
}
