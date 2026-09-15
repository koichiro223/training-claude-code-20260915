"use client";

// トップ（ホーム）画面（functional-design.md 3.3）
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLogEntries } from "@/hooks/useLogEntries";
import { useSchedules } from "@/hooks/useSchedules";
import { EmptyState } from "@/components/ui/EmptyState";
import { EVENT_TYPE_LABELS } from "@/lib/constants";
import { formatDateTime, formatTime } from "@/lib/datetime";

const RECENT_LOG_COUNT = 5;
const UPCOMING_COUNT = 5;

export function HomeScreen() {
  const { sortedEntries, isLoaded: logsLoaded } = useLogEntries();
  const { sortedSchedules, isLoaded: schedulesLoaded } = useSchedules();

  const recentLogs = useMemo(
    () => sortedEntries.slice(0, RECENT_LOG_COUNT),
    [sortedEntries],
  );

  // 未完了予定を scheduledAt 昇順で数件（sortSchedules 済み配列の未完了先頭部分）
  const upcoming = useMemo(
    () => sortedSchedules.filter((s) => !s.done).slice(0, UPCOMING_COUNT),
    [sortedSchedules],
  );

  const isLoaded = logsLoaded && schedulesLoaded;

  // 現在時刻はマウント後に取得（SSR不整合回避 / 純粋関数制約）
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    // 現在時刻はブラウザ専用値のためマウント後に設定（SSR不整合回避）。
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now());
  }, []);

  return (
    <main className="space-y-6">
      <header className="pt-2">
        <h1 className="text-2xl font-bold text-slate-800">
          赤ちゃんの生活ログ
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          きょうの記録と近い予定
        </p>
      </header>

      {!isLoaded ? (
        <p className="text-sm text-slate-400">読み込み中…</p>
      ) : (
        <>
          {/* 直近の生活ログ */}
          <section aria-labelledby="recent-logs-heading" className="space-y-3">
            <div className="flex items-center justify-between">
              <h2
                id="recent-logs-heading"
                className="text-base font-semibold text-slate-700"
              >
                直近の記録
              </h2>
              <Link
                href="/logs"
                className="text-sm font-medium text-sky-600 hover:underline"
              >
                すべて見る →
              </Link>
            </div>
            {recentLogs.length === 0 ? (
              <EmptyState
                icon="📝"
                title="まだ記録がありません"
                description="授乳やおむつ替えの記録を追加してみましょう。"
                action={
                  <Link
                    href="/logs"
                    className="inline-flex min-h-11 items-center rounded-xl bg-sky-600 px-4 text-sm font-medium text-white hover:bg-sky-700"
                  >
                    記録を追加
                  </Link>
                }
              />
            ) : (
              <ul className="space-y-2">
                {recentLogs.map((log) => (
                  <li
                    key={log.id}
                    className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm"
                  >
                    <span className="font-medium text-slate-700">
                      {EVENT_TYPE_LABELS[log.type]}
                      {log.type === "temperature" && log.value !== undefined
                        ? ` ${log.value}℃`
                        : ""}
                    </span>
                    <time className="text-sm text-slate-500">
                      {formatDateTime(log.occurredAt)}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* 近い予定 */}
          <section aria-labelledby="upcoming-heading" className="space-y-3">
            <div className="flex items-center justify-between">
              <h2
                id="upcoming-heading"
                className="text-base font-semibold text-slate-700"
              >
                近い予定
              </h2>
              <Link
                href="/schedules"
                className="text-sm font-medium text-sky-600 hover:underline"
              >
                すべて見る →
              </Link>
            </div>
            {upcoming.length === 0 ? (
              <EmptyState
                icon="📅"
                title="近い予定はありません"
                description="予防接種や健診などの予定を登録できます。"
                action={
                  <Link
                    href="/schedules"
                    className="inline-flex min-h-11 items-center rounded-xl bg-sky-600 px-4 text-sm font-medium text-white hover:bg-sky-700"
                  >
                    予定を追加
                  </Link>
                }
              />
            ) : (
              <ul className="space-y-2">
                {upcoming.map((s) => {
                  const overdue =
                    now !== null && new Date(s.scheduledAt).getTime() < now;
                  return (
                    <li
                      key={s.id}
                      className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-700">
                          {s.title}
                        </p>
                        <p className="text-xs text-slate-400">
                          {EVENT_TYPE_LABELS[s.type]}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <time className="text-sm text-slate-500">
                          {formatTime(s.scheduledAt)}
                        </time>
                        {overdue ? (
                          <span className="ml-2 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700">
                            遅れ
                          </span>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* バルーン遊びへの導線 */}
          <section>
            <Link
              href="/play"
              className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-sky-400 to-indigo-400 px-5 py-4 text-white shadow-sm"
            >
              <span className="text-base font-semibold">
                🎈 バルーン遊びをする
              </span>
              <span aria-hidden="true">→</span>
            </Link>
          </section>
        </>
      )}
    </main>
  );
}
