# タスクリスト — バルーン肥大化演出

進捗記号：`[ ]` 未着手 / `[~]` 作業中 / `[x]` 完了

## 前提
- **`20260915-balloon-game` 完了後に着手する。**
- 変更は `lib/constants.ts`・`hooks/useBalloonGame.ts`・`components/balloon/Balloon.tsx` に閉じる。
- 完了条件：`npm run lint` と `npx tsc --noEmit` がエラー・警告なし。

## A. 定数
- [x] `lib/constants.ts`：`BALLOON_MAX_SCALE`（破裂直前の最大倍率, 例 1.6）を追加

## B. 状態機械フック
- [x] `hooks/useBalloonGame.ts`：`BalloonModel` に `durationMs`（= count*1000）を追加
- [x] `spawnBalloon()` で `durationMs` を設定
- [x] tick で時刻ベースの経過 `elapsedMs`（クランプ済み）を算出し公開APIに追加
- [x] `start`/`stop`/spawn 時に `elapsedMs` を適切に初期化・リセット

## C. UI
- [x] `components/balloon/Balloon.tsx`：`elapsedMs`/`durationMs` から progress→scale を算出し表示直径を拡大
- [x] 中心基準配置（`translate(-50%,-50%)`）を維持し、はみ出しを抑える
- [x] `BalloonStage.tsx`/`BalloonScreen.tsx`：`elapsedMs` を受け渡す（必要な配線のみ）

## D. アクセシビリティ・演出
- [x] CSS transition で滑らかに拡大（急拡縮・点滅なし）
- [x] `prefers-reduced-motion` 有効時は補間を低減（既存 globals.css 踏襲）

## E. 品質チェック
- [x] `npm run lint`（エラー・警告なし）
- [x] `npx tsc --noEmit`（エラーなし）
- [x] `npm run build` で型・ビルドを確認
- [x] 変更内容を報告（Git 操作はしない）

## 完了の定義
- 受け入れ条件（requirements §3）をすべて満たし、発生時は初期サイズ→カウントダウン中に滑らかに拡大→破裂で初期サイズに戻る、が動作する。既存機能に退行がない。
