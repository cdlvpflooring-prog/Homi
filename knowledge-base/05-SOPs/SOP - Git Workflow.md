# SOP: Git Workflow

---

## Branch Convention

| Branch Type | Pattern | Example |
|-------------|---------|---------|
| Feature | `feature/<description>` | `feature/plate-verification` |
| Bug fix | `fix/<description>` | `fix/asyncstorage-corruption` |
| Claude AI session | `claude/<description>` | `claude/claude-md-docs-sldx2z` |
| Design/UI | `design/<description>` | `design/typography-system` |

---

## Commit Message Convention

Write commit messages in imperative tense, focused on the "why":

```
Add plate verification step to onboarding flow

Ensures users can only register plates they own before
messaging is enabled, reducing spam from unverified accounts.
```

**Format**:
```
<short imperative summary under 72 chars>

<optional body: why this change, what problem it solves>
```

**Common prefixes** (optional but helpful):
- `Add` — new feature
- `Fix` — bug fix
- `Update` — enhancement to existing
- `Remove` — deletion
- `Refactor` — no behavior change

---

## Workflow for a New Feature

```bash
# 1. Create a branch from main
git checkout main
git pull origin main
git checkout -b feature/my-feature

# 2. Make changes
# ... edit files ...

# 3. Stage specific files (never git add -A or git add .)
git add expo/app/new-screen.tsx
git add expo/types/index.ts

# 4. Commit
git commit -m "Add new screen for [feature]"

# 5. Push with tracking
git push -u origin feature/my-feature
```

---

## Safety Rules

| Rule | Why |
|------|-----|
| Never `git add -A` | Could accidentally stage `.env` files or build artifacts |
| Never `git push --force` to main | Destructive, cannot be undone |
| Never `--no-verify` | Bypasses hooks |
| Never commit `.env` files | Security — environment variables are secrets |
| Always create NEW commits (not `--amend`) after a hook failure | Amending can destroy previous work |

---

## Files That Should Never Be Committed

```
.env
.env.local
.env.production
node_modules/
.expo/
dist/
*.log
```

These are all in `.gitignore` — verify before committing anything unusual.

---

## Resolving Merge Conflicts

```bash
# 1. Pull the latest from main
git fetch origin main
git merge origin/main

# 2. Resolve conflicts in the files (edit them manually)
# Look for <<<<<<, =======, >>>>>>> markers

# 3. Stage resolved files
git add <resolved-files>

# 4. Complete the merge
git commit
```

**Never** use `git checkout -- .` or `git reset --hard` to resolve conflicts — this discards your work.

---

## Working with Claude AI Sessions

Claude Code sessions develop on dedicated branches like `claude/claude-md-docs-sldx2z`. After a session:
1. Review the diff: `git diff main...<claude-branch>`
2. Test the changes locally
3. Create a PR or merge to main as appropriate
4. The Claude session branch can be deleted after merging

---

## Checking What Will Be Committed

```bash
# See what's staged
git diff --staged

# See all changes (staged + unstaged)
git status

# See the full diff
git diff
```

---

## Related Notes

- [[Commands Reference]] — Git commands and dev commands
- [[Environment Setup]] — Setting up the repo
