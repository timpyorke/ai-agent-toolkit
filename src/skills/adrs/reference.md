# ADR Template Reference and Tools

## Standard Michael Nygard Format

```markdown
# ADR-001: Use React for Frontend Framework

## Status

Accepted

## Context

We are building a customer-facing web application that requires:

- Rich interactive UI with complex state management
- Good developer experience with fast iteration cycles
- Strong ecosystem and community support
- Ability to hire developers easily
- Server-side rendering for SEO

We need to choose a frontend framework for the entire application.

## Decision

We will use React as our primary frontend framework.

## Consequences

### Positive

- Large talent pool and hiring is easier
- Excellent ecosystem (Next.js for SSR, React Query, etc.)
- Component reusability across projects
- Strong TypeScript support
- Battle-tested at scale (Facebook, Netflix, Airbnb)
- Great developer tools (React DevTools)

### Negative

- Requires additional libraries for routing, state management
- JSX syntax has learning curve for some developers
- Bundle size can be large without optimization
- Need to be careful about re-renders and performance

### Neutral

- Team needs training on React best practices
- Migration from prototype (jQuery) will take 3 months

## Alternatives Considered

### Vue.js

- **Pros**: Easier learning curve, single-file components
- **Cons**: Smaller ecosystem, harder to hire experienced developers
- **Why rejected**: Hiring constraints and smaller ecosystem

### Angular

- **Pros**: Full-featured framework, TypeScript first
- **Cons**: Steeper learning curve, more opinionated, heavier bundle
- **Why rejected**: Team preference for lighter-weight solution

## Notes

- Decision made in collaboration with frontend team
- Reviewed by: @tech-lead, @architect
- Related to: ADR-002 (state management), ADR-005 (SSR strategy)
```

## Review Checklist Template

```markdown
## ADR Review Checklist

- [ ] Context is clear and complete
- [ ] Decision is explicitly stated
- [ ] Consequences (positive and negative) documented
- [ ] Alternatives were considered
- [ ] Technical feasibility confirmed
- [ ] Cost implications understood
- [ ] Timeline is realistic
- [ ] Team has necessary skills
- [ ] Security reviewed (if applicable)
- [ ] Migration plan exists (if needed)
```

## Blank Template

```markdown
# ADR-[NUMBER]: [TITLE]

## Status

[Proposed | Accepted | Deprecated | Superseded | Rejected]

## Context

[Describe the issue that motivates this decision]
[Include forces at play: technical, political, social, project constraints]
[Explain current state and what problem this solves]

## Decision

[Describe the decision in full sentences]
[Be specific about what is being decided]
[Include configuration approach if relevant]

## Consequences

### Positive

- [Benefit 1]
- [Benefit 2]
- [Benefit 3]

### Negative

- [Trade-off 1]
- [Trade-off 2]
- [Trade-off 3]

### Neutral

- [Implication 1]
- [Implication 2]

## Alternatives Considered

### [Alternative Name]

- **Pros**: [List advantages]
- **Cons**: [List disadvantages]
- **Why rejected**: [Specific reason for rejection]

### [Another Alternative]

- **Pros**: [List advantages]
- **Cons**: [List disadvantages]
- **Why rejected**: [Specific reason for rejection]

## Notes

- Decision date: [YYYY-MM-DD]
- Participants: [List people involved]
- Implementation timeline: [Timeline]
- Related ADRs: [Links to related decisions]
```

## Command Line Tools

### adr-tools (Shell Scripts)

```bash
# Installation
brew install adr-tools  # macOS
# or
curl -L https://raw.githubusercontent.com/npryce/adr-tools/master/install.sh | sh

# Usage
adr init docs/adr                    # Initialize ADR directory
adr new "Use PostgreSQL"             # Create new ADR
adr new -s 3 "Migrate to GraphQL"    # Create ADR that supersedes #3
adr list                             # List all ADRs
adr generate toc > docs/adr/README.md  # Generate table of contents
```

### adr-log (JavaScript/NPM)

```bash
# Installation
npm install -g adr-log

# Usage
adr-log -d docs/adr                  # Generate ADR log
adr-log -d docs/adr -s               # Include status
adr-log -d docs/adr -e               # Generate embedded HTML
```

### Custom ADR Creation Script

```bash
#!/bin/bash
# adr-create.sh - Custom ADR creation script

ADR_DIR="${ADR_DIR:-docs/adr}"
TITLE="$1"

if [ -z "$TITLE" ]; then
    echo "Usage: $0 'ADR Title'"
    exit 1
fi

# Get next number
NEXT_NUM=$(printf "%04d" $(($(ls -1 "$ADR_DIR"/*.md 2>/dev/null | wc -l) + 1)))

# Create filename
SLUG=$(echo "$TITLE" | tr '[:upper:] ' '[:lower:]-' | tr -cd '[:alnum:]-')
FILENAME="$ADR_DIR/$NEXT_NUM-$SLUG.md"

# Create from template
cat > "$FILENAME" <<EOF
# ADR-$NEXT_NUM: $TITLE

## Status

Proposed

## Context

[Describe the forces at play: technical, political, social, project]
[What is the current situation?]
[Why does this decision need to be made?]

## Decision

[State the decision clearly and concisely]
[Include what is being decided and how it will be implemented]

## Consequences

### Positive

- [Benefit 1]
- [Benefit 2]

### Negative

- [Trade-off 1]
- [Trade-off 2]

### Neutral

- [Implication 1]

## Alternatives Considered

### [Alternative Name]

- **Pros**: [advantages]
- **Cons**: [disadvantages]
- **Why rejected**: [specific reason]

## Notes

- Proposed date: $(date +%Y-%m-%d)
- Participants: [@github-handles]
- Implementation timeline: [estimate]
- Related ADRs: [links]
EOF

echo "Created: $FILENAME"
echo "Edit with: \$EDITOR $FILENAME"
```

## Web-Based Tools

### log4brains

Full-featured ADR management with web UI, search, and static site generation.

```bash
# Installation
npm install -g log4brains

# Initialize
log4brains init

# Preview
log4brains preview
# Opens http://localhost:4004

# Build static site
log4brains build
# Outputs to .log4brains/out/

# Features:
# - WYSIWYG template editor
# - Full-text search
# - ADR linking and graphs
# - Markdown preview
# - Static site export
```

### ADR Manager (Python)

```bash
# Installation
pip install adr-manager

# Usage
adr-manager init
adr-manager new "Decision Title"
adr-manager list --format html > adr-list.html
adr-manager supersede 3 "New Decision"
```

## CI/CD Integration

### GitHub Actions - Validate ADRs

```yaml
# .github/workflows/adr-validation.yml
name: ADR Validation

on:
  pull_request:
    paths:
      - "docs/adr/**"

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Validate ADR Format
        run: |
          for file in docs/adr/*.md; do
            echo "Checking $file"
            
            # Check for required sections
            grep -q "^## Status" "$file" || { echo "Missing Status section"; exit 1; }
            grep -q "^## Context" "$file" || { echo "Missing Context section"; exit 1; }
            grep -q "^## Decision" "$file" || { echo "Missing Decision section"; exit 1; }
            grep -q "^## Consequences" "$file" || { echo "Missing Consequences section"; exit 1; }
            
            # Check valid status
            STATUS=$(grep "^## Status" -A 1 "$file" | tail -n1)
            if ! echo "$STATUS" | grep -qE "(Proposed|Accepted|Deprecated|Superseded|Rejected)"; then
              echo "Invalid status: $STATUS"
              exit 1
            fi
          done

      - name: Generate ADR Index
        run: |
          adr-log -d docs/adr > docs/adr/INDEX.md

      - name: Check for Broken Links
        run: |
          # Check for broken ADR references
          grep -r "ADR-[0-9]" docs/ | while read -r line; do
            FILE=$(echo "$line" | cut -d: -f1)
            REF=$(echo "$line" | grep -oE "ADR-[0-9]+")
            NUM=$(echo "$REF" | sed 's/ADR-//')
            
            if ! ls docs/adr/*-$NUM-*.md 2>/dev/null; then
              echo "Broken reference: $REF in $FILE"
              exit 1
            fi
          done
```

### GitLab CI - ADR Linting

```yaml
# .gitlab-ci.yml
adr-lint:
  stage: test
  script:
    - apt-get update && apt-get install -y markdownlint-cli
    - markdownlint docs/adr/*.md
    - |
      # Check ADR numbering sequence
      EXPECTED=1
      for file in docs/adr/*.md; do
        NUM=$(basename "$file" | grep -oE "^[0-9]+" | sed 's/^0*//')
        if [ "$NUM" != "$EXPECTED" ]; then
          echo "ADR numbering gap: expected $EXPECTED, got $NUM"
          exit 1
        fi
        EXPECTED=$((NUM + 1))
      done
  only:
    changes:
      - docs/adr/**
```

## Editor Integration

### VS Code Extension

```json
// .vscode/settings.json
{
  "adr.path": "docs/adr",
  "adr.language": "en",
  "adr.defaultTemplate": "default",

  // Snippets for ADR sections
  "editor.snippetSuggestions": "top",

  // Markdown preview enhancements
  "markdown.preview.breaks": true
}
```

**VS Code Snippets:**

```json
// .vscode/adr.code-snippets
{
  "ADR Template": {
    "prefix": "adr",
    "body": [
      "# ADR-${1:NUMBER}: ${2:TITLE}",
      "",
      "## Status",
      "",
      "${3|Proposed,Accepted,Deprecated,Superseded,Rejected|}",
      "",
      "## Context",
      "",
      "${4:Describe the forces at play}",
      "",
      "## Decision",
      "",
      "${5:State the decision}",
      "",
      "## Consequences",
      "",
      "### Positive",
      "",
      "- ${6:Benefit}",
      "",
      "### Negative",
      "",
      "- ${7:Trade-off}",
      "",
      "## Alternatives Considered",
      "",
      "### ${8:Alternative Name}",
      "",
      "- **Pros**: ${9:advantages}",
      "- **Cons**: ${10:disadvantages}",
      "- **Why rejected**: ${11:reason}",
      "$0"
    ],
    "description": "Create new ADR"
  }
}
```

### JetBrains IDE (IntelliJ, WebStorm)

**Live Templates:**

```xml
<!-- ADR.xml in templates directory -->
<templateSet group="ADR">
  <template name="adr" value="# ADR-$NUMBER$: $TITLE$&#10;&#10;## Status&#10;&#10;$STATUS$&#10;&#10;## Context&#10;&#10;$CONTEXT$&#10;&#10;## Decision&#10;&#10;$DECISION$&#10;&#10;## Consequences&#10;&#10;### Positive&#10;&#10;- $POSITIVE$&#10;&#10;### Negative&#10;&#10;- $NEGATIVE$&#10;&#10;## Alternatives Considered&#10;&#10;$END$" description="ADR Template" toReformat="true" toShortenFQNames="true">
    <variable name="NUMBER" expression="" defaultValue="" alwaysStopAt="true" />
    <variable name="TITLE" expression="" defaultValue="" alwaysStopAt="true" />
    <variable name="STATUS" expression="" defaultValue="Proposed" alwaysStopAt="true" />
    <context>
      <option name="MARKDOWN" value="true" />
    </context>
  </template>
</templateSet>
```

## Automation Scripts

### Auto-Generate ADR Index

```javascript
// scripts/generate-adr-index.js
const fs = require("fs");
const path = require("path");

const ADR_DIR = "docs/adr";
const INDEX_FILE = path.join(ADR_DIR, "README.md");

function parseADR(filename) {
  const content = fs.readFileSync(path.join(ADR_DIR, filename), "utf-8");
  const lines = content.split("\n");

  const title = lines.find((l) => l.startsWith("# ADR-"));
  const statusLine = lines.find(
    (l, i) => lines[i - 1] === "## Status" && l.trim(),
  );

  return {
    filename,
    number: filename.match(/^(\d+)/)?.[1],
    title: title?.replace(/^# ADR-\d+:\s*/, ""),
    status: statusLine?.trim(),
  };
}

function generateIndex() {
  const files = fs
    .readdirSync(ADR_DIR)
    .filter((f) => f.match(/^\d+.*\.md$/) && f !== "README.md")
    .sort();

  const adrs = files.map(parseADR);

  let index = "# Architecture Decision Records\n\n";
  index += "## Index\n\n";
  index += "| ADR | Title | Status |\n";
  index += "|-----|-------|--------|\n";

  for (const adr of adrs) {
    index += `| [${adr.number}](${adr.filename}) | ${adr.title} | ${adr.status} |\n`;
  }

  index += "\n## By Status\n\n";

  const byStatus = {};
  adrs.forEach((adr) => {
    if (!byStatus[adr.status]) byStatus[adr.status] = [];
    byStatus[adr.status].push(adr);
  });

  for (const [status, items] of Object.entries(byStatus)) {
    index += `\n### ${status}\n\n`;
    items.forEach((adr) => {
      index += `- [ADR-${adr.number}: ${adr.title}](${adr.filename})\n`;
    });
  }

  fs.writeFileSync(INDEX_FILE, index);
  console.log(`Generated ${INDEX_FILE}`);
}

generateIndex();
```

### Pre-commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Check if any ADR files are being committed
ADR_FILES=$(git diff --cached --name-only | grep 'docs/adr/.*\.md')

if [ -n "$ADR_FILES" ]; then
  echo "ADR files modified, regenerating index..."
  node scripts/generate-adr-index.js
  git add docs/adr/README.md
fi
```

## Markdown Linting

### markdownlint Configuration

```json
// .markdownlint.json
{
  "default": true,
  "MD013": false, // Line length (ADRs can have long lines)
  "MD033": false, // Allow inline HTML
  "MD041": false, // First line doesn't need to be H1
  "MD024": {
    "siblings_only": true // Allow duplicate headings in different sections
  }
}
```

### Custom ADR Rules

```javascript
// .markdownlint-custom-rules.js
module.exports = [
  {
    names: ["adr-required-sections"],
    description: "ADR must have required sections",
    tags: ["adr"],
    function: (params, onError) => {
      const required = [
        "## Status",
        "## Context",
        "## Decision",
        "## Consequences",
      ];

      const content = params.lines.join("\n");

      required.forEach((section) => {
        if (!content.includes(section)) {
          onError({
            lineNumber: 1,
            detail: `Missing required section: ${section}`,
          });
        }
      });
    },
  },
];
```
