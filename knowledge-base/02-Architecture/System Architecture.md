# System Architecture

## Overview

Homi is a **monorepo** with a single `expo/` directory containing both the React Native frontend and the co-located Hono/tRPC backend. The backend runs alongside the app as part of the Rork build system.

```
/Homi
├── expo/                  ← Everything lives here
│   ├── app/               ← Expo Router screens (frontend)
│   ├── backend/           ← Hono server + tRPC (backend)
│   ├── components/        ← Reusable UI components
│   ├── hooks/             ← Global state (context hooks)
│   ├── lib/               ← tRPC client, utilities
│   ├── constants/         ← Design tokens, theme, config
│   ├── types/             ← TypeScript type definitions
│   ├── utils/             ← Helper functions
│   └── __tests__/         ← Jest test suite
├── CLAUDE.md              ← AI assistant guidance
└── knowledge-base/        ← This Obsidian vault
```

---

## Full Stack Diagram

```
┌─────────────────────────────────────────────┐
│              Client (Expo App)               │
│                                             │
│  Expo Router → Screens → Components         │
│       ↓                                     │
│  Context Hooks (useAppStore, etc.)          │
│       ↓                                     │
│  React Query + tRPC Client                  │
│       ↓                                     │
│  HTTP → /api/trpc/*                         │
└─────────────────────────────────────────────┘
                    ↕ HTTP
┌─────────────────────────────────────────────┐
│              Backend (Hono + tRPC)           │
│                                             │
│  backend/hono.ts → Hono app                 │
│       ↓                                     │
│  @hono/trpc-server mounted at /api/trpc     │
│       ↓                                     │
│  backend/trpc/app-router.ts                 │
│       ↓                                     │
│  backend/trpc/routes/**/*.ts                │
└─────────────────────────────────────────────┘
```

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React Native | 0.81.5 |
| UI Runtime | React | 19.1.0 |
| Build / Dev | Expo | 54.0.21 |
| Navigation | Expo Router | 6.0.14 |
| Dev Tunnel | Rork | latest |
| Backend | Hono | 4.9.8 |
| API Layer | tRPC | 11.6.0 |
| Server Adapter | @hono/trpc-server | 0.4.0 |
| State (global) | @nkzw/create-context-hook | 1.1.0 |
| State (server) | TanStack React Query | 5.90.6 |
| Persistence | AsyncStorage | 2.2.0 |
| Serialization | superjson | 2.2.2 |
| Validation | Zod | 4.1.12 |
| Icons | Lucide React Native | 0.475.0 |
| Package Manager | Bun | latest |

---

## Key Architectural Decisions

### 1. Co-located Backend
The Hono server runs in the same project as the frontend. This allows tRPC to share types across frontend and backend with zero configuration — `AppRouter` from the backend is imported directly by the tRPC client in `lib/trpc.ts`.

### 2. File-Based Routing
Expo Router v6 uses the filesystem as the route definition. This means every file in `app/` is a route. Groups (`(tabs)/`) are organizational, not part of the URL path.

### 3. Context Hooks for State
Instead of plain Zustand or Redux, the app uses `@nkzw/create-context-hook`. Each store is a React context, which ensures tree-based scoping and avoids global singleton patterns.

### 4. AsyncStorage with Corruption Detection
All persistent reads use `safeJsonParse()` from `utils/eventsStore.ts`. The `ErrorBoundary` in `app/_layout.tsx` detects and recovers from corruption automatically by clearing AsyncStorage.

### 5. Safe superjson Transformer
The tRPC client uses a wrapped `safeSuperjson` transformer (`lib/trpc.ts`) that catches malformed responses before they can crash the app — a critical defense layer for production stability.

---

## Environment & API URL Resolution

The tRPC client (`lib/trpc.ts`) resolves the API base URL at runtime:

1. **Web**: uses `window.location.origin`
2. **Mobile with `EXPO_PUBLIC_RORK_API_BASE_URL`**: uses the env var
3. **Mobile dev fallback**: uses the hardcoded Rork tunnel URL `https://fpalntr3egyjh33wsmwjp.rork.live`

---

## Related Notes

- [[State Management]] — Deep dive on context hook pattern
- [[Backend & API]] — How to extend the tRPC backend
- [[Storage & Persistence]] — AsyncStorage internals
- [[Navigation & Routing]] — Expo Router file structure
