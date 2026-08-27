# 母艦 (yuisekin-z) の運用

`https://trident.yuiseki.net` を OpenAI なしで動かすための手順。
Pi クラスタ側は `k8s/pi/` と別途の手順を参照。

## いま動いているもの

| 役割 | 実体 | 向き先 |
|---|---|---|
| アプリ | Deployment `trident` (namespace `trident`) | `k8s/z/trident-app.yaml` |
| surface / inner | llama-server `gvt-llm` (Qwen3.6-35B-A3B, GPU) | `llama-server.knative-pool:8080` |
| deep | v4.2 の 0.5B (GPU 1, VRAM 636 MiB) | `trident-deep.default:8080` / `k8s/z/trident-deep.yaml` |
| embedding | granite-embedding (384 次元) | `embedding-server.default:8080` |
| Nominatim | 自前 | `nominatim.yuiseki.net` |
| Overpass | 自前 (planet) | `overpass.yuiseki.net` / NodePort 30112 |
| 地図スタイル | 自前 (tiles / glyphs / sprites すべて) | `z.yuiseki.net/static/maps/styles/osm-fiord.json` |
| DB | pgvector (Deployment `trident-db`, PVC `trident-db-data`) | database `trident` |

秘密は Secret `trident-env`。マニフェストには参照名しか書かない。

外部に出る通信は無い。ログに出る `"model_provider": "openai"` は LangChain が
`ChatOpenAI` クラスに付けるラベルで、OpenAI 互換クライアントを llama-server に
向けているだけ。実際の向き先は起動時の `Using llama-server (...)` の 4 行。

## デプロイ

### 1. ビルドして containerd に取り込む

registry は使わない。ホストで build して import する。
`NEXT_PUBLIC_*` はクライアントバンドルに焼き込まれるので実行時の env では
変えられない。build arg が唯一の入口。

```sh
SHA=$(git rev-parse --short HEAD)
docker build -f Dockerfile.production \
  --build-arg NEXT_PUBLIC_NOMINATIM_BASE_URL=https://nominatim.yuiseki.net \
  --build-arg NEXT_PUBLIC_OVERPASS_BASE_URL=https://overpass.yuiseki.net \
  --build-arg NEXT_PUBLIC_MAP_STYLE_URL=https://z.yuiseki.net/static/maps/styles/osm-fiord.json \
  -t trident:noopenai-$SHA .
docker save trident:noopenai-$SHA -o /tmp/trident-$SHA.tar
ctr -n k8s.io images import /tmp/trident-$SHA.tar   # sudo は不要
```

### 2. イメージがあることを確かめる

**必ず別のコマンドとして実行する。** ビルドを `&&` で繋いだ流れの中に混ぜない。

```sh
ctr -n k8s.io images ls | grep "trident:noopenai-$SHA"
```

ここが空のまま次へ進むと、Pod が ImagePullBackOff になり、
`strategy: Recreate` なので旧 Pod は既に消えていてサイトが落ちる。
実際に一度落とした。

### 3. 反映する

```sh
kubectl set image deploy/trident -n trident app=trident:noopenai-$SHA
kubectl rollout status deploy/trident -n trident
```

マニフェストの `image:` も同じ tag に更新してコミットする。

### 4. 確かめる

```sh
curl -s -o /dev/null -w '%{http_code}\n' https://trident.yuiseki.net
kubectl logs -n trident deploy/trident | grep "Using llama-server"   # 4 行出る
```

三層の通しは下の「動作確認」を実行する。

## 元に戻す

イメージは containerd に残っている。tag を戻すだけ。

```sh
ctr -n k8s.io images ls | grep trident:noopenai   # 使える tag を見る
kubectl set image deploy/trident -n trident app=trident:noopenai-<戻したい sha>
kubectl rollout status deploy/trident -n trident
```

OpenAI 経路に戻すなら env を 2 つ戻す。イメージはそのままでよい。

```sh
kubectl set env deploy/trident -n trident USE_OPENAI_API=1 USE_LLAMA_CPP=0
```

**env を分けて適用しないこと。** 接続先を入れる前にフラグだけ立てると、
既定の `127.0.0.1:18091` を見に行って inner が 504 になる。
ページ自体は 200 を返すので外形監視では気づけない。実際に一度踏んだ。
向きを変えるときは接続先を先に、フラグを後に。

## 動作確認

三層を通して Overpass まで。想定件数は 2026-08-27 時点。

```sh
B=https://trident.yuiseki.net
curl -s -X POST $B/api/ai/surface -H 'Content-Type: application/json' \
  -d '{"query":"台東区の蕎麦屋を表示して","pastMessages":[]}'
# -> Ability: overpass-api

curl -s -X POST $B/api/ai/inner -H 'Content-Type: application/json' \
  -d '{"pastMessages":["台東区の蕎麦屋を表示して","Ability: overpass-api\nReply: I copy."]}'
# -> Area: Taito, Tokyo / AreaWithConcern: Taito, Tokyo, Soba noodle shops

curl -s -X POST $B/api/ai/deep -H 'Content-Type: application/json' \
  -d '{"query":"AreaWithConcern: Taito, Tokyo, Soba noodle shops"}'
# -> area(3601543125) と area(3601758888) に接地されている
```

| 入力 | 期待 |
|---|---:|
| 台東区の蕎麦屋 | 31 件 |
| 台東区のカフェ | 368 件 |
| 広島のカフェ | 288 件 (広島県) |
| 広島市のカフェ | 127 件 (広島市) |
| 新宿のホテル | 97 件 |

`Area:` 行は境界クエリになる。`relation(1758888)` で台東区が 1 件。

## 落とし穴

### CDN が HTML を固定する

Next.js は prerender したページに `s-maxage=31536000` を付ける。CDN が
それを守ると、古い HTML が存在しないチャンク名を指し続け、
訪問者は先週のクライアントで今週の API を叩くことになる。
`next.config.mjs` の `headers()` で HTML を `max-age=0, must-revalidate` に
してあるので、この設定を含むイメージが載っていれば以後は起きない。

設定を入れる前にエッジへ載った応答は自然には消えない。Cloudflare の
パージが一度だけ必要。

### DB のベクタ次元

例のテーブルは埋め込みモデルの次元で作られる。granite は 384 次元、
OpenAI は 1536 次元。バックエンドを切り替えたあとに古いテーブルが残っていると
`different vector dimensions 1536 and 384` で落ちる。

テーブルは起動時にコードから作り直されるので、切り替えるときは
派生テーブルを消す。**認証系 (`User` `Account` `Session` `VerificationToken`)
と `JGeoGLUE*` は消さない。**

```sh
kubectl exec -n trident deploy/trident-db -- sh -c \
  'psql -U "$POSTGRES_USER" -d trident -c "DROP TABLE IF EXISTS
   trident_deep_example_openai, trident_inner_example_openai,
   trident_suggest_examples_openai, trident_surface_example_openai;"'
```

切り替えの途中で古いバックエンドのままリクエストを投げると、そのとき
古い次元で初期化されてしまう。env はまとめて適用し、確認は切り替え後に行う。

### 初回リクエストが遅い

起動後の最初のリクエストは例の埋め込み投入を待つので、CDN のタイムアウトに
当たることがある。失敗ではない。二度目から数秒で返る。

### .npmrc

`legacy-peer-deps=true` が無いと `@langchain/community` の peer 依存が
ERESOLVE になり `npm ci` が落ちる。`Dockerfile.production` の
`COPY package.json package-lock.json .npmrc ./` から外さないこと。

## 既知の弱点

| 症状 | 状態 |
|---|---|
| deep のタグ誤り。12 concern 中 4 件 (Bakeries / Schools / Libraries / Post offices) | 未対応 |
| うち Taginfo 検証で防げるのは 2 件のみ。残り 2 件は「実在するが概念が違う」タグ | 未対応 |
| inner が area の粒度を落とす。10 例中 6 例のみ正しい | 未対応 |
| 素の `Hiroshima` を市と県のどちらに解決するか。いまは県 | 保留 |
| llama.cpp 経路では `base-style-switch` と `style-edit` の ability が無効 | 仕様 |
| Prisma の認証テーブル。PVC を作り直したので未作成 | 未確認 |
