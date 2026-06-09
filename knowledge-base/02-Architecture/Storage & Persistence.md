# Storage & Persistence

## Storage Layer: AsyncStorage

All user data is persisted locally using `@react-native-async-storage/async-storage`. There is no remote database for user-generated content in the MVP — all state lives on the device.

---

## Storage Keys

| Key | Type | Store | Description |
|-----|------|-------|-------------|
| `user_profile` | `UserProfile` | useAppStore | Full user profile + vehicles |
| `messages` | `Message[]` | useAppStore | All sent/received messages |
| `recent_activity` | `RecentActivity[]` | useAppStore | Last activity feed |
| `onboarding_complete` | `boolean` | useAppStore | Has user finished onboarding |
| `user_ratings` | `UserRating[]` | useAppStore | Ratings given and received |
| `notification_prefs` | `NotificationPreferences` | useAppStore | Notification settings |
| `events_store_v1` | `Event[]` | (events store) | Local event/incident cache |

---

## The Corruption Problem

The app has a documented history of AsyncStorage corruption — typically the string `"o"` or `"[object Object]"` getting written instead of valid JSON. This crashes any `JSON.parse()` call.

### Solution: `safeJsonParse`

Located in `utils/eventsStore.ts`. **Always use this instead of `JSON.parse` directly.**

```typescript
import { safeJsonParse } from '@/utils/eventsStore';

// Safe read from AsyncStorage
const raw = await AsyncStorage.getItem('user_profile');
const profile = safeJsonParse<UserProfile>(raw, null);
```

`safeJsonParse` returns a fallback value (second argument) if parsing fails instead of throwing.

---

## ErrorBoundary Recovery

`app/_layout.tsx` contains an `ErrorBoundary` class component that:
1. Detects corruption errors in `componentDidCatch` by checking the error message for keywords:
   - `AsyncStorage`, `JSON`, `Unexpected character: o`, `JSON Parse error`, `corruption detected`
2. On detection: calls `AsyncStorage.clear()` to wipe all stored data
3. On web: reloads the page via `window.location.reload()`

This is the **last line of defense** — if `safeJsonParse` misses something, the ErrorBoundary catches it.

---

## Reading from AsyncStorage (Pattern)

```typescript
useEffect(() => {
  const loadData = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      const profile = safeJsonParse<UserProfile>(raw, null);
      if (profile) setUserProfile(profile);
    } catch (error) {
      console.error('Failed to load profile:', error);
      // Do not rethrow — graceful degradation
    }
  };

  loadData();
}, []);
```

---

## Writing to AsyncStorage (Pattern)

```typescript
const saveProfile = async (profile: UserProfile) => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.USER_PROFILE,
      JSON.stringify(profile)    // JSON.stringify is safe for writes
    );
    setUserProfile(profile);
  } catch (error) {
    console.error('Failed to save profile:', error);
    // Show a toast if this is user-initiated
  }
};
```

---

## Clearing All Storage (Reset)

Available at the `/refresh` dev screen, or called by the ErrorBoundary:

```typescript
await AsyncStorage.clear();
```

This resets onboarding state, profile, messages, and all other persisted data.

---

## Web vs. Native

AsyncStorage works on both web and mobile. On web it uses `localStorage` under the hood. The corruption issue is most common on web due to differences in serialization behavior.

---

## Related Notes

- [[State Management]] — Which stores use which keys
- [[SOP - AsyncStorage Operations]] — Full SOP for reading/writing
- [[System Architecture]] — Context of persistence in the full stack
