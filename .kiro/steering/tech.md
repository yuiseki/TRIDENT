# Technology Stack

## Framework & Runtime
- **Next.js 15.3.3**: React framework with App Router
- **React 19.1.0**: UI library with latest features
- **Node.js**: Runtime environment with ES modules
- **TypeScript 5.8.3**: Primary language with strict configuration

## AI & Machine Learning
- **LangChain 0.3.0**: AI orchestration framework
- **Ollama**: Local LLM inference (qwen2.5:1.5b, snowflake-arctic-embed:22m)
- **OpenAI Integration**: Via @langchain/openai for external models
- **Vector Storage**: PostgreSQL with pgvector extension

## Database & ORM
- **PostgreSQL**: Primary database
- **Prisma 6.4.1**: Database ORM and migration tool
- **Vercel Postgres**: Cloud database integration

## Mapping & Geospatial
- **MapLibre GL 5.0.0**: WebGL-based map rendering
- **React Map GL 8.0.1**: React wrapper for MapLibre
- **Turf.js 7.1.0**: Geospatial analysis library
- **OSMtoGeoJSON**: Convert OpenStreetMap data to GeoJSON
- **PMTiles**: Efficient map tile format

## Authentication & Security
- **NextAuth.js 5.0.0-beta.25**: Authentication framework
- **Prisma Adapter**: Database session management

## Data Processing
- **DuckDB WASM 1.29.0**: In-browser analytics database
- **Apache Arrow 17.0.0**: Columnar data format
- **SWR 2.2.4**: Data fetching and caching

## Development Tools
- **ESLint 9.13.0**: Code linting with TypeScript support
- **Prettier**: Code formatting
- **Jest 29.7.0**: Testing framework
- **SASS 1.69.6**: CSS preprocessing

## Common Commands

### Development
```bash
# Install dependencies
npm ci

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test
```

### Database Operations
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Reset database
npx prisma migrate reset
```

### AI Model Setup
```bash
# Setup Ollama and models
make setup

# Pull specific models
ollama pull qwen2.5:1.5b
ollama pull snowflake-arctic-embed:22m
```

### Data Processing
```bash
# Fetch ReliefWeb data
npm run site:api.reliefweb.int:fetch

# Update disaster data
npm run site:api.reliefweb.int:update

# Run Voyager data processing
npm run voyager
```

## Build Configuration
- **WebAssembly Support**: Enabled for DuckDB and other WASM modules
- **ES Modules**: Full ESM support with `"type": "module"`
- **Path Aliases**: `@/*` maps to `src/*`
- **Experimental Features**: WASM modules, async WebAssembly