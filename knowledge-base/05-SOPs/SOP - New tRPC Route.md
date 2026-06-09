# SOP: Adding a New tRPC Route

Use this procedure any time you need to add a new backend API endpoint.

---

## Naming Convention

Routes follow a namespace/procedure structure:
- Namespace = logical grouping (e.g., `user`, `message`, `plate`)
- Procedure = action name (e.g., `getProfile`, `sendMessage`, `lookup`)
- File path: `backend/trpc/routes/<namespace>/<procedure>/route.ts`

Example: `user.getProfile` → `backend/trpc/routes/user/getProfile/route.ts`

---

## Procedure

### Step 1 — Create the Route File

```bash
mkdir -p expo/backend/trpc/routes/<namespace>/<procedure>
touch expo/backend/trpc/routes/<namespace>/<procedure>/route.ts
```

### Step 2 — Write the Procedure

**Query (read operation):**
```typescript
// expo/backend/trpc/routes/plate/lookup/route.ts
import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

export default publicProcedure
  .input(z.object({
    plate: z.string().min(1).max(12),
    country: z.string().default('US'),
  }))
  .query(async ({ input }) => {
    // Business logic here
    return {
      plate: input.plate,
      country: input.country,
      isRegistered: false, // placeholder
    };
  });
```

**Mutation (write operation):**
```typescript
// expo/backend/trpc/routes/message/send/route.ts
import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

export default publicProcedure
  .input(z.object({
    fromPlate: z.string(),
    toPlate: z.string(),
    content: z.string().min(1).max(500),
    type: z.string(),
  }))
  .mutation(async ({ input }) => {
    // Save message logic
    return { success: true, messageId: crypto.randomUUID() };
  });
```

### Step 3 — Register in the Root Router

Open `expo/backend/trpc/app-router.ts`:

```typescript
import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import lookupRoute from "./routes/plate/lookup/route";  // ← Add import
import sendRoute from "./routes/message/send/route";    // ← Add import

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  plate: createTRPCRouter({          // ← Register namespace
    lookup: lookupRoute,
  }),
  message: createTRPCRouter({        // ← Register namespace
    send: sendRoute,
  }),
});

export type AppRouter = typeof appRouter;
```

### Step 4 — Use the Route in a Component

The frontend gets full TypeScript autocomplete immediately — no additional steps needed.

```typescript
// Query
const { data, isLoading, error } = trpc.plate.lookup.useQuery({
  plate: 'ABC123',
  country: 'US',
});

// Mutation
const sendMutation = trpc.message.send.useMutation({
  onSuccess: (data) => {
    console.log('Message sent:', data.messageId);
  },
  onError: (error) => {
    console.error('Send failed:', error.message);
  },
});

sendMutation.mutate({
  fromPlate: 'XYZ789',
  toPlate: 'ABC123',
  content: 'Your lights are on!',
  type: 'lights_on',
});
```

### Step 5 — Test the Endpoint

1. Start the dev server: `bun run start`
2. Trigger the query/mutation from the UI
3. Check the browser Network tab for `/api/trpc/<namespace>.<procedure>` requests
4. Verify the response shape matches expectations

---

## Input Validation Rules

- Use `z.string().min(1)` — never accept empty strings for required fields
- Use `z.string().max(N)` — always cap string lengths
- Use `z.enum([...])` for fields with known valid values
- Plate numbers: `z.string().min(1).max(12).regex(/^[A-Z0-9]+$/)`

---

## Error Handling

tRPC procedures can throw `TRPCError` for structured error responses:

```typescript
import { TRPCError } from '@trpc/server';

if (!plateExists) {
  throw new TRPCError({
    code: 'NOT_FOUND',
    message: 'Plate not found',
  });
}
```

Standard error codes: `NOT_FOUND`, `UNAUTHORIZED`, `BAD_REQUEST`, `INTERNAL_SERVER_ERROR`

---

## Checklist

- [ ] Route file created at `backend/trpc/routes/<namespace>/<procedure>/route.ts`
- [ ] Uses `publicProcedure` from `create-context`
- [ ] Input validated with Zod schema
- [ ] Registered in `app-router.ts` under correct namespace
- [ ] Tested via browser Network tab
- [ ] Types flow through to client (no `any`)

---

## Related Notes

- [[Backend & API]] — Architecture overview
- [[System Architecture]] — Full stack context
