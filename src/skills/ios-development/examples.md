# Examples

## SwiftUI Development

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
