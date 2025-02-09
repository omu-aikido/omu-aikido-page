# ホームページ

## 概要

Astro.jsを使用して開発されています。AstroJs
## 開発環境

### 依存 （2025-02-09時点）

#### Dependencies

- @astrojs/cloudflare: ^12.2.1
- astro: ^5.2.5
- ts-ics: ^1.6.6

#### DevDependencies

- @cloudflare/workers-types": "^4.20250204.0"
- wrangler: ^3.107.3

### ローカルでの開発方法

`npx preinstall`で[omu-aikido-app](https://github.com/omu-aikido/omu-aikido-app)から必要なLayoutsやコンポーネントを取得します。


```bash
$ npx astro dev # ローカルサーバを起動します
$ npx astro build # ビルドします
$ npx astro preview # プレビューします
```
