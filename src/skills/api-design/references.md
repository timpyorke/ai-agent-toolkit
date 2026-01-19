# Reference Material

## Best Practices

### Do:

- ✅ Design from user journeys
- ✅ Standardize responses and errors
- ✅ Provide clear versioning/deprecation
- ✅ Use contract-first with OpenAPI/SDL
- ✅ Include idempotency for creates

### Don't:

- ❌ Overload endpoints with mixed responsibilities
- ❌ Break contracts without deprecation
- ❌ Expose internal error details
- ❌ Use inconsistent naming/status codes

## Quick Reference

- REST: nouns, proper methods, consistent errors
- GraphQL: clear types, dataloader, persisted queries
- Versioning: `/v1` paths, deprecation headers
- Docs: OpenAPI/SDL in repo, CI validation
