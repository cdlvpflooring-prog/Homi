# Component Recipes

Pre-built component style patterns from `designTokens.componentRecipes`. Use these as the base for any new interactive element.

---

## Button / Primary

```
Background:    Fiery Orange (#FF6B00)
Text:          White (#FFFFFF)
Border Radius: 16px
Height:        48px
Shadow:        Medium elevation (6px)
Font:          16px, weight 500
```

```typescript
import { designTokens } from '@/constants/theme';
const style = designTokens.componentRecipes.primaryButton;
```

---

## Button / Secondary

```
Background:    Surface (#F7F7F8)
Text:          Matte Black (#121212)
Border:        1px solid border color
Border Radius: 16px
Height:        48px
```

---

## Filter Chip

```
Background (default):  Surface (#F7F7F8)
Background (selected): Fiery Orange 12% opacity + orange border
Border Radius:         12px
Height:                36px
Font:                  14px, weight 500
```

---

## FAB (Floating Action Button)

```
Size:       56×56px
Background: Fiery Orange (#FF6B00)
Shadow:     Large elevation (12px)
Position:   Bottom-right, 24px margins from edges
Icon color: White
```

---

## Input Field

```
Height:        48px
Background:    White (#FFFFFF)
Border:        1px solid border color (#E3E5E8)
Border Radius: 12px
Font:          16px, weight 500
Padding:       Horizontal 16px
```

Validation states:
- **Error**: Red border (`#D64545`)
- **Focus**: Blue focus ring (2px solid `#2563EB`)
- **Disabled**: 40% opacity

---

## Bottom Sheet / Modal

```
Background:    White (#FFFFFF)
Border Radius: 24px (top corners only)
Shadow:        25px elevation
Backdrop:      rgba(0,0,0,0.35)
Handle:        Centered drag indicator bar
```

Sheet components end in `*Sheet.tsx` (e.g., `PreviewSendSheet.tsx`, `IncidentTypeSheet.tsx`, `SendToSheet.tsx`).

---

## Card / Tile

```
Background:    Surface (#F7F7F8)
Border Radius: 12px or 16px
Shadow:        sm elevation (2px)
Padding:       16px
```

---

## Motion / Animation Timings

| Name | Duration | Use for |
|------|----------|---------|
| `fast` | 150ms | Micro-interactions, icon state |
| `std` | 220ms | Standard transitions |
| `slow` | 280ms | Sheet slide-in/out, page transitions |

Spring animations used for sheet transitions (`tension: 55–65, friction: 9–10`).

---

## Tap Targets

Minimum **44pt** for all interactive elements — enforced by design tokens and verified in accessibility audit.

---

## Icon Library

**Lucide React Native** (`lucide-react-native@^0.475.0`).

Standard icon sizes:
- `sm`: 20px
- `md`: 24px (default)
- `lg`: 32px

```typescript
import { Car, MessageSquare, Shield, MapPin } from 'lucide-react-native';
import { designTokens } from '@/constants/theme';

<Car size={designTokens.icon.md} color={designTokens.color.primary} />
```

---

## Related Notes

- [[Design System Overview]] — Token reference
- [[Brand & Colors]] — Color values for components
- [[Typography]] — Text styling for component labels
- [[SOP - Design Tokens]] — How to use tokens in new components
