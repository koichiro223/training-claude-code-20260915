"use client";

// 生活ログ画面コンテナ（design §3 LogsScreen / glossary.md 4章 Logs `/logs`）
// useLogEntries を購読し、クイック記録・追加/編集フォーム・一覧・空状態を束ねる。
import { useState } from "react";
import type { EventType, LogEntry, LogInput } from "@/types";
import { useLogEntries } from "@/hooks/useLogEntries";
import { nowIso } from "@/lib/datetime";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { QuickLogBar } from "@/components/logs/QuickLogBar";
import { LogForm } from "@/components/logs/LogForm";
import { LogList } from "@/components/logs/LogList";

export function LogsScreen() {
  const { sortedEntries, add, update, remove, isLoaded } = useLogEntries();

  // フォームの開閉状態。編集中は対象 LogEntry を保持。
  const [formOpen, setFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<LogEntry | null>(null);

  const openAddForm = () => {
    setEditingEntry(null);
    setFormOpen(true);
  };

  const openEditForm = (entry: LogEntry) => {
    setEditingEntry(entry);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingEntry(null);
  };

  const handleQuickAdd = (type: EventType) => {
    add({ type, occurredAt: nowIso() });
  };

  const handleSubmit = (input: LogInput) => {
    if (editingEntry) {
      update(editingEntry.id, input);
    } else {
      add(input);
    }
    closeForm();
  };

  const handleDelete = (id: string) => {
    remove(id);
  };

  return (
    <main className="space-y-6">
      <header className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">生活ログ</h1>
          <p className="mt-1 text-sm text-slate-500">
            授乳・睡眠・おむつなどの記録
          </p>
        </div>
        {!formOpen ? (
          <Button type="button" variant="primary" onClick={openAddForm}>
            記録を追加
          </Button>
        ) : null}
      </header>

      {!isLoaded ? (
        <p className="text-sm text-slate-400">読み込み中…</p>
      ) : (
        <>
          {formOpen ? (
            <LogForm
              // 編集対象が変わったらフォームを作り直す（初期値を反映）
              key={editingEntry?.id ?? "new"}
              entry={editingEntry ?? undefined}
              onSubmit={handleSubmit}
              onCancel={closeForm}
            />
          ) : (
            <QuickLogBar onQuickAdd={handleQuickAdd} />
          )}

          <section aria-labelledby="log-list-heading" className="space-y-3">
            <h2
              id="log-list-heading"
              className="text-base font-semibold text-slate-700"
            >
              記録一覧
            </h2>
            {sortedEntries.length === 0 ? (
              <EmptyState
                icon="📝"
                title="まだ記録がありません"
                description="上のクイック記録、または「記録を追加」から始めましょう。"
                action={
                  !formOpen ? (
                    <Button type="button" variant="primary" onClick={openAddForm}>
                      記録を追加
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <LogList
                entries={sortedEntries}
                onEdit={openEditForm}
                onDelete={handleDelete}
              />
            )}
          </section>
        </>
      )}
    </main>
  );
}
