# TRIDENT Voyager

## Goal

- ReliefWeb から災害情報を取得する
- それぞれの災害に関連する GIS オープンデータを取得する
- それらを地図上に表示する

## Directory Structure

### Overview

- `docs/voyager/`
- `public/data/voyager/`
- `tmp/voyager`
- `scripts/voyager/`
- `src/app/voyager/`

### `docs/voyager/` directory

TRIDENT Voyager のためのドキュメントディレクトリ。

### `public/data/voyager/` directory

TRIDENT Voyager が使用できる、公開用のデータを格納するディレクトリ。

### `tmp/voyager/` directory

TRIDENT Voyager が使用できる、作業用一時ディレクトリ。

### `scripts/voyager/` directory

TRIDENT Voyager に関連するスクリプトを格納するディレクトリ。

**NOTE**

スクリプトは TypeScript または Shell script で記述しなければならない。

- scripts/voyager/index.ts

### `src/app/voyager/` directory

TRIDENT Voyager に関連する Next.js アプリケーションのディレクトリ。

- src/app/voyager/page.tsx
- src/app/voyager/MyMap.tsx

#### `src/app/voyager/[country]` directory

- src/app/voyager/[country]/page.tsx
- src/app/voyager/[country]/CountryDisasterMap.tsx
