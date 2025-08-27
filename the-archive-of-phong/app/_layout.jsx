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
      <StatusBar barStyle={'dark-content'} />
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

        // Check if user has completed code redemption
        const userData = await getUserData(session.user.id);
        
        if (userData.success) {
          // Store the full user data including name, class, school
          setUserData({ ...userData.data, email: session.user.email });
          // User has verified codes, go to main app
          router.replace('/(main)/home');
        } else {
          // User needs to enter school/class codes
          router.replace('/codeRedemption');
        }

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