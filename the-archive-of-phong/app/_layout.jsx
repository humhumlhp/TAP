import { View, Text, ActivityIndicator, StatusBar } from 'react-native'
import React, { useEffect } from 'react'
import { Stack, useRouter } from 'expo-router'
import { AuthProvider, useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { getUserData } from '../services/userService'
import { useFonts } from 'expo-font'
import { VT323_400Regular } from '@expo-google-fonts/vt323'

const _layout = () => {
  // Load fonts globally for the entire app
  const [fontsLoaded] = useFonts({
    VT323_400Regular
  });

  // Show loading screen while fonts are loading
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' }}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={{ color: 'white', marginTop: 10 }}>Loading fonts...</Text>
      </View>
    );
  }

  return (
    <AuthProvider>
      <Mainlayout />
    </AuthProvider>
  )
}

const Mainlayout = () => {
  const { setAuth, setUserData } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // In your _layout.jsx, modify the auth state change handler:
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setAuth(session.user);

        // Check email verification first
        if (!session.user.email_confirmed_at) {
          router.replace('/emailVerification');
          return;
        }

        router.replace('/codeRedemption');

      } else {
        setAuth(null);
        router.replace('/welcome');
      }
    });


  }, []);


  const updateUserData = async (user) => {
    let res = await getUserData(user?.id);
    if (res.success) setUserData({ ...res.data, email: user.email });
  }
  return (
    <Stack
      screenOptions={{
        headerShown: false


      }}
    />

  )
}

export default _layout