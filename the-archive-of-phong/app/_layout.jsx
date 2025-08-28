import { View, Text, ActivityIndicator, StatusBar, Platform } from 'react-native'
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
  




  const WebContainer = ({ children }) => {
    if (Platform.OS !== 'web') {
      return children;
    }

    // Calculate width to maintain mobile aspect ratio (390/844) with full height
    const mobileRatio = 390 / 844;
    const containerHeight = '100vh';
    const containerWidth = `${mobileRatio * 100}vh`; // width = height * ratio

    return (
      <View style={{
        flex: 1,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}>
        <View style={{
          width: containerWidth,
          height: containerHeight,
          backgroundColor: 'white',
          borderRadius: 25,
          overflow: 'hidden',
          boxShadow: Platform.OS === 'web' ? '0px 10px 20px rgba(0, 0, 0, 0.25)' : undefined,
          shadowColor: Platform.OS !== 'web' ? '#000' : undefined,
          shadowOffset: Platform.OS !== 'web' ? {
            width: 0,
            height: 10,
          } : undefined,
          shadowOpacity: Platform.OS !== 'web' ? 0.25 : undefined,
          shadowRadius: Platform.OS !== 'web' ? 20 : undefined,
          elevation: Platform.OS !== 'web' ? 20 : undefined,
        }}>
          {children}
        </View>
      </View>
    );
  };

  return (
    <AuthProvider>
      <WebContainer>
        <StatusBar barStyle={'dark-content'} />
        <Mainlayout />
      </WebContainer>
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