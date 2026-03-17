# Prebuild Process Guide

This document explains how the prebuild process works for shanyaiEvents-v5 and how to handle the custom build.gradle configuration.

## Overview

Expo's prebuild process generates native Android and iOS projects from your Expo configuration. Since we use custom signing configurations for CodeMagic CI/CD, we need to replace the generated `build.gradle` file after prebuild.

## Why Custom build.gradle?

The custom `build.gradle` in `support-files/` includes:

1. **CodeMagic Signing Configuration**: Automatically uses CI environment variables for release signing
2. **Version Management**: Custom version code and version name handling
3. **Fallback Debug Signing**: Uses debug keystore for local development

## Prebuild Workflow

### Local Development

#### First Time Setup

```bash
# Install dependencies
npm install --legacy-peer-deps

# Run prebuild to generate native folders
npx expo prebuild --clean
```

#### For Android Development

```bash
# Generate Android project
npx expo prebuild --platform android --clean

# Apply custom build.gradle
mv ./support-files/build.gradle android/app/

# Run on Android
npm run android
```

#### For iOS Development

```bash
# Generate iOS project
npx expo prebuild --platform ios --clean

# Install pods
cd ios && pod install && cd ..

# Run on iOS
npm run ios
```

### CI/CD (CodeMagic)

The CodeMagic workflow automatically handles prebuild:

```yaml
scripts:
  - name: Install npm dependencies
    script: |
      npm install --legacy-peer-deps

  - name: Run Expo Prebuild
    script: |
      npx expo prebuild --clean
      # Config plugin automatically applies build.gradle modifications
```

**No manual file copying needed!** The config plugin handles everything automatically.

## Custom build.gradle Explained

### Signing Configuration

```gradle
signingConfigs {
    release {
        if (System.getenv()["CI"]) {
            // CodeMagic CI environment
            storeFile file(System.getenv()["CM_KEYSTORE_PATH"])
            storePassword System.getenv()["CM_KEYSTORE_PASSWORD"]
            keyAlias System.getenv()["CM_KEY_ALIAS"]
            keyPassword System.getenv()["CM_KEY_PASSWORD"]
        } else {
            // Local development - uses debug keystore
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }
}
```

**How it works:**

- Checks for `CI` environment variable (set by CodeMagic)
- If in CI: Uses CodeMagic keystore environment variables
- If local: Falls back to debug keystore for development builds

### 2. Version Management

The plugin injects custom version functions:

```gradle
def baseVersionCode = 20000

def getMyVersionCode = { ->
    def increment = project.hasProperty('versionCode') ? versionCode.toInteger() : 0
    return baseVersionCode + increment
}

def getMyVersionName = { ->
    return project.hasProperty('versionName') ? versionName : "2.0.0"
}
```

**Usage in CodeMagic:**

```bash
./gradlew bundleRelease \
  -PversionCode=$UPDATED_BUILD_NUMBER \
  -PversionName=2.0.$UPDATED_BUILD_NUMBER
```

## Required CodeMagic Environment Variables

Set these in your CodeMagic project settings:

| Variable               | Description               | Example                  |
| ---------------------- | ------------------------- | ------------------------ |
| `CM_KEYSTORE_PATH`     | Path to uploaded keystore | `/tmp/keystore.jks`      |
| `CM_KEYSTORE_PASSWORD` | Keystore password         | `your-keystore-password` |
| `CM_KEY_ALIAS`         | Key alias name            | `upload`                 |
| `CM_KEY_PASSWORD`      | Key password              | `your-key-password`      |

## Common Issues & Solutions

### Issue: Config plugin not applying changes

**Solution**: Ensure plugin is registered in `app.json` and run prebuild with `--clean`:

```bash
npx expo prebuild --clean
```

### Issue: Signing fails in CI

**Solution**: Verify all CodeMagic environment variables are set correctly

### Issue: Local build fails with signing error

**Solution**: The debug keystore should be auto-generated. If missing:

```bash
cd android/app
keytool -genkey -v -keystore debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000
```

### Issue: Prebuild overwrites custom changes

**Solution**: This shouldn't happen with config plugins. If it does, check that the plugin is properly registered in `app.json`

## Extending the Config Plugin

To add more build.gradle modifications, edit `plugins/withCustomAndroidBuild.js`:

```javascript
function ensureCustomFeature(contents) {
  // Add your custom modifications
  if (!contents.includes("myCustomConfig")) {
    contents = contents.replace(
      /android\s*\{/,
      "android {\n    myCustomConfig = true",
    );
  }
  return contents;
}

// Then add to the plugin:
next = ensureCustomFeature(next);
```

## Best Practices

1. **Always use `--clean`**: Ensures fresh native projects and plugin re-runs
2. **Don't commit native folders**: Keep `android/` and `ios/` in `.gitignore`
3. **Test locally before CI**: Run prebuild locally to catch issues early
4. **Version control plugins**: Always commit changes to `plugins/withCustomAndroidBuild.js`
5. **Idempotent modifications**: Ensure plugin checks before adding code to avoid duplicates

## Debugging Prebuild

### View generated build.gradle

```bash
npx expo prebuild --clean
cat android/app/build.gradle
# Look for CodeMagic signing config and version management
```

### Verify plugin applied changes

```bash
npx expo prebuild --clean
grep -A 10 "CM_KEYSTORE_PATH" android/app/build.gradle
grep -A 5 "getMyVersionCode" android/app/build.gradle
```

### Test signing configuration

```bash
cd android
./gradlew assembleRelease --info
```

### Debug plugin execution

Add console.log statements in `plugins/withCustomAndroidBuild.js`:

```javascript
console.log("✅ Applied custom Android build configuration");
```

## Migration from v4

**v4 approach**: Manual file copy after prebuild

```bash
npx expo prebuild
mv ./support-files/build.gradle android/app/  # Manual step
```

**v5 approach**: Automatic via config plugin

```bash
npx expo prebuild --clean  # Plugin applies automatically
```

### Benefits of v5 Approach

- ✅ No manual steps required
- ✅ Impossible to forget to apply changes
- ✅ Modifications are version-controlled in JavaScript
- ✅ Easier to extend and maintain
- ✅ Works seamlessly in CI/CD

### Migration Checklist

1. ✅ Created `plugins/withCustomAndroidBuild.js`
2. ✅ Registered plugin in `app.json`
3. ✅ Updated CodeMagic YAML to remove manual copy step
4. ✅ Kept `support-files/build.gradle` as reference (optional)

## Resources

- [Expo Prebuild Docs](https://docs.expo.dev/workflow/prebuild/)
- [Expo Config Plugins](https://docs.expo.dev/guides/config-plugins/)
- [CodeMagic Android Signing](https://docs.codemagic.io/yaml-code-signing/signing-android/)
