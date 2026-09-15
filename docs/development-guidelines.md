# 開発ガイドライン（Development Guidelines）

## 0. ドキュメント情報

- 対象：赤ちゃんの生活ログアプリ（ベース機能）
- 位置づけ：コーディング規約・命名規則・スタイリング規約・テスト規約・Git 規約を定義する。
- 関連：技術構成は `docs/architecture.md`、構造は `docs/repository-structure.md`、用語は `docs/glossary.md`。

### 改訂履歴
| 版 | 日付 | 変更概要 |
| --- | --- | --- |
| 1.0 | 2026-09-15 | 初版作成。コーディング／命名／スタイリング／テスト／Git 規約を定義 |
| 1.1 | 2026-09-15 | 独立レビュー反映（担保区分1.6、色パレット確定3.1、命名統一、BabyLogProvider表記、Git参考の非提案明示、定数・通知配置10章、品質チェック見出し） |

## 1. コーディング規約

### 1.1 言語・型
- TypeScript を用い、`strict` を前提とする。`any` は原則禁止。型が不明な場合は `unknown` を使い絞り込む。
- ドメイン型（`EventType` / `LogEntry` / `Schedule`）は `src/types/` に定義し、各所から import する。
- 関数の引数・戻り値には型を明示する（推論に頼りすぎない、特に公開関数）。
- `null` と `undefined` を混用しない。任意項目は `?`（`undefined`）で表現する。

### 1.2 React / Next.js
- 既定は Server Component。`localStorage`・現在時刻・タイマー・イベント・状態を扱うコンポーネントにのみ `"use client"` を付ける。
- ルートレイアウト（`app/layout.tsx`）は Server Component のまま保ち、状態プロバイダは `components/providers.tsx`（`"use client"`）に切り出す。
- 副作用は `useEffect` に閉じ込め、依存配列を正しく指定する。クリーンアップ（タイマー・イベント解除）を必ず行う。
- ブラウザ専用値の初期化はマウント後に行い、SSR とクライアント初期状態を一致させる（ハイドレーション不整合の回避）。
- ドメインロジック（並べ替え・変換・ペアリング）は UI から切り離し、`src/lib/` の純粋関数として実装する。

### 1.3 状態管理
- グローバル状態（`logs` / `schedules`）は `BabyLogProvider`（`context/BabyLogContext.tsx`）を単一の状態源とする。画面ごとに独立した状態を持たない。
- 状態更新は「React state を更新してから `storage.ts` で永続化」の順で行い、state と localStorage を乖離させない。
- 複数データを同時に変える操作（実績化など）は1アクションにまとめる。

### 1.4 エラー処理・防御的実装
- `localStorage` の読み込み失敗・パース失敗時は、黙って上書き保存せず、空データとして扱いつつ通知する（`functional-design.md` 5章）。
- 参照先（`doneLogId` / `fromScheduleId`）が見つからない場合も落ちないように扱う。
- 外部入力（フォーム値）は保存前にバリデーションする。

### 1.5 その他
- マジックナンバー・固定文字列は定数化する（カウントダウン範囲、色パレット、文字数上限 等）。定数の配置は §10 を参照。
- import は `@/` エイリアスを用いる（深い相対パスを避ける）。
- 未使用の変数・import・コードを残さない。

### 1.6 規約の担保区分
規約には「ESLint で自動検証されるもの」と「手動遵守（レビュー・目視）で守るもの」がある。混同しないこと。

- **自動検証（`eslint-config-next` = core-web-vitals + typescript）**：未使用変数、React Hooks の依存配列、Next.js のベストプラクティス等。
- **手動遵守（現状 lint 未強制）**：`any` の回避、Tailwind クラスの並び順、関数の型明示の徹底 等。将来これらを強制したい場合は、対応する ESLint ルール／プラグイン（例：`@typescript-eslint/no-explicit-any`、`prettier-plugin-tailwindcss`）の追加を別途検討する。

## 2. 命名規則

| 対象 | 規則 | 例 |
| --- | --- | --- |
| React コンポーネント | PascalCase | `BalloonStage`, `ScheduleList` |
| コンポーネントファイル | PascalCase.tsx | `BalloonStage.tsx` |
| フック | `use` + camelCase | `useLogEntries` |
| フックファイル | フック名.ts | `useLogEntries.ts` |
| 変数・関数 | camelCase | `occurredAt`, `completeAsLog` |
| 型・インターフェース | PascalCase | `LogEntry`, `EventType` |
| 定数 | UPPER_SNAKE_CASE | `COUNTDOWN_MIN`, `BALLOON_COLORS` |
| 非コンポーネントの一般ファイル | kebab-case または短い lowercase | `storage.ts`, `datetime.ts` |
| ディレクトリ | 小文字（複数語は kebab-case） | `components/ui`, `components/balloon` |
| App Router 予約ファイル | Next.js 規約（小文字） | `page.tsx`, `layout.tsx`, `globals.css` |
| SVG 図 | kebab-case.svg | `er-diagram.svg` |

- ドメイン用語（英語名）は `docs/glossary.md` の対応表に従って統一する（例：授乳＝feeding、予定＝schedule）。
- 真偽値は `is`/`has`/`can`/`done` などの接頭・接尾で意図を示す。

## 3. スタイリング規約

- Tailwind CSS v4 を用い、原則ユーティリティクラスでスタイリングする。生 CSS は `globals.css` の最小限に留める。
- 色・角丸・余白などはデザイントークン（Tailwind テーマ／CSS 変数）に集約し、直値の乱用を避けて統一感を保つ。
- **モバイルファースト**：スマホ縦画面を基準に組み、必要に応じてブレークポイントで拡張する。
- タップ対象は十分な大きさを確保する（片手・タップ主体の操作）。
- 情報は色のみに依存させず、アイコン・ラベルを併用する。
- アニメーションは控えめにし、`prefers-reduced-motion` 有効時は簡略化・低減する。
- クラスの並びは「レイアウト → 余白 → 色・装飾」の順を目安に、可読性を優先する（現状 lint 未強制の手動遵守。§1.6）。条件付き結合が複雑な場合はヘルパーで整理する。

### 3.1 バルーンの色パレット（確定）
`functional-design.md` 4.3 で本ファイルを参照先としているため、ここで確定する。定数 `BALLOON_COLORS` として定義し（配置は §10）、出現ごとにランダム選択する。

| 色名 | 目安の色（Tailwind 系トーン） | 数字テキスト色 |
| --- | --- | --- |
| ピンク | pink-300 系 | 濃色（例：pink-900） |
| スカイブルー | sky-300 系 | 濃色 |
| イエロー | yellow-300 系 | 濃色 |
| グリーン | green-300 系 | 濃色 |
| パープル | purple-300 系 | 白または濃色（コントラスト確認） |
| オレンジ | orange-300 系 | 濃色 |

- パステル調（明度高め）を基本とし、**各背景色に対して数字が読めるコントラスト**を確保する（背景が明るい色は濃い数字色を用いる）。実装時に実際の Tailwind クラス値を確定する。

## 4. アクセシビリティ規約

- 意味に応じた要素・ロールを用いる（ボタンは `<button>`、ダイアログは `role="dialog"`）。
- フォーム項目にはラベルを関連付ける。
- モーダルはフォーカストラップし、Esc・ボタンで閉じられるようにする。
- 動的更新（バルーンのスコア、結果メッセージ）は `aria-live` で伝える。
- 色のコントラストを確保する（バルーンの数字は背景色に対して読める色を選ぶ）。

## 5. セキュリティ規約

- ユーザー入力は React の標準エスケープで描画し、`dangerouslySetInnerHTML` を使用しない（XSS 対策）。
- 追加・編集時に入力バリデーション（必須・型・文字数・数値範囲）を行う。
- 外部送信を行わない（個人データを端末外に出さない）。

## 6. テスト規約

- ベース機能では自動テストフレームワークを導入しない（`docs/architecture.md` テスト方針）。
- 動作確認は開発サーバー上の手動確認、および Lint・型チェックで担保する。
- ドメインロジックは純粋関数として切り出し、将来の単体テスト追加を容易にしておく。
- 動作確認に Playwright MCP ツールは使用しない（CLAUDE.md）。

## 7. 品質チェック（実装後・変更報告前）

- 実装後、変更を報告する前に必ず以下を実行し、エラーがない状態にする。
  - Lint：`npm run lint`
  - 型チェック：`npx tsc --noEmit`（`package.json` に `type-check` script を用意する場合は `npm run type-check`）
- 警告・エラーを残さない。修正できない場合は理由を作業バッチドキュメントに記録する。

## 8. Git 規約

> **重要（CLAUDE.md）**：本リポジトリでは Git 操作（commit / branch / checkout / switch / worktree / push / PR 作成）はすべて人間が行う。
> Claude Code はこれらを実行せず、**提案・催促もしない**。実装・動作確認が終わったら変更内容を報告して作業を終える。

以下は**人間のみが参照する参考情報**であり、Claude Code はこれに基づく提案・催促・実行を一切行わない。

- コミットは論理的なまとまり単位で行う。
- コミットメッセージは変更内容が分かる簡潔な要約とする（日本語可）。
- 作業単位は `.steering/[YYYYMMDD]-[開発タイトル]/` のドキュメントで管理する。

## 9. ドキュメント運用（開発時）

- 基本設計に影響する変更は、該当する `docs/` を更新する（`functional-design.md` 等）。
- 図を変更する場合は `docs/images/` の SVG も同時更新し、Markdown から参照する（Mermaid/ASCII を本文に直書きしない）。
- 各作業は `.steering/` に requirements → design → tasklist を作成し、各段階で確認・承認を得てから次へ進む。

## 10. 定数・通知パターンの配置

### 定数
- ドメイン／演出の固定値は定数化し、`src/lib/` 配下に集約する（例：`src/lib/constants.ts`）。
  - 例：`COUNTDOWN_MIN` / `COUNTDOWN_MAX`（バルーンのカウント範囲）、`BALLOON_COLORS`（色パレット）、`MEMO_MAX_LENGTH`（500）、`TITLE_MAX_LENGTH`（100）。
- 特定機能のみで使う定数は、その機能のコンポーネント近傍に置いてもよい。

### 通知（エラー・保存失敗）UI パターン
- `functional-design.md` 5章が求める「通知」は、アプリ内の軽量な通知表示（インラインのメッセージ領域、または簡易トースト）で行う。ブラウザ標準 `alert()` は用いない。
- 破壊的操作の確認はアプリ内モーダル（`components/ui`）で行う（標準 `confirm()` を用いない）。

### コード内コメント・文言
- コード内のコメントは日本語可（周囲のコードに合わせる）。ユーザー向け表示文言は日本語とし、用語は `docs/glossary.md` に従う。
