# Reference Material

## Core Principles

1. **Clarity first**: favor concise, actionable steps over exhaustive prose.
2. **Fast onboarding**: one-command setup and copy-paste basics that work.
3. **Consistent workflow**: branches, Conventional Commits, PR templates, and CI checks.
4. **Quality gates**: tests, lint, and docs updates required for changes.
5. **Respectful collaboration**: Code of Conduct and timely, constructive reviews.

## Development Workflow

### Branch Naming Conventions
- **Features**: `feature/description` (e.g., `feature/add-user-auth`)
- **Bug fixes**: `fix/description` (e.g., `fix/login-validation`)
- **Docs**: `docs/description` (e.g., `docs/update-readme`)
- **Refactor**: `refactor/description` (e.g., `refactor/extract-user-service`)

### Commit Message Structure
We follow [Conventional Commits](https://www.conventionalcommits.org/):
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding or modifying tests
- `chore`: Maintenance tasks

## Coding Standards

### Code Style
- Use ESLint and Prettier
- Run linting and formatting before committing

### Testing Requirements
- Write tests for all new features
- Aim for 80%+ coverage
- Name tests `*.test.ts` or `*.spec.ts`

### Submitting Changes (Process)

#### Pre-PR Checklist
- [ ] Tests pass locally
- [ ] Lint passes
- [ ] New features include tests and docs
- [ ] Conventional Commits used
- [ ] Branch rebased on latest `main`

#### Review & Merge
1. **CI checks must pass** (tests, lint, build)
2. **Minimum approvals met**; respond within 48 hours
3. **Resolve conversations**, rebase on `main`, and merge without conflicts

## Issue Guidelines

### Labels
- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Documentation improvements
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention needed
- `question`: Further information requested
- `wontfix`: This will not be worked on
- `duplicate`: This issue already exists

### Claiming Issues
- Comment "I'd like to work on this" before starting
- Wait for maintainer assignment
- If assigned, start within 7 days or issue will be reopened

### Triage Workflow
1. **Initial triage (≤24h)**: validate, categorize, prioritize
2. **Technical assessment**: reproducibility (`confirmed`), scope (`frontend`/`backend`/`infra`/`api`), effort estimate
3. **Assignment**: newcomer-friendly vs specialty needs; add mentoring notes
4. **Tracking**: add to project board, link milestones, update roadmap if needed

## Community

### Channels
- **GitHub Issues**: bugs and feature requests
- **GitHub Discussions**: Q&A and general topics
- **Discord**: real-time chat
- **Twitter**: project updates

### Getting Help
- Read docs; search issues; ask in Discussions; join Discord

### Recognition
- Add to CONTRIBUTORS.md
- Highlight in release notes
- Feature top contributors

## Code of Conduct (Excerpt)
We pledge a harassment-free experience for everyone. Be welcoming, respectful, and empathetic; avoid trolling, harassment, or doxxing. Report issues to the conduct contact. Adapted from the Contributor Covenant.

## Best Practices

### Do
- **Make setup easy**: provide `npm run setup` for dependency install, env config, DB init
- **Provide examples**: show real paths and test locations; prefer “show, don’t tell”
- **Keep guides current**: update when processes change; include a PR checkbox
- **Welcome newcomers**: friendly tone and clear steps; avoid gatekeeping

### Don't (Anti-Patterns)
- **Vague instructions** like “use the standard workflow”
- **Assuming prior knowledge** of tooling or processes
- **Stale documentation** and missing automation
- **Intimidating tone** or discouraging language

## Scenarios

### Fix a Bug
1. Reproduce and write a failing test
2. Implement fix; run `npm test` and `npm run lint`
3. Commit `fix(scope): concise description`; open PR and link issue

### Add a Feature
1. Discuss in issue; refine acceptance criteria
2. Branch `feature/...`; implement + tests + docs
3. Commit `feat(scope): ...`; ensure CI green; request review

### Docs-Only Change
1. Branch `docs/...`; update README or guides
2. Commit `docs: clarify setup`; open PR
