import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

const isServer = typeof window === 'undefined';

// Web vs Native persistent storage router split
const safeStorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (isServer) return null;
    try {
      if (Platform.OS === 'web') {
        return window.localStorage.getItem(key);
      }
      return await AsyncStorage.getItem(key);
    } catch (e) {
      console.warn("Storage read failure", e);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (isServer) return;
    try {
      if (Platform.OS === 'web') {
        window.localStorage.setItem(key, value);
        return;
      }
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.warn("Storage write failure", e);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (isServer) return;
    try {
      if (Platform.OS === 'web') {
        window.localStorage.removeItem(key);
        return;
      }
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.warn("Storage clean failure", e);
    }
  },
};

// Replace these values with your exact project variables 
const SUPABASE_URL = 'https://hwceudxxgewuxpwfmrvz.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_SeejEEnUgr2Hksvq9NShSA_cmFvGmU9';           

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: safeStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web', // Set to true only on web targets
  },
});
