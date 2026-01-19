---
name: angular-web-development
description: Build robust Angular apps with modular architecture, DI, RxJS, NgRx, testing, and performance tuning
---

# Angular Skill

Patterns and guidance for scalable Angular applications.

## Architecture

- **Modules/Standalone**: Prefer standalone components in newer Angular or feature modules when needed.
- **Feature Folders**: `app/features/<feature>/components|services|store`.
- **Shared**: `app/shared/ui`, `app/shared/utils`, `app/shared/directives`.
- **Providers**: Provide services at root or feature scope appropriately.

## Dependency Injection & Services

See [Code Examples](examples.md#dependency-injection--services).

## RxJS Essentials

See [Code Examples](examples.md#rxjs-essentials).

## State Management (NgRx)

See [Code Examples](examples.md#state-management-ngrx).

## Forms

See [Code Examples](examples.md#forms).

## Change Detection

See [Code Examples](examples.md#change-detection).

## Accessibility

- Semantics first, ARIA only when needed.
- Keyboard navigation and focus management.
- Use CDK components for accessible foundations.

## Performance

- Lazy load feature routes.
- Preload critical modules.
- Avoid heavy pipes or complex templates; move logic to TS.
- TrackBy in `*ngFor` for stable identity.

See [Code Examples](examples.md#performance-trackby).

## Testing

- **Unit**: Test components with `TestBed`.
- **Effects/Reducers**: Test NgRx logic isolated.
- **Integration/E2E**: Cypress/Playwright for flows.

See [Code Examples](examples.md#testing).

## Do's & Don'ts

See [Reference Material](references.md#dos--donts).

## Resources

See [Reference Material](references.md#resources).
