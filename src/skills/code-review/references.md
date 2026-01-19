# Reference Material

## Core Principles

### 1. Constructive and Respectful
- Assume positive intent and be kind
- Focus on code, not the coder
- Offer specific suggestions, not vague criticism
- Explain the "why" behind feedback
- Celebrate good patterns and improvements

### 2. Context-Aware
- Understand the purpose of the change
- Respect project conventions and architecture
- Balance ideal solutions with delivery timelines
- Consider trade-offs made intentionally
- Avoid bike-shedding minor style issues

### 3. Practical and Actionable
- Prioritize issues by severity/impact
- Suggest concrete fixes with examples
- Provide references to standards and docs
- Identify blockers vs. optional improvements
- Keep comments concise and focused

## Review Checklist

### Correctness
- Logic implements requirements and handles edge cases
- Input validation and error handling are robust
- State management is consistent and predictable
- Concurrency and async flows are safe
- Tests cover expected behavior and edge cases

### Design & Maintainability
- Follows project architecture and patterns
- Functions/classes have single responsibility
- Clear naming and intention-revealing code
- Duplication minimized; DRY principles upheld
- Public APIs documented and stable

### Security
- Validates and sanitizes external inputs
- Avoids injections (SQL/NoSQL/HTML)
- Proper authz/authn checks in place
- Secrets not committed; config managed securely
- Data exposure and logging policies respected

### Performance
- Avoids unnecessary computations and allocations
- Efficient data structures and algorithms
- Proper caching and memoization where relevant
- Database queries are optimized and indexed
- Network calls batched/paginated appropriately

### Testing
- Unit/integration tests present and meaningful
- Tests assert behavior, not implementation details
- Edge cases included and negative tests present
- Fast, deterministic tests without flakiness
- CI passes; test coverage is reasonable

### Documentation & Style
- Code is self-documenting where possible
- Comments explain rationale, not obvious facts
- README or docs updated when behavior changes
- Consistent formatting and linting
- Commit messages follow project conventions

## Review Process

### 1. Prepare
- Read the PR description and linked issues
- Scan the diff to understand the scope
- Check CI status and test results
- Pull the branch locally if needed for deep checks

### 2. Evaluate
- Review high-risk areas first (security, data, auth)
- Follow the checklist systematically
- Verify assumptions and requirements
- Consider UX and accessibility impact

### 3. Comment
- Use clear, actionable language
- Group related feedback to avoid noise
- Mark severity: Critical/High/Medium/Low
- Offer code snippets for fixes when helpful

### 4. Conclude
- Summarize overall assessment
- Approve if issues are minor or fixed
- Request changes with specific acceptance criteria
- Encourage follow-up refactors if out-of-scope

## Best Practices

### Do:
- ✅ Review intent and requirements first
- ✅ Prioritize correctness and security
- ✅ Be explicit with examples and references
- ✅ Use consistent severity labeling
- ✅ Approve small improvements quickly

### Don't:
- ❌ Block due to personal preferences
- ❌ Rewrite the PR in comments
- ❌ Ignore team conventions for style
- ❌ Overlook tests and docs
- ❌ Assume missing context—ask questions
