## 概要

- Framework: Astro
- UI: Astro, React（@astrojs/react）
- Styling: Tailwind CSS
- Deployment: Cloudflare Pages（wrangler）

## 前提

- Node.js
- pnpm

## クイックスタート

```sh
# リポジトリルートで実行
pnpm install
pnpm dev              # 開発サーバを起動（通常 http://localhost:4321）
```

## package.json の主要スクリプト

（プロジェクトの `package.json` を反映）

- `pnpm dev`
  `astro dev`：ローカル開発サーバを起動

- `pnpm build`
  `astro build`：本番用にビルド（出力先は Astro の設定に準拠。通常は `dist` または `build`）

- `pnpm preview`
  `astro build && wrangler pages dev`：ビルド後に wrangler のローカル Pages エミュレーションを起動

- `pnpm deploy`
  `astro build && wrangler pages deploy dist --project-name=omu-aikido-page --branch=preview`：ビルドして Cloudflare Pages にデプロイ（project-name / branch は package.json にハードコード）

- `pnpm cf-typegen`
  `wrangler types`：Wrangler 用の型生成（必要に応じて）

- `pnpm format`
  `prettier --write .`：コード整形

## ディレクトリ構成

- `src/pages/` — ルーティングされるページ（`.astro`, `.mdx`, `.md` など）
  - `index.astro` → `/`
- `src/components/` — 再利用コンポーネント（.astro / React コンポーネント）
- `public/` — 静的アセット（そのまま配信、例: `/images/logo.png`）
- `package.json`, `README.md` 等プロジェクトルートに配置

## デプロイ（Cloudflare Pages）

[omu-aikido/omu-aikido-page](https://github.com/omu-aikido/omu-aikido-page)へのPRがマージされれば自動的にデプロイされます。
