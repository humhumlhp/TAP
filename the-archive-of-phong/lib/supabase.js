import { AppState, Platform } from 'react-native'
import 'react-native-url-polyfill/auto'
import { createClient, processLock } from '@supabase/supabase-js'
import { supabaseAnonKey, supabaseUrl } from '../constants'

// Platform-specific storage
let storage;

if (Platform.OS === 'web') {
  // Web storage using localStorage
  storage = {
    getItem: async (key) => {
      if (typeof window !== 'undefined') {
        return localStorage.getItem(key);
      }
      return null;
    },
    setItem: async (key, value) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, value);
      }
    },
    removeItem: async (key) => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
      }
    }
  };
} else {
  // Native storage using AsyncStorage
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  storage = AsyncStorage;
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    lock: processLock,
  },
})

// Tells Supabase Auth to continuously refresh the session automatically
// if the app is in the foreground. When this is added, you will continue
// to receive `onAuthStateChange` events with the `TOKEN_REFRESHED` or
// `SIGNED_OUT` event if the user's session is terminated. This should
// only be registered once.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})