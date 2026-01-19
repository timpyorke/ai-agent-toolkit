# Reference Material

## Core Models

### 1. Feature Branch Workflow
- **Concept**: All features/fixes happen in dedicated branches. `main` is always stable.
- **Best for**: Open source, small teams, CI/CD.
- **Rules**:
    - Never push directly to `main`.
    - Create PRs for code review.
    - Delete branch after merge.

### 2. Gitflow
- **Concept**: Strict branching model designed for project releases.
- **Branches**:
    - `main`: Official release history.
    - `develop`: Integration branch for features.
    - `feature/*`: New features (off develop).
    - `release/*`: Release prep (off develop).
    - `hotfix/*`: Quick production fixes (off main).
- **Best for**: Scheduled releases, legacy software maintenance.

### 3. Trunk-Based Development
- **Concept**: Developers merge small, frequent updates to a core "trunk" (main).
- **Best for**: High-performing DevOps teams, CI/CD, fast iteration.
- **Rules**:
    - Short-lived branches (hours, not days).
    - Use Feature Flags to hide unfinished work.

## Best Practices

### Commits
- **Atomic**: One task, one commit.
- **Descriptive**: Use imperative mood ("Add feature" not "Added feature").
- **Conventional**: Type(scope): description (e.g., `feat(auth): add login`).

### Pull Requests
- **Small**: < 400 lines of code.
- **Focused**: Fix one problem.
- **Context**: Add description, screenshots, and issue links.

### Maintenance
- **Rebase**: Prefer rebasing over merging to keep history linear (for feature branches).
- **Squash**: Squash "Work in progress" commits before merging.
- **Tags**: Use semantic versioning tags for releases (v1.0.0).

## Common Issues & Solutions

| Issue | Solution | Command |
|-------|----------|---------|
| Committed to wrong branch | Reset soft, switch, commit | `git reset --soft HEAD~1 && git checkout -b new-branch && git commit` |
| Merge conflict | effective communication, resolve manually | `git status` -> edit files -> `git add` -> `git rebase --continue` |
| Messy history | Interactive rebase | `git rebase -i HEAD~N` |
| Detached HEAD | Create branch from current state | `git checkout -b temp-fix` |

## .gitignore Patterns
- `*` : Match zero or more characters.
- `?` : Match one character.
- `**`: Match nested directories.
- `/` : Directory separator (start with `/` to match root).
- `!` : Negate (do NOT ignore).
