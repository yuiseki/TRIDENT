# TRIDENT

TRIDENT, an Interactive Smart Maps Assistant.

## What?

- TRIDENT is an AI assistant that can interactively create Smart Maps
- TRIDENT is based on OpenStreetMap data, specifically the Overpass API
- TRIDENT generates Overpass API queries based on user interaction, makes requests to the Overpass API, and visualizes the results as a map

## How to development

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
npm ci
npm run dev
```
