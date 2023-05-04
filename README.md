# TRIDENT - Unofficial UN dedicated interactive information retrieval and humanity assistance system

## How to use

### Install dependencies

```
npm ci
```

### add OpenAI API Key to `.env` file

```
cp .env.example .env
```

```
OPENAI_API_KEY=sk-xxxxxxxx
```

### Update document index

```
npm run site:qiita.com:fetch
```
