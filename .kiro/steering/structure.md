# Project Structure

## Root Directory Organization

```
├── src/                    # Main application source code
├── public/                 # Static assets and data files
├── prisma/                 # Database schema and migrations
├── scripts/                # Data processing and utility scripts
├── docs/                   # Documentation files
├── tmp/                    # Temporary files and cache
└── .kiro/                  # Kiro IDE configuration
```

## Source Code Structure (`src/`)

### Application Layer (`src/app/`)
- **Next.js App Router**: File-based routing with layout components
- **API Routes** (`src/app/api/`): Server-side endpoints
  - `ai/`: AI processing endpoints (surface, inner, deep, charites, duckdb)
  - `auth/`: NextAuth.js authentication
  - `tasks/`: JGeoGLUE quiz system
  - `q/`: Query processing
- **Page Components**: Route-specific UI components
  - `agent/`: AI agent interfaces
  - `charites/`: Map style editor
  - `duckdb/`: Data analytics interface
  - `voyager/`: Country-specific disaster maps
  - `q/`: Quiz system pages

### Component Library (`src/components/`)
- **Atomic Design**: Reusable UI components with co-located styles
- **Naming Convention**: PascalCase folders with index.tsx and styles
- **Key Components**:
  - `BaseMap/`: Core map rendering component
  - `DialogueElementView/`: Chat message display
  - `FloatingChatButton/`: Collapsible chat interface
  - `InputSuggest/`: AI-powered input suggestions
  - `GeoJsonToSourceLayer/`: Map data visualization

### Utilities & Libraries (`src/lib/`, `src/utils/`)
- **lib/**: Core utility functions and integrations
  - `maplibre/`: Map-specific utilities
  - `osm/`: OpenStreetMap API integrations
  - `trident/`: TRIDENT-specific helpers
- **utils/**: Business logic and processing
  - `langchain/`: AI chain configurations and tools
  - `langgraph/`: Graph-based AI agents
  - `trident/`: TRIDENT core functionality

### Type Definitions (`src/types/`)
- **TypeScript Interfaces**: Shared type definitions
- **Domain Models**: Business logic types (Concern, DialogueElement, etc.)

## Public Assets (`public/`)

### Data Storage (`public/data/`)
- **Structured by Source**: API responses organized by domain
- **GeoJSON Files**: Geographic data for visualization
- **JSON Datasets**: Processed data for AI training and inference

### Static Resources
- **Icons**: PWA and UI icons
- **Map Styles**: MapLibre GL style definitions
- **Fonts**: Custom typography assets

## Database Layer (`prisma/`)
- **Schema Definition**: Single schema.prisma file
- **Migrations**: Versioned database changes
- **Models**: User management, authentication, quiz system

## Scripts & Automation (`scripts/`)
- **Data Processing**: ETL pipelines for external APIs
- **Site-specific**: Organized by data source (reliefweb, nhk)
- **Utilities**: Helper scripts for development

## Naming Conventions

### Files & Directories
- **Components**: PascalCase folders with index.tsx
- **Pages**: kebab-case for routes, PascalCase for components
- **Utilities**: camelCase files
- **Types**: PascalCase interfaces

### Code Style
- **React Components**: Function components with TypeScript
- **Hooks**: Custom hooks prefixed with `use`
- **Constants**: UPPER_SNAKE_CASE for static values
- **CSS Modules**: `.module.css` or `.module.scss` suffix

## Import Patterns
- **Path Aliases**: Use `@/` for src/ imports
- **Relative Imports**: For same-directory files
- **Barrel Exports**: Index files for component folders
- **Type-only Imports**: Use `import type` for TypeScript types

## Configuration Files
- **Root Level**: Build tools, linting, and framework config
- **Environment**: `.env` files for different environments
- **IDE Settings**: `.vscode/` and `.kiro/` for development tools