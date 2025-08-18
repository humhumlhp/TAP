import { StyleSheet, Text, View, Alert } from 'react-native'
import React, { useState } from 'react'
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



const profile = () => {

  const { user: authUser, setUserData, setAuth } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

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
      const file = { uri, type: 'image/jpeg', name: `avatar_${timestamp}.jpg` };

      const { data, error } = await supabase.storage
        .from('posts')
        .upload(path, file, { contentType: 'image/jpeg', upsert: true });
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
      setUserData({ ...authUser, image: publicUrl });
    } catch (e) {
      console.log('Avatar upload error:', e);
      Alert.alert('Upload failed', e?.message || 'Something went wrong');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    if (loggingOut) return;
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoggingOut(true);
            await supabase.auth.signOut();
            // Properly clear auth (setUserData expects an object, so use setAuth)
            setAuth(null);
            router.replace('/welcome');
          } catch (e) {
            Alert.alert('Logout failed', e?.message || 'Something went wrong');
          } finally {
            setLoggingOut(false);
          }
        }
      }
    ]);
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
            <Text style={styles.detailValue}>{authUser?.name || ''}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>class:</Text>
            <Text style={styles.detailValue}>{authUser?.class || ''}</Text>
          </View>
           <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>school:</Text>
            <Text style={styles.detailValue}>{authUser?.school || ''}</Text>
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