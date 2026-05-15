# ADR-0001: charites による地図スタイル編集機能を main page に統合する

## Status

Proposed

## Context

TRIDENT の main page (`src/app/page.tsx`) は現状、OpenStreetMap データに対する POI 検索 (Overpass API 経由) に特化している。ユーザーが「台東区のカフェを表示して」のように入力すると、surface → inner → deep の 3 層を経て Overpass QL を生成し、結果を GeoJSON オーバーレイとして地図に描画する。

一方で TRIDENT には別パスとして `src/app/charites/` が存在し、以下の機能を提供している:

- ブラウザの OPFS (Origin Private File System) に MapLibre style YAML ファイル群を bootstrap
- 自然言語指示で YAML ファイルを AI に編集させる (`/api/ai/charites`)
- 編集結果から MapLibre style JSON を構築して地図に反映

この charites 機能は独立した画面 (`/charites`) として実装されており、main page からは利用できない。ユーザーは「台東区のカフェを表示して」(POI 表示) と同じインタフェースで「地図の建物を消して」(style 編集) や「ベースマップを人工衛星にして」(プリセット切替) のような指示も出したい。

### 現状の routing 構造

`page.tsx` の `onSubmit` は surface chain の `Ability` フィールドで switch する:

```ts
switch (ability) {
  case "overpass-api": invokeOverpassInner(...);
  case "apology":
  case "ask-more":     break;
}
```

`Ability` 型は 3 値:

```ts
type Ability = "apology" | "ask-more" | "overpass-api";
```

### 推論バックエンドの非対称性

先行する Ollama → llama-server 移行 (commit `c048004` 等) で導入された `USE_LLAMA_CPP=1` モードでは、surface 層は **Qwen3-1.7B (Q4_K_M)** で動く。1.7B クラスの小型モデルで few-shot 5 値分類を高精度に行うのは難しく、style 編集系の指示を分類できない可能性が高い。

一方 OpenAI API (`gpt-5.1`) であれば 5 値分類は問題なく行える。

## Decision

charites 由来の機能を main page に組み込み、ユーザーが単一の入力ボックスから 3 種類の指示を出せるようにする。実装は以下のフェーズに分割する。

### 推論バックエンドの明示と相互排他

新しい環境変数 `USE_OPENAI_API` を導入する。`USE_LLAMA_CPP` / `USE_OLLAMA` / `USE_OPENAI_API` は **どれか 1 つだけ** 1 にできる:

| `USE_OPENAI_API` | `USE_LLAMA_CPP` | `USE_OLLAMA` | 結果 |
|---|---|---|---|
| 1 | 0 | 0 | OpenAI API (gpt-5.1) |
| 0 | 1 | 0 | llama-server (per-role) |
| 0 | 0 | 1 | Ollama |
| 0 | 0 | 0 | OpenAI API (フォールバック・既存挙動) |
| 2 つ以上 1 | | | **起動時エラー** |

複数同時に 1 の場合、Next.js の起動時 (instrumentation hook など) で明示的に `throw new Error("USE_OPENAI_API and USE_LLAMA_CPP are mutually exclusive")` する。ランタイムで sneaky に動くより、ブート時に止まるほうが安全。

`getChatModel` / `getEmbeddingModel` のシグネチャは **変更しない** (`role?: TridentRole` のまま)。代わりに関数内で上記環境変数を見て分岐する。charites route と base-style-switch ハンドラは `USE_OPENAI_API=1` を前提に動くため、getChatModel() の戻り値は OpenAI 化される。

### 推論バックエンドによる ability 数の非対称化

`Ability` 型を 5 値に拡張するが、surface chain の **few-shot example セットと prompt prefix を推論バックエンドで切り替える**:

| 推論バックエンド | 利用可能な ability (5 値中) | 落ちる機能 |
|---|---|---|
| OpenAI API (`USE_OPENAI_API=1` または既定) | 全 5 値 | なし |
| `USE_LLAMA_CPP=1` (Qwen3-1.7B) | 3 値: `apology` / `ask-more` / `overpass-api` | base-style-switch / style-edit |
| `USE_OLLAMA=1` | 3 値: 同上 | 同上 |

surface chain は環境変数を見て examples をマージして組み立てる (詳細は Phase 2)。prompt prefix の "Available abilities" 表記も連動する。

style-edit に到達するのは OpenAI 環境のみなので、charites route から直接 OpenAI を呼ぶことができ、surface chain との整合性が自然に保たれる。

### Phase 分割

#### Phase 1: `USE_OPENAI_API` 環境変数の導入と排他チェック

`getChatModel` / `getEmbeddingModel` のシグネチャは変更しない。代わりに:

- `.env.example` に `USE_OPENAI_API=0` を追加 (デフォルト OpenAI フォールバックと意味的に等価だが、明示性のために導入)
- `src/lib/env/assertInferenceBackend.ts` を新設し、`USE_OPENAI_API` / `USE_LLAMA_CPP` / `USE_OLLAMA` のうち 2 つ以上が `=== "1"` だったら `throw new Error(...)`
- `next.config.mjs` または `instrumentation.ts` から `assertInferenceBackend()` を 1 度だけ呼ぶ (ブート時 1 回チェック)
- `getChatModel` / `getEmbeddingModel` の分岐順序を整理し、`USE_OPENAI_API === "1"` でも OpenAI 分岐に明示的に入るように

副作用ゼロ、既存呼び出しサイトに変更不要。

#### Phase 2: `Ability` 型と surface chain の拡張

`src/types/Ability.ts` を 5 値に:

```ts
type Ability = 
  | "apology" 
  | "ask-more" 
  | "overpass-api"
  | "base-style-switch"  // 新規: 既存プリセットへの切替
  | "style-edit";         // 新規: charites による YAML 編集
```

surface chain の examples を **用途別 (= ability 別) のファイルに分割**する。今後 ability が増えるたびにファイルを足していけるよう拡張性を確保:

```
src/utils/langchain/chains/loadTridentSurfaceChain/examples/
├── index.ts                  # 集約とエクスポート、env 連動の組み立てロジック
├── general.ts                # apology / ask-more (常に含める)
├── overpass.ts               # overpass-api (常に含める)
├── base-style-switch.ts      # base-style-switch (OpenAI のみ)
└── style-edit.ts             # style-edit (OpenAI のみ)
```

`index.ts` で env を見て set を合成:

```ts
export const getSurfaceExamples = (): Example[] => {
  const isOpenAI = 
    process.env.USE_LLAMA_CPP !== "1" && 
    process.env.USE_OLLAMA !== "1";
  
  return [
    ...generalExamples,
    ...overpassExamples,
    ...(isOpenAI ? baseStyleSwitchExamples : []),
    ...(isOpenAI ? styleEditExamples : []),
  ];
};
```

合わせて prompt prefix の "Available abilities" 文字列も env 連動にする (`src/utils/langchain/chains/loadTridentSurfaceChain/prompt.ts` 内で同じ env 判定を行う)。

新しい ability を増やす際は:
1. `examples/<new-ability>.ts` を追加
2. `index.ts` の合成ロジックに 1 行追加
3. `Ability` 型に追記
4. (必要なら) prompt prefix に説明追加

の 4 ステップで完結する。

`base-style-switch` 用に surface 応答に `Style:` 行を追加:

```
Ability: base-style-switch
Style: arcgis-world-imagery
Reply: ベースマップを人工衛星画像に切り替えました
```

`Style` の取りうる値は MapStyleSelector の preset ID と一致させ、prompt prefix で列挙する。`parseSurfaceResJson` に `Style:` パースを追加。

#### Phase 3: page.tsx に 2 つの flow を追加

`onSubmit` の switch を拡張:

```ts
switch (ability) {
  case "overpass-api":      invokeOverpassInner(...);
  case "base-style-switch": setMapStyleJsonUrl(presetMap[styleId]);
  case "style-edit":        invokeCharitesFlow(...);
  case "apology":
  case "ask-more":          break;
}
```

`base-style-switch` は **既存 state を変えるだけ**でロジック追加ほぼゼロ。`presetMap` は MapStyleSelector のリストをそのまま使う定数として外出しする。

`style-edit` は重い:

- 初回 mount で OPFS bootstrap (`TridentCharitesDefaultContents` を OPFS に展開、既存なら skip)
- charites flow 呼び出し (`/api/ai/charites`)
- 応答 YAML を OPFS に書き戻し
- `parseYamlWithIncludes` で OPFS → MapLibre style JSON
- BaseMap に **object 形式の style** を渡す (現状は URL 文字列のみ対応)

#### Phase 4: BaseMap / MapStyleSelector の周辺改修 + 脱出 UI

- `BaseMap` の `style` prop を `string | StyleSpecification` に拡張 (maplibre-gl は両対応)
- MapStyleSelector に "🎨 Custom (charites)" 選択肢を追加 (style-edit 発火時に自動切替)
- style 切替時の **GeoJSON overlay の維持確認** (`<GeoJsonToSourceLayer>` children が壊れないか実機検証)
- Custom mode 中のインジケータ UI
- **脱出ボタン** = `TridentFileSystem.tsx:422-438` の **"ファイルシステムをリセット" (darkred 背景)** を main page にも配置する。Custom mode のときだけ表示。押下で OPFS を全消去 + プリセットスタイルに戻す。ユーザーが style 編集で壊れた状態から確実に回復できる導線を担保する

#### Phase 5: 信頼性強化 (任意)

- charites の出力が invalid YAML だった場合の自動 rollback (前回 style を保持)
- style-edit の Undo (直前 N 個の style snapshot を保持)
- (脱出ボタンは Phase 4 で必須化、ここでは取り扱わない)

## Consequences

### 良い影響

- 単一の入力ボックスから 3 種類の操作 (POI / preset 切替 / style 編集) が可能になり、TRIDENT の "interactive smart maps assistant" としての一貫性が上がる
- charites 画面 (`/charites`) は残しつつ、main page で同じ機能が使えるようになる (charites 画面は専門用途向け)
- `getChatModel` の `openai: true` オプションは、特定の chain だけ品質を担保したい場合に再利用できる汎用 API になる

### 悪い影響・受容するトレードオフ

- **`USE_LLAMA_CPP=1` ユーザーは 2 機能 (base-style-switch / style-edit) を使えない**。これは LLM サイズに起因する不可避な制限で、3 値版 surface examples で受け止める
- page.tsx (548 行) を触ることになり、既存の overpass-api フローを壊すリスクがある。Phase ごとに動作確認 (`make setup` → ブラウザで主要シナリオ実行) を必須化する
- BaseMap の `style` prop 型拡張は他の caller (StaticMap, StaticRegionsMap, planetiler ページ等) にも影響する。これらは string のままで動くべきなので、型を `string | StyleSpecification` にユニオン化するだけで OK
- OPFS は origin / browser 単位なので、ユーザーがブラウザを変えると style 編集結果がリセットされる。MVP では受容し、将来 URL share / DB 永続化を検討する

### リスクと対策

| リスク | 対策 |
|---|---|
| Phase 2 で examples ファイルが増えるとメンテナンスコスト増 | ability 単位の 1 ファイル 1 例集合とし、`index.ts` の合成ロジックを env で素直に切り替えるだけにする。今後 ability を増やす際の手順を ADR に明記済み |
| `mapStyle={object}` で頻繁な再レンダリングが起き地図がチラつく | `useMemo` で style object をメモ化 |
| charites の出力が破壊的で地図が真っ白 | YAML パース失敗時は前回 style に自動 rollback |
| MapStyleSelector のプリセット ID が prompt と乖離 | プリセット定義 (URL とラベル) を `src/constants/MapStylePresets.ts` に一元化し、surface prompt にも MapStyleSelector にも import |
| OpenAI API キー忘れの環境で main page が壊れる | `assertInferenceBackend()` のチェック対象を拡張し、`USE_OPENAI_API=1` かつ `OPENAI_API_KEY` 未設定 / fallback OpenAI 経路で API キー無しのケースも起動時に検出 |

## Alternatives Considered

### 案 A: charites を完全に main page に統合し、`/charites` 画面を削除

- pros: コードの重複が減る
- cons: 専門用途の YAML エディタ UI が失われる。OPFS の生ファイル編集が必要なパワーユーザーに不利益
- 棄却理由: `/charites` は残しても大したコストではない。main 統合は補完的なものとして両立させる

### 案 B: charites の例示集合を逐次取得する 1 つの ability にまとめる

5 値ではなく 4 値 (`style-change` を 1 つ追加) にして、preset 切替か YAML 編集かは内部で再判定する案。

- pros: surface の分類が 4 値で済む
- cons: 二段判定で latency が上がる。Qwen3-1.7B では結局区別できない
- 棄却理由: 区別がそもそも明確 (プリセット名で言うか属性で言うかの違い) なので分けるほうが healthy

### 案 C: USE_LLAMA_CPP=1 環境でも 5 値を頑張らせる

- pros: 環境による機能差分が無くなる
- cons: Qwen3-1.7B が style-edit を overpass-api と誤分類して charites flow が呼ばれ、OPFS が崩れるリスク
- 棄却理由: 静かに壊れるよりは、潔く OpenAI 限定機能とラベル付けするほうが信頼できる

### 案 D: charites 専用に 5 つ目の llama-server を立てる (port 18095)

- pros: `USE_LLAMA_CPP=1` でも charites を動かせる
- cons: charites のような YAML 生成は最低でも 7B 級 / coder 系 fine-tune が必要、VRAM コストとモデル選定コストが大きい
- 棄却理由: 試したいなら独立した別 ADR でやる。本 ADR の範疇外

## References

- `src/app/page.tsx` — 現状の main page (548 行)
- `src/app/api/ai/charites/route.ts` — charites API endpoint
- `src/app/charites/TridentFileSystem.tsx` — 既存 charites 専用画面
- `src/lib/trident/charites/default.ts` — OPFS bootstrap 用デフォルト YAML
- `src/utils/langchain/chains/charites/index.ts` — charites chain (few-shot YAML 生成)
- `src/utils/langchain/chains/loadTridentSurfaceChain/examples.ts` — surface few-shot examples
- `src/types/Ability.ts` — Ability 型定義
- `src/components/MapStyleSelector/index.tsx` — プリセットスタイル選択 UI
- commit `c048004` 推論基盤を Ollama から llama-server の役割別並列構成に移行 (前段、関連 commit)
