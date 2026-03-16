# Asset Allocation Simulator

FIRE計画向け資産アロケーションシミュレーター。モンテカルロ法で将来の資産推移を可視化する。

## 技術スタック

- **Next.js 15 + TypeScript** — App Router、Vercelデプロイ前提
- **Tailwind CSS v4** — スタイリング
- **Recharts** — パーセンタイル帯チャート・ヒストグラム
- **next-intl** — 日本語/英語対応（`/ja`, `/en`）
- **Web Worker** — モンテカルロ計算をメインスレッド外で実行

## コマンド

```bash
npm run dev     # 開発サーバー起動（localhost:3000）
npm run build   # プロダクションビルド
npm run lint    # ESLintチェック
```

## 重要なファイル

| ファイル | 役割 |
|---------|------|
| `src/lib/asset-data.ts` | 7資産クラスの年率リターン・標準偏差・相関行列（ハードコード） |
| `src/lib/cholesky.ts` | コレスキー分解（相関付き乱数生成に使用） |
| `src/lib/monte-carlo.ts` | シミュレーションロジック本体 |
| `src/workers/monte-carlo.worker.ts` | Web Worker版（UIで実際に使用） |
| `src/components/SimulationPanel.tsx` | 入力・出力を統合するメインコンポーネント |
| `src/messages/ja.json`, `en.json` | 翻訳テキスト |
| `src/types/index.ts` | 型定義 |

## 資産クラスとデータ

7クラス: 現金・外国株・日本株・外国債券・日本国債・金・ビットコイン

`src/lib/asset-data.ts` に年率リターン・標準偏差・7×7相関行列をハードコード。
データを更新する際はこのファイルのみ変更すればよい。

## シミュレーションアルゴリズム

1. 年率パラメータ → 月率に変換（リターン÷12、標準偏差÷√12）
2. 相関行列のコレスキー分解で相関付き乱数を生成（Box-Muller変換）
3. 10,000パスを月次でシミュレーション
4. 各月のパーセンタイル（5/25/50/75/95）と最終値分布を計算

## i18n

`/ja`（デフォルト）と `/en` のルーティング。
テキスト追加は `src/messages/ja.json` と `en.json` を同時に更新。
