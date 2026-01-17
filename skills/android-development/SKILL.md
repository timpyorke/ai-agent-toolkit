# 🤖 Android Development Skill

---

name: android-development
description: Build robust Android applications with Kotlin, Java, and modern Android development practices

---

## Overview

This skill enables AI assistants to help developers create high-quality Android applications using modern tools, frameworks, and best practices. It covers everything from basic app structure to advanced features like Jetpack Compose, architecture patterns, and performance optimization.

## Core Principles

### 1. Modern Android Development

- Prioritize Kotlin over Java for new development
- Use Jetpack libraries and Android Architecture Components
- Follow Material Design guidelines
- Implement responsive and adaptive layouts
- Support multiple screen sizes and orientations

### 2. Architecture and Clean Code

- Follow MVVM, MVI, or Clean Architecture patterns
- Separate concerns (UI, business logic, data)
- Use dependency injection (Hilt/Dagger)
- Write testable, maintainable code
- Apply SOLID principles

### 3. Performance and User Experience

- Optimize for battery life and memory usage
- Implement smooth animations and transitions
- Handle configuration changes properly
- Ensure responsive UI with coroutines/RxJava
- Follow Android performance best practices

## Technology Stack

### Primary Language: Kotlin

**Why Kotlin:**

- Null safety and type inference
- Concise syntax with less boilerplate
- Coroutines for asynchronous programming
- Extension functions and higher-order functions
- Official Android language since 2017

**When to use Java:**

- Maintaining legacy codebases
- Team expertise or project requirements
- Interoperability with existing Java libraries

### Core Android Components

#### 1. Activities & Fragments

```kotlin
// Modern Activity with ViewBinding
class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupUI()
    }

    private fun setupUI() {
        binding.buttonSubmit.setOnClickListener {
            // Handle click
        }
    }
}

// Fragment with ViewModel
class ProfileFragment : Fragment() {
    private var _binding: FragmentProfileBinding? = null
    private val binding get() = _binding!!

    private val viewModel: ProfileViewModel by viewModels()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentProfileBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        observeViewModel()
    }

    private fun observeViewModel() {
        viewModel.userState.observe(viewLifecycleOwner) { state ->
            when (state) {
                is UiState.Loading -> showLoading()
                is UiState.Success -> showData(state.data)
                is UiState.Error -> showError(state.message)
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
```

#### 2. Jetpack Compose (Modern UI)

```kotlin
@Composable
fun UserProfileScreen(
    viewModel: ProfileViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Profile") },
                backgroundColor = MaterialTheme.colors.primary
            )
        }
    ) { padding ->
        when (val state = uiState) {
            is UiState.Loading -> LoadingIndicator()
            is UiState.Success -> UserContent(
                user = state.data,
                onEditClick = { viewModel.editProfile() },
                modifier = Modifier.padding(padding)
            )
            is UiState.Error -> ErrorMessage(
                message = state.message,
                onRetry = { viewModel.retry() }
            )
        }
    }
}

@Composable
fun UserContent(
    user: User,
    onEditClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        AsyncImage(
            model = user.avatarUrl,
            contentDescription = "Profile picture",
            modifier = Modifier
                .size(120.dp)
                .clip(CircleShape)
                .align(Alignment.CenterHorizontally)
        )

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = user.name,
            style = MaterialTheme.typography.h5,
            modifier = Modifier.align(Alignment.CenterHorizontally)
        )

        Text(
            text = user.email,
            style = MaterialTheme.typography.body1,
            color = MaterialTheme.colors.onSurface.copy(alpha = 0.6f),
            modifier = Modifier.align(Alignment.CenterHorizontally)
        )

        Spacer(modifier = Modifier.height(24.dp))

        Button(
            onClick = onEditClick,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Edit Profile")
        }
    }
}
```

#### 3. ViewModel & LiveData/StateFlow

```kotlin
@HiltViewModel
class ProfileViewModel @Inject constructor(
    private val userRepository: UserRepository
) : ViewModel() {

    // Using StateFlow (modern approach)
    private val _uiState = MutableStateFlow<UiState<User>>(UiState.Loading)
    val uiState: StateFlow<UiState<User>> = _uiState.asStateFlow()

    // Or using LiveData (traditional approach)
    private val _userData = MutableLiveData<User>()
    val userData: LiveData<User> = _userData

    init {
        loadUserProfile()
    }

    fun loadUserProfile() {
        viewModelScope.launch {
            _uiState.value = UiState.Loading

            userRepository.getUserProfile()
                .catch { exception ->
                    _uiState.value = UiState.Error(
                        exception.message ?: "Unknown error"
                    )
                }
                .collect { user ->
                    _uiState.value = UiState.Success(user)
                }
        }
    }

    fun editProfile() {
        // Navigate or handle edit
    }

    fun retry() {
        loadUserProfile()
    }
}

// UI State sealed class
sealed class UiState<out T> {
    object Loading : UiState<Nothing>()
    data class Success<T>(val data: T) : UiState<T>()
    data class Error(val message: String) : UiState<Nothing>()
}
```

#### 4. Repository Pattern

```kotlin
interface UserRepository {
    fun getUserProfile(): Flow<User>
    suspend fun updateProfile(user: User): Result<User>
}

class UserRepositoryImpl @Inject constructor(
    private val apiService: ApiService,
    private val userDao: UserDao,
    private val dispatcher: CoroutineDispatcher = Dispatchers.IO
) : UserRepository {

    override fun getUserProfile(): Flow<User> = flow {
        // Try to get from local database first
        val cachedUser = userDao.getUser()
        if (cachedUser != null) {
            emit(cachedUser.toDomainModel())
        }

        // Fetch from network
        val networkUser = apiService.getUserProfile()

        // Update local cache
        userDao.insertUser(networkUser.toEntity())

        // Emit fresh data
        emit(networkUser.toDomainModel())
    }.flowOn(dispatcher)

    override suspend fun updateProfile(user: User): Result<User> {
        return withContext(dispatcher) {
            try {
                val updatedUser = apiService.updateProfile(user.toDto())
                userDao.insertUser(updatedUser.toEntity())
                Result.success(updatedUser.toDomainModel())
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
}
```

#### 5. Dependency Injection with Hilt

```kotlin
// Application class
@HiltAndroidApp
class MyApplication : Application()

// Module for providing dependencies
@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideRetrofit(): Retrofit {
        return Retrofit.Builder()
            .baseUrl(BuildConfig.API_BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    @Provides
    @Singleton
    fun provideApiService(retrofit: Retrofit): ApiService {
        return retrofit.create(ApiService::class.java)
    }

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): AppDatabase {
        return Room.databaseBuilder(
            context,
            AppDatabase::class.java,
            "app_database"
        ).build()
    }

    @Provides
    fun provideUserDao(database: AppDatabase): UserDao {
        return database.userDao()
    }
}

// Binding interfaces to implementations
@Module
@InstallIn(ViewModelComponent::class)
abstract class RepositoryModule {

    @Binds
    abstract fun bindUserRepository(
        impl: UserRepositoryImpl
    ): UserRepository
}
```

#### 6. Room Database

```kotlin
// Entity
@Entity(tableName = "users")
data class UserEntity(
    @PrimaryKey val id: String,
    val name: String,
    val email: String,
    val avatarUrl: String?,
    val createdAt: Long
)

// DAO
@Dao
interface UserDao {
    @Query("SELECT * FROM users WHERE id = :userId")
    suspend fun getUser(userId: String): UserEntity?

    @Query("SELECT * FROM users")
    fun getAllUsers(): Flow<List<UserEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUser(user: UserEntity)

    @Update
    suspend fun updateUser(user: UserEntity)

    @Delete
    suspend fun deleteUser(user: UserEntity)

    @Query("DELETE FROM users")
    suspend fun deleteAllUsers()
}

// Database
@Database(
    entities = [UserEntity::class],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao
}
```

#### 7. Networking with Retrofit

```kotlin
interface ApiService {
    @GET("user/profile")
    suspend fun getUserProfile(): UserDto

    @PUT("user/profile")
    suspend fun updateProfile(@Body user: UserDto): UserDto

    @GET("users")
    suspend fun getUsers(
        @Query("page") page: Int,
        @Query("limit") limit: Int = 20
    ): List<UserDto>

    @POST("auth/login")
    suspend fun login(@Body credentials: LoginRequest): AuthResponse

    @Multipart
    @POST("user/avatar")
    suspend fun uploadAvatar(
        @Part avatar: MultipartBody.Part
    ): UserDto
}

// DTOs
data class UserDto(
    val id: String,
    val name: String,
    val email: String,
    @SerializedName("avatar_url")
    val avatarUrl: String?
)

data class LoginRequest(
    val email: String,
    val password: String
)

data class AuthResponse(
    val token: String,
    val user: UserDto
)
```

## Architecture Patterns

### MVVM (Model-View-ViewModel)

**Structure:**

```
app/
├── data/
│   ├── local/
│   │   ├── dao/
│   │   └── entity/
│   ├── remote/
│   │   ├── api/
│   │   └── dto/
│   └── repository/
├── domain/
│   ├── model/
│   └── usecase/
├── ui/
│   ├── screens/
│   │   ├── home/
│   │   │   ├── HomeScreen.kt
│   │   │   └── HomeViewModel.kt
│   │   └── profile/
│   │       ├── ProfileScreen.kt
│   │       └── ProfileViewModel.kt
│   └── components/
└── di/
```

**Benefits:**

- Clear separation of concerns
- Testable business logic
- Reactive UI updates
- Lifecycle-aware components

### MVI (Model-View-Intent)

```kotlin
// State
data class ProfileState(
    val user: User? = null,
    val isLoading: Boolean = false,
    val error: String? = null
)

// Intent (User actions)
sealed class ProfileIntent {
    object LoadProfile : ProfileIntent()
    object RefreshProfile : ProfileIntent()
    data class UpdateProfile(val user: User) : ProfileIntent()
}

// ViewModel
@HiltViewModel
class ProfileViewModel @Inject constructor(
    private val repository: UserRepository
) : ViewModel() {

    private val _state = MutableStateFlow(ProfileState())
    val state: StateFlow<ProfileState> = _state.asStateFlow()

    fun processIntent(intent: ProfileIntent) {
        when (intent) {
            is ProfileIntent.LoadProfile -> loadProfile()
            is ProfileIntent.RefreshProfile -> refreshProfile()
            is ProfileIntent.UpdateProfile -> updateProfile(intent.user)
        }
    }

    private fun loadProfile() {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, error = null)

            repository.getUserProfile()
                .catch { e ->
                    _state.value = _state.value.copy(
                        isLoading = false,
                        error = e.message
                    )
                }
                .collect { user ->
                    _state.value = ProfileState(
                        user = user,
                        isLoading = false,
                        error = null
                    )
                }
        }
    }
}
```

## Best Practices

### 1. Lifecycle Management

```kotlin
class MyActivity : AppCompatActivity() {

    private val viewModel: MyViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Observe LiveData/StateFlow
        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect { state ->
                    updateUI(state)
                }
            }
        }
    }
}

class MyFragment : Fragment() {

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Use viewLifecycleOwner for LiveData in Fragments
        viewModel.data.observe(viewLifecycleOwner) { data ->
            updateUI(data)
        }
    }
}
```

### 2. Resource Management

```kotlin
// strings.xml
<resources>
    <string name="app_name">My App</string>
    <string name="welcome_message">Welcome, %1$s!</string>
    <plurals name="items_count">
        <item quantity="one">%d item</item>
        <item quantity="other">%d items</item>
    </plurals>
</resources>

// Usage in code
val message = getString(R.string.welcome_message, userName)
val count = resources.getQuantityString(R.plurals.items_count, itemCount, itemCount)

// Colors in colors.xml
<resources>
    <color name="primary">#6200EE</color>
    <color name="primary_dark">#3700B3</color>
    <color name="accent">#03DAC5</color>
</resources>

// Dimensions in dimens.xml
<resources>
    <dimen name="spacing_small">8dp</dimen>
    <dimen name="spacing_medium">16dp</dimen>
    <dimen name="spacing_large">24dp</dimen>
</resources>
```

### 3. Navigation Component

```kotlin
// nav_graph.xml
<navigation xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:id="@+id/nav_graph"
    app:startDestination="@id/homeFragment">

    <fragment
        android:id="@+id/homeFragment"
        android:name="com.example.HomeFragment"
        android:label="Home">
        <action
            android:id="@+id/action_home_to_profile"
            app:destination="@id/profileFragment" />
    </fragment>

    <fragment
        android:id="@+id/profileFragment"
        android:name="com.example.ProfileFragment"
        android:label="Profile">
        <argument
            android:name="userId"
            app:argType="string" />
    </fragment>
</navigation>

// Navigation in code
class HomeFragment : Fragment() {

    private val navController by lazy {
        findNavController()
    }

    private fun navigateToProfile(userId: String) {
        val action = HomeFragmentDirections
            .actionHomeToProfile(userId)
        navController.navigate(action)
    }
}

// Receiving arguments with Safe Args
class ProfileFragment : Fragment() {

    private val args: ProfileFragmentArgs by navArgs()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val userId = args.userId
        // Use userId
    }
}
```

### 4. Permissions

```kotlin
class MainActivity : AppCompatActivity() {

    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            // Permission granted
            accessCamera()
        } else {
            // Permission denied
            showPermissionDeniedMessage()
        }
    }

    private fun checkAndRequestCameraPermission() {
        when {
            ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.CAMERA
            ) == PackageManager.PERMISSION_GRANTED -> {
                accessCamera()
            }

            shouldShowRequestPermissionRationale(Manifest.permission.CAMERA) -> {
                showPermissionRationale {
                    requestPermissionLauncher.launch(Manifest.permission.CAMERA)
                }
            }

            else -> {
                requestPermissionLauncher.launch(Manifest.permission.CAMERA)
            }
        }
    }
}
```

### 5. Background Work with WorkManager

```kotlin
class SyncDataWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        return try {
            // Perform sync operation
            syncData()
            Result.success()
        } catch (e: Exception) {
            if (runAttemptCount < 3) {
                Result.retry()
            } else {
                Result.failure()
            }
        }
    }

    private suspend fun syncData() {
        // Implementation
    }
}

// Schedule work
class MyApplication : Application() {

    override fun onCreate() {
        super.onCreate()
        scheduleDataSync()
    }

    private fun scheduleDataSync() {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .setRequiresBatteryNotLow(true)
            .build()

        val syncRequest = PeriodicWorkRequestBuilder<SyncDataWorker>(
            repeatInterval = 1,
            repeatIntervalTimeUnit = TimeUnit.HOURS
        )
            .setConstraints(constraints)
            .build()

        WorkManager.getInstance(this)
            .enqueueUniquePeriodicWork(
                "DataSync",
                ExistingPeriodicWorkPolicy.KEEP,
                syncRequest
            )
    }
}
```

### 6. Error Handling

```kotlin
sealed class Result<out T> {
    data class Success<T>(val data: T) : Result<T>()
    data class Error(val exception: Exception) : Result<Nothing>()
    object Loading : Result<Nothing>()
}

class UserRepository @Inject constructor(
    private val apiService: ApiService
) {
    suspend fun getUser(userId: String): Result<User> {
        return try {
            val response = apiService.getUser(userId)
            if (response.isSuccessful) {
                Result.Success(response.body()!!.toDomainModel())
            } else {
                Result.Error(
                    HttpException(response)
                )
            }
        } catch (e: IOException) {
            Result.Error(e)
        } catch (e: Exception) {
            Result.Error(e)
        }
    }
}

// In ViewModel
fun loadUser(userId: String) {
    viewModelScope.launch {
        _uiState.value = UiState.Loading

        when (val result = repository.getUser(userId)) {
            is Result.Success -> {
                _uiState.value = UiState.Success(result.data)
            }
            is Result.Error -> {
                val message = when (result.exception) {
                    is IOException -> "Network error. Please check your connection."
                    is HttpException -> "Server error. Please try again later."
                    else -> "An unexpected error occurred."
                }
                _uiState.value = UiState.Error(message)
            }
            is Result.Loading -> {
                // Handle loading if needed
            }
        }
    }
}
```

## Testing

### Unit Testing

```kotlin
@ExperimentalCoroutinesTest
class ProfileViewModelTest {

    @get:Rule
    val instantExecutorRule = InstantTaskExecutorRule()

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private lateinit var viewModel: ProfileViewModel
    private lateinit var repository: FakeUserRepository

    @Before
    fun setup() {
        repository = FakeUserRepository()
        viewModel = ProfileViewModel(repository)
    }

    @Test
    fun `loadUserProfile success updates state`() = runTest {
        // Given
        val expectedUser = User("1", "John Doe", "john@example.com")
        repository.setUser(expectedUser)

        // When
        viewModel.loadUserProfile()
        advanceUntilIdle()

        // Then
        val state = viewModel.uiState.value
        assertTrue(state is UiState.Success)
        assertEquals(expectedUser, (state as UiState.Success).data)
    }

    @Test
    fun `loadUserProfile error updates state with error message`() = runTest {
        // Given
        repository.setShouldReturnError(true)

        // When
        viewModel.loadUserProfile()
        advanceUntilIdle()

        // Then
        val state = viewModel.uiState.value
        assertTrue(state is UiState.Error)
    }
}

// Fake repository for testing
class FakeUserRepository : UserRepository {
    private var user: User? = null
    private var shouldReturnError = false

    fun setUser(user: User) {
        this.user = user
    }

    fun setShouldReturnError(shouldError: Boolean) {
        this.shouldReturnError = shouldError
    }

    override fun getUserProfile(): Flow<User> = flow {
        if (shouldReturnError) {
            throw IOException("Network error")
        }
        user?.let { emit(it) } ?: throw NoSuchElementException()
    }

    override suspend fun updateProfile(user: User): Result<User> {
        return if (shouldReturnError) {
            Result.failure(IOException("Network error"))
        } else {
            this.user = user
            Result.success(user)
        }
    }
}
```

### UI Testing with Compose

```kotlin
@ExperimentalComposeUiTest
class UserProfileScreenTest {

    @get:Rule
    val composeTestRule = createComposeRule()

    @Test
    fun loadingState_showsProgressIndicator() {
        // Given
        val viewModel = FakeProfileViewModel().apply {
            setState(UiState.Loading)
        }

        // When
        composeTestRule.setContent {
            UserProfileScreen(viewModel = viewModel)
        }

        // Then
        composeTestRule
            .onNodeWithTag("LoadingIndicator")
            .assertIsDisplayed()
    }

    @Test
    fun successState_showsUserData() {
        // Given
        val user = User("1", "John Doe", "john@example.com")
        val viewModel = FakeProfileViewModel().apply {
            setState(UiState.Success(user))
        }

        // When
        composeTestRule.setContent {
            UserProfileScreen(viewModel = viewModel)
        }

        // Then
        composeTestRule
            .onNodeWithText("John Doe")
            .assertIsDisplayed()
        composeTestRule
            .onNodeWithText("john@example.com")
            .assertIsDisplayed()
    }

    @Test
    fun editButton_click_triggersViewModel() {
        // Given
        val user = User("1", "John Doe", "john@example.com")
        val viewModel = FakeProfileViewModel().apply {
            setState(UiState.Success(user))
        }
        var editClicked = false
        viewModel.onEditProfile = { editClicked = true }

        // When
        composeTestRule.setContent {
            UserProfileScreen(viewModel = viewModel)
        }

        composeTestRule
            .onNodeWithText("Edit Profile")
            .performClick()

        // Then
        assertTrue(editClicked)
    }
}
```

## Performance Optimization

### 1. Memory Management

```kotlin
// Avoid memory leaks with proper lifecycle handling
class MyFragment : Fragment() {

    // Use backing property for View Binding
    private var _binding: FragmentMyBinding? = null
    private val binding get() = _binding!!

    // Cancel coroutines when Fragment is destroyed
    private val fragmentJob = Job()
    private val fragmentScope = CoroutineScope(
        Dispatchers.Main + fragmentJob
    )

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
        fragmentJob.cancel()
    }
}

// Use WeakReference for callbacks
class ImageLoader(context: Context) {
    private val contextRef = WeakReference(context)

    fun loadImage(url: String, callback: (Bitmap) -> Unit) {
        contextRef.get()?.let { context ->
            // Load image
        }
    }
}
```

### 2. RecyclerView Optimization

```kotlin
class UserAdapter : ListAdapter<User, UserAdapter.ViewHolder>(UserDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemUserBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    class ViewHolder(
        private val binding: ItemUserBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(user: User) {
            binding.apply {
                textName.text = user.name
                textEmail.text = user.email

                // Use Coil or Glide for efficient image loading
                imageAvatar.load(user.avatarUrl) {
                    crossfade(true)
                    placeholder(R.drawable.placeholder_avatar)
                    error(R.drawable.error_avatar)
                }
            }
        }
    }
}

// DiffUtil for efficient updates
class UserDiffCallback : DiffUtil.ItemCallback<User>() {
    override fun areItemsTheSame(oldItem: User, newItem: User): Boolean {
        return oldItem.id == newItem.id
    }

    override fun areContentsTheSame(oldItem: User, newItem: User): Boolean {
        return oldItem == newItem
    }
}

// Usage in Fragment
class UsersFragment : Fragment() {

    private val adapter = UserAdapter()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.recyclerView.apply {
            layoutManager = LinearLayoutManager(context)
            adapter = this@UsersFragment.adapter

            // Performance optimizations
            setHasFixedSize(true)
            itemAnimator = null // Disable animations if not needed

            // Prefetch items for smooth scrolling
            (layoutManager as? LinearLayoutManager)?.apply {
                isItemPrefetchEnabled = true
                initialPrefetchItemCount = 4
            }
        }
    }
}
```

### 3. Image Loading

```kotlin
// Using Coil (recommended)
imageView.load("https://example.com/image.jpg") {
    crossfade(true)
    transformations(CircleCropTransformation())
    placeholder(R.drawable.placeholder)
    error(R.drawable.error)
    memoryCachePolicy(CachePolicy.ENABLED)
    diskCachePolicy(CachePolicy.ENABLED)
}

// Compose
AsyncImage(
    model = ImageRequest.Builder(LocalContext.current)
        .data("https://example.com/image.jpg")
        .crossfade(true)
        .build(),
    contentDescription = "Description",
    modifier = Modifier.size(100.dp)
)
```

### 4. Database Optimization

```kotlin
@Dao
interface UserDao {
    // Use suspend for single operations
    @Query("SELECT * FROM users WHERE id = :id")
    suspend fun getUserById(id: String): UserEntity?

    // Use Flow for observing changes
    @Query("SELECT * FROM users")
    fun getAllUsers(): Flow<List<UserEntity>>

    // Use @Transaction for complex queries
    @Transaction
    @Query("SELECT * FROM users WHERE id = :userId")
    suspend fun getUserWithPosts(userId: String): UserWithPosts

    // Batch operations
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(users: List<UserEntity>)

    // Indexed columns for faster queries
    @Query("SELECT * FROM users WHERE email = :email")
    suspend fun findByEmail(email: String): UserEntity?
}

@Entity(
    tableName = "users",
    indices = [Index(value = ["email"], unique = true)]
)
data class UserEntity(
    @PrimaryKey val id: String,
    val name: String,
    val email: String
)
```

## Security Best Practices

### 1. Secure Data Storage

```kotlin
// Use EncryptedSharedPreferences
val masterKey = MasterKey.Builder(context)
    .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
    .build()

val encryptedPrefs = EncryptedSharedPreferences.create(
    context,
    "secure_prefs",
    masterKey,
    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
)

// Store sensitive data
encryptedPrefs.edit {
    putString("auth_token", token)
}

// Retrieve sensitive data
val token = encryptedPrefs.getString("auth_token", null)
```

### 2. Network Security

```kotlin
// network_security_config.xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">api.example.com</domain>
        <pin-set expiration="2027-01-01">
            <pin digest="SHA-256">base64==</pin>
            <pin digest="SHA-256">backup-base64==</pin>
        </pin-set>
    </domain-config>
</network-security-config>

// In AndroidManifest.xml
<application
    android:networkSecurityConfig="@xml/network_security_config">
```

### 3. ProGuard/R8

```groovy
// build.gradle
android {
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile(
                'proguard-android-optimize.txt'
            ), 'proguard-rules.pro'
        }
    }
}
```

## Common Patterns and Solutions

### 1. Pagination

```kotlin
// Paging 3 with RemoteMediator
@OptIn(ExperimentalPagingApi::class)
class UserRemoteMediator(
    private val api: ApiService,
    private val database: AppDatabase
) : RemoteMediator<Int, UserEntity>() {

    override suspend fun load(
        loadType: LoadType,
        state: PagingState<Int, UserEntity>
    ): MediatorResult {
        return try {
            val page = when (loadType) {
                LoadType.REFRESH -> 0
                LoadType.PREPEND -> return MediatorResult.Success(
                    endOfPaginationReached = true
                )
                LoadType.APPEND -> {
                    val lastItem = state.lastItemOrNull()
                        ?: return MediatorResult.Success(
                            endOfPaginationReached = true
                        )
                    // Calculate next page
                    state.pages.size
                }
            }

            val response = api.getUsers(page, state.config.pageSize)

            database.withTransaction {
                if (loadType == LoadType.REFRESH) {
                    database.userDao().deleteAll()
                }
                database.userDao().insertAll(response.map { it.toEntity() })
            }

            MediatorResult.Success(
                endOfPaginationReached = response.isEmpty()
            )
        } catch (e: Exception) {
            MediatorResult.Error(e)
        }
    }
}

// ViewModel
@HiltViewModel
class UsersViewModel @Inject constructor(
    private val repository: UserRepository
) : ViewModel() {

    val users: Flow<PagingData<User>> = repository.getUsers()
        .cachedIn(viewModelScope)
}

// In Compose
@Composable
fun UsersScreen(viewModel: UsersViewModel = hiltViewModel()) {
    val users = viewModel.users.collectAsLazyPagingItems()

    LazyColumn {
        items(users.itemCount) { index ->
            users[index]?.let { user ->
                UserItem(user = user)
            }
        }

        users.apply {
            when {
                loadState.refresh is LoadState.Loading -> {
                    item { LoadingItem() }
                }
                loadState.append is LoadState.Loading -> {
                    item { LoadingItem() }
                }
                loadState.refresh is LoadState.Error -> {
                    item {
                        ErrorItem(
                            message = (loadState.refresh as LoadState.Error).error.message,
                            onRetry = { retry() }
                        )
                    }
                }
            }
        }
    }
}
```

### 2. Deep Linking

```kotlin
// AndroidManifest.xml
<activity android:name=".ui.MainActivity">
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data
            android:scheme="https"
            android:host="example.com"
            android:pathPrefix="/user" />
    </intent-filter>
</activity>

// In navigation graph
<fragment
    android:id="@+id/profileFragment"
    android:name="com.example.ProfileFragment">
    <deepLink
        app:uri="https://example.com/user/{userId}" />
    <argument
        android:name="userId"
        app:argType="string" />
</fragment>

// Handle in Activity
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        handleDeepLink(intent)
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        handleDeepLink(intent)
    }

    private fun handleDeepLink(intent: Intent?) {
        val navController = findNavController(R.id.nav_host_fragment)
        navController.handleDeepLink(intent)
    }
}
```

### 3. Push Notifications (FCM)

```kotlin
class MyFirebaseMessagingService : FirebaseMessagingService() {

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        remoteMessage.notification?.let { notification ->
            showNotification(
                title = notification.title ?: "",
                body = notification.body ?: "",
                data = remoteMessage.data
            )
        }
    }

    override fun onNewToken(token: String) {
        // Send token to server
        sendTokenToServer(token)
    }

    private fun showNotification(
        title: String,
        body: String,
        data: Map<String, String>
    ) {
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            putExtras(Bundle().apply {
                data.forEach { (key, value) ->
                    putString(key, value)
                }
            })
        }

        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            intent,
            PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(title)
            .setContentText(body)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .build()

        NotificationManagerCompat.from(this)
            .notify(NOTIFICATION_ID, notification)
    }

    companion object {
        private const val CHANNEL_ID = "default_channel"
        private const val NOTIFICATION_ID = 1
    }
}
```

## Build Configuration

### Gradle (Kotlin DSL)

```kotlin
// build.gradle.kts (app level)
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("kotlin-kapt")
    id("com.google.dagger.hilt.android")
    id("androidx.navigation.safeargs.kotlin")
}

android {
    namespace = "com.example.myapp"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.example.myapp"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables.useSupportLibrary = true
    }

    buildTypes {
        debug {
            applicationIdSuffix = ".debug"
            isDebuggable = true
            buildConfigField("String", "API_BASE_URL", "\"https://dev-api.example.com\"")
        }

        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            buildConfigField("String", "API_BASE_URL", "\"https://api.example.com\"")
        }
    }

    buildFeatures {
        viewBinding = true
        compose = true
        buildConfig = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.3"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    // Core Android
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.11.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")

    // Compose
    val composeBom = platform("androidx.compose:compose-bom:2023.10.01")
    implementation(composeBom)
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.activity:activity-compose:1.8.2")
    debugImplementation("androidx.compose.ui:ui-tooling")

    // Lifecycle
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.7.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.7.0")

    // Navigation
    implementation("androidx.navigation:navigation-fragment-ktx:2.7.6")
    implementation("androidx.navigation:navigation-ui-ktx:2.7.6")
    implementation("androidx.navigation:navigation-compose:2.7.6")

    // Hilt
    implementation("com.google.dagger:hilt-android:2.48.1")
    kapt("com.google.dagger:hilt-compiler:2.48.1")
    implementation("androidx.hilt:hilt-navigation-compose:1.1.0")

    // Room
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    kapt("androidx.room:room-compiler:2.6.1")

    // Retrofit
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")

    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")

    // Coil for image loading
    implementation("io.coil-kt:coil-compose:2.5.0")

    // Testing
    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.7.3")
    testImplementation("androidx.arch.core:core-testing:2.2.0")
    testImplementation("com.google.truth:truth:1.1.5")
    testImplementation("io.mockk:mockk:1.13.8")

    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
    androidTestImplementation(composeBom)
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")
}
```

## Best Practices Summary

### Do:

- ✅ Use Kotlin for new development
- ✅ Follow MVVM or MVI architecture patterns
- ✅ Implement proper dependency injection with Hilt
- ✅ Use Jetpack Compose for modern UI
- ✅ Handle lifecycle correctly with ViewModels
- ✅ Use coroutines for asynchronous operations
- ✅ Implement proper error handling
- ✅ Write unit and UI tests
- ✅ Follow Material Design guidelines
- ✅ Optimize for performance and battery life
- ✅ Use ProGuard/R8 for release builds
- ✅ Implement proper security measures
- ✅ Handle configuration changes properly
- ✅ Use Navigation Component for navigation
- ✅ Follow Android best practices and conventions

### Don't:

- ❌ Perform long-running operations on the main thread
- ❌ Leak memory with improper lifecycle handling
- ❌ Hardcode strings, use string resources
- ❌ Ignore backward compatibility
- ❌ Store sensitive data in plain text
- ❌ Skip ProGuard rules for release builds
- ❌ Use deprecated APIs without migration plan
- ❌ Neglect accessibility features
- ❌ Over-complicate architecture
- ❌ Skip testing
- ❌ Ignore Android Studio warnings and lint errors
- ❌ Use magic numbers, define constants
- ❌ Create God Activities/Fragments
- ❌ Mix business logic with UI logic

## Quick Reference

### Common Commands

```bash
# Build debug APK
./gradlew assembleDebug

# Build release APK
./gradlew assembleRelease

# Run unit tests
./gradlew test

# Run instrumentation tests
./gradlew connectedAndroidTest

# Check for outdated dependencies
./gradlew dependencyUpdates

# Generate code coverage report
./gradlew createDebugCoverageReport
```

### Resource Qualifiers

```
res/
├── layout/              # Default layouts
├── layout-land/         # Landscape layouts
├── layout-sw600dp/      # Tablets (600dp+)
├── values/              # Default values
├── values-night/        # Dark theme
├── values-es/           # Spanish strings
├── drawable/            # Default drawables
├── drawable-hdpi/       # High density
├── drawable-xhdpi/      # Extra high density
├── drawable-xxhdpi/     # Extra extra high density
└── drawable-xxxhdpi/    # Extra extra extra high density
```

## Conclusion

Modern Android development emphasizes clean architecture, reactive programming, and user-centric design. By following these practices and leveraging the Android Jetpack libraries, you can build robust, maintainable, and performant applications that provide excellent user experiences.

**Remember**: Stay updated with Android development best practices as the ecosystem evolves rapidly. Google I/O and Android Dev Summit are great resources for learning about new features and recommendations.
