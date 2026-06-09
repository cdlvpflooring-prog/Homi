# SOP: Using Design Tokens

Use this procedure every time you write styles for a component or screen.

---

## The Rule

**Never hardcode a color, font size, or spacing value.** All visual values must come from `@/constants/theme`.

```typescript
// ✅ Always do this
import { designTokens, theme, createTextStyle } from '@/constants/theme';

// ❌ Never do this
style={{ backgroundColor: '#FF6B00', fontSize: 16 }}
```

---

## Setup (Every Component File)

```typescript
import { designTokens, theme, createTextStyle } from '@/constants/theme';
// or just:
import { designTokens } from '@/constants/theme';
```

---

## Colors

```typescript
// Primary actions, CTAs
designTokens.color.primary          // #FF6B00 Fiery Orange

// Backgrounds
designTokens.color.bg               // #FFFFFF App background
designTokens.color.surface          // #F7F7F8 Card/surface
designTokens.color.surfaceElevated  // Higher elevation surface

// Text
designTokens.color.text             // #121212 Primary text
designTokens.color.textMuted        // #5C5F66 Secondary/supporting text
designTokens.color.textLight        // #999999 Placeholders

// Borders
designTokens.color.border           // #E3E5E8 Standard border

// Status colors
designTokens.color.success          // #0FA958
designTokens.color.warning          // #FFB020
designTokens.color.error            // #D64545
designTokens.color.info             // #2563EB
```

---

## Typography

### Recommended: `createTextStyle()`

```typescript
import { createTextStyle } from '@/constants/theme';

<Text style={createTextStyle('h1')}>Main Title</Text>
<Text style={createTextStyle('h2')}>Section Header</Text>
<Text style={createTextStyle('h3')}>Subsection</Text>
<Text style={createTextStyle('body')}>Body text</Text>
<Text style={createTextStyle('bodySmall')}>Supporting text</Text>
<Text style={createTextStyle('caption')}>Label or timestamp</Text>
<Text style={createTextStyle('overline')}>CATEGORY LABEL</Text>

// With custom color
<Text style={createTextStyle('body', designTokens.color.textMuted)}>
  Muted content
</Text>
```

### Alternative: `theme.typography.*`

```typescript
import { theme } from '@/constants/theme';

<Text style={theme.typography.h1}>Title</Text>
<Text style={theme.typography.body}>Content</Text>
<Text style={theme.typography.caption}>Label</Text>
```

---

## Spacing (8pt Grid)

Always use multiples of 8 for padding, margin, and gap:

```typescript
// Direct values
padding: 8    // 1 unit — tight internal
padding: 16   // 2 units — standard component
padding: 24   // 3 units — section
padding: 32   // 4 units — screen margin

// Via helper
import { getSpacing } from '@/constants/theme';
getSpacing(1)  // 8
getSpacing(2)  // 16
getSpacing(3)  // 24
getSpacing(4)  // 32
```

---

## Border Radius

Use the standard scale — do not use arbitrary values:

| Use case | Value |
|----------|-------|
| Small element (chips, badges) | `8px` |
| Standard card | `12px` |
| Prominent card | `16px` |
| Sheet/modal top corners | `24px` |
| Pill / full-round | `9999px` |

---

## Shadows / Elevation

```typescript
import { getShadowStyle } from '@/constants/theme';

getShadowStyle('sm')   // Subtle (elevation 2)
getShadowStyle('md')   // Standard card (elevation 6)
getShadowStyle('lg')   // Sheet/FAB (elevation 12)
```

---

## Interactive States

```typescript
import { getStateStyle } from '@/constants/theme';

getStateStyle('hover')     // 6% opacity overlay
getStateStyle('pressed')   // 12% opacity overlay
getStateStyle('disabled')  // 40% opacity
```

---

## Icons

Use **Lucide React Native** only. Reference `designTokens` for size:

```typescript
import { Car, MessageSquare } from 'lucide-react-native';

<Car size={24} color={designTokens.color.primary} />

// Standard sizes
// sm: 20, md: 24 (default), lg: 32
```

---

## Full Component Example

```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { designTokens, createTextStyle, getShadowStyle } from '@/constants/theme';
import { MessageSquare } from 'lucide-react-native';

interface Props {
  title: string;
  onPress: () => void;
}

export function ActionCard({ title, onPress }: Props) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <MessageSquare size={24} color={designTokens.color.primary} />
      <Text style={createTextStyle('body')}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: designTokens.color.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...getShadowStyle('sm'),
  },
});
```

---

## Checklist

- [ ] Import from `@/constants/theme` — no other source for visual values
- [ ] No hardcoded hex colors anywhere in the file
- [ ] No hardcoded font sizes — use `createTextStyle()` or `theme.typography.*`
- [ ] Spacing is a multiple of 8
- [ ] Border radius uses the standard scale
- [ ] Icons from Lucide React Native with token-based size and color
- [ ] Interactive states use `getStateStyle()` or `activeOpacity`

---

## Related Notes

- [[Design System Overview]] — Full token reference
- [[Brand & Colors]] — Color palette detail
- [[Typography]] — Type scale detail
- [[Components & Recipes]] — Pre-built patterns
