# 設計 — 基盤（Foundation）

## 1. 実装アプローチ

`docs/functional-design.md` 1〜2章・`docs/architecture.md` 2章・`docs/repository-structure.md` 2章に沿い、下層（型・lib）→ 状態管理（Context/フック）→ UI 境界・共通UI・レイアウト → トップ画面 の順に組み上げる。後続の機能バッチが依存する**公開インターフェースを本バッチで確定**する。

## 2. 追加/変更するファイル

```
src/
├── types/index.ts                      # EventType / LogEntry / Schedule / 入力型
├── lib/
│   ├── constants.ts                    # COUNTDOWN_MIN/MAX, BALLOON_COLORS, MEMO_MAX_LENGTH(500), TITLE_MAX_LENGTH(100), 永続化キー, EVENT_TYPE_LABELS
│   ├── id.ts                           # generateId(): randomUUID + フォールバック
│   ├── datetime.ts                     # ISO8601 ⇔ datetime-local, 表示整形, ローカル暦日キー
│   └── domain/
│       ├── sort.ts                     # sortByOccurredAtDesc, sortSchedules
│       ├── complete.ts                 # buildLogFromSchedule (実績化変換の純粋関数)
│       └── sleep.ts                    # pairSleep (睡眠ペアリング)
├── context/BabyLogContext.tsx          # createContext + BabyLogProvider 本体
├── hooks/
│   ├── useLogEntries.ts                # Context 購読（logs）
│   └── useSchedules.ts                 # Context 購読（schedules）
├── components/
│   ├── providers.tsx                   # "use client" 境界ラッパー
│   ├── layout/
│   │   └── AppNav.tsx                  # 共通ナビゲーション
│   └── ui/
│       ├── Button.tsx                  # 汎用ボタン
│       ├── ConfirmModal.tsx            # 確認モーダル（role=dialog, フォーカストラップ, Esc）
│       ├── EmptyState.tsx              # 空状態表示
│       └── Toast.tsx / Notice.tsx      # 通知（インライン/簡易トースト）
├── app/
│   ├── layout.tsx                      # 更新：lang="ja", metadata, providers で包む, AppNav 配置
│   ├── page.tsx                        # 更新：トップ画面（直近ログ・近い予定サマリ）
│   └── globals.css                     # 必要に応じデザイントークン整理
```

## 3. データ構造

型定義は `docs/functional-design.md` 2.2/2.3・`docs/glossary.md` を正とする。

```ts
export type EventType =
  | 'feeding' | 'milk' | 'sleepStart' | 'sleepEnd'
  | 'diaperPee' | 'diaperPoo' | 'bath' | 'temperature' | 'memo';

export interface LogEntry {
  id: string;
  type: EventType;
  occurredAt: string;      // ISO8601
  title?: string;
  value?: number;          // 体温など
  memo?: string;
  fromScheduleId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Schedule {
  id: string;
  type: EventType;
  title: string;
  scheduledAt: string;     // ISO8601
  memo?: string;
  done: boolean;
  doneLogId?: string;
  createdAt: string;
  updatedAt: string;
}
```

永続化キー：`babylog.logs` / `babylog.schedules` / `babylog.schemaVersion`（初期値 1）。

## 4. 状態管理の設計（公開インターフェース確定）

`BabyLogProvider` が `logs` / `schedules` を `useState` で保持し、下記を `context` 値として公開する。フックは Context を購読するだけの薄いラッパーとする。

```ts
// useLogEntries()
{
  entries: LogEntry[];                 // 生の配列
  sortedEntries: LogEntry[];           // occurredAt 降順
  add(input: LogInput): void;
  update(id: string, patch: Partial<LogInput>): void;
  remove(id: string): void;            // fromScheduleId があれば対応 Schedule を done=false に戻す
  isLoaded: boolean;                   // 読み込み完了フラグ
}

// useSchedules()
{
  schedules: Schedule[];
  sortedSchedules: Schedule[];         // 未完了 scheduledAt 昇順 → 完了を後方
  add(input: ScheduleInput): void;
  update(id: string, patch: Partial<ScheduleInput>): void;
  remove(id: string): void;
  completeAsLog(scheduleId: string): void;   // logs + schedules を 1 アクションで更新
  uncomplete(scheduleId: string): void;      // doneLogId の LogEntry を削除 → 参照クリア
  isLoaded: boolean;
}
```

- 更新関数は内部で「state 更新 → `storage.ts` 保存」を順に行う。
- `storage` イベント購読で別タブ更新を再読込。
- 保存失敗時は `notify(error)` を呼び、直近操作を取り消す（更新前 state に戻す）。

> **後続バッチはこのインターフェースを前提に実装する。** 変更が必要な場合は本バッチ側を更新し `docs/` と整合させる。

## 5. lib 層の設計

- `id.ts`：`crypto.randomUUID` が Secure Context 外で `undefined` になり得るためフォールバック（疑似UUID）を用意。
- `datetime.ts`：`toDatetimeLocalValue(iso)` / `fromDatetimeLocalValue(v)` / `formatDateTime(iso)` / `localDateKey(iso)`（ローカル暦日でのグルーピングキー）。
- `storage.ts`：型付き `loadLogs()` / `saveLogs()` / `loadSchedules()` / `saveSchedules()`。パース失敗・スキーマ不一致・未知バージョン時は空を返し `{ ok:false, reason }` を通知。**破損データを上書き保存しない**。
- `domain/sort.ts`・`complete.ts`・`sleep.ts`：副作用のない純粋関数。`buildLogFromSchedule(schedule, now, newId)` は実績化変換（type/title/memo 引き継ぎ、occurredAt=now、fromScheduleId=schedule.id）。

## 6. 共通 UI の設計

- `ConfirmModal`：`role="dialog"` `aria-modal`、開いたらフォーカスをモーダル内へ移し Esc/キャンセルで閉じる（フォーカストラップ）。破壊的操作の確認に共通利用。
- `Toast`/`Notice`：`aria-live` を持つ通知領域。読み込み失敗・保存失敗をユーザーに伝える。
- `EmptyState`：0件時の案内（アイコン＋文言＋任意のアクションボタン）。
- `Button`：サイズ・バリアントを持つタップしやすい共通ボタン。
- スタイルは Tailwind デザイントークン、モバイルファースト、色のみに依存しない（アイコン/ラベル併用）。

## 7. トップ画面（`/`）の設計

- Client Component。`useLogEntries` / `useSchedules` を購読。
- 直近ログ：`sortedEntries` の先頭5件。
- 近い予定：未完了予定を `scheduledAt` 昇順で数件、`scheduledAt < now` は「遅れ（overdue）」バッジ表示。
- 0件時は `EmptyState` で記録/予定追加を促す。
- 各機能画面への導線（`AppNav` に加えトップ内カードリンクでも可）。

## 8. 影響範囲

- 既存 `app/layout.tsx` / `app/page.tsx` / `globals.css` を置き換える（ボイラープレート除去、`prefers-color-scheme` は要件外のため前提化しない）。
- 後続の3機能バッチはすべて本バッチの成果物に依存する（他バッチ間の相互依存はなし）。
