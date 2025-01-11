## How to development TRIDENT

### With Docker and docker compose

```bash
git clone git@github.com:yuiseki/TRIDENT.git
cd TRIDENT
cp .env.sample .env
# Edit `OPENAI_API_KEY` in the `.env` file
vim .env
# Start up TRIDENT
docker compose up
```

### Without Docker

```bash
git clone git@github.com:yuiseki/TRIDENT.git
cd TRIDENT
# Edit `OPENAI_API_KEY` in the `.env` file
vim .env
npm ci
npm run dev
```
