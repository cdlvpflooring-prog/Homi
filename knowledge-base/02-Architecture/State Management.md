# State Management

## Pattern: `@nkzw/create-context-hook`

Homi does **not** use plain Zustand or Redux. All global state is managed via `@nkzw/create-context-hook`, which wraps a custom hook as a React context.

### Why this pattern?
- Scoped to the React tree (no global singletons)
- Full TypeScript inference
- No boilerplate — hooks work exactly like you'd expect
- Clean separation: each store is a self-contained file in `hooks/`

---

## How a Store Is Structured

Every store follows this pattern:

```typescript
// hooks/useMyStore.tsx
import createContextHook from '@nkzw/create-context-hook';

function useMyStoreLogic() {
  const [value, setValue] = useState<string>('');

  return {
    value,
    setValue,
  };
}

export const [MyProvider, useMyStore] = createContextHook(useMyStoreLogic);
```

Then in `app/_layout.tsx`:
```typescript
<MyProvider>
  {children}
</MyProvider>
```

And in any component:
```typescript
const { value, setValue } = useMyStore();
```

---

## All Registered Stores

| Store | Provider | File | Persists To |
|-------|----------|------|-------------|
| App Store | `AppProvider` | `hooks/useAppStore.tsx` | AsyncStorage |
| Community Posts | `CommunityPostsProvider` | `hooks/useCommunityPosts.tsx` | AsyncStorage |
| Premium | `PremiumProvider` | `hooks/usePremium.tsx` | AsyncStorage |
| Referral | `ReferralProvider` | `hooks/useReferral.tsx` | AsyncStorage |
| Plate Claims | `PlateClaimsProvider` | `hooks/usePlateClaims.tsx` | AsyncStorage |
| Toast | `ToastProvider` | `hooks/useToast.tsx` | In-memory only |

---

## useAppStore — The Main Store

The largest and most important store. Manages:

| State | Type | Storage Key |
|-------|------|------------|
| `userProfile` | `UserProfile \| null` | `user_profile` |
| `messages` | `Message[]` | `messages` |
| `recentActivity` | `RecentActivity[]` | `recent_activity` |
| `onboardingComplete` | `boolean` | `onboarding_complete` |
| `userRatings` | `UserRating[]` | `user_ratings` |
| `notificationPrefs` | `NotificationPreferences` | `notification_prefs` |

Key methods:
- `saveProfile(profile: UserProfile)` — save user profile and vehicles
- `sendMessage(message: Message)` — add to message list + persist
- `markAsRead(messageId: string)` — update read status
- `addVehicle(vehicle: Vehicle)` — add to user's vehicle list
- `removeVehicle(vehicleId: string)` — remove vehicle
- `setPrimaryVehicle(vehicleId: string)` — mark as primary

---

## React Query for Server State

API data (from tRPC) is managed by **TanStack React Query**. Configuration in `app/_layout.tsx`:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});
```

The tRPC React client (`lib/trpc.ts`) sits on top of React Query — all tRPC queries/mutations use the standard `useQuery` / `useMutation` hooks via `trpc.<router>.<procedure>.useQuery()`.

---

## Provider Tree Order (in `_layout.tsx`)

```tsx
<trpc.Provider client={trpcClient} queryClient={queryClient}>
  <QueryClientProvider client={queryClient}>
    <GestureHandlerRootView>
      <AppProvider>
        <CommunityPostsProvider>
          <PremiumProvider>
            <ReferralProvider>
              <PlateClaimsProvider>
                <ToastProvider>
                  <ToastContainer />
                  {/* App screens */}
                </ToastProvider>
              </PlateClaimsProvider>
            </ReferralProvider>
          </PremiumProvider>
        </CommunityPostsProvider>
      </AppProvider>
    </GestureHandlerRootView>
  </QueryClientProvider>
</trpc.Provider>
```

---

## Toast System

The toast store (`useToast`) is a special in-memory store that triggers animated toasts:

```typescript
const { showToast } = useToast();

showToast({ type: 'success', message: 'Message sent!' });
showToast({ type: 'error', message: 'Something went wrong.' });
showToast({ type: 'info', message: 'New feature available.' });
```

`ToastContainer` renders the animated overlay and is mounted inside `ToastProvider` in `_layout.tsx`.

---

## Related Notes

- [[System Architecture]] — Where stores fit in the full stack
- [[Storage & Persistence]] — How stores persist to AsyncStorage
- [[SOP - New Store]] — How to add a new context store
