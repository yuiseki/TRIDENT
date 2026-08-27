## How to Develop TRIDENT

### With Docker and docker compose

```bash
git clone git@github.com:yuiseki/TRIDENT.git
cd TRIDENT

# Start up TRIDENT
# Environment variables are automatically loaded from .env.development
docker compose up
```

### Verifying Services

The following services should be running:

1. Next.js Application
   - URL: http://localhost:3000
   - When running correctly, you should see the TRIDENT web interface

2. llama-server Services
   - One server per TRIDENT role
     (inner 18091 / surface 18092 / deep 18093 / embedding 18094)
   - Models are downloaded automatically by the `model-downloader` service

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
docker compose logs llama-inner
docker compose logs db
```

3. Common Issues and Solutions
- If model downloads are taking time, check progress with `docker compose logs model-downloader`
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
