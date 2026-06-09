# Navigation & Routing

## Framework: Expo Router v6

File-based routing — every file in `expo/app/` is a route. The filesystem IS the route tree.

---

## Route Tree

```
expo/app/
├── _layout.tsx               ← Root layout (providers, error boundary)
├── index.tsx                 ← Root index: checks onboarding → redirects
├── onboarding.tsx            ← /onboarding
├── send-message.tsx          ← /send-message
├── message-detail.tsx        ← /message-detail
├── vehicle-management.tsx    ← /vehicle-management
├── claim.tsx                 ← /claim
├── map-live.tsx              ← /map-live
├── safety-center.tsx         ← /safety-center
├── paywall.tsx               ← /paywall
├── referral.tsx              ← /referral
├── community-guidelines.tsx  ← /community-guidelines
├── contact-us.tsx            ← /contact-us
├── services.tsx              ← /services
├── verify-plate.tsx          ← /verify-plate
├── refresh.tsx               ← /refresh (dev)
├── system-test.tsx           ← /system-test (dev)
├── notification-test.tsx     ← /notification-test (dev)
├── notification-system-test.tsx ← /notification-system-test (dev)
├── debug-startup.tsx         ← /debug-startup (dev)
├── connection-debug.tsx      ← /connection-debug (dev)
├── dev-server-status.tsx     ← /dev-server-status (dev)
├── +native-intent.tsx        ← Native deep link handler
├── +not-found.tsx            ← 404 screen
└── (tabs)/
    ├── _layout.tsx           ← Tab bar layout
    ├── dashboard.tsx         ← /(tabs)/dashboard
    ├── messages.tsx          ← /(tabs)/messages
    ├── nearby.tsx            ← /(tabs)/nearby
    ├── safety.tsx            ← /(tabs)/safety
    ├── scan.tsx              ← /(tabs)/scan
    └── profile.tsx           ← /(tabs)/profile
```

---

## Root Index Redirect Logic

`app/index.tsx` runs on every app launch:
1. Reads `onboarding_complete` from AsyncStorage
2. If not complete → `router.replace('/onboarding')`
3. If complete → `router.replace('/(tabs)/dashboard')`

It also includes corruption detection — if AsyncStorage read fails, it clears storage and resets to onboarding.

---

## Tab Layout

Defined in `app/(tabs)/_layout.tsx`. The 5 tabs are:

| Tab Label | Screen | Icon |
|-----------|--------|------|
| Dashboard | `dashboard` | Home icon |
| Messages | `messages` | Message icon |
| Nearby | `nearby` | Map icon |
| Safety | `safety` | Shield icon |
| Scan | `scan` | Camera/QR icon |

Profile is accessible via a tab but may render as a stack depending on navigation context.

---

## Navigation Patterns

### Navigating Programmatically

```typescript
import { router } from 'expo-router';

// Push (adds to history stack)
router.push('/send-message');
router.push({ pathname: '/message-detail', params: { plate: 'ABC123' } });

// Replace (no back navigation)
router.replace('/(tabs)/dashboard');

// Back
router.back();
```

### Passing Parameters

```typescript
// Navigate
router.push({ pathname: '/message-detail', params: { plate: 'XYZ789' } });

// Receive
import { useLocalSearchParams } from 'expo-router';
const { plate } = useLocalSearchParams<{ plate: string }>();
```

---

## Deep Linking

Deep links are configured in `app.json` and handled in:
- `app/_layout.tsx` — notification response listener
- `app/+native-intent.tsx` — native deep link handler

Notification deep link format:
```typescript
// In notification data payload:
{ deeplink: '/message-detail', plate: 'ABC123', type: 'message' }
```

---

## Typed Routes

Typed routes are enabled in `app.json`:
```json
{ "expo": { "experiments": { "typedRoutes": true } } }
```

This gives compile-time route validation when using `router.push()` with typed pathnames.

---

## Related Notes

- [[System Architecture]] — Full stack context
- [[SOP - New Screen]] — How to add a new route/screen
