# AI Agent Toolkit - Copilot Instructions

## Project Overview

This is a Node.js CLI tool (`aat`) that manages reusable skill definitions for AI coding agents (Claude, Codex, Gemini). The toolkit contains 55 modular skills across 10 categories (95% complete) that provide specialized instructions to enhance AI assistants' capabilities in development tasks.

**Key Components:**
- `/bin/cli.js` - Commander-based CLI with interactive inquirer prompts
- `/src/skills/` - 55 skill directories, each containing a `SKILL.md` file
- `/bin/_categories.json` - Groups skills into 10 categories (Core Workflow, Architecture & Design, Backend & Services, etc.)
- `/src/skills/SKILL.template.md` - Standard template for creating new skills

## Architecture & Data Flow

### Skill Structure
Each skill follows a strict frontmatter format:
```markdown
---
name: skill-name
description: Brief description
---
# 🎯 Skill Name
[Content with Core Principles, Best Practices, Anti-Patterns sections]
```

### CLI Workflow
1. **List/Info**: Read skills from filesystem, parse frontmatter, display categorized or flat lists
2. **Copy**: Interactive multi-select (inquirer) → choose scope (user/project/custom) → copy skill directories to destination
3. **Scopes**: User scope (`~/.claude/skills/`), Project scope (`./.claude/skills/`), or custom paths

### Key Data Structures
- `getSkillInfo(skillName)` parses frontmatter from `SKILL.md` for name/description
- `loadCategories()` reads `_categories.json` to group skills in interactive UI
- Skills are directories containing `SKILL.md` files (no additional assets currently)

## Developer Workflows

### Adding a New Skill
```bash
# 1. Create directory with kebab-case name
mkdir src/skills/new-skill-name

# 2. Copy template and fill in content
cp src/skills/SKILL.template.md src/skills/new-skill-name/SKILL.md

# 3. Add to appropriate category in bin/_categories.json
# 4. Update TASK.md progress counters
# 5. Add to README.md skill list with link
```

### Testing CLI Commands
```bash
# Link CLI globally for testing
npm link

# Test commands
aat list                    # Verify skill parsing and categorization
aat info <skill-name>       # Check individual skill display
aat copy                    # Test interactive flow
aat copy --all --dest ./tmp # Test batch copy with custom path
```

### Building/Publishing
- No build step required (plain JavaScript)
- Published via `npm publish` when version bumped in `package.json`
- Files whitelist in `package.json` controls what's included in npm package

## Project-Specific Conventions

### Skill Content Guidelines
- **Emoji Icons**: Each skill uses a relevant emoji in the title (🎯, 📐, 🔒, etc.)
- **Section Structure**: Overview → Core Principles (numbered, 3-5 items) → Topic sections → Best Practices → Anti-Patterns (❌/✅) → Scenarios
- **Code Examples**: Use triple backticks with language identifier; keep examples practical and technology-specific
- **No Duplication**: Skills reference each other sparingly; each skill is self-contained

### File Naming
- Skills: `kebab-case` directory names (e.g., `ai-pair-programming`, `owasp-top-10`)
- Always `SKILL.md` (uppercase) in each skill directory
- Template file: `SKILL.template.md` (also uppercase)

### Categories JSON Structure
```json
{
  "Category Name": ["skill-dir-1", "skill-dir-2"],
  "Another Category": ["skill-dir-3"]
}
```
- Categories appear in CLI in definition order
- Skills within categories are displayed in array order
- Uncategorized skills show in a separate "Uncategorized" section

### CLI Output Styling
- Use `chalk` consistently: `cyan` for headers, `green` for success, `yellow` for warnings, `red` for errors, `gray` for hints
- Interactive prompts use `inquirer` with checkbox (multi-select) and list (single-select) types
- Include emoji in CLI output for visual clarity (📚, ✓, ✗, 🚀)

## Common Patterns

### Frontmatter Parsing
```javascript
// Pattern used in getSkillInfo()
const lines = content.split('\n');
if (lines[0] === '---') {
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === '---') break;
    if (lines[i].startsWith('name:')) { /* extract */ }
  }
}
```

### Grouped Display with Separators
```javascript
// Pattern from cli.js copy command
choices.push(new inquirer.Separator(`── ${category} ──`));
for (const skill of existing) {
  choices.push({ name: displayName, value: skill, short: shortName });
}
```

### Path Handling
- Always use `path.join()` for cross-platform compatibility
- SKILLS_DIR is relative to `__dirname` in cli.js: `path.join(__dirname, '..', 'src', 'skills')`
- Destination paths resolve `~` via `require('os').homedir()`

## Anti-Patterns to Avoid

❌ Don't add complex dependencies - keep CLI lightweight (only chalk, commander, inquirer, fs-extra)
❌ Don't create nested skill directories - flat structure in `/src/skills/` only
❌ Don't hardcode paths - use path.join() and platform-agnostic methods
❌ Don't add binary files or images to skill directories - keep them markdown-only
❌ Don't create skills without frontmatter - CLI parsing depends on it

✅ Do follow the SKILL.template.md structure for consistency
✅ Do update both TASK.md and README.md when adding skills
✅ Do test CLI commands after modifications (npm link, then aat commands)
✅ Do keep skill content focused and actionable (avoid generic advice)
✅ Do maintain category groupings in _categories.json

## Key Files Reference

- [bin/cli.js](bin/cli.js) - CLI implementation, all commands
- [src/skills/SKILL.template.md](src/skills/SKILL.template.md) - Template for new skills
- [bin/_categories.json](bin/_categories.json) - Category definitions for grouping
- [package.json](package.json) - Dependencies and npm config
- [TASK.md](TASK.md) - Progress tracking and phase completion
- [README.md](README.md) - User-facing documentation
- [src/ROADMAP.md](src/ROADMAP.md) - Development phases and future plans

## Integration Points

- **NPM Registry**: Published as `ai-agent-toolkit` package
- **File System**: Skills copied to user home directory or project directories
- **AI Agents**: Skills read by Claude/Codex/Gemini from installation paths
- **Git**: Managed on GitHub at `timpyorke/ai-agent-toolkit`

## Progress Tracking

Track skill completion in [TASK.md](TASK.md) with checkbox syntax and percentage calculations. Current status: 52/55 skills (95% complete). Remaining: 3 skills in "AI Agent Ops" category (tool-use, multi-agent-orchestration, memory-context).
