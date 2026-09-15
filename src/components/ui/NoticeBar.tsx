"use client";

// 通知表示（development-guidelines.md §10：alert() を使わずアプリ内で通知）
import { useNotices } from "@/hooks/useNotices";

export function NoticeBar() {
  const { notices, dismiss } = useNotices();

  if (notices.length === 0) return null;

  return (
    <div
      className="fixed inset-x-0 top-0 z-40 flex flex-col gap-2 p-3"
      aria-live="assertive"
    >
      {notices.map((n) => (
        <div
          key={n.id}
          role="alert"
          className={`mx-auto flex w-full max-w-md items-start justify-between gap-3 rounded-xl px-4 py-3 text-sm shadow-md ${
            n.kind === "error"
              ? "bg-rose-600 text-white"
              : "bg-slate-800 text-white"
          }`}
        >
          <span>{n.message}</span>
          <button
            type="button"
            onClick={() => dismiss(n.id)}
            className="shrink-0 rounded px-1 font-bold"
            aria-label="通知を閉じる"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
