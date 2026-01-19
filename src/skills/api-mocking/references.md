# Reference Material

## Best Practices

### Do:

- ✅ Put mock data in repo with code owners
- ✅ Use contract-first validation in CI
- ✅ Document scenarios and how to toggle
- ✅ Simulate realistic latency and errors

### Don't:

- ❌ Hardcode mocks inside app logic
- ❌ Drift mock contract from real API
- ❌ Skip error scenarios (5xx/4xx, timeouts)
- ❌ Leave mocks enabled in production

## Quick Reference

- Prism/WireMock/JSON Server for REST
- MSW for browser/interception
- GraphQL Tools for schema-based mocks
- Scenario toggles via header/query/env
