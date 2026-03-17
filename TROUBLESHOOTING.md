# Troubleshooting Guide

Common issues and solutions for shanyaiEvents-v5.

## Build Issues

### ❌ Gradle Build Fails: "Process 'command 'node'' finished with non-zero exit value 1"

**Error:**
```
FAILURE: Build failed with an exception.
* Where:
Settings file '/path/to/android/settings.gradle' line: 29
* What went wrong:
A problem occurred evaluating settings 'android'.
> Process 'command 'node'' finished with non-zero exit value 1
```

**Cause:** Missing `babel-preset-expo` in devDependencies. The expo-modules-autolinking command runs during Gradle configuration and needs Babel to transform config files.

**Solution:**
```bash
npm install babel-preset-expo --save-dev --legacy-peer-deps
```

Then rebuild:
```bash
npx expo prebuild --clean
npx expo run:android
```

---

### ❌ React Native Reanimated Pod Install Fails

**Error:**
```
Invalid `RNReanimated.podspec` file: [Reanimated] Failed to validate worklets version.
```

**Cause:** React Native Reanimated 4.x has stricter validation requirements that may not be compatible with Expo SDK 55.

**Solution:** Downgrade to Reanimated 3.10.x which is the recommended version for Expo SDK 55:
```bash
npm install react-native-reanimated@~3.10.1 --legacy-peer-deps
npx expo prebuild --clean
```

---

### ❌ Config Plugin Not Applying Changes

**Symptoms:** Custom build.gradle modifications not present after prebuild.

**Solution:**
1. Verify plugin is registered in `app.json`:
```json
"plugins": [
  "./plugins/withCustomAndroidBuild"
]
```

2. Run prebuild with `--clean`:
```bash
npx expo prebuild --clean
```

3. Verify changes were applied:
```bash
grep -A 10 "CM_KEYSTORE_PATH" android/app/build.gradle
```

---

### ❌ Peer Dependency Conflicts

**Error:**
```
npm error ERESOLVE could not resolve
npm error Conflicting peer dependency
```

**Solution:** Always use `--legacy-peer-deps` flag:
```bash
npm install --legacy-peer-deps
```

This is required due to React 19 peer dependency conflicts in Expo SDK 55.

---

## Runtime Issues

### ❌ White Screen on Launch

**Possible Causes:**
1. Metro bundler not running
2. JavaScript bundle failed to load
3. Crash during initialization

**Solutions:**

1. **Check Metro bundler:**
```bash
npx expo start -c  # Clear cache
```

2. **Check device logs:**
```bash
# Android
npx react-native log-android

# iOS
npx react-native log-ios
```

3. **Rebuild with clean cache:**
```bash
npx expo prebuild --clean
npx expo run:android  # or run:ios
```

---

### ❌ API Calls Failing

**Symptoms:** Login fails, events don't load, ticket validation errors.

**Debug Steps:**

1. **Check token in Zustand store:**
```typescript
// Add to any component
import { useAuthStore } from '../lib/store/authStore';
const token = useAuthStore((state) => state.token);
console.log('Token:', token);
```

2. **Check React Query cache:**
```typescript
import { useQueryClient } from '@tanstack/react-query';
const queryClient = useQueryClient();
console.log('Query cache:', queryClient.getQueryData(['events', token]));
```

3. **Verify API endpoint:**
- Base URL: `https://shanyai.events`
- Check network tab in browser (web) or use network debugging tools

---

### ❌ Camera Not Working

**Error:** "Camera permission denied" or camera doesn't open.

**Solutions:**

1. **Verify permissions in app.json:**
```json
"plugins": [
  [
    "react-native-vision-camera",
    {
      "cameraPermissionText": "$(PRODUCT_NAME) needs access to your Camera to scan QR codes.",
      "enableCodeScanner": true
    }
  ]
]
```

2. **Android:** Check AndroidManifest.xml has camera permissions
3. **iOS:** Check Info.plist has NSCameraUsageDescription
4. **Rebuild after permission changes:**
```bash
npx expo prebuild --clean
```

---

## Development Issues

### ❌ TypeScript Errors

**Error:** "Cannot find module" or type errors.

**Solutions:**

1. **Restart TypeScript server** in your IDE
2. **Check imports are correct:**
```typescript
// Correct
import { useLogin } from '../lib/hooks/useAuth';

// Incorrect
import { useLogin } from '../context/AuthContext';  // v4 path
```

3. **Verify types are installed:**
```bash
npm install @types/react @types/react-native --save-dev --legacy-peer-deps
```

---

### ❌ Hot Reload Not Working

**Solutions:**

1. **Restart Metro bundler:**
```bash
npx expo start -c
```

2. **Check Fast Refresh is enabled** in Expo Dev Tools

3. **For config changes, always rebuild:**
```bash
npx expo prebuild --clean
```

---

## CI/CD Issues (CodeMagic)

### ❌ Build Fails in CI but Works Locally

**Common Causes:**

1. **Missing environment variables**
   - Verify `CM_KEYSTORE_PATH`, `CM_KEYSTORE_PASSWORD`, `CM_KEY_ALIAS`, `CM_KEY_PASSWORD` are set

2. **Different Node.js version**
   - CodeMagic uses specific Node version, ensure compatibility

3. **Cache issues**
   - Add cache clearing step in codemagic.yaml if needed

**Debug in CodeMagic:**
```yaml
- name: Debug environment
  script: |
    node --version
    npm --version
    env | grep CM_
```

---

### ❌ Signing Fails in CI

**Error:** "Keystore not found" or "Invalid keystore password"

**Solutions:**

1. **Verify keystore is uploaded** to CodeMagic
2. **Check environment variables** are correctly set
3. **Verify keystore path** in build.gradle matches CodeMagic path:
```gradle
storeFile file(System.getenv()["CM_KEYSTORE_PATH"])
```

---

## Performance Issues

### ❌ App is Slow or Laggy

**Solutions:**

1. **Enable Hermes** (should be enabled by default in Expo SDK 55)

2. **Check React Query cache settings:**
```typescript
// Adjust staleTime if data is refetching too often
const { data } = useFetchEvents(); // Default: 5 min cache
```

3. **Profile with React DevTools:**
```bash
npx react-devtools
```

---

## Debugging Tools

### Enable React Query DevTools (Web Only)

Add to `app/_layout.tsx`:
```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Inside QueryClientProvider
<ReactQueryDevtools initialIsOpen={false} />
```

### View Network Requests

**Web:**
- Open browser DevTools → Network tab

**React Native:**
- Use Flipper or Reactotron
- Or add logging to axios interceptor in `lib/api/client.ts`

### Debug Gradle Build

```bash
cd android
./gradlew assembleDebug --stacktrace --info
```

---

## Getting Help

If you encounter an issue not listed here:

1. **Check Expo documentation:** https://docs.expo.dev
2. **Check React Query docs:** https://tanstack.com/query/latest
3. **Search GitHub issues** for related packages
4. **Check build logs** in CodeMagic dashboard

## Quick Reference

### Clean Everything
```bash
# Clean Metro cache
npx expo start -c

# Clean Gradle
cd android && ./gradlew clean && cd ..

# Clean iOS
cd ios && pod deintegrate && pod install && cd ..

# Clean node_modules
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Clean and rebuild
npx expo prebuild --clean
```

### Verify Setup
```bash
# Check dependencies
npm list react-native-reanimated
npm list babel-preset-expo

# Check config plugin applied
npx expo prebuild --clean
grep "CM_KEYSTORE_PATH" android/app/build.gradle

# Test autolinking
node --no-warnings --eval "require('expo/bin/autolinking')" expo-modules-autolinking react-native-config --platform android --json
```
