import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';
import Icon from '../../assets/icons';
import { useRouter } from 'expo-router';
import Avatar from '../../components/Avatar';

import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';


const Home = () => {
  const { user, setAuth } = useAuth();
  const router = useRouter();

  // Camera permissions and state
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState(CameraType.back);

  function toggleCameraFacing() {
    setFacing((current) => (current === CameraType.back ? CameraType.front : CameraType.back));
  }

  // Optional: implement logout here if needed
  /** 
  const onLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Logout', 'Error signing out!');
    }
  };
  **/

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <ScreenWrapper bg={theme.colors.background}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}> 
          <Text style={styles.message}>We need your permission to show the camera</Text>
          <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper bg={theme.colors.background}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.icons}>
            <Pressable onPress={() => router.push('profile')}>
              <Avatar url={user?.image} size={hp(3.6)} rounded={0} style={{ borderWidth: 0 }} />
            </Pressable>
          </View>
          <View style={styles.icons}>
            <Pressable onPress={() => router.push('notification')}>
              <Icon name="bell" size={40} />
            </Pressable>
          </View>
        </View>

        {/* Camera */}
        <CameraView
          style={styles.camera}
          facing={facing}
        />
        <TouchableOpacity style={styles.buttonContainer} onPress={toggleCameraFacing}>
          <Text style={styles.text}>Flip Camera</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginHorizontal: wp(4),
  },
  icons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 18,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: theme.colors.text,
  },
  permissionButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});
