# Examples

## Feature Branch Workflow

### CLI Commands
```bash
# 1. Update main
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/login-page

# 3. Make changes and commit
git add .
git commit -m "feat(auth): implement login form UI"

# 4. Stay updated with main (Rebase)
git fetch origin
git rebase origin/main

# 5. Push
git push -u origin feature/login-page
```

## Gitflow Workflow

### CLI Commands
```bash
# Initialize
git flow init

# Start feature
git flow feature start login-page

# Finish feature (merges to develop)
git flow feature finish login-page

# Start release
git flow release start 1.0.0

# Finish release (merges to main & develop, tags)
git flow release finish 1.0.0
```

## Trunk Based Workflow

### CLI Commands
```bash
# Create short-lived branch
git checkout -b feat/login

# Commit often
git commit -m "feat: add input fields"
git commit -m "feat: add validation"

# Push and PR immediately
git push origin feat/login
```

## Fixing Mistakes

### Undo Last Commit (Keep changes)
```bash
git reset --soft HEAD~1
```

### Discard Local Changes
```bash
git checktout .
# OR
git restore .
```

### Amending Last Commit
```bash
git add forgotten-file.js
git commit --amend --no-edit
```

## Advanced Commands

### Interactive Rebase (Clean history)
```bash
# Rebase last 3 commits
git rebase -i HEAD~3

# Commands:
# p, pick = use commit
# r, reword = use commit, but edit the commit message
# s, squash = use commit, but meld into previous commit
# d, drop = remove commit
```

### Cherry Pick
```bash
# Apply specific commit from another branch
git cherry-pick a1b2c3d
```

### Stashing
```bash
# Save changes temporarily
git stash save "work in progress"

# Restore changes
git stash pop
```

## Configuration

### Global Config (.gitconfig)
```ini
[user]
    name = John Doe
    email = john@example.com
[core]
    editor = code --wait
[alias]
    st = status
    co = checkout
    br = branch
    ci = commit
    lg = log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit
[pull]
    rebase = true
```

### Ignore File (.gitignore)
```gitignore
# Dependencies
node_modules/
.venv/

# Build
dist/
build/

# Environment
.env

# IDE
.vscode/
.idea/
```
