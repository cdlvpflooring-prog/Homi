# Typography System

## Font Family

- **iOS**: SF Pro (system default)
- **Android**: Roboto (system default)
- **Web**: system-ui
- No custom fonts loaded — system fonts for native feel and zero load overhead.

---

## Type Scale

| Scale | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|---------------|-------|
| `h1` | 26px | 700 | 31px | -0.3px | Main page titles |
| `h2` | 21px | 700 | 25px | -0.3px | Section headers, card titles |
| `h3` | 18px | 700 | 22px | -0.3px | Subsection headers |
| `body` | 16px | 400 | 24px | 0px | Main body text |
| `bodySmall` | 14px | 400 | 21px | 0px | Supporting text, metadata |
| `caption` | 12px | 600 | 16px | 0px | Labels, hints, timestamps |
| `overline` | 11px | 600 | 14px | 0.5px | Eyebrow text, category labels |

> Note: The Style Enforcement Report documents an alternative scale (H1=28, H2=22, Body=16) — the `constants/theme.ts` file is the authoritative source. Always check the file, not these docs, when precision matters.

---

## How to Apply Typography

### Method 1: `createTextStyle()` helper
```typescript
import { createTextStyle } from '@/constants/theme';

<Text style={createTextStyle('h1')}>Page Title</Text>
<Text style={createTextStyle('h2', theme.colors.primary)}>Section</Text>
<Text style={createTextStyle('body')}>Content</Text>
<Text style={createTextStyle('caption', theme.colors.textMuted)}>Meta</Text>
```

### Method 2: `theme.typography` presets
```typescript
import { theme } from '@/constants/theme';

<Text style={theme.typography.h1}>Title</Text>
<Text style={theme.typography.body}>Body text</Text>
<Text style={theme.typography.caption}>Label</Text>
```

---

## Design Principles

1. **Negative letter spacing on headers** (`-0.3px`) — creates compact, modern sharpness
2. **1.5 line height on body** — optimal reading comfort
3. **~1.2 line height on headers** — tight, impactful feel
4. **600 weight for labels/captions** — semi-bold makes small text legible
5. **Consistent scale** — no ad-hoc font sizes outside the scale

---

## Do Not

- Do not use `fontSize: 15` or any value outside the scale
- Do not use `fontWeight: 'bold'` — use the weight from the scale
- Do not use `fontFamily` directly — let the system font resolve

---

## Accessibility

- Minimum font size: 12px (caption/overline)
- Body text 16px meets readability guidelines
- All contrast ratios meet WCAG AA minimum

---

## Related Notes

- [[Design System Overview]] — Full token system
- [[Brand & Colors]] — Color pairing for text
- [[SOP - Design Tokens]] — How to apply correctly
