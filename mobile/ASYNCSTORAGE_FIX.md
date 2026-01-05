# AsyncStorage Native Module Fix

## Error
`[@RNC/AsyncStorage]: NativeModule: AsyncStorage is null.`

## Solution

The AsyncStorage native module needs to be properly linked. Follow these steps:

### For Android:

1. **Stop the Metro bundler** (if running)

2. **Clean the build:**
   ```bash
   cd mobile/android
   ./gradlew clean
   ```

3. **Rebuild the app:**
   ```bash
   cd mobile
   npm run android
   ```

   OR if that doesn't work:
   ```bash
   cd mobile
   npx react-native run-android
   ```

### Alternative: Reset Cache and Rebuild

1. **Clear Metro bundler cache:**
   ```bash
   cd mobile
   npm start -- --reset-cache
   ```

2. **In a new terminal, rebuild:**
   ```bash
   cd mobile
   npm run android
   ```

### If Still Not Working:

1. **Uninstall and reinstall AsyncStorage:**
   ```bash
   cd mobile
   npm uninstall @react-native-async-storage/async-storage
   npm install @react-native-async-storage/async-storage
   ```

2. **Clean everything:**
   ```bash
   cd mobile
   rm -rf node_modules
   npm install
   cd android
   ./gradlew clean
   ```

3. **Rebuild:**
   ```bash
   cd mobile
   npm run android
   ```

## Note

In React Native 0.60+, auto-linking should handle native modules automatically. If it's not working, the app needs to be rebuilt after installing the package.

