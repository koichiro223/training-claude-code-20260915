# 要求内容 — 基盤（Foundation）

## 0. この作業バッチの位置づけ

- 作業バッチ名：`20260915-foundation`
- 対象：全機能が共通で依存する**土台**（型・永続化・状態管理・共通UI・レイアウト/ナビ・トップ画面）の実装。
- 前提：`docs/` の永続的ドキュメント（PRD / 機能設計 / 技術仕様 / 構造 / ガイドライン / 用語）を正とする。
- 実装順序：**本バッチを最初に完了させる**。完了後、`20260915-life-log`（P1）／`20260915-schedule`（P2）／`20260915-balloon-game`（P3）の3機能は**並行開発が可能**になる。

> サブエージェント分担の前提：本バッチが提供する「型」「Context/フックのインターフェース」「共通UI」「ナビゲーション」を各機能バッチが利用する。これらの**公開インターフェースを本バッチで確定**することで、以降の機能を独立して実装できる。

## 1. 変更・追加する機能の説明

以下を新規作成する。

1. **ドメイン型定義**（`src/types/`）：`EventType` / `LogEntry` / `Schedule`。
2. **lib 層**：ID 生成（`id.ts`）、日時変換（`datetime.ts`）、定数（`constants.ts`）、localStorage ラッパ（`storage.ts`）、ドメイン純粋関数（`lib/domain/`：並べ替え・実績化変換・睡眠ペアリング）。
3. **状態管理**：`BabyLogContext.tsx`（Context + `BabyLogProvider` 本体）と、購読フック `useLogEntries` / `useSchedules`。
4. **境界ラッパー**：`components/providers.tsx`（`"use client"`）。
5. **共通レイアウト・ナビゲーション**：`app/layout.tsx`（Server Component, `lang="ja"`, `metadata`）とナビ部品（`components/layout/`）。
6. **汎用 UI**：ボタン、確認モーダル、空状態表示、通知（トースト/インライン）（`components/ui/`）。
7. **トップ画面**（`/`）：直近ログ・近い予定のサマリ、各画面への導線、空状態。

## 2. ユーザーストーリー

- 保護者として、アプリを開いた瞬間に直近の記録と近い予定を確認したい（トップ画面）。
- 保護者として、どの画面からでも他機能に移動したい（共通ナビ）。
- 保護者として、端末を再度開いてもデータが残っていてほしい（localStorage 永続化）。
- 開発者（後続バッチ）として、確定した型・フック・共通UIを使って機能を独立実装したい。

## 3. 受け入れ条件

### 状態・永続化
- `logs` / `schedules` がアプリ全体で**単一の状態源**（`BabyLogProvider`）として保持される。
- 初回マウント（`useEffect`）で localStorage から読み込み、SSR とクライアント初期状態が一致する（ハイドレーションエラーなし。初期値は空配列＋読み込み中/空状態表示）。
- 状態更新は「React state 更新 → `storage.ts` で保存」の順で行い、state と localStorage が乖離しない。
- 別タブでの更新に `window` の `storage` イベントで追従する。
- JSON パース失敗・スキーマ不一致・未知の新しい `schemaVersion` を検出した場合、**上書き保存せず**空データとして扱い、通知する。
- 保存失敗（`QuotaExceededError` 等）時は通知し、直近の操作を取り消す。

### フック（後続バッチ向けの公開インターフェース）
- `useLogEntries()` が `entries` と `add` / `update` / `remove`、並べ替え済み取得を提供する。
- `useSchedules()` が `schedules` と `add` / `update` / `remove` / `completeAsLog` / `uncomplete`、並べ替え済み取得を提供する。
- `completeAsLog` は logs と schedules を**1アクション**でまとめて更新する（機能設計 4.2 準拠）。
- `uncomplete` は `doneLogId` の LogEntry を削除してから参照をクリアする。
- 実績化 LogEntry を削除した場合、対応 Schedule を `done=false`／`doneLogId` クリアに戻す（参照整合性、機能設計 2.6）。

### 共通 UI・レイアウト
- 破壊的操作の確認は**アプリ内モーダル**（`role="dialog"`、フォーカストラップ、Esc/ボタンで閉じる）で行う。標準 `confirm()`／`alert()` は使わない。
- 通知はアプリ内の軽量表示（インライン or 簡易トースト）で行う。
- 全画面共通のナビゲーションから トップ／生活ログ／予定／バルーン遊び に相互遷移できる。
- `app/layout.tsx` は Server Component のまま、`lang="ja"` と `metadata` を持ち、`children` を `providers.tsx` で包む。

### トップ画面（`/`）
- 直近の生活ログ（最新5件程度）を新しい順に表示する。
- 近い予定：未完了予定を `scheduledAt` 昇順で数件表示し、過去日時（遅れ／overdue）が分かる表示にする。
- データ0件時は追加を促す空状態を表示する。
- 各機能画面への導線がある。

### 品質
- `npm run lint` と `npx tsc --noEmit` がエラー・警告なしで通る。

## 4. 制約事項

- 技術スタックは Next.js (App Router) / TypeScript(strict) / Tailwind CSS v4 / npm。外部状態管理ライブラリを追加しない。
- ID 生成は `crypto.randomUUID()`。非セキュアコンテキスト向けフォールバックを用意する。
- 日時保存は ISO8601（UTC基準）、表示・日付グルーピングはローカルタイムゾーン。
- `dangerouslySetInnerHTML` を使わない（XSS対策）。
- テスト自動化フレームワークは導入しない。ドメインロジックは純粋関数として切り出す。
- Git 操作（commit/branch/push/PR）は行わない。
