# SOP: Adding a New Screen

Use this procedure any time you need to add a new route/screen to the Homi app.

---

## Decision: Tab Screen vs. Modal/Stack Screen?

| If the screen is... | Use |
|--------------------|-----|
| A primary navigation destination | Tab screen in `app/(tabs)/` |
| A full-screen flow (compose, detail, settings) | Stack screen in `app/` |
| A temporary overlay | Bottom sheet component (not a route) |

---

## Procedure

### Step 1 — Create the Screen File

**For a stack screen:**
```
expo/app/<screen-name>.tsx
```
Example: `expo/app/settings.tsx` → route `/settings`

**For a tab screen:**
```
expo/app/(tabs)/<screen-name>.tsx
```
Example: `expo/app/(tabs)/activity.tsx` → route `/(tabs)/activity`

### Step 2 — Scaffold the Screen

```typescript
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { designTokens } from '@/constants/theme';

export default function MyNewScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={{ ...designTokens.type.h1, color: designTokens.color.text }}>
          Screen Title
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: designTokens.color.bg,
  },
  content: {
    flex: 1,
    padding: 16,
  },
});
```

### Step 3 — Register in Tab Bar (tab screens only)

Open `expo/app/(tabs)/_layout.tsx` and add a new `<Tabs.Screen>` entry:

```typescript
<Tabs.Screen
  name="activity"
  options={{
    title: 'Activity',
    tabBarIcon: ({ color, size }) => (
      <Activity size={size} color={color} />
    ),
  }}
/>
```

### Step 4 — Navigate to the Screen

From any component:
```typescript
import { router } from 'expo-router';

// Simple navigation
router.push('/settings');

// With params
router.push({ pathname: '/settings', params: { tab: 'notifications' } });
```

### Step 5 — Receive Params (if needed)

```typescript
import { useLocalSearchParams } from 'expo-router';

const { tab } = useLocalSearchParams<{ tab: string }>();
```

### Step 6 — Add a Header (optional)

For screens that need a custom header, configure in the parent stack layout or directly:

```typescript
import { Stack } from 'expo-router';

// Inside the screen file
<Stack.Screen options={{ title: 'Settings', headerShown: true }} />
```

### Step 7 — Test Navigation

1. Start the dev server: `bun run start-web`
2. Navigate to the new route directly (e.g., `http://localhost:8081/settings`)
3. Verify back navigation works
4. Test deep link if applicable

---

## Checklist

- [ ] Screen file created in the correct directory
- [ ] Exports a default function component
- [ ] Uses `designTokens` from `@/constants/theme` — no hardcoded colors
- [ ] Uses `SafeAreaView` as the root container
- [ ] Uses `createTextStyle()` or `theme.typography.*` for all text
- [ ] Tab bar entry added (if tab screen)
- [ ] Navigation tested in browser/device
- [ ] Screen added to the route tree in [[Navigation & Routing]]

---

## Related Notes

- [[Navigation & Routing]] — Full route tree
- [[Design System Overview]] — Token usage
- [[SOP - Design Tokens]] — How to style the screen correctly
