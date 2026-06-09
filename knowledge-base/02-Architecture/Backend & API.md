# Backend & API

## Overview

The backend is a **Hono** web server with **tRPC** mounted as middleware. It runs co-located with the Expo frontend under the Rork build system.

---

## File Structure

```
expo/backend/
├── hono.ts              ← Main Hono app (CORS + tRPC mount)
└── trpc/
    ├── create-context.ts    ← tRPC context factory and router factory
    ├── app-router.ts        ← Root router (all routes registered here)
    └── routes/
        └── example/
            └── hi/
                └── route.ts  ← Example tRPC procedure
```

---

## Hono App (`backend/hono.ts`)

The Hono app:
1. Configures CORS
2. Mounts the tRPC router at `/api/trpc`
3. Exports the Hono app for Rork to serve

---

## Root Router (`backend/trpc/app-router.ts`)

```typescript
import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
});

export type AppRouter = typeof appRouter;
```

`AppRouter` is exported and imported by `lib/trpc.ts` on the client — this is what gives tRPC end-to-end type safety.

---

## Adding a New Route

Follow the convention: one file per procedure, nested directory matches the router namespace.

**Convention**: `backend/trpc/routes/<namespace>/<procedure>/route.ts`

Example: to add `user.getProfile`:
1. Create `backend/trpc/routes/user/getProfile/route.ts`
2. Define the tRPC procedure (query or mutation)
3. Import and register it in `app-router.ts`

See [[SOP - New tRPC Route]] for the full step-by-step.

---

## tRPC Client (`lib/trpc.ts`)

```typescript
export const trpc = createTRPCReact<AppRouter>();
```

The client uses:
- **`httpLink`** for standard request/response
- **`safeSuperjson`** transformer for corruption-safe serialization
- URL resolution: `window.location.origin` (web) or `EXPO_PUBLIC_RORK_API_BASE_URL` (mobile) or hardcoded Rork tunnel fallback

### Using tRPC in a Component

```typescript
// Query
const { data, isLoading } = trpc.example.hi.useQuery({ name: 'world' });

// Mutation
const mutation = trpc.user.updateProfile.useMutation();
mutation.mutate({ displayName: 'Alice' });
```

---

## safeSuperjson Transformer

Located in `lib/trpc.ts`. Wraps superjson with:
- Corruption detection (catches `'o'`, `'object'`, `'undefined'`, `'[object Object]'` strings)
- Error logging on serialize/deserialize/stringify/parse failures
- JSON fallback on parse failure

**Never replace this with plain superjson** — the app has a history of corrupted responses from the Rork dev tunnel.

---

## API URL Configuration

| Environment | URL Source |
|-------------|-----------|
| Web browser | `window.location.origin` |
| Mobile with env var | `process.env.EXPO_PUBLIC_RORK_API_BASE_URL` |
| Mobile dev (fallback) | `https://fpalntr3egyjh33wsmwjp.rork.live` |

---

## Zod for Input Validation

All tRPC procedures use Zod for input schema validation. Zod v4 is installed (`^4.1.12`).

```typescript
import { z } from 'zod';
import { publicProcedure } from '../../create-context';

export default publicProcedure
  .input(z.object({ name: z.string() }))
  .query(({ input }) => {
    return { message: `Hello, ${input.name}!` };
  });
```

---

## Related Notes

- [[System Architecture]] — Where the backend fits in the full stack
- [[SOP - New tRPC Route]] — Step-by-step guide to adding a route
- [[Development/Commands Reference]] — How to run the dev server
