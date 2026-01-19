# Examples

## Release Note Templates

### Standard Release
```markdown
# [Product Name] v2.4.0

### 🚀 Highlights
- **Dark Mode**: Your eyes will thank you!
- **Exports**: Download reports as PDF.

### ✨ New Features
- **Dark Mode**: Switch themes in Settings > Appearance.
- **PDF Export**: Click the "Export" button on any dashboard.

### 🐛 Bug Fixes
- Fixed an issue where the login button was disabled on mobile.
- Resolved a crash when uploading images > 5MB.

### ⚠️ Breaking Changes
- The `getUser` API now returns an object instead of a string.
```

### Hotfix Release
```markdown
# [Product Name] v2.4.1 (Hotfix)

This release addresses critical issues found in v2.4.0.

### 🐛 Bug Fixes
- **Critical**: Fixed data loss issue when saving edits offline.
- Fixed layout alignment on Safari.
```

## Migration Guides

### API Migration (v1 -> v2)
```markdown
## Migrating from v1 to v2

### Authentication
**Before:**
```javascript
client.login('api-key');
```

**After:**
```javascript
client.login({ apiKey: 'api-key', region: 'us-east' });
```

### Endpoints
- `GET /users` is now paginated by default.
- `DELETE /posts/:id` returns 204 instead of 200.
```

## Automation Scripts

### Generate Changelog (Git)
```bash
#!/bin/bash
# Generate changelog from git commits
git log --pretty=format:"- %s (%h)" v1.0.0..HEAD | grep -v "Merge" > CHANGELOG.md
```
