# SOP: Notification System

---

## Two Notification Channels

Homi has two distinct notification systems that work together:

| System | Where | Purpose |
|--------|-------|---------|
| **Toast** | `hooks/useToast.tsx` + `components/Toast.tsx` | In-app feedback (non-blocking overlay) |
| **Push/Local** | `utils/notifications.ts` | Native OS notifications (when app is in background) |

---

## 1. Toast Notifications (In-App)

### Showing a Toast

```typescript
import { useToast } from '@/hooks/useToast';

const { showToast } = useToast();

// Success
showToast({ type: 'success', message: '✅ Message sent!' });

// Error
showToast({ type: 'error', message: 'Failed to send. Try again.' });

// Info
showToast({ type: 'info', message: 'New feature available.' });
```

### Toast Behavior
- Auto-dismisses after a configurable duration
- Animated slide-in from top
- Icon varies by type (checkmark, X, info circle)
- Works on iOS, Android, and web
- Stacks if multiple are triggered rapidly

### Where ToastContainer Lives
`ToastContainer` is mounted in `app/_layout.tsx` inside `ToastProvider`. It renders above all other UI.

---

## 2. Push / Local Notifications

### Requesting Permission

```typescript
import { requestPushPermissions } from '@/utils/notifications';

const result = await requestPushPermissions();
// result.status: 'granted' | 'denied' | 'undetermined'
// result.token: Expo push token (mobile only)
```

**Note**: Users must grant permission. If denied, the app falls back to toast-only notifications — this is graceful, not a crash.

### Sending a Local Notification

```typescript
import * as Notifications from 'expo-notifications';

await Notifications.scheduleNotificationAsync({
  content: {
    title: 'Someone messaged your car!',
    body: "Your plate ABC123 received a message.",
    data: {
      type: 'message',
      plate: 'ABC123',
      deeplink: '/message-detail',
    },
  },
  trigger: null,  // null = send immediately
});
```

### Platform Differences

| Feature | iOS | Android | Web |
|---------|-----|---------|-----|
| Push permissions | Required | Required (Android 13+) | `Notification.requestPermission()` |
| Local notifications | expo-notifications | expo-notifications | Web Notification API |
| Background delivery | Yes | Yes | Limited by browser |
| Push token | Expo push token | Expo push token | N/A (server-side needed) |

---

## 3. Notification Handler Configuration

Configured globally before the app renders (in `utils/notifications.ts`):

```typescript
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});
```

This is set once and controls how all local notifications behave when the app is in the foreground.

---

## 4. Deep Linking from Notifications

When a notification is tapped, the app routes to the relevant screen. This is handled in `app/_layout.tsx`:

```typescript
useEffect(() => {
  const sub = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data;

    if (data?.deeplink) {
      router.push(data.deeplink);
    } else if (data?.type === 'message' && data?.plate) {
      router.push({ pathname: '/message-detail', params: { plate: data.plate } });
    }
  });
  return () => sub.remove();
}, [router]);
```

**To support deep linking from a notification**, include a `deeplink` or `type`+`plate` in the notification's `data` payload.

---

## 5. Notification Copy / Templates

Standardized notification text in `PUSH_COPY` (in `utils/notifications.ts`):

| Key | Copy |
|-----|------|
| `title` | "When your car needs to talk." |
| `newMessage` | "Someone messaged your car's number — tap to reply." |
| `towNearby` | "Tow truck spotted near your car. Don't miss the call." |
| `buyerInquiry` | "New buyer inquiry on your car's phone number." |
| `speedRadar` | "Speed radar ahead" |
| `parkingEnforcement` | "Parking enforcement nearby" |
| `hazard` | "Road hazard reported" |

---

## 6. Notification Preferences (User Settings)

Stored in `notification_prefs` AsyncStorage key via `useAppStore`:

```typescript
interface NotificationPreferences {
  enabled: boolean;      // Master toggle
  messages: boolean;     // Message notifications
  listings: boolean;     // Marketplace notifications
  general: boolean;      // System/general notifications
  pushToken?: string;
  platform?: 'ios' | 'android' | 'web' | 'unknown';
}
```

Check user preferences before sending notifications:

```typescript
const { notificationPrefs } = useAppStore();
if (notificationPrefs.enabled && notificationPrefs.messages) {
  // Send notification
}
```

---

## 7. Testing Notifications

Available dev screens:
- `/notification-test` — Basic toast and permission testing
- `/notification-system-test` — Advanced scenarios (all types)

---

## Checklist for Adding a New Notification Trigger

- [ ] Determine correct channel: toast (in-app only) or push/local (OS-level)
- [ ] Check user's `notificationPrefs` before firing
- [ ] Use `PUSH_COPY` for text — no hardcoded strings
- [ ] Include `data.type` and `data.deeplink` if notification should navigate
- [ ] Test on web (browser API) and mobile (expo-notifications)
- [ ] Handle permission-denied gracefully (fall back to toast)

---

## Related Notes

- [[System Diagnostic]] — Notification system health status
- [[Storage & Persistence]] — `notification_prefs` storage
- [[State Management]] — `useAppStore` notification state
