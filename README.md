# TRIDENT

TRIDENT, an Interactive Smart Maps Assistant.

## What?

- TRIDENT is an AI assistant that can interactively create Smart Maps
- TRIDENT is based on OpenStreetMap data, specifically the Overpass API
- TRIDENT generates Overpass API queries based on user interaction, makes requests to the Overpass API, and visualizes the results as a map

## Development

### Minimum Requirements

- Node.js
- npm
- llama.cpp (built locally at `${LLAMA_CPP_DIR}`)
- tmux

```bash
npm ci
make setup        # starts 4 llama-server tmux sessions for inner/surface/deep/embedding
npm test
```

Stop with `make stop_llama_cpp`. Set `USE_LLAMA_CPP=1` in `.env.development`.

To use the legacy Ollama backend instead, run `make setup_ollama` and set `USE_OLLAMA=1`.

### Docker Compose

`docker compose up` brings up pgvector + 4 llama-server containers (NVIDIA GPU required for `:server-cuda` image) + Next.js dev server. The Next.js container reaches each role via `LLAMA_CPP_*_BASE_URL` env vars.
