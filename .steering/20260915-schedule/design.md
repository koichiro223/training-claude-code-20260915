# 設計 — 予定管理機能（P2）

## 1. 実装アプローチ

foundation の `useSchedules()`（`completeAsLog` / `uncomplete` を含む）・共通UI・lib を用いて `/schedules` 画面を構築する。実績化に伴う logs 更新と参照整合性は foundation 側に実装済みのため、本バッチは UI から所定の関数を呼ぶだけに徹する。

## 2. 追加/変更するファイル

```
src/
├── app/schedules/page.tsx              # 新規：薄いページ。SchedulesScreen を描画
└── components/schedules/
    ├── SchedulesScreen.tsx             # 画面コンテナ（useSchedules 購読・状態束ね）
    ├── ScheduleForm.tsx                # 追加/編集フォーム（種別・タイトル・日時・メモ）
    ├── ScheduleList.tsx                # 未完了→完了の並びで一覧
    ├── ScheduleListItem.tsx            # 1件表示＋実績化/取消/編集/削除
    └── (任意) scheduleFormSchema.ts    # バリデーション純粋関数
```

依存（foundation より import）：
- `@/hooks/useSchedules`
- `@/types`（`EventType` / `Schedule` / `ScheduleInput`）
- `@/lib/datetime` / `@/lib/constants`（`EVENT_TYPE_LABELS` / `TITLE_MAX_LENGTH` / `MEMO_MAX_LENGTH`）
- `@/components/ui`（`Button` / `ConfirmModal` / `EmptyState` / 通知）

## 3. コンポーネント設計

### SchedulesScreen
- `useSchedules()` から `sortedSchedules` / `add` / `update` / `remove` / `completeAsLog` / `uncomplete` / `isLoaded` を取得。
- `isLoaded` false 中はローディング/空表示（ハイドレーション対策）。
- フォーム開閉、削除確認・取り消し確認の対象を管理。

### ScheduleForm（追加/編集兼用）
- フィールド：種別（select）／タイトル（必須, 100字）／日時（`datetime-local`）／メモ（500字）。
- 送信時 `scheduleFormSchema` でバリデーション（タイトル必須・トリム・長さ、日時必須・パース可能：過去許容）。
- 追加＝`add(input)`、編集＝`update(id, patch)`。

### ScheduleList / ScheduleListItem
- `sortedSchedules`（未完了 `scheduledAt` 昇順 → 完了は後方・降順）をそのまま描画。
- 未完了で `scheduledAt < now` は「遅れ（overdue）」を色＋ラベルで区別。
- 未完了項目：「実績にする」ボタン（`completeAsLog(id)`）。`done=true` には表示しない。
- 完了項目：「完了を取り消す」ボタン → 確認モーダル。対応ログが実績化後に編集済み（`doneLogId` の LogEntry の `updatedAt` が生成時より後）なら警告文を追加して確認 → `uncomplete(id)`。
- 各項目に編集・削除（削除は `ConfirmModal`）。

## 4. データ構造の変更

- 新規のドメイン型変更はなし（foundation の `Schedule` / `ScheduleInput` を使用）。

## 5. バリデーション（`docs/functional-design.md` 5章準拠）

| 対象 | ルール |
| --- | --- |
| 種別 | `EventType` 必須 |
| タイトル | 必須・前後トリム・最大100文字・空不可 |
| 日時 | 必須・パース可能（過去日時許容） |
| メモ | 任意・最大500文字 |

## 6. 影響範囲

- 追加は `app/schedules/` と `components/schedules/` のみ。
- 実績化により `logs` も変化するが、その更新は foundation の `completeAsLog` が担う。本バッチは `useLogEntries` を直接操作しない。
- life-log / balloon-game バッチとファイル衝突しない。
