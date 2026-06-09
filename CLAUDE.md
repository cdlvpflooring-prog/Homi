# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Homi is a cross-platform mobile/web app (React Native + Expo) for vehicle-to-vehicle communication via license plates. Users can send messages to other drivers, report incidents, claim plates, and interact with a community. The app runs on iOS, Android, and web via Expo Router.

## Commands

All commands are run from `expo/`:

```bash
bun install              # Install dependencies
bun run start            # Start dev server (tunnel mode, mobile)
bun run start-web        # Start web dev server
bun run lint             # ESLint (expo config)
bun run test             # Run Jest test suite
bun run test:watch       # Watch mode
bun run test:coverage    # Coverage report
```

Run a single test file:
```bash
bun run test -- __tests__/path/to/file.test.ts
```

## Architecture

### Directory Layout (under `expo/`)

- `app/` — Expo Router file-based routes. `(tabs)/` is the main tab group. Screens outside `(tabs)/` are full-screen modals/stacks.
- `backend/` — Hono server + tRPC router that runs alongside the app via Rork. Routes live in `backend/trpc/routes/` using one-file-per-route convention (`route.ts`).
- `hooks/` — All global state lives here as React context hooks (using `@nkzw/create-context-hook`). Each hook exposes a `Provider` and is mounted in `app/_layout.tsx`.
- `components/` — Reusable UI components. Sheet/modal components are named `*Sheet.tsx`.
- `constants/theme.ts` — Single source of truth for all design tokens: colors, typography, spacing, glass effects, shadows. Import `designTokens` for structured access or `theme` for flat access.
- `types/index.ts` — All shared TypeScript types (Vehicle, UserProfile, Message, MessageType, etc.).
- `lib/trpc.ts` — tRPC client setup with `safeSuperjson` transformer and fallback fetch handling.
- `utils/eventsStore.ts` — Shared `safeJsonParse()` utility; use this instead of `JSON.parse` for any AsyncStorage reads.

### State Management Pattern

Global state uses `@nkzw/create-context-hook` (not plain Zustand). Each store:
1. Defines logic in a `use*Logic()` function
2. Exports a `[Store]Provider` and a `use*()` hook via `createContextHook`
3. Is added to the provider tree in `app/_layout.tsx`

Stores: `useAppStore` (profile, messages, onboarding), `useCommunityPosts`, `usePremium`, `useReferral`, `usePlateClaims`, `useToast`.

Data is persisted to AsyncStorage with explicit keys. Always use `safeJsonParse` from `utils/eventsStore` when reading from storage to handle corruption gracefully.

### Backend / API

The backend is a Hono app (`backend/hono.ts`) serving tRPC at `/api/trpc/*`. To add a new tRPC route:
1. Create `backend/trpc/routes/<namespace>/<name>/route.ts` exporting a tRPC procedure
2. Register it in `backend/trpc/app-router.ts`

The tRPC client (`lib/trpc.ts`) resolves the base URL from `window.location.origin` on web or `EXPO_PUBLIC_RORK_API_BASE_URL` env var on mobile. In development it falls back to the hardcoded Rork tunnel URL.

### Navigation

Expo Router v6 with typed routes enabled. The root index (`app/index.tsx`) checks onboarding state and redirects accordingly. The tab bar (`app/(tabs)/_layout.tsx`) renders 5 tabs: Dashboard, Messages, Nearby, Safety, Scan (Profile is a modal/stack, not a tab).

### Styling

Always use tokens from `constants/theme.ts` — never hardcode colors or font sizes. The `designTokens` object provides semantic color, typography, spacing, and glass-effect values. Dark mode variants are included in the token structure.

### TypeScript

Strict mode is on. Path alias `@/` maps to `expo/` root (e.g., `@/components/Foo` → `expo/components/Foo.tsx`). All new files should be `.tsx` for components and `.ts` for utilities.

### Testing

Jest with `jest-expo` preset. Tests live in `expo/__tests__/`. The `@/` alias is configured in `jest.config.js`. Mock setup is in `__tests__/setup.ts`.

## Key Conventions

- **AsyncStorage safety**: All reads must go through `safeJsonParse` — raw `JSON.parse` on storage values will break on corruption.
- **No direct `JSON.parse` on stored data**: The app has a history of AsyncStorage corruption; the `safeJsonParse` utility + `ErrorBoundary` in `_layout.tsx` are the mitigation.
- **Message types** are a wide union defined in `types/index.ts` (`MessageType`): `parking_alert`, `blocking`, `window_open`, `lights_on`, `for_sale`, `compliment`, `safety`, `marketplace`, `service_ad`, etc. Adding new message types requires updating this union.
- **tRPC transformer**: Use the `safeSuperjson` transformer defined in `lib/trpc.ts` — do not swap it for plain superjson, as it handles corrupted response data.
- **Platform checks**: Use `Platform.OS` for native vs. web differences. Many notification and location features are no-ops on web.
