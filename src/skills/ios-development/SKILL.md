---
name: iOS Development
description: Build native iOS applications using Swift, SwiftUI, and UIKit with modern architecture patterns and best practices
---

# iOS Development Skill

Master the art of building robust, performant, and delightful iOS applications using Swift, SwiftUI, UIKit, and the broader Apple ecosystem.

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

## Modern SwiftUI Development

### Component Architecture

```swift
// MARK: - View Model (Observable)
@Observable
final class ProfileViewModel {
    var user: User
    var isLoading = false
    var errorMessage: String?

    private let userService: UserServiceProtocol

    init(user: User, userService: UserServiceProtocol = UserService()) {
        self.user = user
        self.userService = userService
    }

    @MainActor
    func updateProfile() async {
        isLoading = true
        errorMessage = nil

        do {
            user = try await userService.updateUser(user)
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }
}

// MARK: - SwiftUI View
struct ProfileView: View {
    @State private var viewModel: ProfileViewModel
    @Environment(\.dismiss) private var dismiss

    init(user: User) {
        _viewModel = State(wrappedValue: ProfileViewModel(user: user))
    }

    var body: some View {
        Form {
            Section("Personal Information") {
                TextField("Name", text: $viewModel.user.name)
                TextField("Email", text: $viewModel.user.email)
                    .keyboardType(.emailAddress)
                    .textInputAutocapitalization(.never)
            }

            Section {
                Button("Save Changes") {
                    Task {
                        await viewModel.updateProfile()
                    }
                }
                .disabled(viewModel.isLoading)
            }
        }
        .navigationTitle("Edit Profile")
        .navigationBarTitleDisplayMode(.inline)
        .overlay {
            if viewModel.isLoading {
                ProgressView()
            }
        }
        .alert("Error", isPresented: .constant(viewModel.errorMessage != nil)) {
            Button("OK") {
                viewModel.errorMessage = nil
            }
        } message: {
            Text(viewModel.errorMessage ?? "")
        }
    }
}

// MARK: - Preview
#Preview {
    NavigationStack {
        ProfileView(user: User.mock)
    }
}
```

### Reusable Components

```swift
// MARK: - Custom Button Style
struct PrimaryButtonStyle: ButtonStyle {
    @Environment(\.isEnabled) private var isEnabled

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.headline)
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity)
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(isEnabled ? Color.accentColor : Color.gray)
            )
            .opacity(configuration.isPressed ? 0.7 : 1.0)
            .animation(.easeInOut(duration: 0.2), value: configuration.isPressed)
    }
}

extension ButtonStyle where Self == PrimaryButtonStyle {
    static var primary: PrimaryButtonStyle { PrimaryButtonStyle() }
}

// MARK: - Usage
struct CheckoutView: View {
    var body: some View {
        Button("Complete Purchase") {
            // Handle purchase
        }
        .buttonStyle(.primary)
    }
}
```

### Navigation Patterns

```swift
// MARK: - Navigation Coordinator
@Observable
final class AppCoordinator {
    var navigationPath = NavigationPath()
    var presentedSheet: SheetDestination?

    enum SheetDestination: Identifiable {
        case settings
        case profile(User)
        case createPost

        var id: String {
            switch self {
            case .settings: return "settings"
            case .profile(let user): return "profile-\(user.id)"
            case .createPost: return "createPost"
            }
        }
    }

    func navigate(to screen: Screen) {
        navigationPath.append(screen)
    }

    func presentSheet(_ sheet: SheetDestination) {
        presentedSheet = sheet
    }

    func pop() {
        navigationPath.removeLast()
    }

    func popToRoot() {
        navigationPath = NavigationPath()
    }
}

// MARK: - App Structure
@main
struct MyApp: App {
    @State private var coordinator = AppCoordinator()

    var body: some Scene {
        WindowGroup {
            NavigationStack(path: $coordinator.navigationPath) {
                HomeView()
                    .navigationDestination(for: Screen.self) { screen in
                        screen.view
                    }
            }
            .sheet(item: $coordinator.presentedSheet) { destination in
                destination.view
            }
            .environment(coordinator)
        }
    }
}
```

## Architecture Patterns

### MVVM with Combine

```swift
import Combine

// MARK: - View Model
final class FeedViewModel: ObservableObject {
    @Published var posts: [Post] = []
    @Published var isLoading = false
    @Published var error: Error?

    private let postRepository: PostRepositoryProtocol
    private var cancellables = Set<AnyCancellable>()

    init(postRepository: PostRepositoryProtocol = PostRepository()) {
        self.postRepository = postRepository
        observePosts()
    }

    private func observePosts() {
        postRepository.postsPublisher
            .receive(on: DispatchQueue.main)
            .assign(to: &$posts)
    }

    func loadPosts() {
        isLoading = true
        error = nil

        postRepository.fetchPosts()
            .receive(on: DispatchQueue.main)
            .sink { [weak self] completion in
                self?.isLoading = false
                if case .failure(let error) = completion {
                    self?.error = error
                }
            } receiveValue: { [weak self] posts in
                self?.posts = posts
            }
            .store(in: &cancellables)
    }
}

// MARK: - Repository Protocol
protocol PostRepositoryProtocol {
    var postsPublisher: AnyPublisher<[Post], Never> { get }
    func fetchPosts() -> AnyPublisher<[Post], Error>
}
```

### SwiftData for Persistence

```swift
import SwiftData

// MARK: - Model
@Model
final class Task {
    @Attribute(.unique) var id: UUID
    var title: String
    var isCompleted: Bool
    var dueDate: Date?
    var priority: Priority

    @Relationship(deleteRule: .cascade)
    var subtasks: [Subtask]

    init(title: String, priority: Priority = .medium) {
        self.id = UUID()
        self.title = title
        self.isCompleted = false
        self.priority = priority
        self.subtasks = []
    }

    enum Priority: String, Codable {
        case low, medium, high
    }
}

// MARK: - View with SwiftData
struct TaskListView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \Task.dueDate) private var tasks: [Task]

    var body: some View {
        List {
            ForEach(tasks) { task in
                TaskRow(task: task)
            }
            .onDelete(perform: deleteTasks)
        }
        .toolbar {
            Button("Add", systemImage: "plus") {
                addTask()
            }
        }
    }

    private func addTask() {
        let task = Task(title: "New Task")
        modelContext.insert(task)
    }

    private func deleteTasks(at offsets: IndexSet) {
        for index in offsets {
            modelContext.delete(tasks[index])
        }
    }
}
```

## Networking Layer

### Modern async/await Networking

```swift
// MARK: - API Client
protocol APIClient {
    func request<T: Decodable>(_ endpoint: Endpoint) async throws -> T
}

final class NetworkAPIClient: APIClient {
    private let session: URLSession
    private let decoder: JSONDecoder

    init(session: URLSession = .shared) {
        self.session = session
        self.decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        decoder.dateDecodingStrategy = .iso8601
    }

    func request<T: Decodable>(_ endpoint: Endpoint) async throws -> T {
        let request = try endpoint.makeRequest()

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw NetworkError.invalidResponse
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            throw NetworkError.httpError(httpResponse.statusCode)
        }

        do {
            return try decoder.decode(T.self, from: data)
        } catch {
            throw NetworkError.decodingError(error)
        }
    }
}

// MARK: - Endpoint
struct Endpoint {
    let path: String
    let method: HTTPMethod
    let headers: [String: String]?
    let body: Encodable?
    let queryItems: [URLQueryItem]?

    func makeRequest() throws -> URLRequest {
        var components = URLComponents()
        components.scheme = "https"
        components.host = "api.example.com"
        components.path = path
        components.queryItems = queryItems

        guard let url = components.url else {
            throw NetworkError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = method.rawValue

        headers?.forEach { request.setValue($1, forHTTPHeaderField: $0) }

        if let body = body {
            let encoder = JSONEncoder()
            encoder.keyEncodingStrategy = .convertToSnakeCase
            request.httpBody = try encoder.encode(body)
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        }

        return request
    }
}

enum HTTPMethod: String {
    case get = "GET"
    case post = "POST"
    case put = "PUT"
    case delete = "DELETE"
}

enum NetworkError: LocalizedError {
    case invalidURL
    case invalidResponse
    case httpError(Int)
    case decodingError(Error)

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .invalidResponse:
            return "Invalid response from server"
        case .httpError(let code):
            return "HTTP error: \(code)"
        case .decodingError(let error):
            return "Failed to decode: \(error.localizedDescription)"
        }
    }
}
```

## Testing Strategy

### Unit Testing

```swift
import XCTest
@testable import MyApp

final class ProfileViewModelTests: XCTestCase {
    var sut: ProfileViewModel!
    var mockUserService: MockUserService!

    override func setUp() {
        super.setUp()
        mockUserService = MockUserService()
        sut = ProfileViewModel(
            user: User.mock,
            userService: mockUserService
        )
    }

    override func tearDown() {
        sut = nil
        mockUserService = nil
        super.tearDown()
    }

    func testUpdateProfile_Success() async {
        // Given
        let updatedUser = User(id: "1", name: "Updated", email: "test@example.com")
        mockUserService.updateUserResult = .success(updatedUser)

        // When
        await sut.updateProfile()

        // Then
        XCTAssertEqual(sut.user.name, "Updated")
        XCTAssertFalse(sut.isLoading)
        XCTAssertNil(sut.errorMessage)
    }

    func testUpdateProfile_Failure() async {
        // Given
        mockUserService.updateUserResult = .failure(NetworkError.invalidResponse)

        // When
        await sut.updateProfile()

        // Then
        XCTAssertNotNil(sut.errorMessage)
        XCTAssertFalse(sut.isLoading)
    }
}

// MARK: - Mock
final class MockUserService: UserServiceProtocol {
    var updateUserResult: Result<User, Error>!

    func updateUser(_ user: User) async throws -> User {
        switch updateUserResult {
        case .success(let user):
            return user
        case .failure(let error):
            throw error
        case .none:
            fatalError("updateUserResult not set")
        }
    }
}
```

### UI Testing

```swift
import XCTest

final class LoginUITests: XCTestCase {
    var app: XCUIApplication!

    override func setUp() {
        super.setUp()
        continueAfterFailure = false
        app = XCUIApplication()
        app.launchArguments = ["UI-Testing"]
        app.launch()
    }

    func testSuccessfulLogin() {
        // Given
        let emailField = app.textFields["Email"]
        let passwordField = app.secureTextFields["Password"]
        let loginButton = app.buttons["Login"]

        // When
        emailField.tap()
        emailField.typeText("test@example.com")

        passwordField.tap()
        passwordField.typeText("password123")

        loginButton.tap()

        // Then
        XCTAssertTrue(app.navigationBars["Home"].waitForExistence(timeout: 5))
    }

    func testLoginWithEmptyFields() {
        // When
        app.buttons["Login"].tap()

        // Then
        XCTAssertTrue(app.alerts["Error"].exists)
    }
}
```

## Best Practices

### 1. State Management

```swift
// ✅ Use @State for view-local state
struct CounterView: View {
    @State private var count = 0

    var body: some View {
        VStack {
            Text("Count: \(count)")
            Button("Increment") {
                count += 1
            }
        }
    }
}

// ✅ Use @Observable for shared state
@Observable
final class AppState {
    var user: User?
    var isAuthenticated: Bool { user != nil }
}

// ✅ Use @Environment for dependency injection
struct ContentView: View {
    @Environment(AppState.self) private var appState

    var body: some View {
        if appState.isAuthenticated {
            HomeView()
        } else {
            LoginView()
        }
    }
}
```

### 2. Performance Optimization

```swift
// ✅ Use @ViewBuilder for conditional views
@ViewBuilder
func statusView(for order: Order) -> some View {
    switch order.status {
    case .pending:
        PendingView()
    case .processing:
        ProcessingView()
    case .completed:
        CompletedView()
    }
}

// ✅ Use equatable for performance
struct ProductCard: View, Equatable {
    let product: Product

    var body: some View {
        VStack {
            AsyncImage(url: product.imageURL)
            Text(product.name)
        }
    }

    static func == (lhs: ProductCard, rhs: ProductCard) -> Bool {
        lhs.product.id == rhs.product.id
    }
}

// ✅ Use task modifier for async work
struct FeedView: View {
    @State private var viewModel = FeedViewModel()

    var body: some View {
        List(viewModel.posts) { post in
            PostRow(post: post)
        }
        .task {
            await viewModel.loadPosts()
        }
    }
}
```

### 3. Accessibility

```swift
struct AccessibleButton: View {
    let title: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
        }
        .accessibilityLabel(title)
        .accessibilityHint("Double tap to perform action")
        .accessibilityAddTraits(.isButton)
    }
}

// Custom controls
struct RatingView: View {
    @Binding var rating: Int

    var body: some View {
        HStack {
            ForEach(1...5, id: \.self) { index in
                Image(systemName: index <= rating ? "star.fill" : "star")
                    .onTapGesture {
                        rating = index
                    }
            }
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Rating")
        .accessibilityValue("\(rating) out of 5 stars")
        .accessibilityAdjustableAction { direction in
            switch direction {
            case .increment:
                if rating < 5 { rating += 1 }
            case .decrement:
                if rating > 1 { rating -= 1 }
            @unknown default:
                break
            }
        }
    }
}
```

### 4. Error Handling

```swift
// ✅ Create domain-specific errors
enum ValidationError: LocalizedError {
    case emptyEmail
    case invalidEmailFormat
    case passwordTooShort

    var errorDescription: String? {
        switch self {
        case .emptyEmail:
            return "Email cannot be empty"
        case .invalidEmailFormat:
            return "Please enter a valid email address"
        case .passwordTooShort:
            return "Password must be at least 8 characters"
        }
    }

    var recoverySuggestion: String? {
        switch self {
        case .emptyEmail, .invalidEmailFormat:
            return "Please check your email and try again"
        case .passwordTooShort:
            return "Choose a longer password"
        }
    }
}

// ✅ Handle errors gracefully
struct ErrorView: View {
    let error: Error
    let retry: () -> Void

    var body: some View {
        ContentUnavailableView {
            Label("Error", systemImage: "exclamationmark.triangle")
        } description: {
            Text(error.localizedDescription)
        } actions: {
            Button("Try Again", action: retry)
        }
    }
}
```

## Common Patterns

### Loading States

```swift
enum LoadingState<T> {
    case idle
    case loading
    case loaded(T)
    case error(Error)
}

struct ContentView<T>: View {
    let state: LoadingState<T>
    let content: (T) -> some View

    var body: some View {
        switch state {
        case .idle:
            Text("Pull to refresh")
        case .loading:
            ProgressView()
        case .loaded(let data):
            content(data)
        case .error(let error):
            ErrorView(error: error) {
                // Retry logic
            }
        }
    }
}
```

### Dependency Injection

```swift
// Protocol-based dependencies
protocol AuthServiceProtocol {
    func login(email: String, password: String) async throws -> User
    func logout() async throws
}

// Environment key
private struct AuthServiceKey: EnvironmentKey {
    static let defaultValue: AuthServiceProtocol = AuthService()
}

extension EnvironmentValues {
    var authService: AuthServiceProtocol {
        get { self[AuthServiceKey.self] }
        set { self[AuthServiceKey.self] = newValue }
    }
}

// Usage
struct LoginView: View {
    @Environment(\.authService) private var authService

    var body: some View {
        Button("Login") {
            Task {
                try await authService.login(email: email, password: password)
            }
        }
    }
}
```

## Tooling & Workflow

### 1. SwiftLint Configuration

```yaml
# .swiftlint.yml
disabled_rules:
  - trailing_whitespace
opt_in_rules:
  - empty_count
  - explicit_init
  - closure_spacing
included:
  - Sources
excluded:
  - Pods
  - Generated
line_length: 120
```

### 2. Build Configurations

```swift
// Debug helpers
#if DEBUG
extension View {
    func debugPrint(_ value: Any) -> some View {
        print(value)
        return self
    }
}
#endif

// Environment-specific configuration
enum BuildConfiguration {
    case debug
    case release

    static var current: BuildConfiguration {
        #if DEBUG
        return .debug
        #else
        return .release
        #endif
    }

    var apiBaseURL: String {
        switch self {
        case .debug:
            return "https://dev.api.example.com"
        case .release:
            return "https://api.example.com"
        }
    }
}
```

### 3. Xcode Previews Best Practices

```swift
// Preview with multiple configurations
#Preview("Light Mode") {
    HomeView()
        .preferredColorScheme(.light)
}

#Preview("Dark Mode") {
    HomeView()
        .preferredColorScheme(.dark)
}

#Preview("Large Text") {
    HomeView()
        .environment(\.dynamicTypeSize, .xxxLarge)
}

// Preview with mock data
#Preview("With Data") {
    let container = try! ModelContainer(
        for: Task.self,
        configurations: ModelConfiguration(isStoredInMemoryOnly: true)
    )

    return TaskListView()
        .modelContainer(container)
}
```

## Anti-Patterns to Avoid

### ❌ Massive View Controllers (UIKit)

```swift
// Bad: 1000+ line view controller
class MassiveViewController: UIViewController {
    // Too many responsibilities
}

// Good: Split into smaller components
class ProductViewController: UIViewController {
    private let viewModel: ProductViewModel
    private let imageLoader: ImageLoader
    // Focused responsibilities
}
```

### ❌ Force Unwrapping

```swift
// Bad
let user = userRepository.currentUser!

// Good
guard let user = userRepository.currentUser else {
    return
}
```

### ❌ Retain Cycles

```swift
// Bad
Task {
    self.data = try await fetchData()
}

// Good
Task { [weak self] in
    guard let self else { return }
    self.data = try await fetchData()
}
```

## Quick Reference

### SwiftUI Modifiers

```swift
// Layout
.frame(width: 200, height: 100)
.padding()
.offset(x: 10, y: 20)

// Styling
.foregroundStyle(.blue)
.background(.white)
.cornerRadius(12)
.shadow(radius: 5)

// Interaction
.onTapGesture { }
.gesture(DragGesture())
.disabled(true)

// Navigation
.navigationTitle("Title")
.toolbar { }
.sheet(isPresented: $showSheet) { }
```

### Async/Await Patterns

```swift
// Sequential
let user = try await fetchUser()
let posts = try await fetchPosts(for: user)

// Concurrent
async let user = fetchUser()
async let posts = fetchPosts()
let (userData, postsData) = try await (user, posts)

// Task groups
await withTaskGroup(of: Post.self) { group in
    for id in postIDs {
        group.addTask {
            try await fetchPost(id: id)
        }
    }
}
```

## Resources

- [Swift.org Documentation](https://swift.org/documentation/)
- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [SwiftUI Lab](https://swiftui-lab.com/)
- [Hacking with Swift](https://www.hackingwithswift.com/)

---

_Building exceptional iOS experiences requires mastering SwiftUI, understanding platform conventions, and continuously learning as the ecosystem evolves._
