# 設計 — 生活ログ記録機能（P1）

## 1. 実装アプローチ

foundation が提供する `useLogEntries()`・共通UI・lib を組み合わせ、`/logs` 画面を構築する。ページは薄く、UI は `components/logs/` に分割する。新規ファイルは本バッチ専用ディレクトリに閉じ、他機能バッチと衝突しない。

## 2. 追加/変更するファイル

```
src/
├── app/logs/page.tsx                   # 新規：薄いページ。LogsScreen を描画
└── components/logs/
    ├── LogsScreen.tsx                  # 画面コンテナ（useLogEntries 購読・状態束ね）
    ├── QuickLogBar.tsx                 # クイック記録ボタン群
    ├── LogForm.tsx                     # 追加/編集フォーム（種別・日時・メモ・体温数値）
    ├── LogList.tsx                     # 日付グルーピング一覧
    ├── LogListItem.tsx                 # 1件表示＋編集/削除操作
    └── (任意) logFormSchema.ts         # フォームのバリデーション純粋関数
```

依存（foundation より import）：
- `@/hooks/useLogEntries`
- `@/types`（`EventType` / `LogEntry` / `LogInput`）
- `@/lib/datetime`（`toDatetimeLocalValue` / `fromDatetimeLocalValue` / `formatDateTime` / `localDateKey`）
- `@/lib/constants`（`EVENT_TYPE_LABELS` / `MEMO_MAX_LENGTH` / 体温範囲定数）
- `@/components/ui`（`Button` / `ConfirmModal` / `EmptyState` / 通知）

## 3. コンポーネント設計

### LogsScreen
- `useLogEntries()` から `sortedEntries` / `add` / `update` / `remove` / `isLoaded` を取得。
- `isLoaded` が false の間はローディング/空表示（ハイドレーション対策：初期は空配列）。
- 追加/編集フォームの開閉状態、削除確認対象を管理。

### QuickLogBar
- よく使う種別（`feeding` / `milk` / `diaperPee` / `diaperPoo` / `sleepStart` / `sleepEnd` など）のボタン。
- タップで `add({ type, occurredAt: now })` を呼ぶ。詳細は後から編集で足す想定。
- タップしやすい大きさ、アイコン＋ラベル併用。

### LogForm（追加/編集兼用）
- フィールド：種別（select）／日時（`datetime-local`、既定=マウント後に現在時刻）／メモ（textarea, 500字上限）。
- 種別が `temperature` のとき数値入力欄（`value`）を表示。
- 送信時 `logFormSchema` でバリデーション：日時必須・パース可能、体温は数値必須・30〜45℃、メモ長。
- 追加時は `add(input)`、編集時は `update(id, patch)`。

### LogList / LogListItem
- `sortedEntries` を `localDateKey(occurredAt)` でグルーピングし、日付見出し＋その日の記録を降順表示。
- 各 `LogListItem` に種別ラベル・時刻・メモ（体温は値）を表示、編集/削除ボタン。
- 削除は `ConfirmModal` で確認 → `remove(id)`。

## 4. データ構造の変更

- 新規のドメイン型変更はなし（foundation の `LogEntry` / `LogInput` を使用）。

## 5. バリデーション（`docs/functional-design.md` 5章準拠）

| 対象 | ルール |
| --- | --- |
| 種別 | `EventType` 必須 |
| 日時 | 必須・パース可能（未来日時許容） |
| 体温 `value` | `temperature` 時は数値必須・30〜45℃ |
| メモ | 任意・最大500文字 |

- バリデーションは純粋関数として切り出し、UI から分離（将来テスト容易）。

## 6. 影響範囲

- 追加は `app/logs/` と `components/logs/` のみ。foundation の公開インターフェースにのみ依存。
- schedule / balloon-game バッチとファイル衝突しない（`logs` 状態は Context 経由で共有されるが読み書きは `useLogEntries` に集約）。
