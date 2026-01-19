# Code Examples

## Core Android Components

### 1. Activities & Fragments

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

### 2. Jetpack Compose (Modern UI)

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

### 3. ViewModel & LiveData/StateFlow

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

### 4. Repository Pattern

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

### 5. Dependency Injection with Hilt

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

### 6. Room Database

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

### 7. Networking with Retrofit

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
