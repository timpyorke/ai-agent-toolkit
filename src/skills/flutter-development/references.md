# Reference Material

## Core Principles

### 1. Clean Architecture
- **Separation of concerns**: UI, Logic, and Data are independent
- **Dependency Rule**: Source code dependencies only point inwards
- **Testability**: Business logic can be tested without UI/Framework

### 2. State Management (BLoC)
- **Events**: Input to the Bloc (e.g., button press)
- **States**: Output from the Bloc (e.g., data loaded)
- **Unidirectional Data Flow**: View -> Event -> Bloc -> State -> View
- **Predictability**: State transitions are explicit and traceable

### 3. Dependency Injection
- **Inversion of Control**: Classes don't create their dependencies
- **Service Locator (get_it)**: Central registry for dependencies
- **Testability**: Easy to swap real implementations with mocks

## Architecture Layers

### Presentation Layer
- **Responsibility**: Display data and handle user input
- **Components**: Widgets, Pages, Blocs/Controllers
- **Principles**: Dumb widgets, logic in BLoC

### Domain Layer
- **Responsibility**: Core business logic (Enterprise wide)
- **Components**: Entities, Use Cases, Repository Interfaces
- **Dependencies**: None (Pure Dart)

### Data Layer
- **Responsibility**: Retrieve and persist data (External agencies)
- **Components**: Models, Repository Implementations, Data Sources
- **Dependencies**: HTTP client, Local Database, Platform channels

## Best Practices

### Code
- Use `const` constructors where possible for performance
- Use `Equatable` for value equality comparisons
- Use strict linting (flutter_lints or very_good_analysis)
- Handle errors with Either<Failure, Success> type (fpdart or dartz)

### UI
- Break down large widgets into smaller, reusable ones
- Use `Theme` for consistent styling
- Support Dark Mode and different screen sizes (Responsive)

### Testing
- **Unit Tests**: Test logic in isolation (Blocs, UseCases, Repositories)
- **Widget Tests**: Test UI components and interactions
- **Integration Tests**: Test the full app flow
- Aim for high coverage, especially in Domain and Data layers

## Common Packages
- **State Management**: `flutter_bloc`, `provider`, `riverpod`
- **DI**: `get_it`, `injectable`
- **Functional**: `fpdart` or `dartz`
- **Comparison**: `equatable`
- **Networking**: `dio`, `http`, `retrofit`
- **JSON**: `json_annotation`, `json_serializable`
