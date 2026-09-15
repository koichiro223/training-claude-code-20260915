# タスクリスト — 予定管理機能（P2）

進捗記号：`[ ]` 未着手 / `[~]` 作業中 / `[x]` 完了

## 前提
- **`20260915-foundation` 完了後に着手する。**
- 実績化・完了取り消しのロジックは foundation の `useSchedules`（`completeAsLog`/`uncomplete`）を利用。本バッチは UI に専念。
- 新規実装は `app/schedules/` と `components/schedules/` に閉じる。
- 完了条件：`npm run lint` と `npx tsc --noEmit` がエラー・警告なし。

## A. ページ雛形
- [ ] `app/schedules/page.tsx`：薄いページを作成し `SchedulesScreen` を描画

## B. 画面コンテナ
- [ ] `components/schedules/SchedulesScreen.tsx`：`useSchedules` 購読、`isLoaded` 分岐、フォーム/確認モーダルの状態管理

## C. 追加/編集フォーム
- [ ] `components/schedules/ScheduleForm.tsx`：種別／タイトル（必須100字）／`datetime-local`／メモ（500字）
- [ ] `components/schedules/scheduleFormSchema.ts`（任意）：バリデーション純粋関数
- [ ] 追加＝`add(input)` / 編集＝`update(id, patch)` を接続

## D. 一覧
- [ ] `components/schedules/ScheduleList.tsx`：`sortedSchedules`（未完了昇順→完了後方）を描画、未完了/完了をスタイル区別
- [ ] `components/schedules/ScheduleListItem.tsx`：種別・タイトル・日時・メモ表示、`scheduledAt < now` の遅れ（overdue）区別

## E. 実績化・取り消し・削除
- [ ] 未完了に「実績にする」ボタン → `completeAsLog(id)`。`done=true` には非表示（二重実績化防止）
- [ ] 完了に「完了を取り消す」ボタン → `ConfirmModal`。対応ログが実績化後編集済みなら警告文を追加 → `uncomplete(id)`
- [ ] 各項目に編集・削除。削除は `ConfirmModal` → `remove(id)`

## F. 空状態・仕上げ
- [ ] 0件時に `EmptyState` を表示し追加を促す
- [ ] ラベル/文言を `docs/glossary.md` に合わせる
- [ ] モバイルファースト・色のみ依存回避・`aria` 属性を確認

## G. 品質チェック
- [ ] `npm run lint`（エラー・警告なし）
- [ ] `npx tsc --noEmit`（エラーなし）
- [ ] `npm run dev` で `/schedules` を手動確認：追加／編集／削除／実績化（生活ログへ反映）／完了取り消し（ログ削除）／遅れ表示／再読込後の保持
- [ ] 変更内容を報告（Git 操作はしない）

## 完了の定義
- 受け入れ条件（requirements §3）をすべて満たし、予定 CRUD・ワンタップ実績化・完了取り消し・遅れ表示・空状態が動作する。
