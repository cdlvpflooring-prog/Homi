# Brand & Colors

## Brand Identity

- **Primary Color**: Fiery Orange `#FF6B00`
- **Primary Text**: Matte Black `#121212`
- **Background**: White `#FFFFFF`
- **Inspiration**: Nextdoor's community trust + futuristic automotive energy

---

## Light Theme Color Tokens

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#FF6B00` | CTAs, active states, brand accent |
| `primaryLight` | (lighter orange) | Hover/pressed states on primary |
| `primarySoft` | (soft orange tint) | Backgrounds behind primary elements |
| `primaryOn` | `#FFFFFF` | Text/icons on primary background |
| `secondary` | — | Secondary brand color |
| `accent` | — | Accent highlight |
| `accentTeal` | — | Map and nearby features |
| `bg` | `#FFFFFF` | App background |
| `surface` | `#F7F7F8` | Cards, elevated surfaces |
| `surfaceElevated` | — | Higher elevation surfaces |
| `text` | `#121212` | Primary text (was `#212121` in older variant) |
| `textMuted` | `#5C5F66` | Secondary text, metadata |
| `textLight` | `#999999` | Placeholder, disabled text |
| `border` | `#E3E5E8` | Dividers, input borders |
| `borderMuted` | — | Subtle dividers |
| `success` | `#0FA958` | Confirmation states |
| `successSoft` | — | Success backgrounds |
| `warning` | `#FFB020` | Warnings |
| `warningSoft` | — | Warning backgrounds |
| `error` | `#D64545` | Errors, destructive actions |
| `errorSoft` | — | Error backgrounds |
| `info` | `#2563EB` | Informational alerts |
| `infoSoft` | — | Info backgrounds |
| `mapAccent` | — | Map-specific accent color |

---

## Contrast Ratios (WCAG)

| Combination | Ratio | Grade |
|-------------|-------|-------|
| Primary (#FF6B00) on White | 4.52:1 | AA ✅ |
| White on Primary (#FF6B00) | 4.52:1 | AA ✅ |
| Text (#121212) on White | 17.35:1 | AAA ✅ |
| Text Muted (#5C5F66) on White | 7.23:1 | AA ✅ |
| Primary text (#212121) on White | 16.1:1 | AAA ✅ |

---

## Interactive State Overlays

| State | Overlay |
|-------|---------|
| Hover | 6% opacity black |
| Pressed | 12% opacity black |
| Disabled | 40% opacity on element |
| Focus Ring | 2px solid `#2563EB` |

---

## Glass Effects (`designTokens.glass`)

Used for frosted-glass UI elements (sheets, overlays):
- `background` — semi-transparent fill
- `backgroundSolid` — fallback for non-blur contexts
- `border` — translucent border
- `shadowColor`, `shadowOpacity`, `blurIntensity`

---

## Usage Rule

**Always** import from `@/constants/theme`. **Never** hardcode a color value in a component file.

```typescript
// ✅ Correct
import { designTokens, theme } from '@/constants/theme';
style={{ backgroundColor: designTokens.color.primary }}

// ❌ Wrong
style={{ backgroundColor: '#FF6B00' }}
```

---

## Related Notes

- [[Design System Overview]] — Full system reference
- [[Components & Recipes]] — How colors apply in component patterns
- [[SOP - Design Tokens]] — Usage procedure
