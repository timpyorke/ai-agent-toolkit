# Reference Material

## Core Principles

### 1. SwiftUI-First Approach
- **Declarative UI**: Build interfaces by describing what they should look like
- **State-driven**: UI automatically updates when state changes
- **Composability**: Break down complex views into smaller, reusable components
- **Preview-driven development**: Iterate quickly with Xcode previews

### 2. Architecture Excellence
- **Separation of concerns**: Decouple UI, business logic, and data layers
- **Testability**: Design for unit and UI testing from the start
- **Scalability**: Support growing teams and feature sets
- **Maintainability**: Write code that's easy to understand and modify

### 3. Apple Ecosystem Integration
- **Platform conventions**: Follow Human Interface Guidelines (HIG)
- **System features**: Leverage native capabilities (Face ID, HealthKit, etc.)
- **Cross-platform**: Share code with macOS, watchOS, tvOS when appropriate
- **Accessibility**: Build inclusive experiences for all users

## Best Practices

### State Management
- **@State**: View-local state, simple values.
- **@Observable / @StateObject**: Shared state, complex models, view models.
- **@Environment**: Dependency injection, system settings.

### Performance
- **@ViewBuilder**: Efficient conditional view construction.
- **Equatable**: Prevent unnecessary redraws for static content.
- **Lazy Stacks**: Use `LazyVStack` / `LazyHStack` for long lists.
- **Instruments**: Use the Time Profiler to identify bottlenecks.

### Accessibility
- **Labels**: Provide descriptive labels for UI elements.
- **Traits**: use `.accessibilityAddTraits` (e.g., `.isButton`).
- **Dynamic Type**: Support scalable fonts.
- **VoiceOver**: Test navigation flow with VoiceOver enabled.

### Error Handling
- **Domain Errors**: Define specific error enums (e.g. `NetworkError`, `ValidationError`).
- **Graceful Failure**: Show user-friendly error views, not raw error codes.
- **Recovery**: Offer retry actions where possible.
