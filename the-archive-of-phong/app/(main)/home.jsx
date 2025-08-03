import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import TopHeader from '../../components/TopHeader'
import { Camera, useCameraPermissions } from 'expo-camera'
import CameraView from '../../components/camera/CameraView'
import CameraControl from '../../components/camera/CameraControl'
import AudienceSelector from '../../components/AudienceSelector'
import FeedSwipe from '../../components/feeds/FeedSwipe'
import { useAuth } from '../../contexts/AuthContext'
import { hp, wp } from '../../helpers/common'
import { useRouter } from 'expo-router'


const Home = () => {

  const { user, setAuth } = useAuth();
  console.log('user:', user);
  const [permission, requestPermission] = useCameraPermissions();

  //Camera permission before using the app
  if (!permission) {
    return (
      <ScreenWrapper bg='black'>
        <View style={styles.container}>
          <Text style={styles.loadingText}>Loading camera permissions...</Text>
        </View>
      </ScreenWrapper>
    );
  }
  if (!permission.granted) {
    return (
      <ScreenWrapper bg='black'>
        <View style={styles.container}>
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionText}>
              Ứng dụng cần được cấp quyền Camera
            </Text>
            <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
              <Text style={styles.permissionButtonText}>Cho phép truy cập</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScreenWrapper>
    );
  }
  console.log('permission:', permission) //Check Camera status in Terminal

  const router = useRouter();

  return (

    <ScreenWrapper bg='black'>
      <View style={styles.container}>
        {/* Header: Profile picture on the left, Bell notification on the right */}
        <TopHeader />
        {/* Access Camera & 1:1 aspect ratio camera overlay*/}
        <CameraView />
        {/*Flash, Take Picture, Flip Camera */}
        <CameraControl />
        {/* Select School, Class, Personal */}
        <AudienceSelector />
        {/* Swipe down to go others' posts */}
        <FeedSwipe />
      </View>
    </ScreenWrapper>
  )
}

export default Home

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(4),
  },
  permissionText: {
    fontSize: hp(2),
    textAlign: 'center',
    marginBottom: 20,
    color: 'white',
  },
  permissionButton: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  permissionButtonText: {
    color: 'black',
    fontSize: hp(1.8),
    fontWeight: '600',
  },
  loadingText: {
    color: 'white',
    fontSize: hp(2),
    textAlign: 'center',
  },







})