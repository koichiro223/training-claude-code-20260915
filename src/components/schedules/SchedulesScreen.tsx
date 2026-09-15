"use client";

// 予定画面コンテナ（design.md §3）
import { useEffect, useState } from "react";
import { useSchedules } from "@/hooks/useSchedules";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScheduleForm } from "@/components/schedules/ScheduleForm";
import { ScheduleList } from "@/components/schedules/ScheduleList";
import type { Schedule, ScheduleInput } from "@/types";

export function SchedulesScreen() {
  const {
    sortedSchedules,
    add,
    update,
    remove,
    completeAsLog,
    uncomplete,
    findDoneLog,
    isLoaded,
  } = useSchedules();

  // フォーム状態：null=閉, "new"=追加, Schedule=編集
  const [formTarget, setFormTarget] = useState<"new" | Schedule | null>(null);

  // 現在時刻はマウント後に取得（SSR不整合回避 / 純粋関数制約）
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    // 現在時刻はブラウザ専用値のためマウント後に設定。
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now());
  }, []);

  const closeForm = () => setFormTarget(null);

  const handleSubmit = (input: ScheduleInput) => {
    if (formTarget === "new") {
      add(input);
    } else if (formTarget) {
      update(formTarget.id, input);
    }
    closeForm();
  };

  return (
    <main className="space-y-6">
      <header className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">予定</h1>
          <p className="mt-1 text-sm text-slate-500">
            予防接種や健診などの予定を管理
          </p>
        </div>
        {formTarget === null ? (
          <Button variant="primary" onClick={() => setFormTarget("new")}>
            予定を追加
          </Button>
        ) : null}
      </header>

      {formTarget !== null ? (
        <ScheduleForm
          schedule={formTarget === "new" ? undefined : formTarget}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      ) : null}

      {!isLoaded ? (
        <p className="text-sm text-slate-400">読み込み中…</p>
      ) : sortedSchedules.length === 0 ? (
        <EmptyState
          icon="📅"
          title="まだ予定がありません"
          description="予防接種や健診などの予定を登録してみましょう。"
          action={
            formTarget === null ? (
              <Button variant="primary" onClick={() => setFormTarget("new")}>
                予定を追加
              </Button>
            ) : undefined
          }
        />
      ) : (
        <ScheduleList
          schedules={sortedSchedules}
          now={now}
          onComplete={completeAsLog}
          onUncomplete={uncomplete}
          onEdit={(schedule) => setFormTarget(schedule)}
          onRemove={remove}
          findDoneLog={findDoneLog}
        />
      )}
    </main>
  );
}
