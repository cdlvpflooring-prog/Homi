# SOP: Adding a New Context Store

Use this procedure when you need to add new global state that doesn't belong in an existing store.

---

## When to Create a New Store vs. Extend an Existing One

| Situation | Decision |
|-----------|----------|
| State is closely related to existing store's domain | Add to existing store |
| State has a distinct lifecycle or concerns | New store |
| State needs its own persistence key | New store |
| State is feature-scoped and likely temporary | New store with clear name |

---

## Procedure

### Step 1 — Create the Store File

```bash
touch expo/hooks/useMyFeature.tsx
```

### Step 2 — Write the Store

```typescript
// expo/hooks/useMyFeature.tsx
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback } from 'react';
import { safeJsonParse } from '@/utils/eventsStore';

const STORAGE_KEY = 'my_feature_data_v1';

interface MyFeatureData {
  items: string[];
  lastUpdated: string | null;
}

const defaultData: MyFeatureData = {
  items: [],
  lastUpdated: null,
};

function useMyFeatureLogic() {
  const [data, setData] = useState<MyFeatureData>(defaultData);
  const [isLoading, setIsLoading] = useState(true);

  // Load from AsyncStorage on mount
  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const parsed = safeJsonParse<MyFeatureData>(raw, defaultData);
        setData(parsed);
      } catch (error) {
        console.error('Failed to load my feature data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Persist helper
  const persist = useCallback(async (newData: MyFeatureData) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      setData(newData);
    } catch (error) {
      console.error('Failed to save my feature data:', error);
    }
  }, []);

  // Example action
  const addItem = useCallback(async (item: string) => {
    const updated = {
      ...data,
      items: [...data.items, item],
      lastUpdated: new Date().toISOString(),
    };
    await persist(updated);
  }, [data, persist]);

  return {
    data,
    isLoading,
    addItem,
  };
}

export const [MyFeatureProvider, useMyFeature] = createContextHook(useMyFeatureLogic);
```

### Step 3 — Register the Provider in `_layout.tsx`

Open `expo/app/_layout.tsx` and add the provider to the tree:

```typescript
import { MyFeatureProvider } from '@/hooks/useMyFeature';

// Inside the provider tree (add inside the existing nesting):
<PlateClaimsProvider>
  <MyFeatureProvider>        {/* ← Add here */}
    <ToastProvider>
      <ToastContainer />
      {children}
    </ToastProvider>
  </MyFeatureProvider>
</PlateClaimsProvider>
```

### Step 4 — Use the Store in Components

```typescript
import { useMyFeature } from '@/hooks/useMyFeature';

function MyComponent() {
  const { data, isLoading, addItem } = useMyFeature();

  if (isLoading) return <ActivityIndicator />;

  return (
    <View>
      {data.items.map(item => (
        <Text key={item}>{item}</Text>
      ))}
    </View>
  );
}
```

---

## Storage Key Naming Convention

- Use `snake_case`
- Append `_v1` (or increment version when schema changes to avoid migration issues)
- Be descriptive: `my_feature_data_v1`, not `mfd`
- Existing keys: `user_profile`, `messages`, `recent_activity`, `onboarding_complete`, `user_ratings`, `notification_prefs`, `events_store_v1`

## Schema Versioning

If you change the shape of stored data, increment the version suffix:
- `my_feature_data_v1` → `my_feature_data_v2`
- The old key will be ignored (stale data), and users start fresh for that feature

---

## If the Store Doesn't Need Persistence

Skip the AsyncStorage logic and use plain `useState`:

```typescript
function useToastLogic() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Toast) => {
    setToasts(prev => [...prev, toast]);
  }, []);

  return { toasts, showToast };
}

export const [ToastProvider, useToast] = createContextHook(useToastLogic);
```

---

## Checklist

- [ ] Store file created in `expo/hooks/use<FeatureName>.tsx`
- [ ] Logic function named `use<FeatureName>Logic`
- [ ] `createContextHook` used to create `[Provider, useHook]` pair
- [ ] Both `Provider` and hook exported
- [ ] Storage key follows naming convention (if persisting)
- [ ] `safeJsonParse` used for all AsyncStorage reads (if persisting)
- [ ] Provider added to tree in `app/_layout.tsx` in the correct position
- [ ] Provider listed in [[State Management]] note

---

## Related Notes

- [[State Management]] — All existing stores and the provider tree
- [[Storage & Persistence]] — AsyncStorage patterns
- [[SOP - AsyncStorage Operations]] — Detailed persistence SOP
