# Commands Reference

All commands run from `expo/` directory.

---

## Development

| Command | What it does |
|---------|-------------|
| `bun install` | Install all dependencies |
| `bun run start` | Start dev server in tunnel mode (mobile + web) |
| `bun run start-web` | Start dev server for web only |
| `bun run start-web-dev` | Web dev server with `DEBUG=expo*` logging |

---

## Code Quality

| Command | What it does |
|---------|-------------|
| `bun run lint` | Run ESLint with expo preset |

---

## Testing

| Command | What it does |
|---------|-------------|
| `bun run test` | Run all tests once |
| `bun run test:watch` | Run tests in watch mode |
| `bun run test:coverage` | Run tests and generate coverage report |

### Run a Single Test File
```bash
bun run test -- __tests__/path/to/file.test.ts
```

### Run Tests Matching a Pattern
```bash
bun run test -- --testNamePattern="should send message"
```

### Run a Specific Test Suite
```bash
bun run test -- --testPathPattern="useAppStore"
```

---

## Git

| Command | What it does |
|---------|-------------|
| `git status` | Check working tree |
| `git add <file>` | Stage specific file (avoid `git add -A`) |
| `git commit -m "message"` | Commit with message |
| `git push -u origin <branch>` | Push branch to remote |

See [[SOP - Git Workflow]] for the full branch and commit convention.

---

## Debugging (Dev Screens)

These routes are accessible in the running app (navigate via URL bar or deep link):

| Route | Purpose |
|-------|---------|
| `/system-test` | Full system health check |
| `/notification-test` | Test basic notifications |
| `/notification-system-test` | Test advanced notification scenarios |
| `/refresh` | Clear AsyncStorage and reset app |
| `/debug-startup` | App startup diagnostics |
| `/connection-debug` | Network/API connection test |
| `/dev-server-status` | Check Rork dev server status |

---

## Expo / Rork Commands (Advanced)

These use `bunx rork` or `bunx expo` directly:

```bash
# Check Expo config
bunx expo config

# Clear Metro cache
bunx expo start --clear

# Check installed packages for version issues
bunx expo doctor
```

---

## Related Notes

- [[Environment Setup]] — Prerequisites and initial setup
- [[Testing]] — Testing strategy and patterns
- [[SOP - Debugging]] — How to use debug screens
