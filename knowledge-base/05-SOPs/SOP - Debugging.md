# SOP: Debugging & Diagnostics

---

## Built-In Debug Screens

Navigate to these routes in the running app (type the path in the browser or use a deep link):

| Route | Purpose | When to Use |
|-------|---------|-------------|
| `/system-test` | Comprehensive system health check | First stop when something seems wrong |
| `/refresh` | Clear all AsyncStorage + reload | App stuck in bad state, corrupt data |
| `/notification-test` | Test basic toast and push permissions | Notification issues |
| `/notification-system-test` | Test all notification scenarios | Advanced notification debugging |
| `/debug-startup` | App startup sequence diagnostics | App won't load past splash |
| `/connection-debug` | API/network connection test | tRPC calls failing |
| `/dev-server-status` | Rork dev server status | Blank screen, no data loading |

---

## Common Problems and Solutions

### Problem: App Shows Blank Screen or Stuck on Splash

**Likely cause**: AsyncStorage corruption or corrupt onboarding state.

**Solution**:
1. Navigate to `/refresh` in the browser
2. This calls `AsyncStorage.clear()` and reloads
3. App will restart from onboarding

**Or** open browser DevTools → Application → Local Storage → clear all entries.

---

### Problem: tRPC Calls Failing / No API Data

**Likely cause**: Dev server URL mismatch or network issue.

**Steps**:
1. Go to `/connection-debug` or `/dev-server-status`
2. Check browser Network tab for `/api/trpc/*` requests
3. Verify the base URL in `lib/trpc.ts` `getBaseUrl()` matches the running server
4. If using a custom tunnel, set `EXPO_PUBLIC_RORK_API_BASE_URL` in `.env.local`

---

### Problem: JSON Parse Error / "o" Error

**Likely cause**: AsyncStorage corruption (the `"o"` bug).

**Solution**:
1. The `ErrorBoundary` in `_layout.tsx` should auto-detect this and call `AsyncStorage.clear()`
2. If the boundary didn't catch it, manually go to `/refresh`
3. Check that all AsyncStorage reads use `safeJsonParse` — not raw `JSON.parse`

**Prevention**: See [[SOP - AsyncStorage Operations]].

---

### Problem: Notifications Not Appearing

**Checklist**:
1. Did the user grant notification permissions? → `/notification-test`
2. Is `notificationPrefs.enabled` true in the store?
3. On web: is the browser `Notification` permission granted?
4. On mobile: check device notification settings for the Expo Go app
5. The app uses `expo-notifications` — ensure device is not in Do Not Disturb mode

---

### Problem: Design Looks Wrong / Colors Off

**Check**:
1. Are colors from `designTokens.color.*`? Search for hardcoded hex values.
2. Is the correct font size used? Check against the type scale in [[Typography]].
3. Is spacing a multiple of 8?

---

### Problem: TypeScript Errors After Adding a New Type

**If you added a new `MessageType` value**:
1. Check for exhaustive switch statements — TypeScript will guide you to all affected locations
2. Update `actionIcons.ts`, `send-message.tsx`, and `dashboard.tsx`
3. See [[SOP - New Message Type]]

---

### Problem: Tests Failing

**Run the failing test in isolation**:
```bash
bun run test -- --testPathPattern="<filename>" --verbose
```

**Common causes**:
- AsyncStorage mock not reset between tests (add `beforeEach(() => AsyncStorage.clear())`)
- Missing provider wrapper (wrap with `AppProvider` for store tests)
- Platform-specific code not mocked (`Platform.OS` returns 'ios' in jest-expo)

---

## Reading Logs

In the browser:
- Open DevTools → Console
- tRPC errors appear as `tRPC request failed:` or `Superjson parse error:`
- AsyncStorage errors appear as `Failed to load [key]:` or `Failed to save [key]:`
- Storage corruption appears as `Corrupted superjson data detected:` or `Corrupted response detected:`

On mobile (Expo Go):
- Logs appear in the terminal running `bun run start`
- Shake device → Expo DevTools → Open Debugger

---

## System Health Check

The `/system-test` screen runs 12 automated checks:
1. App Store Provider
2. User Profile Loading
3. Vehicle Management
4. Message System
5. Toast Notifications
6. Push Permissions
7. Local Notifications
8. Navigation System
9. Storage System
10. Error Boundaries
11. Platform Compatibility
12. Performance Metrics

**Target**: All 12 pass, score ≥ 95/100.

---

## Related Notes

- [[System Diagnostic]] — Baseline system health report
- [[Storage & Persistence]] — AsyncStorage architecture
- [[Notification System Status]] — Notification system baseline
- [[Commands Reference]] — Test commands
