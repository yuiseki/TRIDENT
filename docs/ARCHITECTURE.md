# TRIDENT Architecture

TRIDENT is an AI-powered Interactive Smart Maps Assistant that combines OpenStreetMap data with natural language processing capabilities. This document describes its architecture and components.

## System Overview

TRIDENTは3層のアーキテクチャで構成されています：
TRIDENT is built on a three-layer architecture:

### 1. Surface Layer (表層)

The Surface Layer handles user interactions and ability selection:
- Manages dialogue with users
- Selects appropriate abilities for task completion
- Implemented in `loadTridentSurfaceChain`
- Processes natural language inputs and determines the appropriate course of action

表層は以下の役割を担います：
- ユーザーとの対話管理
- タスク達成に適切なアビリティの選択
- `loadTridentSurfaceChain`による実装
- 自然言語入力の処理とアクションの決定

### 2. Inner Layer (内層)

The Inner Layer processes dialogue history and generates intermediate representations:
- Analyzes conversation history between user and surface layer
- Outputs map content specifications in TRIDENT Intermediate Language
- Converts natural language requirements into structured map queries
- Manages map styling and visualization parameters

内層は以下の機能を提供します：
- ユーザーと表層間の対話履歴の分析
- TRIDENT中間言語による地図コンテンツの指定
- 自然言語要件の構造化マップクエリへの変換
- 地図のスタイリングと視覚化パラメータの管理

### 3. Deep Layer (深層)

The Deep Layer handles geospatial data retrieval:
- Generates Overpass API queries based on AreaWithConcern specifications
- Processes TRIDENT Intermediate Language
- Manages data retrieval and caching
- Implements OpenStreetMap data integration

深層は地理空間データの取得を担当します：
- AreaWithConcernに基づくOverpass APIクエリの生成
- TRIDENT中間言語の処理
- データ取得とキャッシュの管理
- OpenStreetMapデータの統合

## Technical Implementation

### Core Components

1. **Map Interface**
   - Built on MapLibre GL
   - Implements BaseMap component for map visualization
   - Supports multiple map styles and layers

2. **Data Management**
   - Uses Overpass API for OpenStreetMap data retrieval
   - Implements caching with 6-hour default duration
   - Converts OSM data to GeoJSON format

3. **AI Integration**
   - Utilizes LangChain for natural language processing
   - Implements custom chains for map-specific operations
   - Manages dialogue state and context

### Data Flow

1. User Input → Surface Layer
   - Natural language processing
   - Ability selection
   - Context management

2. Surface Layer → Inner Layer
   - Dialogue history analysis
   - Generation of TRIDENT Intermediate Language
   - Map specification creation

3. Inner Layer → Deep Layer
   - Query generation
   - Data retrieval
   - Cache management

4. Deep Layer → User Interface
   - Map rendering
   - Data visualization
   - User interaction handling

## Key Technologies

- **Frontend**: Next.js, React, TypeScript
- **Map Rendering**: MapLibre GL
- **Data Sources**: OpenStreetMap, Overpass API
- **AI/ML**: LangChain
- **State Management**: React Hooks
- **Caching**: Local Storage with timestamp-based invalidation

## Architecture Decisions

1. **Three-Layer Design**
   - Separates concerns between user interaction, processing, and data retrieval
   - Enables modular development and maintenance
   - Supports multiple language interfaces

2. **Caching Strategy**
   - 6-hour cache duration aligned with OpenStreetMap update cycles
   - Reduces load on Overpass API
   - Improves response times for frequent queries

3. **Component Structure**
   - Modular components for maintainability
   - Separation of map and dialogue interfaces
   - Reusable utilities and tools

## Future Considerations

1. **Extensibility**
   - Additional language tools in `langchain/tools`
   - Enhanced geospatial processing capabilities
   - New map visualization styles

2. **Performance Optimization**
   - Cache strategy refinement
   - Query optimization
   - Response time improvements

3. **Feature Enhancement**
   - Additional map data sources
   - Enhanced natural language understanding
   - Extended visualization capabilities
