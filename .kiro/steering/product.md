# Product Overview

TRIDENT is an Interactive Smart Maps Assistant that creates dynamic, AI-powered maps based on user queries.

## Core Functionality

- **AI-Powered Map Generation**: Uses LangChain and Ollama models to interpret natural language queries and generate interactive maps
- **OpenStreetMap Integration**: Leverages OSM data via Overpass API to fetch real-world geographic information
- **Multi-layered AI Architecture**: 
  - Surface layer: Interprets user intent and determines capabilities
  - Inner layer: Processes geographic queries and generates Overpass API calls
  - Deep layer: Executes queries and transforms data into visualizations
- **Real-time Disaster Monitoring**: Integrates with ReliefWeb API for humanitarian data and disaster information
- **Geographic Quiz System (JGeoGLUE)**: Educational component for geographic knowledge testing
- **Multi-language Support**: Supports English, Japanese, Chinese, and French interfaces

## Key Features

- Interactive map visualization using MapLibre GL
- Real-time chat interface for natural language map queries
- Multiple map styles and customization options
- User authentication and session management
- Data persistence with PostgreSQL and Prisma
- Responsive design for desktop and mobile
- PWA capabilities with offline support

## Target Use Cases

- Emergency response and humanitarian mapping
- Educational geographic exploration
- Data visualization for disaster monitoring
- Interactive storytelling with geographic data