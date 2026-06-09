# Environment Setup

## Prerequisites

- **Bun** — Package manager (replaces npm/yarn for this project)
- **Node.js** — Required by Expo tooling
- **Expo CLI** — Install globally: `bun add -g expo-cli` (or use via `bunx expo`)
- **iOS**: Xcode + iOS simulator (Mac only)
- **Android**: Android Studio + Android SDK

---

## Initial Setup

```bash
# 1. Clone the repo
git clone <repo-url>
cd Homi

# 2. Install dependencies
cd expo
bun install
```

---

## Running the App

### Mobile (tunnel mode — default)
```bash
cd expo
bun run start
```
This starts the Rork dev server with a tunnel. Scan the QR code with Expo Go on your device.

### Web
```bash
bun run start-web
```

### Web with Debug Logging
```bash
bun run start-web-dev
# Equivalent to: DEBUG=expo* bunx rork start ... --web --tunnel
```

---

## How Rork Works

Homi uses **Rork** (`@rork-ai/toolkit-sdk`) as its build and development infrastructure. Rork wraps Expo and provides:
- A development tunnel (`--tunnel` flag) for accessing the app on physical devices
- Metro bundler integration via `expo/metro.config.js`
- Deployment to `*.rork.live` URLs
- Project ID: `nryq0khoc46x0yfuf36id`

The `bunx rork start` command is the equivalent of `expo start` but through Rork's system.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_PUBLIC_RORK_API_BASE_URL` | No | Overrides the tRPC API base URL on mobile |

Create a `.env.local` file in `expo/` if you need to override the API URL:
```
EXPO_PUBLIC_RORK_API_BASE_URL=https://your-custom-url.com
```

The `.env` file is gitignored. Never commit real credentials.

---

## Dev Server URL

In development, the tRPC client falls back to:
```
https://fpalntr3egyjh33wsmwjp.rork.live
```

This is the hardcoded Rork development tunnel. If this URL is unavailable, API calls will gracefully fail with a local error response (no app crash).

---

## TypeScript

Strict mode is enabled. The `@/` path alias maps to the `expo/` root directory.

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "paths": { "@/*": ["./*"] }
  }
}
```

---

## Linting

```bash
cd expo
bun run lint
# Uses expo ESLint preset
```

There is no pre-commit hook configured for linting — run it manually before pushing.

---

## Resetting the App State

If you need to clear all AsyncStorage (equivalent to a fresh install):
1. Navigate to `/refresh` in the app (dev mode)
2. Or call `AsyncStorage.clear()` from the console
3. Or reinstall the Expo Go app

---

## Related Notes

- [[Commands Reference]] — Full command list
- [[Testing]] — How to run tests
- [[SOP - Debugging]] — Debug screens and troubleshooting
