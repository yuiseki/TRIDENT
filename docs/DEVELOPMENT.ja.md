## TRIDENTの開発方法

### Docker と docker compose を使用する場合

```bash
git clone git@github.com:yuiseki/TRIDENT.git
cd TRIDENT
cp .env.example .env
# 必要な環境変数を設定
# USE_OLLAMA=1
# OLLAMA_BASE_URL="http://ollama:11434"
# USE_POSTGRES=1
# VERCEL_ENV=development

# TRIDENTを起動
docker compose up
```

### 動作確認方法

以下のサービスが正常に起動していることを確認してください：

1. Next.js アプリケーション
   - URL: http://localhost:3000
   - 正常に起動すると、TRIDENTのウェブインターフェースが表示されます

2. Ollama サービス
   - ポート: 1143 (コンテナ内部では11434)
   - 必要なモデル（qwen2.5:1.5b、snowflake-arctic-embed:22m）が自動的にダウンロードされます

3. PostgreSQL データベース
   - ポート: 5433 (コンテナ内部では5432)
   - データベース名: verceldb
   - ユーザー名: default
   - パスワード: password

### トラブルシューティング

1. コンテナの状態確認
```bash
docker compose ps
```

2. 各サービスのログ確認
```bash
# 全てのログを表示
docker compose logs

# 特定のサービスのログを表示
docker compose logs nextjs
docker compose logs ollama
docker compose logs db
```

3. よくある問題と解決方法
- Ollamaモデルのダウンロードに時間がかかる場合は、`docker compose logs ollama`で進行状況を確認できます
- データベース接続エラーの場合は、`docker compose logs db`でPostgreSQLの起動状態を確認してください
- ポートが既に使用されている場合は、`docker compose down`を実行してから再度起動してください

### Docker を使用しない場合

```bash
git clone git@github.com:yuiseki/TRIDENT.git
cd TRIDENT
cp .env.example .env
# 必要な環境変数を設定
npm ci
npm run dev
```
