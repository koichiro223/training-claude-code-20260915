"use client";

// 生活ログ一覧（design §3 LogList）
// sortedEntries（occurredAt 降順）を localDateKey で日付グルーピングし、
// 日付見出し（formatDateHeading）＋その日の記録を降順表示する。
import { useMemo } from "react";
import type { LogEntry } from "@/types";
import { localDateKey, formatDateHeading } from "@/lib/datetime";
import { LogListItem } from "@/components/logs/LogListItem";

interface LogListProps {
  /** occurredAt 降順で並んだ記録 */
  entries: LogEntry[];
  onEdit: (entry: LogEntry) => void;
  onDelete: (id: string) => void;
}

interface DateGroup {
  key: string;
  /** 見出し表示に使う代表 ISO（そのグループの1件目の occurredAt） */
  headingIso: string;
  entries: LogEntry[];
}

function groupByLocalDate(entries: LogEntry[]): DateGroup[] {
  const groups: DateGroup[] = [];
  const indexByKey = new Map<string, number>();
  for (const entry of entries) {
    const key = localDateKey(entry.occurredAt);
    const existing = indexByKey.get(key);
    if (existing === undefined) {
      indexByKey.set(key, groups.length);
      groups.push({ key, headingIso: entry.occurredAt, entries: [entry] });
    } else {
      groups[existing].entries.push(entry);
    }
  }
  return groups;
}

export function LogList({ entries, onEdit, onDelete }: LogListProps) {
  const groups = useMemo(() => groupByLocalDate(entries), [entries]);

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.key} aria-label={formatDateHeading(group.headingIso)}>
          <h3 className="mb-2 text-sm font-semibold text-slate-500">
            {formatDateHeading(group.headingIso)}
          </h3>
          <ul className="space-y-2">
            {group.entries.map((entry) => (
              <LogListItem
                key={entry.id}
                entry={entry}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
