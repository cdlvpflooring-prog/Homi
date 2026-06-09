# SOP: Adding a New Message Type

Use this procedure when introducing a new category of message that users can send via a license plate.

---

## Files That Must Be Updated

Adding a message type touches at least 3 files:

1. `expo/types/index.ts` — the type definition
2. `expo/constants/actionIcons.ts` — icon, label, color, and template message
3. Any screen that renders message type lists (dashboard quick actions, send-message screen)

---

## Procedure

### Step 1 — Add to the `MessageType` Union

Open `expo/types/index.ts` and add your new value to the union:

```typescript
export type MessageType = 
  | 'parking_alert'
  | 'blocking'
  // ... existing types ...
  | 'your_new_type';    // ← Add here
```

**Naming convention**: `snake_case`, verb or noun phrase, descriptive of the driver scenario.

### Step 2 — Add the Action Icon / Quick Action

Open `expo/constants/actionIcons.ts` (or wherever `QuickAction` entries are defined) and add an entry:

```typescript
{
  id: 'your_new_type',
  type: 'your_new_type' as MessageType,
  title: 'Human-Readable Label',
  icon: 'IconName',           // Lucide icon name
  color: designTokens.color.warning,  // Semantic color from tokens
  message: 'Pre-written message template shown to sender',
}
```

**Color guide by intent**:
| Intent | Token |
|--------|-------|
| Safety / urgent | `designTokens.color.error` |
| Warning / caution | `designTokens.color.warning` |
| Info / community | `designTokens.color.info` |
| Positive / compliment | `designTokens.color.success` |
| Commerce | `designTokens.color.primary` |
| General | `designTokens.color.textMuted` |

### Step 3 — Verify Rendering in Send Message Screen

Open `expo/app/send-message.tsx` and check how message types are rendered. If there's a switch/map over `MessageType` values, add your new type there.

Check for any switch statements that need a new case:
```typescript
// Search for exhaustive switches or maps
switch (message.type) {
  case 'parking_alert': return ...;
  // Make sure your_new_type is handled
  case 'your_new_type': return ...;
}
```

### Step 4 — Verify Dashboard Quick Actions

The Dashboard (`expo/app/(tabs)/dashboard.tsx`) renders a grid of quick actions. Check if it pulls from the same `actionIcons` config or has its own array. If it has its own, add your type there too.

### Step 5 — Add Priority (if applicable)

If the new type is safety-critical, document its recommended priority in [[Message Types]]:
- `child_pet_alert`, `break_in_alert` → `urgent`
- `hazard`, `tow_warning` → `high`
- Vehicle state alerts → `medium`
- Social/commerce → `low`

### Step 6 — Update Documentation

Add the new type to [[Message Types]] in the knowledge base with:
- The type value
- Human-readable description
- Recommended priority
- Use case

---

## TypeScript Exhaustiveness Check

If any part of the codebase uses an exhaustive switch (all cases covered), TypeScript will give you a compile error if you add a new type without handling it. This is intentional — follow the compile error trail to find all the places that need updating.

```typescript
// Pattern that forces you to handle all types:
function assertNever(x: never): never {
  throw new Error('Unhandled message type: ' + x);
}

switch (message.type) {
  case 'parking_alert': return ...;
  // ...
  default: return assertNever(message.type);  // ← This will error on new types
}
```

---

## Checklist

- [ ] New value added to `MessageType` union in `types/index.ts`
- [ ] `QuickAction` entry added in `constants/actionIcons.ts`
- [ ] Icon chosen from Lucide React Native
- [ ] Color uses design token (not hardcoded)
- [ ] Pre-written message template is clear and concise
- [ ] All switch statements / type maps updated
- [ ] Priority documented in [[Message Types]]
- [ ] Knowledge base updated

---

## Related Notes

- [[Message Types]] — Current taxonomy
- [[Data Models]] — Full `Message` interface
- [[Design System Overview]] — Token reference for colors
