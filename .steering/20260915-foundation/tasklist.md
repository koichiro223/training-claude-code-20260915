# タスクリスト — 基盤（Foundation）

進捗記号：`[ ]` 未着手 / `[~]` 作業中 / `[x]` 完了

## 前提
- 本バッチは**最初に実装する**。完了後に life-log / schedule / balloon-game を並行開発できる。
- 完了条件：`npm run lint` と `npx tsc --noEmit` がエラー・警告なしで通ること。

## A. 環境・下準備
- [ ] `package.json` に `type-check`（`tsc --noEmit`）script を追加（任意）
- [ ] `next.config.ts` に静的エクスポート設定（`output: 'export'`）を確認/追加
- [ ] `tsconfig.json` の `@/*` パスエイリアスを確認

## B. 型定義（`src/types/index.ts`）
- [ ] `EventType` を定義
- [ ] `LogEntry` / `Schedule` を定義
- [ ] 入力型 `LogInput` / `ScheduleInput`（id/timestamps を除いた形）を定義

## C. lib 層
- [ ] `lib/constants.ts`：`COUNTDOWN_MIN/MAX`, `BALLOON_COLORS`, `MEMO_MAX_LENGTH`(500), `TITLE_MAX_LENGTH`(100), 永続化キー, `EVENT_TYPE_LABELS`
- [ ] `lib/id.ts`：`generateId()`（randomUUID + 非セキュア時フォールバック）
- [ ] `lib/datetime.ts`：ISO ⇔ datetime-local 変換、表示整形、`localDateKey`
- [ ] `lib/domain/sort.ts`：`sortByOccurredAtDesc`, `sortSchedules`
- [ ] `lib/domain/complete.ts`：`buildLogFromSchedule`
- [ ] `lib/domain/sleep.ts`：`pairSleep`（睡眠ペアリング）
- [ ] `lib/storage.ts`：型付き load/save、パース失敗・スキーマ不一致・未知バージョン時は非上書き＋通知理由を返す

## D. 状態管理
- [ ] `context/BabyLogContext.tsx`：`createContext` + `BabyLogProvider`（state 保持・初回読込・storage 保存・`storage` イベント購読・保存失敗時ロールバック＆通知）
- [ ] `hooks/useLogEntries.ts`：Context 購読、`entries`/`sortedEntries`/`add`/`update`/`remove`/`isLoaded`。`remove` は実績化ログなら対応 Schedule を復帰
- [ ] `hooks/useSchedules.ts`：Context 購読、`schedules`/`sortedSchedules`/CRUD/`completeAsLog`/`uncomplete`/`isLoaded`
- [ ] `completeAsLog` を logs+schedules の 1 アクション更新として実装（機能設計 4.2）
- [ ] `uncomplete` を doneLogId 削除 → 参照クリアで実装（機能設計 4.2 / 2.6）

## E. 共通 UI・境界
- [ ] `components/providers.tsx`：`"use client"` で `BabyLogProvider` ラップ
- [ ] `components/ui/Button.tsx`
- [ ] `components/ui/ConfirmModal.tsx`（`role="dialog"`, フォーカストラップ, Esc/ボタン閉じ）
- [ ] `components/ui/EmptyState.tsx`
- [ ] `components/ui/Toast.tsx`（または `Notice.tsx`）：`aria-live` 通知
- [ ] `components/layout/AppNav.tsx`：トップ/生活ログ/予定/バルーン遊びへの共通ナビ

## F. レイアウト・トップ画面
- [ ] `app/layout.tsx`：Server Component 維持、`lang="ja"`、`metadata`、`providers` で `children` を包む、`AppNav` 配置
- [ ] `app/globals.css`：Tailwind 読み込み・デザイントークン整理、ボイラープレート除去
- [ ] `app/page.tsx`：トップ画面（直近ログ5件・近い予定・遅れ表示・空状態・導線）

## G. 品質チェック
- [ ] `npm run lint` 実行しエラー・警告なし
- [ ] `npx tsc --noEmit` 実行しエラーなし
- [ ] `npm run dev` で起動し、トップ画面表示・ナビ遷移・（暫定データで）永続化を手動確認
- [ ] 完了条件を満たしたら変更内容を報告（Git 操作はしない）

## 完了の定義
- 型・lib・Context・フック・共通UI・レイアウト・トップ画面が揃い、公開インターフェース（§design 4）が確定している。
- 後続の life-log / schedule / balloon-game バッチが本成果物を import して独立実装できる状態になっている。
