/**
 * Agri eBook Hub - Main App Component
 * Agricultural eBook platform with Reader and Author roles
 *
 * @format
 */

import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/components/common/SplashScreen';
import AppStatusBar from './src/components/common/AppStatusBar';
import { AuthProvider } from './src/context/AuthContext';
import { SettingsProvider } from './src/context/SettingsContext';
import Colors from './color';

function App() {
    const [showSplash, setShowSplash] = useState(true);

    const handleSplashFinish = () => {
        setShowSplash(false);
    };

    return (
        <AuthProvider>
            <SettingsProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <SafeAreaProvider>
                        <AppStatusBar />
                        {showSplash ? (
                            <SplashScreen onFinish={handleSplashFinish} />
                        ) : (
                            <AppNavigator />
                        )}
                    </SafeAreaProvider>
                </GestureHandlerRootView>
            </SettingsProvider>
        </AuthProvider>
    );
}

export default App;

