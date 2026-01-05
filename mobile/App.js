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
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { SettingsProvider } from './src/context/SettingsContext';
import Colors from './color';

function AppContent() {
    const [showSplash, setShowSplash] = useState(true);
    const { isAuthenticated, isLoading } = useAuth();

    const handleSplashFinish = () => {
        setShowSplash(false);
    };

    // If auth is still loading, show splash
    if (isLoading || showSplash) {
        return <SplashScreen onFinish={handleSplashFinish} />;
    }

    return <AppNavigator />;
}

function App() {
    return (
        <AuthProvider>
            <SettingsProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <SafeAreaProvider>
                        <AppStatusBar />
                        <AppContent />
                    </SafeAreaProvider>
                </GestureHandlerRootView>
            </SettingsProvider>
        </AuthProvider>
    );
}

export default App;

