# Testing Strategy

## Test Runner: Jest with jest-expo

```
jest-expo          ← Preset configured for React Native
@testing-library/react-native  ← Component testing utilities
```

---

## Configuration

`expo/jest.config.js`:
```javascript
module.exports = {
  preset: 'jest-expo',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',   // Resolves @/ path alias
  },
  setupFiles: ['<rootDir>/__tests__/setup.ts'],
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|...)',
  ],
};
```

---

## Test Location

All tests live in `expo/__tests__/`. The setup file is `__tests__/setup.ts`.

Test file naming: `<subject>.test.ts` or `<subject>.test.tsx`

---

## Running Tests

```bash
# Run all tests
bun run test

# Watch mode (re-runs on file changes)
bun run test:watch

# Coverage report
bun run test:coverage

# Single file
bun run test -- __tests__/hooks/useAppStore.test.tsx

# Pattern match
bun run test -- --testNamePattern="should save profile"

# Path pattern
bun run test -- --testPathPattern="useAppStore"
```

---

## What to Test

### Utilities (High Value)
- `safeJsonParse` from `utils/eventsStore.ts`
- `computeRatingTotals` from `hooks/useAppStore.tsx`
- `computeCommunityScoreFromRatings`
- `normalizePlateInput` from `app/onboarding.tsx`
- Input validation helpers

### Hooks / Stores (High Value)
- Store initialization with clean and corrupted AsyncStorage
- Store method behavior (addVehicle, sendMessage, etc.)
- Corruption detection and recovery

### Components (Medium Value)
- Render tests for critical UI components
- Interaction tests for forms (plate entry, message compose)
- Error state rendering

### Integration (Lower Priority in MVP)
- tRPC query/mutation flows
- Navigation flows via Expo Router

---

## Test Patterns

### Testing a Pure Utility
```typescript
import { safeJsonParse } from '@/utils/eventsStore';

describe('safeJsonParse', () => {
  it('returns fallback on corrupted input', () => {
    expect(safeJsonParse('o', null)).toBeNull();
    expect(safeJsonParse('[object Object]', null)).toBeNull();
  });

  it('parses valid JSON', () => {
    expect(safeJsonParse('{"name":"Alice"}', null)).toEqual({ name: 'Alice' });
  });
});
```

### Testing a Hook
```typescript
import { renderHook, act } from '@testing-library/react-native';
import { AppProvider, useAppStore } from '@/hooks/useAppStore';

const wrapper = ({ children }) => <AppProvider>{children}</AppProvider>;

it('adds a vehicle', async () => {
  const { result } = renderHook(() => useAppStore(), { wrapper });
  await act(async () => {
    result.current.addVehicle({ id: '1', licensePlate: 'TEST123', ... });
  });
  expect(result.current.userProfile?.vehicles).toHaveLength(1);
});
```

### Mocking AsyncStorage
The `__tests__/setup.ts` file configures the AsyncStorage mock. Check it for available mock behaviors.

---

## Current Test Coverage

- Initial suite: ~98 tests (as of the first test infrastructure commit)
- Coverage report: `bun run test:coverage` → outputs to `coverage/` directory

---

## Related Notes

- [[Commands Reference]] — All test commands
- [[Storage & Persistence]] — What to test around AsyncStorage
- [[SOP - Debugging]] — Manual testing via dev screens
