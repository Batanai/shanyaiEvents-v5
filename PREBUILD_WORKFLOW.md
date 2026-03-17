# Prebuild Workflow Guide

This document explains how to handle Android prebuild with custom build.gradle configuration.

## Problem

Expo's `npx expo prebuild --clean` regenerates the entire `android/` folder from scratch, overwriting any manual changes to `android/app/build.gradle`. Our custom CodeMagic signing configuration and version management would be lost.

## Solution: Manual Copy Approach

We use a **manual copy approach** with a saved template in `support-files/build.gradle`.

### Why Not Config Plugin?

We initially tried using an Expo config plugin (`plugins/withCustomAndroidBuild.js`), but string replacement operations kept corrupting the generated build.gradle file. The manual copy approach is more reliable.

---

## Local Development

### Option 1: Use npm scripts (Recommended)

```bash
# Prebuild Android only with custom build.gradle
npm run prebuild:android

# Prebuild both platforms with custom build.gradle
npm run prebuild:clean
```

These scripts automatically:
1. Run `npx expo prebuild --clean`
2. Copy `support-files/build.gradle` to `android/app/build.gradle`

### Option 2: Manual commands

```bash
npx expo prebuild --platform android --clean
cp support-files/build.gradle android/app/build.gradle
```

---

## CodeMagic CI/CD

The workflow is already configured in `codemagic.yaml`:

```yaml
- name: Run Expo Prebuild
  script: npx expo prebuild --clean
  
- name: Set up app/build.gradle  
  script: cp ./support-files/build.gradle android/app/
```

This ensures the custom build.gradle is applied during CI builds.

---

## What's in the Custom build.gradle?

### 1. Version Management

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

Usage in defaultConfig:
```gradle
versionCode getMyVersionCode()
versionName getMyVersionName()
```

This allows CodeMagic to pass version parameters:
```bash
./gradlew bundleRelease -PversionCode=123 -PversionName=2.0.123
```

### 2. CodeMagic Signing Configuration

```gradle
signingConfigs {
    debug {
        storeFile file('debug.keystore')
        storePassword 'android'
        keyAlias 'androiddebugkey'
        keyPassword 'android'
    }
    release {
        if (System.getenv()["CI"]) {
            // Use CodeMagic environment variables in CI
            storeFile file(System.getenv()["CM_KEYSTORE_PATH"])
            storePassword System.getenv()["CM_KEYSTORE_PASSWORD"]
            keyAlias System.getenv()["CM_KEY_ALIAS"]
            keyPassword System.getenv()["CM_KEY_PASSWORD"]
        } else {
            // Use debug keystore for local development
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }
}
```

### 3. Build Types

```gradle
buildTypes {
    debug {
        signingConfig signingConfigs.debug
    }
    release {
        signingConfig signingConfigs.release  // Uses CodeMagic keys in CI
        minifyEnabled enableMinifyInReleaseBuilds
        // ... other release settings
    }
}
```

---

## Updating the Template

If you need to modify the build.gradle configuration:

1. **Make changes** to `android/app/build.gradle`
2. **Test** that the build works: `npm run android`
3. **Save** the changes: `cp android/app/build.gradle support-files/build.gradle`
4. **Commit** the updated `support-files/build.gradle` to git

---

## Troubleshooting

### Build fails after prebuild

**Symptom:** Build errors about missing signing config or version functions.

**Solution:** You forgot to copy the custom build.gradle:
```bash
cp support-files/build.gradle android/app/build.gradle
```

Or use the npm script:
```bash
npm run prebuild:android
```

### Changes to build.gradle are lost

**Symptom:** After running prebuild, your custom changes disappear.

**Cause:** Prebuild regenerates the android folder from scratch.

**Solution:** 
1. Always make changes to `support-files/build.gradle` (the template)
2. Then copy it: `cp support-files/build.gradle android/app/build.gradle`
3. Or run: `npm run prebuild:android`

### CodeMagic build fails with signing errors

**Symptom:** CI build fails with "keystore not found" or similar.

**Cause:** Environment variables not set in CodeMagic.

**Solution:** Verify these are set in CodeMagic:
- `CM_KEYSTORE_PATH`
- `CM_KEYSTORE_PASSWORD`
- `CM_KEY_ALIAS`
- `CM_KEY_PASSWORD`
- `CI` (automatically set by CodeMagic)

---

## Quick Reference

### Local Development Commands

```bash
# Clean prebuild with custom config (recommended)
npm run prebuild:android

# Build and run on device
npm run android

# Full clean rebuild
npm run prebuild:clean
npm run android
```

### Files to Know

- **`support-files/build.gradle`** - Template with custom config (committed to git)
- **`android/app/build.gradle`** - Generated file (gitignored, regenerated on prebuild)
- **`codemagic.yaml`** - CI/CD workflow that copies the template
- **`package.json`** - Contains helper scripts

### Important Notes

- ✅ **DO** commit `support-files/build.gradle` to git
- ✅ **DO** use `npm run prebuild:android` for local prebuild
- ✅ **DO** update the template when making changes
- ❌ **DON'T** manually edit `android/app/build.gradle` without updating the template
- ❌ **DON'T** commit `android/` folder (it's gitignored)
- ❌ **DON'T** run `npx expo prebuild` without copying the template afterward
