# タスクリスト — 生活ログ記録機能（P1）

進捗記号：`[ ]` 未着手 / `[~]` 作業中 / `[x]` 完了

## 前提
- **`20260915-foundation` 完了後に着手する。**
- foundation の `useLogEntries` / 共通UI / lib を利用し、新規実装は `app/logs/` と `components/logs/` に閉じる。
- 完了条件：`npm run lint` と `npx tsc --noEmit` がエラー・警告なし。

## A. ページ雛形
- [ ] `app/logs/page.tsx`：薄いページを作成し `LogsScreen` を描画

## B. 画面コンテナ
- [ ] `components/logs/LogsScreen.tsx`：`useLogEntries` 購読、`isLoaded` によるローディング/空状態分岐、フォーム開閉・削除確認状態を管理

## C. クイック記録
- [ ] `components/logs/QuickLogBar.tsx`：よく使う種別ボタンで現在時刻の `add` を実行（タップしやすいサイズ・アイコン＋ラベル）

## D. 追加/編集フォーム
- [ ] `components/logs/LogForm.tsx`：種別 select／`datetime-local`（既定=マウント後の現在時刻）／メモ／体温数値欄（`temperature` 時）
- [ ] `components/logs/logFormSchema.ts`（任意）：バリデーション純粋関数（日時必須・体温30〜45℃・メモ500字）
- [ ] 追加＝`add(input)` / 編集＝`update(id, patch)` を接続

## E. 一覧
- [ ] `components/logs/LogList.tsx`：`localDateKey` で日付グルーピング、各日を `occurredAt` 降順表示
- [ ] `components/logs/LogListItem.tsx`：種別ラベル・時刻・メモ（体温は値）表示、編集/削除ボタン
- [ ] 削除は `ConfirmModal` で確認 → `remove(id)`

## F. 空状態・仕上げ
- [ ] 0件時に `EmptyState` を表示し追加を促す
- [ ] ラベル/文言を `docs/glossary.md` に合わせる
- [ ] モバイルファースト・色のみ依存回避・`aria` 属性を確認

## G. 品質チェック
- [ ] `npm run lint`（エラー・警告なし）
- [ ] `npx tsc --noEmit`（エラーなし）
- [ ] `npm run dev` で `/logs` を手動確認：クイック記録／追加／編集／削除／グルーピング／再読込後のデータ保持
- [ ] 変更内容を報告（Git 操作はしない）

## 完了の定義
- 受け入れ条件（requirements §3）をすべて満たし、記録の CRUD・クイック記録・日付グルーピング・空状態が動作する。
