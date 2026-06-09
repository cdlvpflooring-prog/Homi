# SOP: AsyncStorage Operations

Use this procedure for all reads and writes to persistent storage.

---

## The Golden Rule

**Never use raw `JSON.parse()` on data from AsyncStorage.** Always use `safeJsonParse` from `@/utils/eventsStore`.

Background: The app has a documented history of AsyncStorage corruption where the string `"o"` or `"[object Object]"` gets persisted instead of valid JSON. `JSON.parse("o")` throws and crashes the app.

---

## Reading from AsyncStorage

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { safeJsonParse } from '@/utils/eventsStore';

const STORAGE_KEY = 'my_data_v1';

// Always use safeJsonParse, never JSON.parse directly
const raw = await AsyncStorage.getItem(STORAGE_KEY);
const data = safeJsonParse<MyType>(raw, defaultValue);
// data is always MyType | typeof defaultValue — never throws
```

---

## Writing to AsyncStorage

```typescript
// JSON.stringify is safe for writes — only reads are dangerous
await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
```

Always wrap writes in try/catch and log errors — never let storage failures propagate silently or crash the app:

```typescript
try {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
} catch (error) {
  console.error('Storage write failed:', error);
  // Optionally show a toast if user-initiated
}
```

---

## Full Read-Update-Write Pattern

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { safeJsonParse } from '@/utils/eventsStore';

const STORAGE_KEY = 'user_data_v1';

interface UserData { name: string; count: number; }
const DEFAULT: UserData = { name: '', count: 0 };

async function incrementCount() {
  try {
    // Read
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const current = safeJsonParse<UserData>(raw, DEFAULT);

    // Update
    const updated: UserData = { ...current, count: current.count + 1 };

    // Write
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Failed to update count:', error);
    return DEFAULT;
  }
}
```

---

## Deleting a Key

```typescript
await AsyncStorage.removeItem(STORAGE_KEY);
```

---

## Clearing All Storage (Full Reset)

Only use this intentionally — it wipes ALL app data:

```typescript
await AsyncStorage.clear();
```

Used by:
- `app/refresh.tsx` (dev reset screen)
- `app/_layout.tsx` `ErrorBoundary` (corruption recovery)

---

## Storage Key Registry

| Key | Type | Store | Notes |
|-----|------|-------|-------|
| `user_profile` | `UserProfile` | useAppStore | Central user data |
| `messages` | `Message[]` | useAppStore | All messages |
| `recent_activity` | `RecentActivity[]` | useAppStore | Activity feed |
| `onboarding_complete` | `boolean` | useAppStore | Onboarding gate |
| `user_ratings` | `UserRating[]` | useAppStore | Rating history |
| `notification_prefs` | `NotificationPreferences` | useAppStore | Notification settings |
| `events_store_v1` | `Event[]` | events store | Local incident cache |

When adding a new key, register it in [[Storage & Persistence]] and follow the `snake_case_v1` naming convention.

---

## Versioning Storage Keys

When you change the shape of a stored type:
1. Rename the key: `my_data_v1` → `my_data_v2`
2. The old data is silently ignored; users start fresh for that feature
3. Consider a one-time migration if the data is critical

```typescript
// Migration example (run once on app start)
const STORAGE_KEY_V1 = 'my_data_v1';
const STORAGE_KEY_V2 = 'my_data_v2';

const v1Raw = await AsyncStorage.getItem(STORAGE_KEY_V1);
if (v1Raw) {
  const v1Data = safeJsonParse<V1Type>(v1Raw, null);
  if (v1Data) {
    const v2Data = migrateV1ToV2(v1Data);
    await AsyncStorage.setItem(STORAGE_KEY_V2, JSON.stringify(v2Data));
  }
  await AsyncStorage.removeItem(STORAGE_KEY_V1);
}
```

---

## Testing Storage Code

Mock AsyncStorage is configured in `__tests__/setup.ts`. In tests:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Reset between tests
beforeEach(() => {
  AsyncStorage.clear();
});

// Seed test data
await AsyncStorage.setItem('user_profile', JSON.stringify(mockProfile));
```

---

## Related Notes

- [[Storage & Persistence]] — Architecture overview and key registry
- [[State Management]] — Stores that use AsyncStorage
- [[SOP - New Store]] — How to wire up a new persistent store
