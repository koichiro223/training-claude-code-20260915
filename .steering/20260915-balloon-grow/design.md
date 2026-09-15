# 設計 — バルーン肥大化演出

## 1. 実装アプローチ

既存のバルーン遊び（`useBalloonGame` / `Balloon` / `BalloonStage`）を土台に、カウントダウンの進捗に応じて表示直径を拡大する。サイズ算出は「残り数字（`remaining`）ではなく」**時刻ベースの連続的な進捗**から行い、滑らかに膨らませる。破裂で次のバルーンが生成されると初期サイズから膨らみ直す（既存の `spawnBalloon` が新IDで新規 `BalloonModel` を作るため自然にリセットされる）。

## 2. 追加/変更するファイル

```
src/
├── lib/constants.ts                    # 変更：BALLOON_MAX_SCALE を追加
├── hooks/useBalloonGame.ts             # 変更：生成時の総カウント時間を保持（progress 算出用）
└── components/balloon/
    ├── Balloon.tsx                     # 変更：時刻ベースの progress で scale を算出し拡大
    └── BalloonStage.tsx                # 変更なし（サイズは Balloon 内で算出。overflow-hidden 済み）
```

## 3. サイズ拡大の設計

### 進捗（progress）の定義（時刻ベース）
- バルーン生成時に `expireAt`（既存）に加えて、生成時点の総カウント秒 `count`（= `COUNTDOWN_MIN`〜`MAX`）から
  **総寿命 `durationMs = count * 1000`** と **`startAt = expireAt - durationMs`** を導ける。
- 経過割合 `progress = clamp((now - startAt) / durationMs, 0, 1)`。
- `now` はカウントダウンの tick（既存 200ms 間隔）で更新される `remaining` と同じ描画サイクルで再計算する。

### scale の算出
- `scale = 1 + (BALLOON_MAX_SCALE - 1) * progress`
  - `progress=0`（発生直後）→ `scale=1`（初期サイズ）
  - `progress=1`（破裂直前）→ `scale=BALLOON_MAX_SCALE`（最大）
- 表示直径 `displaySize = balloon.size * scale`。

### 定数（`@/lib/constants`）
- `BALLOON_MAX_SCALE = 1.6`（破裂直前で初期比 1.6 倍。穏やかに膨らむ想定値）。
- 既存 `BALLOON_SIZE = 112` は初期直径として維持。

### はみ出し防止
- 既存の位置は**中心基準**（`Balloon` は `translate(-50%, -50%)`）で配置され、`BalloonStage` は `overflow-hidden`。
- 位置余白 `POSITION_MARGIN_PCT = 8%` により中心は領域端から離れているため、1.6 倍でも視覚的な破綻は生じにくい。万一はみ出しても `overflow-hidden` でクリップされる。

## 4. 実装詳細

### 4.1 constants.ts
- `BALLOON_MAX_SCALE` を追加し、コメントで意味（破裂直前の最大倍率）を明記。

### 4.2 useBalloonGame.ts
- `BalloonModel` に生成時カウントを保持する `durationMs`（= `count * 1000`）を追加。
  - `startAt` は `expireAt - durationMs` で算出できるため別途持たない。
- `spawnBalloon()` で `durationMs` を設定する（`expireAt` 算出と同じ箇所）。
- フックの公開APIは不変（`Balloon` が `balloon.durationMs`/`expireAt` を参照して自前で progress 算出）。
  - サイズ更新は既存の `remaining` 更新（200ms tick）による再レンダリングで反映される。

### 4.3 Balloon.tsx
- props で受け取る `balloon`（`durationMs`/`expireAt` を含む）と `remaining` を用いる。
  - `remaining` は再レンダリングのトリガ兼、進捗の目安。`scale` は時刻ベースで算出：
    - `now` はレンダー時点で必要だが、`Balloon` は Client Component。ただし `Math`/`Date` 直接呼び出しは既存規約（イベント/タイマー内のみ）に配慮し、
      **進捗は親から渡す `remaining` と `balloon.durationMs` から算出**する：
      `elapsedMs ≈ durationMs - remaining*1000` は粗いので、より滑らかにするため
      `progress = clamp(1 - (expireAt - nowFromTick)/durationMs, 0, 1)`。
    - レンダー内で `Date.now()` を避けるため、`useBalloonGame` の tick で `now` を更新し `remaining` と共に `progressMs` を提供する方式を採る（下記4.4）。

### 4.4 progress の提供方法（レンダー内 Date.now 回避）
- 既存規約「`Date.now()`/`Math.random()` はイベント/タイマー内のみ」を守るため、tick 内で `now` を確定し、
  フックから連続値 `elapsedMs`（= `now - startAt`、クランプ済み）を公開する。
- `Balloon` は `elapsedMs / durationMs` で progress を算出（レンダー内で乱数・現在時刻を呼ばない）。
- 公開APIに `elapsedMs` を追加（`remaining` と同じ tick で更新）。`BalloonScreen`→`BalloonStage`→`Balloon` へ受け渡す。

## 5. アクセシビリティ・演出

- 拡大は CSS transition（既存 `transition duration-200 ease-out`）で滑らかに補間。200ms tick と一致させ滑らかさを確保。
- `prefers-reduced-motion` 有効時は既存の globals.css により transition が無効化され、急拡大しない（サイズ自体は更新されるが補間なし）。
  - 追加で Balloon 側に `motion-reduce` は既存踏襲。
- 激しい点滅は発生しない（単調拡大のみ）。

## 6. 影響範囲

- 変更は `lib/constants.ts`・`hooks/useBalloonGame.ts`・`components/balloon/Balloon.tsx` のみ。
- スコア・破裂・競合防止・色・数字表示・離脱終了などの既存挙動は不変。
- logs/schedules・Context・永続化に影響なし。
