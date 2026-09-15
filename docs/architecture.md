# 技術仕様書（Architecture）

## 0. ドキュメント情報

- 対象：赤ちゃんの生活ログアプリ（ベース機能）
- 位置づけ：本アプリの技術的な選定・制約・構成を定義する。機能の設計は `docs/functional-design.md`、要求は `docs/product-requirements.md` を参照。

### 改訂履歴
| 版 | 日付 | 変更概要 |
| --- | --- | --- |
| 1.0 | 2026-09-15 | 初版作成。技術スタック・構成・制約を定義 |
| 1.1 | 2026-09-15 | 独立レビュー反映（Provider/metadata両立、配布形態＝静的エクスポート、matchMedia/ダークモード要件外、crypto secure context、オフライン定義、テスト方針、バージョン表整合、lang="ja"/metadata） |

## 1. テクノロジースタック

バージョンは `package.json` の指定値。`^` 付きは semver レンジで、実際の解決値は `package-lock.json` に従う。

| 分類 | 採用技術 | 指定バージョン | 備考 |
| --- | --- | --- | --- |
| フレームワーク | Next.js (App Router) | 16.1.7（固定） | React Server/Client Components。ルーティングは `src/app/` |
| UIライブラリ | React / React DOM | 19.2.3（固定） | |
| 言語 | TypeScript | ^5 | `strict: true` |
| スタイリング | Tailwind CSS | ^4 | PostCSS プラグイン（`@tailwindcss/postcss`）経由 |
| 型定義 | @types/react / @types/react-dom / @types/node | ^19 / ^19 / ^20 | `@types/node` は 20 系。実行 Node 24 との差分は許容する |
| パッケージマネージャ | npm | （Node 同梱） | ロックファイル `package-lock.json` |
| 実行環境 | Node.js | 24.x（開発環境 24.11.1） | |
| Lint | ESLint | ^9 | `eslint-config-next`（core-web-vitals + typescript） |

- データストアは持たない（バックエンド／DB なし）。永続化はブラウザの `localStorage`（詳細は `functional-design.md` 2章）。

## 2. アプリケーション構成

### 2.1 レンダリング方針
- サーバー処理を持たない**クライアント主体のマルチページ構成**を Next.js App Router 上で実現する。API Routes・サーバーアクションは本フェーズでは使用しない。
- データを扱う画面・インタラクティブ要素は **Client Component**（`"use client"`）として実装する。
- 静的な骨組み（レイアウト・見出し等）は Server Component のままでよいが、`localStorage`・現在時刻・タイマーに触れる箇所は必ず Client Component 側に置く。
- SSR とクライアント初期状態の不一致（ハイドレーションエラー）を避けるため、ブラウザ専用データの読み込みはマウント後（`useEffect`）に行う（`functional-design.md` 1章参照）。

### 2.2 ルーティング
App Router によるページ単位のルーティングを採用する。

| ルート | ファイル（想定） | 画面 |
| --- | --- | --- |
| `/` | `src/app/page.tsx` | トップ |
| `/logs` | `src/app/logs/page.tsx` | 生活ログ |
| `/schedules` | `src/app/schedules/page.tsx` | 予定 |
| `/play` | `src/app/play/page.tsx` | バルーン遊び |

- 共通レイアウト・ナビゲーションは `src/app/layout.tsx`（Server Component）に配置し、`lang="ja"` とアプリ用の `metadata`（タイトル・説明）を設定する。
- **状態プロバイダ（`BabyLogProvider`）は `"use client"` が必要**なため、`layout.tsx` を直接クライアント化せず、`"use client"` を付けた専用ラッパー（例：`src/components/providers.tsx`）に切り出す。`layout.tsx`（Server Component のまま）から `children` をこのラッパーで包む。これにより `metadata` export を維持したまま Context を提供できる。

### 2.3 状態・永続化の技術方針
- アプリ全体を **React Context（`BabyLogProvider`）** で包み、`logs` / `schedules` を単一の状態源として保持する（`functional-design.md` 1章）。
- 状態管理には追加の外部ライブラリ（Redux 等）を導入せず、React 標準（Context + `useState`/`useReducer`）で完結させる。
- `localStorage` アクセスは `storage.ts` に集約し、読み書き・JSON パース・バリデーション・エラー処理を担う。
- 別タブ更新への追従に `window` の `storage` イベントを用いる。
- ID 生成は `crypto.randomUUID()`（ブラウザ標準）を用いる。

### 2.4 スタイリング方針
- Tailwind CSS v4 を採用（`src/app/globals.css` で `@import "tailwindcss";`）。
- 色・角丸・余白などデザイントークンは Tailwind のテーマ／CSS 変数で共通化し、統一感を保つ（詳細規約は `docs/development-guidelines.md`）。
- レスポンシブはスマホ縦画面優先（モバイルファースト）。

## 3. 開発ツールと手法

| 項目 | 内容 |
| --- | --- |
| 開発サーバー | `npm run dev` |
| ビルド | `npm run build`（静的エクスポート時は `out/` を生成） |
| 静的配信の確認 | `npx serve out` 等の静的サーバー（`next start` は静的エクスポートでは使わない） |
| Lint | `npm run lint`（ESLint） |
| 型チェック | `npx tsc --noEmit`（`tsconfig` は `noEmit: true`）。必要に応じて `type-check` npm script を追加する |
| パスエイリアス | `@/*` → `./src/*`（`tsconfig.json`） |

- コード変更後は必ず Lint・型チェックを実施する（CLAUDE.md の方針）。
- 動作確認に Playwright MCP ツールは使用しない（CLAUDE.md の方針）。

### テスト方針
- ベース機能では**テスト自動化フレームワークは導入しない**（`package.json` にもテスト依存を追加しない）。動作確認は開発サーバー上の手動確認と、Lint・型チェックで担保する。
- ただし、ドメインロジック（並べ替え・実績化変換・睡眠ペアリング等）は副作用のない純粋関数として切り出し、将来テストを追加しやすい構造にしておく（`functional-design.md` 1章・4章）。

## 4. 技術的制約と要件

- **バックエンド無し**：サーバー保存・認証・複数ユーザーは対象外。データは端末内に留める。
- **利用環境はブラウザのみ**：ネイティブ／デスクトップアプリは提供しない。
- **通信非依存**：起動後の実行に外部通信を要しない（外部 API 呼び出しをしない）。ただし初回ロードには配信元への接続が必要。完全なオフライン起動（PWA / Service Worker）は本フェーズ対象外。
- **単一利用者・単一端末**：端末・ブラウザをまたぐ同期はしない。
- **データ永続性の限界**：ブラウザのデータ削除・プライベートモード等でデータが失われうる。バックアップ機能は本フェーズ対象外。
- **依存追加の抑制**：ベース機能は標準機能（React/Next.js/Tailwind）で実現し、不要な依存を増やさない。

### 4.1 配布・デプロイ形態
- サーバー処理を持たないため、Next.js の**静的エクスポート**（`next.config.ts` に `output: 'export'`）による静的ファイル配信を基本方針とする。静的ホスティング（任意の静的サーバー／CDN）に配置できる。
- 開発時は `npm run dev`、ビルドは `npm run build`（静的エクスポート時は `out/` が生成される）を用いる。
- 静的エクスポートの制約（サーバー機能・動的ルートの一部が使えない）を踏まえ、本アプリは全ページをクライアント主体で構成する（この制約と現設計は矛盾しない）。
- 補足：静的エクスポートを採用する場合、`next start` は使用しない（`output: 'export'` の生成物は `out/` を任意の静的サーバーで配信する）。ローカル確認は静的サーバー（例：`npx serve out`）を用いる。静的エクスポートを採用しない選択（`next start` による Node 配信）も可能だが、本アプリはサーバー機能を使わないため静的エクスポートを推奨する。

## 5. パフォーマンス要件

- 画面遷移・操作・バルーンのタップ反応は体感で遅延なく動作する。
- バルーンのカウントダウンは時刻ベース（`expireAt`）で算出し、タイマーのドリフトや非アクティブタブでのスロットリングの影響を抑える（`functional-design.md` 4.3）。
- タイマー・イベントリスナはアンマウント時に確実に解除し、リーク・多重登録を防ぐ。
- `localStorage` の読み書きは必要最小限に留め、頻繁な同期書き込みでの体感低下を避ける。

## 6. セキュリティ・プライバシー

- ユーザー入力は React の標準エスケープで描画し、`dangerouslySetInnerHTML` を使用しない（XSS 対策）。
- 入力バリデーションを追加・編集時に実施する（`functional-design.md` 5章）。
- 外部送信を行わず、個人データをネットワークに出さない。

## 7. ブラウザ対応

- モダンブラウザ（スマートフォン・PC の最新版 Chrome / Safari / Firefox / Edge）を対象とする。
- 利用する Web API：`localStorage`、`crypto.randomUUID`、`prefers-reduced-motion` の判定（CSS メディアクエリ、または必要時に `matchMedia`）。いずれも対象ブラウザで利用可能。
- **ダークモード対応はベース機能では要件外**とする（PRD／機能設計に定義なし）。`globals.css` に残るボイラープレートの `prefers-color-scheme` 切替は、要件確定まで前提化しない。
- **`crypto.randomUUID` は Secure Context（HTTPS または `localhost`）でのみ利用可能**。非セキュアなコンテキスト（平文 HTTP の LAN 配信等）では `undefined` となりうるため、その場合に備えたフォールバック（疑似 UUID 生成）を `storage.ts` 近傍に用意する。

## 8. 想定ディレクトリ（概要）

詳細は `docs/repository-structure.md` で定義する。ここでは技術構成上の要点のみ示す。

- `src/app/` … ルーティング・レイアウト・各画面
- `src/components/` … 再利用 UI コンポーネント
- `src/lib/` … `storage.ts`・日時ユーティリティ・ドメインロジック（純粋関数）
- `src/hooks/` … `useLogEntries` / `useSchedules` / `useBalloonGame` 等
- `src/types/` … 型定義（`EventType` / `LogEntry` / `Schedule` 等）
