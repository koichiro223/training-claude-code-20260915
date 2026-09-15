"use client";

// クイック記録バー（glossary.md 4章 quickLog）
// よく使う種別を1タップで「現在時刻」で記録する。アイコン＋ラベル併用（色のみに依存しない）。
import type { EventType } from "@/types";
import { EVENT_TYPE_LABELS } from "@/lib/constants";

// クイック記録に出す種別（design §3：feeding / milk / diaper系 / sleep系）
const QUICK_TYPES: EventType[] = [
  "feeding",
  "milk",
  "diaperPee",
  "diaperPoo",
  "sleepStart",
  "sleepEnd",
];

// 各種別のアイコン（色以外の手がかり）
const QUICK_ICONS: Partial<Record<EventType, string>> = {
  feeding: "🤱",
  milk: "🍼",
  diaperPee: "💧",
  diaperPoo: "💩",
  sleepStart: "😴",
  sleepEnd: "🌅",
};

interface QuickLogBarProps {
  /** 現在時刻で1件追加する */
  onQuickAdd: (type: EventType) => void;
}

export function QuickLogBar({ onQuickAdd }: QuickLogBarProps) {
  return (
    <section aria-labelledby="quick-log-heading" className="space-y-3">
      <h2
        id="quick-log-heading"
        className="text-base font-semibold text-slate-700"
      >
        クイック記録
      </h2>
      <p className="text-xs text-slate-400">
        タップで現在時刻の記録をすぐ追加できます。
      </p>
      <ul className="grid grid-cols-3 gap-2">
        {QUICK_TYPES.map((type) => (
          <li key={type}>
            <button
              type="button"
              onClick={() => onQuickAdd(type)}
              className="flex min-h-20 w-full flex-col items-center justify-center gap-1 rounded-2xl border border-slate-200 bg-white px-2 py-3 text-center shadow-sm transition-colors hover:bg-sky-50 active:bg-sky-100"
            >
              <span className="text-2xl" aria-hidden="true">
                {QUICK_ICONS[type]}
              </span>
              <span className="text-xs font-medium leading-tight text-slate-700">
                {EVENT_TYPE_LABELS[type]}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
