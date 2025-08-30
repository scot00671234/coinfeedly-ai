# AI Commodity Price Prediction Platform

## Overview
This platform is a full-stack web application for tracking and analyzing AI model predictions of commodity prices. It features a minimalist landing page and a comprehensive dashboard where users can compare the accuracy of various AI models (Claude, ChatGPT, Deepseek) in predicting both hard and soft commodity prices across quarterly timeframes (3mo, 6mo, 9mo, 12mo). Key capabilities include real-time price tracking from Yahoo Finance, interactive charts with timeframe filtering, model performance analytics, and league tables. The project generates comprehensive monthly predictions on the 1st of each month and provides a robust, data-driven tool for assessing AI prediction capabilities in financial markets.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes (August 2025)
- **Modern UI Enhancement Package - August 2025**: Complete visual transformation with Vercel-inspired design language and enhanced user experience
- **Smooth Animations**: Implemented framer-motion for sophisticated fade-in animations, staggered card reveals, and smooth page transitions
- **Enhanced Scrolling**: Added native smooth scrolling with proper scroll padding for sticky headers and optimized webkit behavior
- **Modern Typography**: Upgraded to semibold headings, improved line heights, enhanced letter spacing, and better visual hierarchy
- **Sophisticated Backgrounds**: Modernized hero gradients with muted gray tones, separate light/dark theme waves, and cleaner visual aesthetics
- **Interactive Elements**: Added hover scale effects, button animations, and micro-interactions throughout the interface
- **Professional Navigation**: Enhanced header with announcement banner, improved navigation menu, and better mobile responsiveness
- **Visual Consistency**: Unified spacing system with larger section padding, improved card layouts, and consistent visual rhythm
- **Platform Enhancement Package August 2025**: Complete platform improvement with educational content and user experience enhancements
- **New Educational Pages**: Added comprehensive About and FAQ pages to improve user understanding and engagement
- **Enhanced Navigation**: Updated site navigation across all pages with consistent menu structure (Landing, Dashboard, About, FAQ, Blog, Policy)
- **Component Optimization August 2025**: Fixed constant loading issue by removing infinite retry loops in CompositeIndexGauge and related dashboard components
- **Minimalist Design Update**: Simplified dashboard cards with cleaner spacing, reduced padding, and subtle loading states using triangle icons
- **Company Information Added**: Added Loremt ApS CVR-nr 41691360 to footer across all pages (landing, dashboard, blog)
- **Quarterly Prediction System**: Complete architecture transformation implementing quarterly forecasting (3mo, 6mo, 9mo, 12mo) with monthly generation on 1st of each month at 3 AM
- **Timeframe-Aware Architecture**: Added timeframe field to predictions table with production-safe migration, frontend filtering, and API endpoint support
- **Enhanced AI Services**: Updated OpenAI, Claude, and Deepseek services with quarterly timeframe-specific prediction logic and specialized prompts for long-term forecasting
- **Frontend Timeframe Support**: Implemented tabbed interface and filtering for quarterly predictions with bar chart visualization optimized for timeframe comparison
- **Production Migration Safety**: Updated production-migrate.ts script to handle schema changes seamlessly for Dokploy VPS deployments
- **Overlap Management**: Implemented full prediction overlap preservation for rich accuracy analysis and prediction evolution tracking
- **Claude Model Fix**: Fixed critical Claude prediction failures by updating to current model version (claude-sonnet-4-20250514) and added JSON parsing robustness for markdown code blocks
- **Production Migration System**: Created comprehensive database migration system with automatic production deployment
- **Robust Error Handling**: Fixed critical production issue (42P01 - relation 'commodities' does not exist) with multi-layer migration approach
- **Enhanced Deployment**: Added automatic schema creation, conflict resolution, and production-ready scripts (deploy.sh, production-migrate.ts)
- **Replit Migration Complete**: Successfully migrated from Replit Agent to standard Replit environment with PostgreSQL setup
- **Composite Index Issue Fixed**: Identified routing issue where Hard/Soft commodity indices showed static 50.0 values despite having predictions - solution is to trigger fresh composite index calculation on production server
- **Google AdSense Integration**: Added Google AdSense script with publisher ID ca-pub-4669482504741834 for monetization
- **Migration Completed August 2025**: Full migration from Replit Agent to Replit environment completed with PostgreSQL database, all dependencies installed, and server running successfully
- **Modern UI Enhancement - August 2025**: Updated button components with smaller sizes, cleaner styling, and improved spacing for a more minimalist aesthetic with better typography and micro-interactions
- **Minimalist Design Update - August 2025**: Complete visual refinement with significantly improved spacing, smaller more elegant buttons, cleaner typography with medium font weights, reduced section padding for better proportions, and enhanced visual hierarchy across all landing page sections
- **Real 24-Hour Price Changes - August 2025**: Enhanced Yahoo Finance service to calculate accurate 24-hour price changes and percentages for all commodity live price cards, replacing placeholder 0.00% values with actual market data
- **Mobile Compatibility**: Enhanced responsive design across all components for optimal mobile viewing experience
- **Real Accuracy System**: Implemented comprehensive accuracy calculation based on actual AI predictions vs real historical prices
- **Production-Ready**: League table and scoreboards now use authentic prediction data instead of mock data
- **Multi-Service Integration**: Simultaneous prediction generation using OpenAI, Anthropic, and DeepSeek APIs with robust error handling
- **API Management**: Comprehensive manual trigger endpoints for all prediction operations and service status monitoring

## System Architecture
### Frontend
- **Framework**: React with TypeScript (Vite)
- **UI**: shadcn/ui (Radix UI), Tailwind CSS with a modern minimalist design, enhanced typography, and seamless light/dark theme switching (light mode default)
- **Animations**: Framer Motion for sophisticated page transitions, staggered reveals, and micro-interactions
- **State Management**: TanStack React Query
- **Routing**: Wouter for lightweight client-side routing with smooth scrolling
- **Charts**: Recharts for interactive data visualization
- **Forms**: React Hook Form with Zod validation
- **Visual Design**: Triangle logo system, modern gradient backgrounds, refined button styles with hover effects, and professional spacing system.
- **Pages**: 6 comprehensive pages - Landing page, dashboard, about, FAQ, blog, and policy pages with consistent navigation and visual hierarchy.

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ES modules)
- **Build**: esbuild for production bundling
- **API**: RESTful endpoints with error handling and request logging.
- **Deployment**: VPS-ready with nixpacks.toml for Dokploy.

### Data Layer
- **Database**: PostgreSQL (Neon serverless database)
- **ORM**: Drizzle ORM for type-safe queries and migrations
- **Schema**: Covers AI models, commodities, predictions, actual prices, accuracy metrics, and market alerts.
- **Validation**: Zod schemas for runtime type validation.
- **Storage**: DatabaseStorage class for CRUD operations.
- **Historical Data**: Comprehensive historical AI prediction data for the past year across all commodities and models, with intelligent caching.

### Key Design Patterns
- **Monorepo**: Shared TypeScript types and schemas.
- **Type Safety**: End-to-end type safety from database to UI.
- **Component Architecture**: Atomic design principles for reusable UI components.
- **Data Fetching**: Query-based architecture with optimistic updates.
- **Theme System**: CSS custom properties with dynamic switching.
- **Responsive Design**: Mobile-first approach.
- **Modern Aesthetic**: Vercel-inspired design with enhanced typography, sophisticated animations, ample whitespace, and refined visual elements.
- **Enhanced UX**: Smooth scrolling, hover effects, staggered animations, and professional micro-interactions throughout the interface.
- **Consistent Branding**: Unified design language with modern spacing system and sophisticated visual hierarchy across all pages.
- **Deployment Architecture**: Three-phase startup system (initialization, server startup, background processing) with a StartupManager service for robust deployment.
- **Real-time Accuracy**: Comprehensive accuracy calculation using MAPE, directional accuracy, and threshold-based methods.
- **Production Predictions**: Automatic monthly prediction generation (quarterly forecasts: 3mo, 6mo, 9mo, 12mo) on the 1st of each month with rate limiting and error handling.

## External Dependencies
- **Yahoo Finance API**: Real-time commodity price data.
- **OpenAI API**: GPT-4o integration for AI predictions.
- **Claude API**: Integration for AI predictions.
- **Deepseek API**: Integration for AI predictions.
- **Google Fonts**: For typography.
- **Replit**: Integrated with cartographer plugin and runtime error overlay.