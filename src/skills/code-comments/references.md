# Reference Material

## Core Principles

### 1. Explain the Why, Not the What
- **Why**: "We use binary search here because the dataset is sorted and large (O(log n) vs O(n))."
- **What**: "Performs binary search." (Redundant, the code shows this)
- **When**: Comment when the code itself cannot express the intent, constraint, or history.

### 2. Commenting Levels
- **Level 1 (Inline)**: Explains complex logic or non-obvious lines within a function.
- **Level 2 (Function/Class)**: Explains the purpose, inputs, outputs, and side effects (Docstrings/JSDoc).
- **Level 3 (Module/File)**: Explains the high-level responsibility and relationships of the module.

### 3. Maintain Comments Like Code
- Outdated comments are worse than no comments.
- Update comments whenever the logic they describe changes.
- Delete comments that are no longer relevant (Git history preserves the past).

## Standard Markers

| Marker | Usage |
| :--- | :--- |
| `TODO` | Work that needs to be done later. |
| `FIXME` | Code that is broken or incorrect and needs fixing. |
| `HACK` | A workaround for a problem or a temporary solution. |
| `NOTE` | Important information to highlight for other developers. |
| `OPTIMIZE` | Code that functions but is inefficient (performance). |
| `SECURITY` | Security-related notes, risks, or mitigations. |
| `DEPRECATED` | Functionality that should no longer be used. |

## Best Practices

### ✅ DO
1. **Explain why, not what**: Focus on intent, constraints, and business logic.
2. **Document public APIs**: Use JSDoc, Docstrings, or Javadoc for exported functions, classes, and types.
3. **Use consistent markers**: Stick to `TODO`, `FIXME`, etc., and formatting conventions.
4. **Link to external documentation**: Reference issues, specs, or design docs for deep context.
5. **Update comments with code**: Treat comments as part of the code's truth.

### ❌ DON'T
1. **Don't state the obvious**: `i++ // increment i` adds noise, not value.
2. **Don't leave commented-out code**: It clutters the file. Trust version control to retrieve old code if needed.
3. **Don't write novels**: Keep comments concise and focused. Link to external docs for long-form explanations.
4. **Don't fix bad code with comments**: If code is confusing, refactor it to be clearer instead of explaining the mess.

## Anti-Patterns

### Redundant Comments
```python
# ❌ Redundant: Repeats what code says
# Increment counter by 1
counter += 1
```

### Apologetic Comments
```javascript
// ❌ Don't apologize, fix it or explain why it's necessary
// Sorry this is messy, I was in a rush
function complexLogic() { ... }
```

### Commented-Out Code
```java
// ❌ Dead code
// public void oldMethod() { ... }
```
