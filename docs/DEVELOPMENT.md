## How to Develop TRIDENT

### With Docker and docker compose

```bash
git clone git@github.com:yuiseki/TRIDENT.git
cd TRIDENT
cp .env.example .env
# Configure required environment variables:
# USE_OLLAMA=1
# OLLAMA_BASE_URL="http://ollama:11434"
# USE_POSTGRES=1
# VERCEL_ENV=development

# Start up TRIDENT
docker compose up
```

### Verifying Services

The following services should be running:

1. Next.js Application
   - URL: http://localhost:3000
   - When running correctly, you should see the TRIDENT web interface

2. Ollama Service
   - Port: 1143 (mapped to 11434 inside container)
   - Required models (qwen2.5:1.5b and snowflake-arctic-embed:22m) will be downloaded automatically

3. PostgreSQL Database
   - Port: 5433 (mapped to 5432 inside container)
   - Database: verceldb
   - Username: default
   - Password: password

### Troubleshooting

1. Check container status
```bash
docker compose ps
```

2. View service logs
```bash
# View all logs
docker compose logs

# View specific service logs
docker compose logs nextjs
docker compose logs ollama
docker compose logs db
```

3. Common Issues and Solutions
- If Ollama model downloads are taking time, check progress with `docker compose logs ollama`
- For database connection issues, verify PostgreSQL is healthy with `docker compose logs db`
- If ports are already in use, run `docker compose down` before starting again

### Without Docker

```bash
git clone git@github.com:yuiseki/TRIDENT.git
cd TRIDENT
cp .env.example .env
# Configure required environment variables
npm ci
npm run dev
```
