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
- ollama

```bash
make setup_ollama
make setup
npm ci
npm test
```

### Linting

To check code quality and maintain consistent style:

```bash
npm run lint
```

To automatically fix linting issues:

```bash
npm run lint -- --fix
```
