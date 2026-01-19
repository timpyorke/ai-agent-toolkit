# Reference Material

## Core Principles

### 1. Curate, Don't Dump
- Write human-readable summaries, not raw git commit logs
- Group related changes logically by category (Added, Changed, Fixed, etc.)
- Filter out internal changes (refactors, chores) unless relevant to users
- Provide context and migration guidance for breaking changes

### 2. Write for Your Audience
- User-facing changelogs focus on features and fixes they'll experience
- Developer changelogs include API changes, deprecations, and technical details
- Internal changelogs track sprint progress, technical debt, and metrics
- Adjust language and detail level based on who will read it

### 3. Automate When Possible, Manual When Necessary
- Use Conventional Commits to automate changelog generation
- Leverage tools like standard-version, release-please, or semantic-release
- Manually edit generated changelogs to improve clarity and add context
- Balance automation efficiency with human communication quality

## Handling Different Scenarios

### Scenario 1: Creating a User-Facing Changelog
1. **Focus on user impact**: Describe features and fixes in terms users understand
2. **Skip technical details**: No API endpoints, internal refactors, or dependency updates
3. **Use friendly language**: "You can now export your data" vs "Implemented export endpoint"
4. **Highlight benefits**: Explain why the change matters to users

### Scenario 2: Creating a Developer Changelog
1. **Include technical details**: API changes, new endpoints, deprecated features
2. **Document breaking changes**: With code examples and migration guides
3. **Link to documentation**: Issues, PRs, migration guides, and API docs
4. **Show before/after**: Use code diffs for API changes

### Scenario 3: Automating Changelog Generation
1. **Use Conventional Commits**: Structure commit messages for automation
2. **Configure changelog tool**: standard-version, release-please, or semantic-release
3. **Review generated output**: Edit for clarity and add context
4. **Automate in CI/CD**: Generate changelog on release

### Scenario 4: Handling Breaking Changes
1. **Make it prominent**: Use ⚠️ emoji and BREAKING CHANGES heading
2. **Explain the change**: What broke and why it was necessary
3. **Provide migration path**: Step-by-step guide to upgrade
4. **Link to documentation**: Detailed migration guide in docs

## Best Practices

### Content Quality
- Write clear, descriptive entries that explain what changed and why
- Group related changes under meaningful subheadings
- Link to issues, pull requests, and documentation for full context
- Highlight breaking changes prominently with migration guidance
- Include version comparison links for easy navigation

### Organization
- Maintain chronological order with newest releases at the top
- Use consistent categorization (Added, Changed, Fixed, etc.)
- Never skip versions - document all releases for complete history
- Keep an [Unreleased] section for changes not yet released
- Tag each entry with version number and release date

### Audience Awareness
- Match language and technical depth to your audience
- User-facing changelogs focus on benefits and user experience
- Developer changelogs include API changes and technical details
- Provide different changelog views for different audiences when needed
- Include migration guides for breaking changes

## Anti-Patterns

### Don't:
- ❌ Dump raw git commit history without curation or context
- ❌ Use vague descriptions like "various bug fixes" or "improvements"
- ❌ Skip versions or leave gaps in the release history
- ❌ Bury breaking changes in the middle of other changes
- ❌ Write overly technical jargon for user-facing changelogs
- ❌ Forget to link version numbers to git comparisons or releases
- ❌ Include every minor commit (refactors, typo fixes, WIP commits)

### Do:
- ✅ Curate and summarize changes into clear, meaningful entries
- ✅ Be specific: "Fixed race condition in payment processing (#256)"
- ✅ Document all releases chronologically for complete history
- ✅ Prominently highlight breaking changes with migration guidance
- ✅ Write for your audience: users vs developers vs internal team
- ✅ Include version comparison links: `[1.2.0]: github.com/...compare/v1.1.0...v1.2.0`
- ✅ Focus on notable changes that matter to your audience
