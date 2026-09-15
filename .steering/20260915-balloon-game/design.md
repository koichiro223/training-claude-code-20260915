# 設計 — バルーン遊び機能（P3）

## 1. 実装アプローチ

`useBalloonGame` を画面ローカル・非永続の状態機械として実装し、`/play` 画面で使う。foundation からはナビ・共通UI・`constants`・`id` のみ利用し、logs/schedules 状態には一切依存しない（最も独立性が高いバッチ）。

## 2. 追加/変更するファイル

```
src/
├── app/play/page.tsx                   # 新規：薄いページ。BalloonScreen を描画
├── hooks/useBalloonGame.ts             # 状態機械（idle/playing/stopped, 非永続）
└── components/balloon/
    ├── BalloonScreen.tsx               # 画面コンテナ（開始/停止/結果/スコア）
    ├── BalloonStage.tsx                # プレイ領域（バルーン配置・タップ判定）
    ├── Balloon.tsx                     # 1つのバルーン（色・数字・サイズ・破裂演出）
    └── GameResult.tsx                  # 停止後の結果メッセージ（aria-live）
```

依存（foundation より import）：
- `@/lib/constants`（`BALLOON_COLORS` / `COUNTDOWN_MIN` / `COUNTDOWN_MAX` / 初期サイズ定数）
- `@/lib/id`（`generateId`）
- `@/components/ui`（`Button` 等）

## 3. 状態機械（useBalloonGame）

状態：`idle` / `playing` / `stopped`（`docs/functional-design.md` 4.3）。

公開値（想定）：
```ts
{
  state: 'idle' | 'playing' | 'stopped';
  score: number;
  balloon: BalloonModel | null;   // { id, x, y, size, color, textColor, expireAt, remaining }
  remaining: number;              // 現在の残り秒（時刻ベース算出）
  start(): void;                  // idle/stopped → playing, score=0, spawn
  stop(): void;                   // playing → stopped, タイマー停止
  popCurrent(id: string): void;   // タップ破裂：id 一致時のみ score+1 → spawn
}
```

### spawnBalloon()（順序に注意, 機能設計 4.3）
1. サイズ確定（初期は大きめ。画面幅に応じ調整）。
2. サイズを踏まえ、プレイ領域から直径ぶんを差し引いた範囲でランダム座標（画面外にはみ出さない）。
3. `BALLOON_COLORS` からランダムに色＋対応する数字色（コントラスト確保）。
4. カウント初期値 `COUNTDOWN_MIN`〜`COUNTDOWN_MAX` のランダム整数、`expireAt = now + count*1000`。
5. `generateId()` で一意ID付与。

### カウントダウン（時刻ベース）
- 約1秒間隔の tick で `remaining = ceil((expireAt - now)/1000)` を再計算・表示更新。
- `remaining <= 0` で **自動破裂** → `spawnBalloon()`（スコア加算なし）。
- タイマー/最新 score/現在バルーンID は `useRef` に保持し stale closure を回避。

### 競合防止
- 破裂処理（タップ／自動）は「現在表示中バルーンIDと一致する場合のみ」実行。到達とタップがほぼ同時でも二重生成しない（処理後に current id を更新）。

### クリーンアップ
- 状態遷移・アンマウントでタイマー解除。**プレイ中の画面離脱でアンマウント → 自動終了**（スコア非保持）。

## 4. データ構造

- 非永続のビュー用モデル `BalloonModel` のみ（型はフック近傍 or `types` に定義。ドメイン永続型は不使用）。

## 5. UI・アクセシビリティ

- `BalloonStage`：`relative` なプレイ領域、バルーンを絶対配置。タップ対象は十分大きく。
- `Balloon`：円形、背景色＝ランダム、中央に残り数字（コントラスト確保の数字色）。破裂は穏やかなアニメーション、`prefers-reduced-motion` で低減。
- スコア表示と結果メッセージ「おめでとう {score}個 おせたね」は `aria-live` 領域で通知。
- 激しい点滅を避ける。

## 6. 影響範囲

- 追加は `app/play/`・`components/balloon/`・`hooks/useBalloonGame.ts` のみ。
- logs/schedules 状態・foundation の Context を購読しないため、life-log / schedule と完全独立。
