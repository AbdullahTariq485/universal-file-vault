import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { supabase } from '../lib/supabase';

interface SettingsContextType {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  notifications: boolean;
  setNotifications: (value: boolean) => void;
  autoSync: boolean;
  setAutoSync: (value: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [darkMode, setDarkModeState] = useState(true);
  const [notifications, setNotificationsState] = useState(true);
  const [autoSync, setAutoSyncState] = useState(true);
  const [loaded, setLoaded] = useState(false);

  // Load settings from AsyncStorage and Supabase on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Try to get from Supabase first
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Get user preferences from database
        const { data: prefs, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (!error && prefs) {
          setDarkModeState(prefs.dark_mode ?? true);
          setNotificationsState(prefs.notifications ?? true);
          setAutoSyncState(prefs.auto_sync ?? true);
        } else {
          // Fall back to AsyncStorage
          const [darkModeValue, notificationsValue, autoSyncValue] = await Promise.all([
            AsyncStorage.getItem('darkMode'),
            AsyncStorage.getItem('notifications'),
            AsyncStorage.getItem('autoSync'),
          ]);

          if (darkModeValue !== null) setDarkModeState(JSON.parse(darkModeValue));
          if (notificationsValue !== null) setNotificationsState(JSON.parse(notificationsValue));
          if (autoSyncValue !== null) setAutoSyncState(JSON.parse(autoSyncValue));
        }
      } else {
        // Fall back to AsyncStorage if not authenticated
        const [darkModeValue, notificationsValue, autoSyncValue] = await Promise.all([
          AsyncStorage.getItem('darkMode'),
          AsyncStorage.getItem('notifications'),
          AsyncStorage.getItem('autoSync'),
        ]);

        if (darkModeValue !== null) setDarkModeState(JSON.parse(darkModeValue));
        if (notificationsValue !== null) setNotificationsState(JSON.parse(notificationsValue));
        if (autoSyncValue !== null) setAutoSyncState(JSON.parse(autoSyncValue));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoaded(true);
    }
  };

  const setDarkMode = async (value: boolean) => {
    try {
      setDarkModeState(value);
      await AsyncStorage.setItem('darkMode', JSON.stringify(value));

      // Save to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('user_preferences')
          .upsert({ user_id: user.id, dark_mode: value }, { onConflict: 'user_id' });
      }
    } catch (error) {
      console.error('Failed to save dark mode setting:', error);
    }
  };

  const setNotifications = async (value: boolean) => {
    try {
      setNotificationsState(value);
      await AsyncStorage.setItem('notifications', JSON.stringify(value));

      // Save to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('user_preferences')
          .upsert({ user_id: user.id, notifications: value }, { onConflict: 'user_id' });
      }
    } catch (error) {
      console.error('Failed to save notifications setting:', error);
    }
  };

  const setAutoSync = async (value: boolean) => {
    try {
      setAutoSyncState(value);
      await AsyncStorage.setItem('autoSync', JSON.stringify(value));

      // Save to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('user_preferences')
          .upsert({ user_id: user.id, auto_sync: value }, { onConflict: 'user_id' });
      }
    } catch (error) {
      console.error('Failed to save auto sync setting:', error);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        darkMode,
        setDarkMode,
        notifications,
        setNotifications,
        autoSync,
        setAutoSync,
      }}>
      {loaded && children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
