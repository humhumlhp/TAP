import { StyleSheet, Text, View, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { theme } from '../../constants/theme'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/Button'
import { router } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import { hp, wp } from '../../helpers/common'
import { Image } from 'expo-image'
import Icon from '../../assets/icons'
import * as ImagePicker from 'expo-image-picker'
import { supabase } from '../../lib/supabase'
import { getUserData } from '../../services/userService'



const profile = () => {

  const { user: authUser, setUserData, setAuth } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load user data when component mounts or when authUser.id changes
  useEffect(() => {
    const loadUserData = async () => {
      if (!authUser?.id) return;
      
      // If we already have complete user data (name, class, school), don't reload
      if (authUser.name && authUser.class && authUser.school) return;
      
      try {
        setLoading(true);
        console.log('Loading user data for profile page...');
        
        const userData = await getUserData(authUser.id);
        if (userData.success) {
          // Merge the current auth user with the profile data
          const fullUserData = { 
            ...authUser, 
            ...userData.data,
            email: authUser.email 
          };
          console.log('Profile: Updated user data:', fullUserData);
          setAuth(fullUserData);
        } else {
          console.error('Failed to load user data:', userData.msg);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [authUser?.id]);

  const onUploadAvatar = async () => {
    try {
      if (!authUser?.id) return;
      // Ask permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'We need media library permission to select a photo.');
        return;
      }
      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });
      if (result.canceled || !result.assets?.length) return;
      const uri = result.assets[0].uri;

      setUploading(true);

      // Upload to Supabase Storage (reuse posts bucket for simplicity)
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const path = `${authUser.id}/avatar_${timestamp}_${randomString}.jpg`;
      
      // Convert URI to ArrayBuffer (same pattern as uploadService)
      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();

      const { data, error } = await supabase.storage
        .from('posts')
        .upload(path, arrayBuffer, { contentType: 'image/jpeg', upsert: true });
      if (error) throw error;

      const { data: urlData } = supabase.storage.from('posts').getPublicUrl(path);
      const publicUrl = urlData.publicUrl;

      // Update user record
      const { error: updateErr } = await supabase
        .from('users')
        .update({ image: publicUrl })
        .eq('id', authUser.id);
      if (updateErr) throw updateErr;

      // Update local auth state
      setAuth({ ...authUser, image: publicUrl });
    } catch (e) {
      console.log('Avatar upload error:', e);
      Alert.alert('Upload failed', e?.message || 'Something went wrong');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    
    // For web compatibility, bypass Alert and logout directly
    // Later we can add a custom confirmation modal if needed
    try {
      setLoggingOut(true);
      console.log('Starting logout process...');
      
      // Clear local auth state immediately
      setAuth(null);
      setUserData(null);
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase signOut error:', error);
        // Don't throw error, continue with logout
      }
      
      console.log('Successfully signed out from Supabase');
      console.log('Cleared local auth state, redirecting...');
      
      // Force redirect to welcome page with a small delay to ensure state is cleared
      setTimeout(() => {
        router.replace('/welcome');
      }, 100);
      
    } catch (e) {
      console.error('Logout error:', e);
      // Even if there's an error, clear state and redirect
      setAuth(null);
      setUserData(null);
      router.replace('/welcome');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <ScreenWrapper bg={theme.colors.backgroundLight}>
      <View style={styles.container}>
        <View style={styles.backButtonContainer}>
          <Button
            width={wp(13)}
            height={wp(13)}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={30} color="black" />
          </Button>
        </View>

        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            <View style={styles.shadowLayer} />
            {authUser?.image ? (
              <Image
                source={{ uri: authUser?.image }}
                style={styles.avatar}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.avatar, styles.fallbackAvatar]}>
                <Ionicons name='person-sharp' size={hp(7)} strokeWidth={2} />
              </View>
            )}
          </View>

          {/* Upload avatar button */}
          <View style={styles.uploadBtnWrapper}>
            <Button
              onPress={onUploadAvatar}
              width={wp(10)}
              height={wp(10)}
            >
              <Ionicons name='create-sharp' size={wp(7)} />
            </Button>
          </View>
        </View>


        <View style={styles.userInfoContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>name:</Text>
            <Text style={styles.detailValue}>{loading ? 'Loading...' : (authUser?.name || '')}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>class:</Text>
            <Text style={styles.detailValue}>{loading ? 'Loading...' : (authUser?.class || '')}</Text>
          </View>
           <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>school:</Text>
            <Text style={styles.detailValue}>{loading ? 'Loading...' : (authUser?.school || '')}</Text>
          </View>
        </View>
        <View style = {styles.logOutContainer}>
          <Button onPress={handleLogout} width={wp(90)} height={hp(6)} loading={loggingOut}>
            <Text style={{ fontFamily: 'VT323_400Regular', fontSize: wp(10) }}>{loggingOut ? '...' : 'LOGOUT'}</Text>
          </Button>
        </View>
      </View>
    </ScreenWrapper>
  )
}

export default profile

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  backButtonContainer: {
    position: 'absolute',
    left: wp(5),
    top: hp(6),
    zIndex: 1000, // Ensure it's above other elements
  },
  avatarContainer: {
    position: 'relative',
    alignSelf: 'center',
    marginTop: hp(6),
  },
  avatar: {
    height: hp(18),
    width: hp(18),
    borderWidth: 1,
  },
  shadowLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
    transform: [{ translateX: 4 }, { translateY: 5 }],
    zIndex: 0,
    borderWidth: 2,
    borderColor: 'black'
  },
  fallbackAvatar: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.backgroundLight,
    borderWidth: 1,
    borderColor: theme.colors.black,
  },
  uploadBtnWrapper: {
    marginTop: -hp(3),
    alignSelf: 'right',
    position: 'relative',
    right: -wp(18),
  },
  userInfoContainer: {
    alignSelf: 'center',
    width: wp(90)
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  detailLabel: {
    fontFamily: "VT323_400Regular",
    fontSize: wp(8),
    color: '#000',
    width: wp(25),
    textAlign: 'right',
  },
  detailValue: {
    fontFamily: "VT323_400Regular",
    fontSize: wp(8),
    color: '#000',
    flex: 1,
    textAlign: 'left',
    marginLeft: wp(1),
    width: wp(50)
  },
  logOutContainer: {
    position: 'absolute',
    top: hp(85),
    alignSelf: 'center'
  }



})