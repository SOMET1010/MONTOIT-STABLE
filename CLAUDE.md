# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mon Toit is a comprehensive real estate rental platform built with React 18, TypeScript, and Vite. The application connects tenants, landlords, real estate agencies, and trust agents through a unified interface featuring property search, lease management, messaging, payment processing, and dispute resolution.

## Architecture

### Feature-Based Organization
The codebase follows a feature-first architecture with domain-specific folders under `src/features/`:
- `auth/` - Authentication, user profiles, role management
- `property/` - Property listings, search, comparisons, maps
- `tenant/` - Tenant-specific features (applications, visits, scoring)
- `owner/` - Landlord features (property management, contracts)
- `agency/` - Real estate agency management
- `contract/` - Lease generation and management
- `messaging/` - Internal communication system
- `payment/` - Payment processing with mobile money integration
- `dispute/` - Dispute resolution system
- `verification/` - Identity and document verification
- `trust-agent/` - Third-party trust services
- `admin/` - Platform administration and monitoring

### State Management
- **Zustand** for global state management
- **React Query (@tanstack/react-query)** for server state and caching
- React Context for theme and authentication providers

### Data Layer
- **Supabase** as primary backend (PostgreSQL + realtime + auth)
- Repository pattern in `src/api/repositories/` for data access
- Centralized API client with error handling in `src/api/client.ts`
- Edge Functions for complex business logic

### UI Architecture
- **Tailwind CSS** for styling with custom components
- **Lucide React** for icons
- **CVA (Class Variance Authority)** for component variants
- Dark mode support via theme provider

## Development Commands

```bash
# Development
npm run dev                 # Start dev server with Vite
npm run build               # Production build (optimized config)
npm run build:standard      # Standard build without optimizations
npm run build:analyze       # Build with bundle analyzer
npm run preview             # Preview production build

# Code Quality
npm run lint                # Run ESLint
npm run lint:fix            # Auto-fix linting issues
npm run format              # Format code with Prettier
npm run format:check        # Check formatting without changes
npm run typecheck           # TypeScript type checking

# Testing
npm run test                # Run Vitest tests
npm run test:ui             # Run tests with UI
npm run test:coverage       # Run tests with coverage report
```

## Path Aliases

Extensive path mapping is configured for clean imports:
- `@/` → `src/`
- `@features/` → Feature modules
- `@components/` → Shared UI components
- `@services/` → Service layer
- `@hooks/` → Custom React hooks
- `@lib/` → Utility functions
- `@stores/` → Zustand stores
- `@contexts/` → React contexts

## Key Patterns

### Repository Pattern
Each domain has a repository (`src/api/repositories/`) that encapsulates Supabase interactions and provides a clean API for the rest of the application.

### Feature Structure
Each feature follows the pattern:
```
src/features/[feature]/
├── index.ts              # Public exports
├── types.ts              # TypeScript types
├── services/             # API calls and business logic
├── hooks/                # React hooks
├── components/           # Feature-specific components
└── pages/                # Page components for routing
```

### Lazy Loading
All pages are lazy-loaded for optimal bundle splitting. See `src/app/routes.tsx` for the complete routing setup.

### Error Handling
Centralized error handling in `src/api/client.ts` with consistent response types across all API calls.

## Build Configuration

Two Vite configs are available:
- `vite.config.ts` - Standard development configuration
- `vite.config.optimized.ts` - Production optimizations with code splitting and bundle analysis

The optimized config includes strategic chunk splitting for vendors and features to improve loading performance.

## Testing

Uses Vitest with React Testing Library. Test files follow the pattern `__tests__/*.test.ts` or `*.test.tsx`. Coverage reports are available via `npm run test:coverage`.

## Environment Variables

The project uses Vite's environment variable system. Supabase configuration and API keys should be set in `.env` files following the `VITE_` prefix convention.

## Authentication Flow

Multi-role authentication system with email/password and phone number support. Users can have multiple roles (tenant, landlord, agent, etc.) with role-based access control throughout the application.

## Integration Points

- **Supabase** - Database, auth, storage, edge functions
- **Mapbox GL** - Interactive property maps
- **jsPDF** - Contract generation
- **Mobile Money APIs** - Payment processing
- **Sentry** - Error tracking and monitoring