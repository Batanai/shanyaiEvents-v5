# Shanyai Events v5

Modern event management and QR code scanning app built with Expo SDK 55 and React Query.

## 🚀 What's New in v5

### Major Improvements
- **Expo SDK 55**: Latest Expo version with React Native 0.83.2 and React 19
- **React Query**: Replaced Context API with @tanstack/react-query for better API state management
- **Zustand**: Lightweight state management for auth tokens
- **TypeScript**: Full TypeScript support throughout the codebase
- **Better Performance**: Automatic request caching, deduplication, and background refetching
- **Improved Error Handling**: Better loading states and error boundaries
- **Modern Architecture**: Clean separation of concerns with API layer, hooks, and UI components

### Architecture Changes

#### v4 → v5 Migration
| Feature | v4 | v5 |
|---------|----|----|
| State Management | Context API | Zustand + React Query |
| API Calls | Direct axios in Context | Centralized API layer with React Query |
| TypeScript | Partial | Full coverage |
| Expo SDK | 51 | 55 |
| React | 18.2.0 | 19.2.0 |
| React Native | 0.74.5 | 0.83.2 |
| Build Config | Manual | Automated with prebuild |

## 📁 Project Structure

```
shanyaiEvents-v5/
├── app/                      # Expo Router screens
│   ├── _layout.tsx          # Root layout with React Query provider
│   ├── index.tsx            # Landing screen
│   ├── login.tsx            # Login screen
│   ├── events.tsx           # Events list
│   ├── list-tickets.tsx     # Ticket list
│   └── scan-barcode.tsx     # QR scanner
├── lib/
│   ├── api/                 # API layer
│   │   ├── client.ts        # Axios client configuration
│   │   ├── auth.ts          # Auth API endpoints
│   │   ├── events.ts        # Events API endpoints
│   │   └── tickets.ts       # Tickets API endpoints
│   ├── hooks/               # React Query hooks
│   │   ├── useAuth.ts       # Authentication hooks
│   │   ├── useEvents.ts     # Events hooks
│   │   └── useTickets.ts    # Tickets hooks
│   └── store/
│       └── authStore.ts     # Zustand auth store
├── helpers/
│   └── decodeJwt.ts         # JWT decoder utility
├── support-files/
│   └── build.gradle         # Custom Android build config
├── assets/                  # App assets
├── app.json                 # Expo configuration
├── babel.config.js          # Babel configuration
├── codemagic.yaml           # CI/CD configuration
└── package.json             # Dependencies
```

## 🔧 Installation

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## 🏗️ Prebuild Process

### Local Development

For local builds with native code:

```bash
# Clean prebuild (recommended when switching between builds)
npx expo prebuild --clean

# For Android with custom signing
npx expo prebuild --platform android
mv ./support-files/build.gradle android/app/

# For iOS
npx expo prebuild --platform ios
```

### CI/CD with CodeMagic

The app uses CodeMagic for automated builds. The prebuild process is handled automatically:

#### Android Build Process
1. **Install dependencies**: `npm install --legacy-peer-deps`
2. **Run prebuild**: `npx expo prebuild --clean`
3. **Apply custom build.gradle**: Moves `support-files/build.gradle` to `android/app/`
4. **Build release**: Gradle builds with CodeMagic signing keys

#### iOS Build Process
1. **Install dependencies**: `npm install --legacy-peer-deps`
2. **Run prebuild**: `npx expo prebuild --clean`
3. **Configure Info.plist**: Adds required keys
4. **Install pods**: `cd ios && pod install`
5. **Build IPA**: Xcode builds with App Store Connect signing

### CodeMagic Signing Configuration

The `support-files/build.gradle` file handles signing automatically:

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
            // Local development
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }
}
```

**Environment Variables Required in CodeMagic:**
- `CM_KEYSTORE_PATH`: Path to keystore file
- `CM_KEYSTORE_PASSWORD`: Keystore password
- `CM_KEY_ALIAS`: Key alias
- `CM_KEY_PASSWORD`: Key password

## 🔌 API Integration

### Base URL
```typescript
https://shanyai.events
```

### Endpoints

#### 1. Login
```typescript
POST /wp-json/meup/v1/login
Body: { user: string, pass: string }
Response: { status: 'SUCCESS' | 'ERROR', token?: string, msg?: string }
```

#### 2. Fetch Events
```typescript
POST /wp-json/meup/v1/event_accepted
Body: { token: string }
Response: { status: 'SUCCESS' | 'ERROR', events?: Event[], msg?: string }
```

#### 3. Validate Ticket
```typescript
POST /wp-json/meup/v1/validate_ticket
Body: { token: string, qrcode: string, eid: string }
Response: { status: 'SUCCESS' | 'ERROR', name_customer?: string, seat?: string, ... }
```

## 🎯 React Query Benefits

### Automatic Caching
```typescript
// Events are cached for 5 minutes
const { data: events } = useFetchEvents();
```

### Loading & Error States
```typescript
const { data, isLoading, error } = useFetchEvents();

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage />;
```

### Optimistic Updates
```typescript
const { mutate: validateTicket, isPending } = useValidateTicket();
```

### Background Refetching
React Query automatically refetches stale data in the background, ensuring users always see fresh data.

## 🔐 Authentication Flow

1. User enters credentials on login screen
2. `useLogin` hook calls auth API
3. On success, token is stored in Zustand store
4. User is redirected to events screen
5. Token is automatically included in subsequent API calls
6. Logout clears token and redirects to login

## 📱 Features

- ✅ User authentication with JWT
- ✅ Event listing with pull-to-refresh
- ✅ QR code scanning for ticket validation
- ✅ Real-time ticket validation feedback
- ✅ Offline-first architecture with React Query
- ✅ TypeScript for type safety
- ✅ Modern UI with animations (Moti)
- ✅ Toast notifications for user feedback

## 🚀 Deployment

### Android (Google Play)
```bash
# Trigger CodeMagic build
git push origin main

# Or manually build
npx expo prebuild --platform android
mv ./support-files/build.gradle android/app/
cd android && ./gradlew bundleRelease
```

### iOS (App Store)
```bash
# Trigger CodeMagic build
git push origin main

# Or manually build
npx expo prebuild --platform ios
cd ios && pod install
# Build in Xcode
```

## 🔄 Migration Notes from v4

### Breaking Changes
1. **Context API removed**: Use React Query hooks instead
2. **Auth state**: Now managed by Zustand instead of Context
3. **API calls**: Centralized in `lib/api/` directory
4. **TypeScript**: All files must be `.ts` or `.tsx`

### Migration Steps
1. ✅ Update to Expo SDK 55
2. ✅ Replace Context with React Query + Zustand
3. ✅ Convert all files to TypeScript
4. ✅ Centralize API calls
5. ✅ Update build configuration
6. ✅ Update CodeMagic workflows

## 📝 Development Tips

### Adding New API Endpoints
1. Define types in `lib/api/[feature].ts`
2. Create API function
3. Create React Query hook in `lib/hooks/use[Feature].ts`
4. Use hook in component

### Debugging
```bash
# Clear Metro cache
npx expo start -c

# Clear prebuild
npx expo prebuild --clean

# Check React Query DevTools (web only)
# Add to _layout.tsx for debugging
```

## 🐛 Troubleshooting

### Build Issues
- **Android build fails**: Ensure `support-files/build.gradle` is copied correctly
- **iOS build fails**: Run `cd ios && pod install --repo-update`
- **Dependency conflicts**: Use `--legacy-peer-deps` flag

### Runtime Issues
- **API calls fail**: Check token in Zustand store
- **Camera not working**: Verify permissions in app.json
- **White screen**: Check Metro bundler logs

## 📦 Dependencies

### Core
- `expo`: ~55.0.6
- `react`: 19.2.0
- `react-native`: 0.83.2
- `expo-router`: ^55.0.5

### State Management
- `@tanstack/react-query`: ^5.90.21
- `zustand`: Latest

### UI & Animations
- `moti`: ^0.30.0
- `react-native-reanimated`: ^4.2.2
- `react-native-shadow-2`: ^7.1.2

### Features
- `react-native-vision-camera`: ^4.7.3
- `axios`: ^1.13.6
- `jwt-decode`: ^4.0.0

## 📄 License

Private - Shanyai Events

## 👥 Contributors

- Migration to v5: Automated with React Query integration
- Original v4: Shanyai Events Team
