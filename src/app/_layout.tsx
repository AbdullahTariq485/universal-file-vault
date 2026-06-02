import { DarkTheme, DefaultTheme, Tabs, ThemeProvider, useRouter, useSegments } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { Colors } from '@/constants/theme';
import { SettingsProvider, useSettings } from '@/context/settings-context';
import { AuthProvider, useAuth } from '../context/auth-context';

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Check if the current route is an authentication screen
    const inAuthGroup = segments[0] === 'login' || segments[0] === 'signup';

    if (!user && !inAuthGroup) {
      // Direct unauthenticated users to the standalone login page
      router.replace('/login');
    } else if (user && inAuthGroup) {
      // Return logged-in users straight to the home landing
      router.replace('/');
    }
  }, [user, segments, loading]);

  return <>{children}</>;
}

function TabsLayout() {
  const { darkMode } = useSettings();
  const scheme = darkMode ? 'dark' : 'light';
  const colors = Colors[scheme];

  return (
    <ThemeProvider value={darkMode ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      {Platform.OS === 'web' ? (
        <Tabs
          screenOptions={{
            tabBarStyle: {
              backgroundColor: colors.background,
              borderTopColor: colors.backgroundElement,
              borderTopWidth: 1,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
            },
            tabBarActiveTintColor: '#6366F1',
            tabBarInactiveTintColor: '#8892B0',
            headerShown: false,
          }}>
          {/* Main Content Tabs */}
          <Tabs.Screen name="index" options={{ title: '🏠 Home', tabBarLabel: 'Home' }} />
          <Tabs.Screen name="explore" options={{ title: '📊 Activity', tabBarLabel: 'Activity' }} />
          <Tabs.Screen name="profile" options={{ title: '👤 Profile', tabBarLabel: 'Profile' }} />
          <Tabs.Screen name="settings" options={{ title: '⚙️ Settings', tabBarLabel: 'Settings' }} />
          <Tabs.Screen name="file-details" options={{ href: null }} />
          
          {/* Hiding Authentication screens from Web Tab Navigation */}
          <Tabs.Screen name="login" options={{ href: null, tabBarStyle: { display: 'none' } }} />
          <Tabs.Screen name="signup" options={{ href: null, tabBarStyle: { display: 'none' } }} />
        </Tabs>
      ) : (
        <NativeTabs
          backgroundColor={colors.background}
          indicatorColor={colors.backgroundElement}
          labelStyle={{ selected: { color: colors.text } }}>
          {/* Only render triggers for your actual functional screens */}
          <NativeTabs.Trigger name="index">
            <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
            <NativeTabs.Trigger.Icon src={require('@/assets/images/tabIcons/home.png')} renderingMode="template" />
          </NativeTabs.Trigger>

          <NativeTabs.Trigger name="explore">
            <NativeTabs.Trigger.Label>Activity</NativeTabs.Trigger.Label>
            <NativeTabs.Trigger.Icon src={require('@/assets/images/tabIcons/explore.png')} renderingMode="template" />
          </NativeTabs.Trigger>

          <NativeTabs.Trigger name="profile">
            <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
            <NativeTabs.Trigger.Icon src={require('@/assets/images/tabIcons/explore.png')} renderingMode="template" />
          </NativeTabs.Trigger>

          <NativeTabs.Trigger name="settings">
            <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
            <NativeTabs.Trigger.Icon src={require('@/assets/images/tabIcons/explore.png')} renderingMode="template" />
          </NativeTabs.Trigger>
          
          {/* Notice login, signup, and file-details are completely omitted from Triggers */}
          {/* NativeTabs registers screens automatically, omission leaves them hidden from the bar */}
        </NativeTabs>
      )}
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <AuthGate>
          <TabsLayout />
        </AuthGate>
      </AuthProvider>
    </SettingsProvider>
  );
}
