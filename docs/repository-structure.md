# リポジトリ構造定義書（Repository Structure）

## 0. ドキュメント情報

- 対象：赤ちゃんの生活ログアプリ（ベース機能）
- 位置づけ：フォルダ・ファイル構成と配置ルールを定義する。技術構成は `docs/architecture.md`、機能設計は `docs/functional-design.md` を参照。

### 改訂履歴
| 版 | 日付 | 変更概要 |
| --- | --- | --- |
| 1.0 | 2026-09-15 | 初版作成。ディレクトリ構成・配置ルールを定義 |
| 1.1 | 2026-09-15 | 独立レビュー反映（features/廃止しcomponents/へ集約、Provider/Context責務分担、hooks役割明確化、balloon命名統一、予約ファイル例外、favicon実態、目標構成の注記、SVG一覧） |

## 1. ルート構成

```
training-claude-code-20260915/
├── docs/                    # 永続的ドキュメント（本ドキュメント群）
│   └── images/              # 設計図（SVG）
├── .steering/               # 作業バッチドキュメント（YYYYMMDD-タイトル単位）
├── public/                  # 静的アセット（画像等。favicon は src/app/favicon.ico）
├── src/                     # アプリケーションソース
├── CLAUDE.md                # プロジェクトメモリ（開発ルール）
├── README.md
├── package.json / package-lock.json
├── tsconfig.json            # TypeScript 設定（strict, @/* エイリアス）
├── next.config.ts           # Next.js 設定（静的エクスポート output: 'export' 等。詳細は architecture.md）
├── eslint.config.mjs        # ESLint 設定
├── postcss.config.mjs       # PostCSS（Tailwind v4）
└── next-env.d.ts
```

## 2. `src/` の構成

> 本章は**目標ディレクトリ構成**である。現状の `src/` は `app/`（`layout.tsx`/`page.tsx`/`globals.css`/`favicon.ico`）のみであり、
> インクリメンタル開発（CLAUDE.md）に従って機能実装時に順次作成する。
> `architecture.md` 8章のディレクトリ要点（`app`/`components`/`hooks`/`lib`/`context`/`types`）と一致させている。

```
src/
├── app/                     # App Router：ルーティング・レイアウト・各画面
│   ├── layout.tsx           # ルートレイアウト（Server Component, lang="ja", metadata）
│   ├── page.tsx             # トップ（/）
│   ├── globals.css          # グローバルスタイル（Tailwind 読み込み）
│   ├── favicon.ico          # App Router 規約による favicon（自動配信）
│   ├── logs/
│   │   └── page.tsx         # 生活ログ（/logs）
│   ├── schedules/
│   │   └── page.tsx         # 予定（/schedules）
│   └── play/
│       └── page.tsx         # バルーン遊び（/play）
├── components/              # UI コンポーネント（Client 中心）
│   ├── providers.tsx        # "use client" 境界の薄いラッパー（BabyLogProvider でツリーを包む）
│   ├── layout/              # ナビゲーション等の共通レイアウト部品
│   ├── ui/                  # 汎用 UI（ボタン、モーダル、空状態表示 等）
│   ├── logs/                # 生活ログ画面の構成部品
│   ├── schedules/           # 予定画面の構成部品
│   └── balloon/             # バルーン遊び画面の構成部品（ルートは /play、機能識別子は balloon）
├── hooks/                   # カスタムフック
│   ├── useLogEntries.ts     # Context を購読（logs）
│   ├── useSchedules.ts      # Context を購読（schedules）
│   └── useBalloonGame.ts    # 画面ローカル状態（Context を購読しない・非永続）
├── lib/                     # ドメインロジック・ユーティリティ（副作用の少ない純粋関数中心）
│   ├── storage.ts           # localStorage ラッパ（読み書き・検証・エラー処理）
│   ├── datetime.ts          # 日時変換・整形（ISO8601 ⇔ ローカル）
│   ├── id.ts                # ID 生成（crypto.randomUUID + 非セキュア時フォールバック）
│   └── domain/              # 並べ替え・実績化変換・睡眠ペアリング等の純粋関数
├── context/                 # React Context 定義
│   └── BabyLogContext.tsx   # createContext ＋ BabyLogProvider 本体（logs/schedules の状態・localStorage同期）
└── types/                   # 型定義
    └── index.ts             # EventType / LogEntry / Schedule 等
```

### Provider と Context の責務分担
- `context/BabyLogContext.tsx`：`createContext` と **`BabyLogProvider` 本体**（状態保持・`storage.ts` との同期・`storage` イベント購読）を定義する。
- `components/providers.tsx`：`"use client"` を付け、`BabyLogProvider` を import してアプリツリー全体を包む**薄い境界ラッパー**。`app/layout.tsx`（Server Component）から `children` をこれで包む。

## 3. ディレクトリの役割

| ディレクトリ | 役割 |
| --- | --- |
| `src/app/` | ルーティング・レイアウト・各画面（ページ）。ページは薄く保ち、UI 実体は `components/` に置く |
| `src/components/` | UI コンポーネント。汎用（`ui/`）・共通レイアウト（`layout/`）・機能別（`logs/`/`schedules/`/`balloon/`）・境界ラッパー（`providers.tsx`） |
| `src/hooks/` | カスタムフック。Context 購読型（`useLogEntries`/`useSchedules`）と画面ローカル状態型（`useBalloonGame`）を含む |
| `src/lib/` | 永続化・日時・ID・ドメインロジック等の非 UI ロジック |
| `src/context/` | アプリ全体で共有する状態の Context 定義と Provider 本体 |
| `src/types/` | ドメインの型定義 |
| `docs/` | 永続的ドキュメント（`images/` に SVG 図） |
| `.steering/` | 作業バッチドキュメント |
| `public/` | 画像等の静的アセット（favicon は App Router 規約により `src/app/favicon.ico`） |

## 4. ファイル配置ルール

- **ページ（`app/**/page.tsx`）は薄く**：データ取得・レイアウトの土台のみとし、UI 詳細は `components/`（機能別サブディレクトリ）へ委譲する。
- **Client Component の境界を明確に**：`localStorage`・現在時刻・タイマー・イベントを扱うものは `"use client"` を付ける。`layout.tsx` はサーバーのまま保ち、状態提供は `components/providers.tsx` 経由にする。
- **ドメインロジックは `lib/` へ**：UI に依存しない純粋関数（並べ替え・変換・ペアリング等）は `lib/domain/` に置き、UI と分離する。
- **型は `types/` に集約**：機能をまたぐ型（`EventType`/`LogEntry`/`Schedule`）は `types/index.ts` に集約する（例外的なバレル。数が増えたらファイル分割する）。
- **1ファイル1責務**：コンポーネント／フック／ユーティリティは役割ごとにファイルを分ける（型定義の集約は上記の例外）。
- **import は `@/` エイリアス**：`src/` 配下は相対パスの深いネストを避け、`@/lib/...` のように参照する（`tsconfig.json` の `paths`）。

## 5. 命名規則（配置に関わる範囲）

- **ディレクトリ**：小文字（必要に応じて kebab-case）。例：`components/ui`, `features` は用いず `components/balloon`。
- **React コンポーネントファイル**：PascalCase（例：`BalloonStage.tsx`）。
- **フックファイル**：`useXxx.ts`（camelCase、`use` 接頭）。例：`useLogEntries.ts`。
- **その他ユーティリティ（非コンポーネント）**：kebab-case または短い lowercase。例：`storage.ts`, `datetime.ts`。
- **App Router の予約ファイル**（`page.tsx`/`layout.tsx`/`globals.css`/`favicon.ico` 等）は Next.js 規約に従い小文字とし、PascalCase 規則の対象外とする。
- **バルーン機能の呼称**：ルートは Next.js のパス都合で `/play`、機能識別子（ディレクトリ・フック名）は `balloon`（`components/balloon/`・`useBalloonGame`）に統一する。
- **SVG 図**：kebab-case（例：`er-diagram.svg`）。`docs/images/` に配置し、1ファイル1図（CLAUDE.md の図表ルール）。
- 詳細なコード命名規約は `docs/development-guidelines.md` を参照。

## 6. 配置してはいけないもの／注意

- `docs/` に一時的な作業メモを置かない（作業単位は `.steering/` を使う）。
- 図を Markdown 内に直接（Mermaid/ASCII）書かず、必ず `docs/images/` に SVG として分離する（CLAUDE.md）。
- ビルド生成物（`.next/`、`out/`）はソース管理対象外（`.gitignore`）。
- 参照されなくなった SVG は削除する（CLAUDE.md）。

### `docs/images/` の想定 SVG
`functional-design.md` から参照される図を配置する。

| ファイル | 参照元 |
| --- | --- |
| `er-diagram.svg` | データモデル（ER図） |
| `system-architecture.svg` | システム構成図 |
| `screen-transition.svg` | 画面遷移図 |
