# TRIDENT Voyager

## About

TRIDENT Voyager は、 TRIDENT のサブプロジェクトです。

## Goal

- 自律的に地理空間情報を取得、加工、可視化する生成 AI エージェントを生み出すこと

## Milestones

- [x] ReliefWeb から災害情報を取得する
  - [x] 災害ごとのページを表示する
- [ ] それぞれの災害に関連する GIS オープンデータを取得する
  - [ ] それらのデータを Web ページに表示できる形式に変換する
- [ ] それらを地図上に適切に表示する

## Directory Structure

### Overview

- `Makefile`
- `docs/voyager/`
- `public/data/voyager/`
- `tmp/voyager`
- `scripts/voyager/`
- `src/app/voyager/`

### `Makefile`

TRIDENT 全体の Makefile。

`make voyager` で TRIDENT Voyager を実行する。

### `package.json`

TRIDENT 全体の package.json。
package.json の scripts に `voyager` というコマンドがあり、
Makefile の `voyager` ターゲットを実行すると、このコマンドが実行される。

### `docs/voyager/` directory

TRIDENT Voyager のためのドキュメントディレクトリ。

### `public/data/voyager/` directory

TRIDENT Voyager が使用できる、公開用のデータを格納するディレクトリ。

- `public/data/voyager/latest/`
  - 最新の災害情報データを格納

### `tmp/voyager/` directory

TRIDENT Voyager が使用できる、作業用一時ディレクトリ。

### `scripts/voyager/` directory

TRIDENT Voyager に関連するスクリプトを格納するディレクトリ。

**NOTE**

スクリプトは TypeScript または Shell script で記述しなければならない。

- `scripts/voyager/index.ts`
  - ReliefWeb からの災害情報取得スクリプト

### `src/app/voyager/` directory

TRIDENT Voyager に関連する Next.js アプリケーションのディレクトリ。

- `src/app/voyager/page.tsx`
  - メインページのコンポーネント
- `src/app/voyager/MyMap.tsx`
  - 地図表示用の共通コンポーネント

#### `src/app/voyager/[country]` directory

国別の災害情報表示ページ

- `src/app/voyager/[country]/page.tsx`
  - 国別ページのコンポーネント
- `src/app/voyager/[country]/CountryDisasterMap.tsx`
  - 国別の災害情報地図コンポーネント

## Data Flow

1. データ取得（`scripts/voyager/index.ts`）

- ReliefWeb の API を使用して災害情報を取得
- 取得したデータを `public/data/voyager/latest/` に保存

2. データ表示（`src/app/voyager/`）

- メインページで全体の災害情報を表示
- 国別ページで詳細な災害情報と地図を表示

## Development

### Setup

1. 依存パッケージのインストール

```bash
npm ci
```

2. 開発サーバーの起動

```bash
npm run dev
```

### データ取得・更新

```bash
make
```
