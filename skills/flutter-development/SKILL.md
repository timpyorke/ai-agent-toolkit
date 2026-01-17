---
name: Flutter Development
description: Build cross-platform mobile applications with Flutter using MVVM and Clean Architecture patterns
---

# Flutter Development Skill

Master cross-platform mobile development with Flutter, Dart, and modern architecture patterns emphasizing MVVM and Clean Architecture principles.

## Core Principles

### 1. Clean Architecture

- **Layer separation**: Presentation, Domain, Data layers with clear boundaries
- **Dependency rule**: Inner layers know nothing about outer layers
- **Testability**: Each layer can be tested in isolation
- **Framework independence**: Business logic independent of UI framework

### 2. MVVM Pattern

- **View**: UI components (Widgets) that react to state changes
- **ViewModel**: Presentation logic and state management
- **Model**: Data entities and business logic
- **Data binding**: Reactive state updates using streams or providers

### 3. Cross-Platform Excellence

- **Platform-adaptive UI**: Respect platform conventions (Material/Cupertino)
- **Code reuse**: Share business logic across iOS, Android, Web, Desktop
- **Platform channels**: Native integration when needed
- **Performance**: 60fps smooth animations and efficient rendering

## Clean Architecture Structure

```
lib/
├── core/
│   ├── data/
│   │   ├── datasources/
│   │   │   ├── auth_local_data_source.dart
│   │   │   └── auth_remote_data_source.dart
│   │   ├── models/
│   │   │   └── user_model.dart
│   │   └── repositories/
│   │       └── auth_repository_impl.dart
│   ├── domain/
│   │   ├── entities/
│   │   │   └── user.dart
│   │   ├── repositories/
│   │   │   └── auth_repository.dart
│   │   └── usecases/
│   │       ├── usecase.dart
│   │       ├── login_user.dart
│   │       └── logout_user.dart
│   ├── error/
│   │   ├── exceptions.dart
│   │   └── failures.dart
│   ├── network/
│   │   └── network_info.dart
│   └── utils/
│       ├── constants.dart
│       └── validators.dart
├── features/
│   └── authentication/
│       └── presentation/
│           ├── providers/
│           │   └── auth_provider.dart
│           ├── viewmodels/
│           │   └── login_viewmodel.dart
│           └── pages/
│               └── login_page.dart
└── main.dart
```

## Domain Layer (Business Logic)

### Entity

```dart
// lib/core/domain/entities/user.dart
import 'package:equatable/equatable.dart';

class User extends Equatable {
  final String id;
  final String email;
  final String name;
  final String? avatarUrl;

  const User({
    required this.id,
    required this.email,
    required this.name,
    this.avatarUrl,
  });

  @override
  List<Object?> get props => [id, email, name, avatarUrl];
}
```

### Repository Interface

```dart
// lib/core/domain/repositories/auth_repository.dart
import 'package:dartz/dartz.dart';
import '../../error/failures.dart';
import '../entities/user.dart';

abstract class AuthRepository {
  Future<Either<Failure, User>> login({
    required String email,
    required String password,
  });

  Future<Either<Failure, void>> logout();

  Future<Either<Failure, User>> getCurrentUser();
}
```

### Use Case

```dart
// lib/core/domain/usecases/usecase.dart
import 'package:dartz/dartz.dart';
import '../../error/failures.dart';

abstract class UseCase<Type, Params> {
  Future<Either<Failure, Type>> call(Params params);
}

class NoParams {}

// lib/core/domain/usecases/login_user.dart
import 'package:dartz/dartz.dart';
import '../../error/failures.dart';
import 'usecase.dart';
import '../entities/user.dart';
import '../repositories/auth_repository.dart';

class LoginUser implements UseCase<User, LoginParams> {
  final AuthRepository repository;

  LoginUser(this.repository);

  @override
  Future<Either<Failure, User>> call(LoginParams params) async {
    return await repository.login(
      email: params.email,
      password: params.password,
    );
  }
}

class LoginParams {
  final String email;
  final String password;

  LoginParams({required this.email, required this.password});
}
```

## Data Layer (Implementation)

### Model

```dart
// lib/core/data/models/user_model.dart
import '../../domain/entities/user.dart';

class UserModel extends User {
  const UserModel({
    required super.id,
    required super.email,
    required super.name,
    super.avatarUrl,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String,
      email: json['email'] as String,
      name: json['name'] as String,
      avatarUrl: json['avatar_url'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'avatar_url': avatarUrl,
    };
  }

  User toEntity() {
    return User(
      id: id,
      email: email,
      name: name,
      avatarUrl: avatarUrl,
    );
  }
}
```

### Remote Data Source

```dart
// lib/core/data/datasources/auth_remote_data_source.dart
import 'package:dio/dio.dart';
import '../../error/exceptions.dart';
import '../models/user_model.dart';

abstract class AuthRemoteDataSource {
  Future<UserModel> login(String email, String password);
  Future<void> logout();
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final Dio client;

  AuthRemoteDataSourceImpl({required this.client});

  @override
  Future<UserModel> login(String email, String password) async {
    try {
      final response = await client.post(
        '/auth/login',
        data: {
          'email': email,
          'password': password,
        },
      );

      if (response.statusCode == 200) {
        return UserModel.fromJson(response.data['user']);
      } else {
        throw ServerException();
      }
    } on DioException catch (e) {
      throw ServerException(message: e.message);
    }
  }

  @override
  Future<void> logout() async {
    try {
      await client.post('/auth/logout');
    } on DioException {
      throw ServerException();
    }
  }
}
```

### Local Data Source

```dart
// lib/core/data/datasources/auth_local_data_source.dart
import 'package:shared_preferences/shared_preferences.dart';
import '../../error/exceptions.dart';
import '../models/user_model.dart';
import 'dart:convert';

abstract class AuthLocalDataSource {
  Future<UserModel?> getCachedUser();
  Future<void> cacheUser(UserModel user);
  Future<void> clearCache();
}

class AuthLocalDataSourceImpl implements AuthLocalDataSource {
  final SharedPreferences sharedPreferences;
  static const cachedUserKey = 'CACHED_USER';

  AuthLocalDataSourceImpl({required this.sharedPreferences});

  @override
  Future<UserModel?> getCachedUser() async {
    final jsonString = sharedPreferences.getString(cachedUserKey);
    if (jsonString != null) {
      return UserModel.fromJson(json.decode(jsonString));
    }
    return null;
  }

  @override
  Future<void> cacheUser(UserModel user) async {
    await sharedPreferences.setString(
      cachedUserKey,
      json.encode(user.toJson()),
    );
  }

  @override
  Future<void> clearCache() async {
    await sharedPreferences.remove(cachedUserKey);
  }
}
```

### Repository Implementation

```dart
// lib/features/authentication/data/repositories/auth_repository_impl.dart
import 'package:dartz/dartz.dart';
import '../../../../core/error/exceptions.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/network/network_info.dart';
import '../../domain/entities/user.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_local_data_source.dart';
import '../datasources/auth_remote_data_source.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource remoteDataSource;
  final AuthLocalDataSource localDataSource;
  final NetworkInfo networkInfo;

  AuthRepositoryImpl({
    required this.remoteDataSource,
    required this.localDataSource,
    required this.networkInfo,
  });

  @override
  Future<Either<Failure, User>> login({
    required String email,
    required String password,
  }) async {
    if (await networkInfo.isConnected) {
      try {
        final user = await remoteDataSource.login(email, password);
        await localDataSource.cacheUser(user);
        return Right(user.toEntity());
      } on ServerException catch (e) {
        return Left(ServerFailure(message: e.message));
      }
    } else {
      return Left(NetworkFailure());
    }
  }

  @override
  Future<Either<Failure, void>> logout() async {
    try {
      if (await networkInfo.isConnected) {
        await remoteDataSource.logout();
      }
      await localDataSource.clearCache();
      return const Right(null);
    } on CacheException {
      return Left(CacheFailure());
    }
  }

  @override
  Future<Either<Failure, User>> getCurrentUser() async {
    try {
      final cachedUser = await localDataSource.getCachedUser();
      if (cachedUser != null) {
        return Right(cachedUser.toEntity());
      }
      return Left(CacheFailure(message: 'No cached user found'));
    } on CacheException {
      return Left(CacheFailure());
    }
  }
}
```

## Presentation Layer (MVVM)

### ViewModel with Riverpod

```dart
// lib/features/authentication/presentation/viewmodels/login_viewmodel.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/domain/entities/user.dart';
import '../../../../core/domain/usecases/login_user.dart';

// State classes
abstract class LoginState {}

class LoginInitial extends LoginState {}

class LoginLoading extends LoginState {}

class LoginSuccess extends LoginState {
  final User user;
  LoginSuccess(this.user);
}

class LoginError extends LoginState {
  final String message;
  LoginError(this.message);
}

// ViewModel
class LoginViewModel extends StateNotifier<LoginState> {
  final LoginUser loginUseCase;

  LoginViewModel({required this.loginUseCase}) : super(LoginInitial());

  Future<void> login({
    required String email,
    required String password,
  }) async {
    state = LoginLoading();

    final result = await loginUseCase(
      LoginParams(email: email, password: password),
    );

    result.fold(
      (failure) => state = LoginError(_mapFailureToMessage(failure)),
      (user) => state = LoginSuccess(user),
    );
  }

  String _mapFailureToMessage(failure) {
    switch (failure.runtimeType) {
      case ServerFailure:
        return 'Server error. Please try again later.';
      case NetworkFailure:
        return 'No internet connection. Please check your network.';
      default:
        return 'Unexpected error occurred.';
    }
  }
}

// Provider
final loginViewModelProvider = StateNotifierProvider<LoginViewModel, LoginState>(
  (ref) => LoginViewModel(
    loginUseCase: ref.read(loginUseCaseProvider),
  ),
);
```

### View (Page)

```dart
// lib/features/authentication/presentation/pages/login_page.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../viewmodels/login_viewmodel.dart';

class LoginPage extends ConsumerStatefulWidget {
  const LoginPage({super.key});

  @override
  ConsumerState<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends ConsumerState<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    ref.listen<LoginState>(loginViewModelProvider, (previous, next) {
      if (next is LoginSuccess) {
        Navigator.of(context).pushReplacementNamed('/home');
      } else if (next is LoginError) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(next.message),
            backgroundColor: Colors.red,
          ),
        );
      }
    });

    final state = ref.watch(loginViewModelProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Login'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              TextFormField(
                controller: _emailController,
                decoration: const InputDecoration(
                  labelText: 'Email',
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.emailAddress,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter your email';
                  }
                  if (!value.contains('@')) {
                    return 'Please enter a valid email';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _passwordController,
                decoration: const InputDecoration(
                  labelText: 'Password',
                  border: OutlineInputBorder(),
                ),
                obscureText: true,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter your password';
                  }
                  if (value.length < 6) {
                    return 'Password must be at least 6 characters';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: state is LoginLoading ? null : _handleLogin,
                  child: state is LoginLoading
                      ? const CircularProgressIndicator()
                      : const Text('Login'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _handleLogin() {
    if (_formKey.currentState!.validate()) {
      ref.read(loginViewModelProvider.notifier).login(
            email: _emailController.text.trim(),
            password: _passwordController.text.trim(),
          );
    }
  }
}
```

## State Management Options

### 1. Riverpod (Recommended)

```dart
// Providers
final counterProvider = StateProvider<int>((ref) => 0);

final userProvider = FutureProvider<User>((ref) async {
  final repository = ref.read(authRepositoryProvider);
  final result = await repository.getCurrentUser();
  return result.fold(
    (failure) => throw Exception(failure.message),
    (user) => user,
  );
});

// Stream provider
final postsStreamProvider = StreamProvider<List<Post>>((ref) {
  final repository = ref.read(postRepositoryProvider);
  return repository.watchPosts();
});

// Usage in widget
class CounterWidget extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final count = ref.watch(counterProvider);

    return Column(
      children: [
        Text('Count: $count'),
        ElevatedButton(
          onPressed: () => ref.read(counterProvider.notifier).state++,
          child: const Text('Increment'),
        ),
      ],
    );
  }
}
```

### 2. Bloc Pattern

```dart
// Events
abstract class AuthEvent {}

class LoginRequested extends AuthEvent {
  final String email;
  final String password;

  LoginRequested({required this.email, required this.password});
}

class LogoutRequested extends AuthEvent {}

// States
abstract class AuthState {}

class AuthInitial extends AuthState {}

class AuthLoading extends AuthState {}

class AuthAuthenticated extends AuthState {
  final User user;
  AuthAuthenticated(this.user);
}

class AuthUnauthenticated extends AuthState {}

class AuthError extends AuthState {
  final String message;
  AuthError(this.message);
}

// Bloc
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final LoginUser loginUseCase;
  final LogoutUser logoutUseCase;

  AuthBloc({
    required this.loginUseCase,
    required this.logoutUseCase,
  }) : super(AuthInitial()) {
    on<LoginRequested>(_onLoginRequested);
    on<LogoutRequested>(_onLogoutRequested);
  }

  Future<void> _onLoginRequested(
    LoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());

    final result = await loginUseCase(
      LoginParams(email: event.email, password: event.password),
    );

    result.fold(
      (failure) => emit(AuthError(failure.message)),
      (user) => emit(AuthAuthenticated(user)),
    );
  }

  Future<void> _onLogoutRequested(
    LogoutRequested event,
    Emitter<AuthState> emit,
  ) async {
    await logoutUseCase(NoParams());
    emit(AuthUnauthenticated());
  }
}

// Usage
BlocProvider(
  create: (context) => AuthBloc(
    loginUseCase: sl<LoginUser>(),
    logoutUseCase: sl<LogoutUser>(),
  ),
  child: BlocBuilder<AuthBloc, AuthState>(
    builder: (context, state) {
      if (state is AuthLoading) {
        return const CircularProgressIndicator();
      }
      if (state is AuthAuthenticated) {
        return HomeScreen(user: state.user);
      }
      return const LoginScreen();
    },
  ),
)
```

## Dependency Injection

### Using GetIt

```dart
// lib/injection_container.dart
import 'package:get_it/get_it.dart';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:internet_connection_checker/internet_connection_checker.dart';

final sl = GetIt.instance;

Future<void> init() async {
  // Features - Authentication
  // ViewModels / Blocs
  sl.registerFactory(
    () => LoginViewModel(loginUseCase: sl()),
  );

  // Use cases
  sl.registerLazySingleton(() => LoginUser(sl()));
  sl.registerLazySingleton(() => LogoutUser(sl()));
  sl.registerLazySingleton(() => GetCurrentUser(sl()));

  // Repository
  sl.registerLazySingleton<AuthRepository>(
    () => AuthRepositoryImpl(
      remoteDataSource: sl(),
      localDataSource: sl(),
      networkInfo: sl(),
    ),
  );

  // Data sources
  sl.registerLazySingleton<AuthRemoteDataSource>(
    () => AuthRemoteDataSourceImpl(client: sl()),
  );

  sl.registerLazySingleton<AuthLocalDataSource>(
    () => AuthLocalDataSourceImpl(sharedPreferences: sl()),
  );

  // Core
  sl.registerLazySingleton<NetworkInfo>(
    () => NetworkInfoImpl(sl()),
  );

  // External
  final sharedPreferences = await SharedPreferences.getInstance();
  sl.registerLazySingleton(() => sharedPreferences);

  sl.registerLazySingleton(() => Dio()
    ..options.baseUrl = 'https://api.example.com'
    ..options.connectTimeout = const Duration(seconds: 10)
    ..options.receiveTimeout = const Duration(seconds: 10)
    ..interceptors.add(LogInterceptor(requestBody: true, responseBody: true)));

  sl.registerLazySingleton(() => InternetConnectionChecker());
}

// main.dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await init();
  runApp(const MyApp());
}
```

## Testing

### Unit Tests

```dart
// test/features/authentication/domain/usecases/login_user_test.dart
import 'package:dartz/dartz.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:mockito/annotations.dart';

@GenerateMocks([AuthRepository])
void main() {
  late LoginUser usecase;
  late MockAuthRepository mockRepository;

  setUp(() {
    mockRepository = MockAuthRepository();
    usecase = LoginUser(mockRepository);
  });

  final tUser = User(
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
  );

  test('should get user from repository when login is successful', () async {
    // arrange
    when(mockRepository.login(
      email: anyNamed('email'),
      password: anyNamed('password'),
    )).thenAnswer((_) async => Right(tUser));

    // act
    final result = await usecase(
      LoginParams(email: 'test@example.com', password: 'password'),
    );

    // assert
    expect(result, Right(tUser));
    verify(mockRepository.login(
      email: 'test@example.com',
      password: 'password',
    ));
    verifyNoMoreInteractions(mockRepository);
  });

  test('should return failure when login fails', () async {
    // arrange
    when(mockRepository.login(
      email: anyNamed('email'),
      password: anyNamed('password'),
    )).thenAnswer((_) async => Left(ServerFailure()));

    // act
    final result = await usecase(
      LoginParams(email: 'test@example.com', password: 'password'),
    );

    // assert
    expect(result, Left(ServerFailure()));
  });
}
```

### Widget Tests

```dart
// test/features/authentication/presentation/pages/login_page_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mockito/mockito.dart';

void main() {
  testWidgets('should display form fields and login button', (tester) async {
    // arrange
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: LoginPage(),
        ),
      ),
    );

    // assert
    expect(find.byType(TextFormField), findsNWidgets(2));
    expect(find.text('Email'), findsOneWidget);
    expect(find.text('Password'), findsOneWidget);
    expect(find.text('Login'), findsOneWidget);
  });

  testWidgets('should show validation error for empty email', (tester) async {
    // arrange
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: LoginPage(),
        ),
      ),
    );

    // act
    await tester.tap(find.text('Login'));
    await tester.pump();

    // assert
    expect(find.text('Please enter your email'), findsOneWidget);
  });
}
```

### Integration Tests

```dart
// integration_test/app_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('complete login flow', (tester) async {
    // Start app
    await tester.pumpWidget(const MyApp());
    await tester.pumpAndSettle();

    // Find and tap email field
    final emailField = find.byKey(const Key('email_field'));
    await tester.tap(emailField);
    await tester.enterText(emailField, 'test@example.com');

    // Find and tap password field
    final passwordField = find.byKey(const Key('password_field'));
    await tester.tap(passwordField);
    await tester.enterText(passwordField, 'password123');

    // Tap login button
    await tester.tap(find.text('Login'));
    await tester.pumpAndSettle();

    // Verify navigation to home
    expect(find.text('Home'), findsOneWidget);
  });
}
```

## Best Practices

### 1. Error Handling

```dart
// lib/core/error/failures.dart
import 'package:equatable/equatable.dart';

abstract class Failure extends Equatable {
  final String? message;

  const Failure({this.message});

  @override
  List<Object?> get props => [message];
}

class ServerFailure extends Failure {
  const ServerFailure({super.message = 'Server error occurred'});
}

class NetworkFailure extends Failure {
  const NetworkFailure({super.message = 'No internet connection'});
}

class CacheFailure extends Failure {
  const CacheFailure({super.message = 'Cache error occurred'});
}

// lib/core/error/exceptions.dart
class ServerException implements Exception {
  final String? message;
  ServerException({this.message});
}

class CacheException implements Exception {
  final String? message;
  CacheException({this.message});
}

class NetworkException implements Exception {
  final String? message;
  NetworkException({this.message});
}
```

### 2. Constants and Configuration

```dart
// lib/core/utils/constants.dart
class AppConstants {
  static const String appName = 'MyApp';
  static const Duration requestTimeout = Duration(seconds: 30);

  // API
  static const String baseUrl = String.fromEnvironment(
    'BASE_URL',
    defaultValue: 'https://api.example.com',
  );

  // Storage keys
  static const String accessTokenKey = 'ACCESS_TOKEN';
  static const String refreshTokenKey = 'REFRESH_TOKEN';
}

// Environment configuration
enum Environment { dev, staging, prod }

class EnvironmentConfig {
  static Environment get currentEnvironment {
    const env = String.fromEnvironment('ENV', defaultValue: 'dev');
    switch (env) {
      case 'prod':
        return Environment.prod;
      case 'staging':
        return Environment.staging;
      default:
        return Environment.dev;
    }
  }

  static String get apiBaseUrl {
    switch (currentEnvironment) {
      case Environment.prod:
        return 'https://api.example.com';
      case Environment.staging:
        return 'https://staging.api.example.com';
      case Environment.dev:
        return 'https://dev.api.example.com';
    }
  }
}
```

### 3. Platform-Adaptive UI

```dart
// Platform-aware components
class PlatformButton extends StatelessWidget {
  final VoidCallback onPressed;
  final Widget child;

  const PlatformButton({
    super.key,
    required this.onPressed,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    if (Theme.of(context).platform == TargetPlatform.iOS) {
      return CupertinoButton(
        onPressed: onPressed,
        child: child,
      );
    }
    return ElevatedButton(
      onPressed: onPressed,
      child: child,
    );
  }
}

// Platform-aware navigation
void navigateTo(BuildContext context, Widget page) {
  if (Theme.of(context).platform == TargetPlatform.iOS) {
    Navigator.of(context).push(
      CupertinoPageRoute(builder: (_) => page),
    );
  } else {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => page),
    );
  }
}
```

### 4. Responsive Design

```dart
// Responsive layout helper
class ResponsiveLayout extends StatelessWidget {
  final Widget mobile;
  final Widget? tablet;
  final Widget? desktop;

  const ResponsiveLayout({
    super.key,
    required this.mobile,
    this.tablet,
    this.desktop,
  });

  static bool isMobile(BuildContext context) =>
      MediaQuery.of(context).size.width < 650;

  static bool isTablet(BuildContext context) =>
      MediaQuery.of(context).size.width >= 650 &&
      MediaQuery.of(context).size.width < 1100;

  static bool isDesktop(BuildContext context) =>
      MediaQuery.of(context).size.width >= 1100;

  @override
  Widget build(BuildContext context) {
    if (isDesktop(context) && desktop != null) {
      return desktop!;
    }
    if (isTablet(context) && tablet != null) {
      return tablet!;
    }
    return mobile;
  }
}

// Usage
ResponsiveLayout(
  mobile: MobileLayout(),
  tablet: TabletLayout(),
  desktop: DesktopLayout(),
)
```

## Performance Optimization

### 1. Efficient Lists

```dart
// Use const constructors
class ProductCard extends StatelessWidget {
  final Product product;

  const ProductCard({super.key, required this.product});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        title: Text(product.name),
        subtitle: Text('\$${product.price}'),
      ),
    );
  }
}

// ListView with builder for large lists
ListView.builder(
  itemCount: products.length,
  itemBuilder: (context, index) {
    return ProductCard(product: products[index]);
  },
)

// Separate list items
ListView.separated(
  itemCount: products.length,
  separatorBuilder: (context, index) => const Divider(),
  itemBuilder: (context, index) => ProductCard(product: products[index]),
)
```

### 2. Image Optimization

```dart
// Cached network images
CachedNetworkImage(
  imageUrl: product.imageUrl,
  placeholder: (context, url) => const CircularProgressIndicator(),
  errorWidget: (context, url, error) => const Icon(Icons.error),
  memCacheHeight: 200,
  memCacheWidth: 200,
)

// Precache images
@override
void didChangeDependencies() {
  super.didChangeDependencies();
  precacheImage(AssetImage('assets/logo.png'), context);
}
```

### 3. Lazy Loading

```dart
// Pagination
class ProductListViewModel extends ChangeNotifier {
  final ProductRepository repository;
  List<Product> products = [];
  bool isLoading = false;
  bool hasMore = true;
  int currentPage = 1;

  ProductListViewModel(this.repository);

  Future<void> loadMore() async {
    if (isLoading || !hasMore) return;

    isLoading = true;
    notifyListeners();

    final result = await repository.getProducts(page: currentPage);

    result.fold(
      (failure) {
        // Handle error
        isLoading = false;
        notifyListeners();
      },
      (newProducts) {
        products.addAll(newProducts);
        hasMore = newProducts.isNotEmpty;
        currentPage++;
        isLoading = false;
        notifyListeners();
      },
    );
  }
}

// In widget
ListView.builder(
  controller: _scrollController,
  itemCount: products.length + (hasMore ? 1 : 0),
  itemBuilder: (context, index) {
    if (index == products.length) {
      return const Center(child: CircularProgressIndicator());
    }
    return ProductCard(product: products[index]);
  },
)
```

## Common Patterns

### Result/Either Pattern

```dart
// Using dartz for functional programming
import 'package:dartz/dartz.dart';

Future<Either<Failure, List<Product>>> getProducts() async {
  try {
    final products = await remoteDataSource.getProducts();
    return Right(products);
  } on ServerException catch (e) {
    return Left(ServerFailure(message: e.message));
  }
}

// Usage
final result = await repository.getProducts();
result.fold(
  (failure) => print('Error: ${failure.message}'),
  (products) => print('Success: ${products.length} products'),
);
```

### Sealed Classes for State

```dart
// Using freezed for immutable state
import 'package:freezed_annotation/freezed_annotation.dart';

part 'product_state.freezed.dart';

@freezed
class ProductState with _$ProductState {
  const factory ProductState.initial() = _Initial;
  const factory ProductState.loading() = _Loading;
  const factory ProductState.loaded(List<Product> products) = _Loaded;
  const factory ProductState.error(String message) = _Error;
}

// Usage in widget
state.when(
  initial: () => const Text('Start loading'),
  loading: () => const CircularProgressIndicator(),
  loaded: (products) => ProductList(products: products),
  error: (message) => Text('Error: $message'),
)
```

## Anti-Patterns to Avoid

### ❌ Business Logic in Widgets

```dart
// Bad
class ProductPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
      future: http.get('https://api.example.com/products'),
      builder: (context, snapshot) {
        // Processing data in widget
      },
    );
  }
}

// Good
class ProductPage extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(productViewModelProvider);
    // Just display the state
  }
}
```

### ❌ Tight Coupling

```dart
// Bad
class LoginViewModel {
  final Dio dio = Dio(); // Direct dependency
}

// Good
class LoginViewModel {
  final AuthRepository repository; // Dependency injection
  LoginViewModel({required this.repository});
}
```

### ❌ God Objects

```dart
// Bad: One ViewModel handles everything
class AppViewModel {
  // Auth, products, cart, profile, etc.
}

// Good: Separate ViewModels
class AuthViewModel { }
class ProductViewModel { }
class CartViewModel { }
```

## Quick Reference

### pubspec.yaml Dependencies

```yaml
dependencies:
  flutter:
    sdk: flutter

  # State Management
  flutter_riverpod: ^2.4.0
  # OR
  flutter_bloc: ^8.1.3

  # Functional Programming
  dartz: ^0.10.1
  freezed_annotation: ^2.4.1

  # Dependency Injection
  get_it: ^7.6.0

  # Networking
  dio: ^5.3.3

  # Storage
  shared_preferences: ^2.2.2

  # Utils
  equatable: ^2.0.5
  internet_connection_checker: ^1.0.0+1
  cached_network_image: ^3.3.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  mockito: ^5.4.2
  build_runner: ^2.4.6
  freezed: ^2.4.5
  integration_test:
    sdk: flutter
```

### Run Commands

```bash
# Run with environment
flutter run --dart-define=ENV=dev

# Generate code
flutter pub run build_runner build --delete-conflicting-outputs

# Watch for changes
flutter pub run build_runner watch

# Run tests
flutter test

# Integration tests
flutter test integration_test

# Code coverage
flutter test --coverage

# Analyze code
flutter analyze

# Format code
dart format lib/
```

## Resources

- [Flutter Documentation](https://docs.flutter.dev/)
- [Clean Architecture Guide](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Riverpod Documentation](https://riverpod.dev/)
- [Bloc Documentation](https://bloclibrary.dev/)
- [Flutter Architectural Samples](https://github.com/brianegan/flutter_architecture_samples)

---

_Building maintainable Flutter apps requires disciplined architecture, clear separation of concerns, and adherence to SOLID principles throughout the codebase._
