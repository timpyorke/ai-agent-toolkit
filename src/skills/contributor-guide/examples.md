# Examples

## Git Workflow

### Sync Fork
```bash
git remote add upstream https://github.com/original/repo.git
git fetch upstream
git rebase upstream/main
```

### Create Feature Branch
```bash
git checkout main
git pull upstream main
git checkout -b feature/your-feature
```

### Rebase & Push
```bash
git fetch upstream
git rebase upstream/main
git push origin feature/your-feature
```

## Commit Messages

### Conventional Commits Examples
```
feat(auth): add OAuth2 Google login
fix(api): prevent duplicate user registration
docs: update API examples in README
test(auth): add tests for password reset
ci: fix github actions workflow
perf: optimize image loading
refactor: extract user service
```

## Coding Standards Examples

### TypeScript Type Safety
```typescript
// ✅ Explicit types, clear names
interface User {
  id: string;
  email: string;
  createdAt: Date;
}

function getUserById(id: string): Promise<User | null> {
  // Implementation
}

// ❌ Any types, unclear names
function get(x: any): Promise<any> {
  // Implementation
}
```

### Testing Structure
```typescript
describe("UserService", () => {
  describe("createUser", () => {
    it("creates user with valid data", async () => {
      const userData = { email: "test@example.com" };
      const user = await userService.createUser(userData);
      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
    });
  });
});
```

### Documentation (JSDoc)
```typescript
/**
 * Authenticates a user with email and password
 *
 * @param email - User's email address
 * @param password - User's password (plain text)
 * @returns JWT token for authenticated user
 * @throws {AuthenticationError} If credentials are invalid
 *
 * @example
 * ```typescript
 * const token = await authenticateUser('user@example.com', 'password123');
 * ```
 */
async function authenticateUser(
  email: string,
  password: string,
): Promise<string> {
  // Implementation
}
```

## Templates

### Pull Request Template
```markdown
## Description
Brief description of changes

Fixes #123

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
Describe the tests you ran and how to reproduce them.

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have updated the documentation accordingly
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or my feature works
- [ ] New and existing unit tests pass locally with my changes
```

### Bug Report Template
```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
What you expected to happen.

**Actual behavior**
What actually happened.

**Screenshots**
If applicable, add screenshots.

**Environment**
- OS: [e.g. macOS 14.0]
- Browser: [e.g. Chrome 120]
- Version: [e.g. 1.2.3]

**Additional context**
Any other context about the problem.
```

### Feature Request Template
```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
What you want to happen.

**Describe alternatives you've considered**
Other solutions you've thought about.

**Additional context**
Any other context or screenshots.
```

## Onboarding Checklists

### First-Time Contributor
```markdown
# New Contributor Onboarding

## Before You Start
- [ ] Read CODE_OF_CONDUCT.md and CONTRIBUTING.md
- [ ] Join Discord and introduce yourself

## Environment Setup
- [ ] Fork and clone
- [ ] npm install; copy .env; start Docker services
- [ ] Run migrations; start dev server; verify http://localhost:3000
- [ ] Run tests and ensure all pass

## First Contribution
- [ ] Claim a good first issue; create branch
- [ ] Make changes; write tests; lint and test
- [ ] Conventional commit; push; open PR; respond to reviews
```

### New Maintainer
```markdown
# Maintainer Onboarding

## Access & Permissions
- [ ] GitHub write, npm publish, deploy access
- [ ] Monitoring access; added to maintainers email and Discord

## Required Reading
- [ ] GOVERNANCE.md, ARCHITECTURE.md, RELEASING.md, recent ADRs

## Responsibilities
- [ ] Review PRs within 48h; triage weekly; participate in meetings
- [ ] Release quarterly; mentor contributors; rotate on-call

## Tools & Processes
- [ ] PR notifications; install `gh`; GPG signing; changelog automation; rollback practice
```

## Development CLI Commands

### Debugging
```bash
# Debug mode
npm run dev:debug
# VS Code launch configuration available in .vscode/launch.json
```

### Database
```bash
# Reset database
npm run db:reset
# Create migration
npm run db:migration:create add_user_table
# Seed database
npm run db:seed
```

### Testing
```bash
# Run specific test file
npm test -- user.test.ts
# Run tests matching pattern
npm test -- --testNamePattern="should create user"
# Debug tests
npm run test:debug
```

### Quick Reference
```bash
# Fork and clone
gh repo fork owner/repo --clone

# Setup
npm install
cp .env.example .env
npm run dev

# Create branch
git checkout -b feature/my-feature

# Commit
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/my-feature
gh pr create --fill

# Sync fork
git fetch upstream
git rebase upstream/main
```
