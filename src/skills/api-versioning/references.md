# Reference Material

## Core Concepts

### Version Lifecycle

```
Alpha → Beta → Stable → Deprecated → Sunset
  │       │       │         │          │
  │       │       │         │          └─ Removed
  │       │       │         └─ Warning period
  │       │       └─ Production-ready
  │       └─ Feature-complete
  └─ Experimental
```

### Semantic Versioning for APIs

```
MAJOR.MINOR.PATCH
  │     │     │
  │     │     └─ Bug fixes (backward compatible)
  │     └─ New features (backward compatible)
  └─ Breaking changes
```

## Strategy Comparison

### URI Path Versioning
**Pros:**
- ✅ Explicit and visible in URLs
- ✅ Easy to route/cache/test
**Cons:**
- ❌ URL pollution
- ❌ Not RESTful

### Header Versioning
**Pros:**
- ✅ RESTful (URI stays clean)
- ✅ Content negotiation standard
**Cons:**
- ❌ Not visible in URLs
- ❌ Harder to test in browsers

### Query Parameter Versioning
**Pros:**
- ✅ Easy to test/debug
- ✅ Simple implementation
**Cons:**
- ❌ Pollutes query parameters
- ❌ Not RESTful

### Custom Header Versioning
**Pros:**
- ✅ Simple and explicit
- ✅ Separate from URL and body
**Cons:**
- ❌ Not standard
- ❌ Requires header support

### Decision Matrix

| Strategy | Visibility | Caching | RESTful | Ease of Use |
| --- | --- | --- | --- | --- |
| URI Path | High | Easy | No | High |
| Accept Header | Low | Medium | Yes | Medium |
| Query Param | High | Easy | No | High |
| Custom Header | Medium | Medium | Yes | Medium |

## Deprecation Timeline

```
Month 1-2: Announce deprecation (Sunset headers, Docs, Email)
Month 3-4: Warning period (Log usage, Contact users)
Month 5-6: Grace period (Reduce support, Response warnings)
Month 7: Sunset (410 Gone, Redirect)
```

## Best Practices & Anti-Patterns

### Best Practices

- **Version from Day One**
- **Support N-1 Versions**
- **Document Every Change** (Changelog)
- **Use Feature Flags** for gradual rollout

### Anti-Patterns

- ❌ **Micro-Versioning**: Creating new version for every tiny change.
- ❌ **No Deprecation Period**: Removing old version immediately.
- ❌ **Versioning Individual Fields**: e.g., `name_v1`, `name_v2`.

## Resources

- [REST API Versioning (Microsoft)](https://docs.microsoft.com/en-us/azure/architecture/best-practices/api-design#versioning-a-restful-web-api)
- [API Evolution (Stripe)](https://stripe.com/blog/api-versioning)
- [GraphQL Schema Evolution](https://graphql.org/learn/best-practices/#versioning)
- [Semantic Versioning](https://semver.org/)
- [RFC 8594 - Sunset HTTP Header](https://datatracker.ietf.org/doc/html/rfc8594)
