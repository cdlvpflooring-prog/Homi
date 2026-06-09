# Design System Overview

## Single Source of Truth: `constants/theme.ts`

All colors, typography, spacing, shadows, and component recipes live in `expo/constants/theme.ts`. **Never hardcode colors or font sizes in component files.**

---

## Accessing the Design System

Two exports:

### `designTokens` — Structured access
```typescript
import { designTokens } from '@/constants/theme';

// Colors
designTokens.color.primary        // #FF6B00
designTokens.color.text           // #121212
designTokens.color.bg             // #FFFFFF

// Typography
designTokens.type.h1              // { size, weight, lineHeight, letterSpacing }

// Spacing
designTokens.space[4]             // 32px (4 × 8pt grid)

// Glass effects
designTokens.glass.card           // { background, border, shadowColor, ... }
```

### `theme` — Flat / legacy access
```typescript
import { theme } from '@/constants/theme';

theme.colors.primary              // Same as designTokens.color.primary
theme.typography.h1               // Pre-built StyleSheet object
theme.typography.body
theme.typography.caption
```

---

## Helper Functions

### `createTextStyle(scale, color?)`
```typescript
import { createTextStyle } from '@/constants/theme';

<Text style={createTextStyle('h1')}>Title</Text>
<Text style={createTextStyle('body', theme.colors.textMuted)}>Subtitle</Text>
<Text style={createTextStyle('caption')}>Label</Text>
```

### `getStateStyle(state)`
Returns overlay styles for interactive states:
```typescript
getStateStyle('hover')     // 6% opacity overlay
getStateStyle('pressed')   // 12% opacity overlay
getStateStyle('disabled')  // 40% opacity
```

### `getShadowStyle(elevation)`
```typescript
getShadowStyle('sm')       // elevation: 2
getShadowStyle('md')       // elevation: 6
getShadowStyle('lg')       // elevation: 12
```

### `getSpacing(multiplier)`
```typescript
getSpacing(1)  // 8
getSpacing(2)  // 16
getSpacing(3)  // 24
getSpacing(4)  // 32
```

---

## 8-Point Grid System

All spacing uses multiples of 8px:
- `8` — tight internal padding
- `16` — standard component padding
- `24` — section spacing
- `32` — screen-level margins

---

## Component Recipes

Pre-built component style objects in `designTokens.componentRecipes`:
- `primaryButton` — Fiery Orange, 48px height, 16px radius
- `secondaryButton` — Surface background, bordered
- `filterChip` — Surface, orange when selected
- `fab` — 56×56, Fiery Orange, large shadow
- `inputField` — 48px, white bg, 12px radius
- `bottomSheet` — white, 24px top radius, strong shadow

See [[Components & Recipes]] for usage examples.

---

## Dark Mode

Dark theme tokens are **defined** in `designTokens.dark` but a theme context provider has not yet been implemented. Dark mode is ready to activate — it needs:
1. A theme context provider (useTheme hook)
2. Switching `designTokens.color.*` references based on the active theme

---

## Related Notes

- [[Brand & Colors]] — Full color palette
- [[Typography]] — Type scale details
- [[Components & Recipes]] — Component pattern reference
- [[SOP - Design Tokens]] — How to use tokens correctly in new components
