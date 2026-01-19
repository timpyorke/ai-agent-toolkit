# Reference Material

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
