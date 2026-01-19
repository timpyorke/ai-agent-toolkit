# Reference Material

## Core Principles

### 1. Clarity and Conciseness
- Write messages that explain what changed and why
- Use clear, descriptive language
- Avoid vague terms like "fix", "update", or "change" without context
- Be specific about the impact of changes

### 2. Consistency
- Follow established project conventions
- Use consistent formatting and style
- Maintain a unified voice across commits
- Adhere to team or project-specific standards

### 3. Meaningful Context
- Explain the motivation behind changes
- Reference related issues or tickets
- Describe the problem being solved
- Note any important implementation decisions

## Commit Types Guide

| Change Description               | Type       | Example                     |
| -------------------------------- | ---------- | --------------------------- |
| Adding new functionality         | `feat`     | Adding user registration    |
| Fixing a bug                     | `fix`      | Correcting validation logic |
| Updating documentation           | `docs`     | Improving API docs          |
| Code cleanup, no behavior change | `refactor` | Extracting helper functions |
| Performance optimization         | `perf`     | Caching database queries    |
| Test additions/modifications     | `test`     | Adding unit tests           |
| Dependency updates               | `build`    | Upgrading React version     |
| CI/CD changes                    | `ci`       | Updating GitHub Actions     |
| Formatting, linting              | `style`    | Running code formatter      |

## Scope Guidelines

### What is a Scope?
A scope specifies the section of the codebase affected by the commit. It provides quick context about where changes were made.

### Common Scopes
- **Component names**: `auth`, `user`, `payment`, `admin`
- **File types**: `api`, `ui`, `database`, `middleware`
- **Features**: `login`, `signup`, `checkout`, `dashboard`
- **Modules**: `core`, `utils`, `services`, `models`

### Scope Best Practices
- Keep scopes consistent within the project
- Use lowercase
- Avoid overly broad scopes like "app" or "code"
- Be specific but not overly granular
- Document common scopes in contributing guidelines

## Best Practices

### Do:
- ✅ Use imperative mood in the subject line
- ✅ Separate subject from body with a blank line
- ✅ Explain **why** the change was necessary
- ✅ Reference related issues or tickets
- ✅ Keep commits atomic (one logical change per commit)
- ✅ Write for your future self and teammates
- ✅ Use consistent language and terminology
- ✅ Proofread before committing

### Don't:
- ❌ Write vague messages like "fix bug" or "update code"
- ❌ Include multiple unrelated changes in one commit
- ❌ Use past tense ("fixed" instead of "fix")
- ❌ Exceed character limits (50 for subject, 72 for body)
- ❌ Assume everyone has context about the change
- ❌ Commit commented-out code without explanation
- ❌ Use abbreviations that aren't universally understood
