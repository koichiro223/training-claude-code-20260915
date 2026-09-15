# タスクリスト — バルーン遊び機能（P3）

進捗記号：`[ ]` 未着手 / `[~]` 作業中 / `[x]` 完了

## 前提
- **`20260915-foundation` 完了後に着手する。**
- logs/schedules 状態を使わない最も独立したバッチ。実装は `app/play/`・`components/balloon/`・`hooks/useBalloonGame.ts` に閉じる。
- 完了条件：`npm run lint` と `npx tsc --noEmit` がエラー・警告なし。

## A. ページ雛形
- [ ] `app/play/page.tsx`：薄いページを作成し `BalloonScreen` を描画

## B. 状態機械フック
- [ ] `hooks/useBalloonGame.ts`：`idle/playing/stopped`、`score`、現在バルーン、`start`/`stop`/`popCurrent`
- [ ] `spawnBalloon()`：サイズ→位置→色→カウント(3〜5)→ID の順で生成（画面外にはみ出さない）
- [ ] カウントダウンを**時刻ベース**（`expireAt`, `remaining=ceil((expireAt-now)/1000)`）で実装
- [ ] `useRef` でタイマー/最新score/現在IDを保持し stale closure 回避
- [ ] 競合防止：破裂は現在バルーンID一致時のみ、二重生成しない
- [ ] クリーンアップ：状態遷移・アンマウントでタイマー解除（画面離脱で自動終了）

## C. UI
- [ ] `components/balloon/BalloonScreen.tsx`：開始/停止ボタン、スコア常時表示、結果表示の分岐
- [ ] `components/balloon/BalloonStage.tsx`：プレイ領域（絶対配置・タップ判定）
- [ ] `components/balloon/Balloon.tsx`：色（`BALLOON_COLORS`）・残り数字（コントラスト確保）・穏やかな破裂演出
- [ ] `components/balloon/GameResult.tsx`：「おめでとう {score}個 おせたね」（`aria-live`）

## D. アクセシビリティ・演出
- [ ] 激しい点滅を避ける／`prefers-reduced-motion` で低減
- [ ] スコア・結果を `aria-live` で通知
- [ ] 各背景色で数字が読めるコントラストを確認

## E. 品質チェック
- [ ] `npm run lint`（エラー・警告なし）
- [ ] `npx tsc --noEmit`（エラーなし）
- [ ] `npm run dev` で `/play` を手動確認：開始→ランダム位置/色/数字→カウントダウン→自動破裂（加点なし）→タップ破裂（加点）→停止で結果→再開でスコア0→他画面遷移で終了
- [ ] 変更内容を報告（Git 操作はしない）

## 完了の定義
- 受け入れ条件（requirements §3）をすべて満たし、開始/停止/スコア/自動破裂/タップ破裂/結果/再開/競合防止/離脱終了が動作する。
