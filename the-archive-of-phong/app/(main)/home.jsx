// app/(main)/home.jsx - REFACTORED VERSION
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { hp, wp } from '../../helpers/common';
import { uploadService } from '../../services/uploadService';

// Import our custom components
import ScreenWrapper from '../../components/ScreenWrapper';
import TopHeader from '../../components/TopHeader';
import CameraComponent from '../../components/camera/CameraComponent';
import AudienceSelector from '../../components/AudienceSelector';
import { theme } from '../../constants/theme';
import Button from '../../components/Button';
import { useRouter } from 'expo-router'
import { useFonts } from 'expo-font';
import SchoolDisplay from '../../components/SchoolDisplay';

const Home = () => {
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const router = useRouter();

  // State management - keeping all shared state in the parent component
  const [capturedImage, setCapturedImage] = useState(null);
  const [targetAudience, setTargetAudience] = useState('yourself');
  const [messageText, setMessageText] = useRef('');
  const [isUploading, setIsUploading] = useState(false);
  const [showFeed, setShowFeed] = useState(false);

  console.log('user:', user);

  // Check camera permissions first
  if (!permission) {
    return (
      <ScreenWrapper bg='black'>
        <View style={styles.permissionContainer}>
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

  // ===== CALLBACK FUNCTIONS (Parent functions that children will call) =====

  // Handle when photo is taken (called by CameraComponent)
  const handlePhotoTaken = (imageUri) => {
    setCapturedImage(imageUri);
    console.log('Photo captured:', imageUri);
  };

  // Handle retaking photo (called by CameraComponent)
  const handleRetakePhoto = () => {
    setCapturedImage(null);
    setMessageText('');
  };

  // Handle message text change (called by CameraComponent)
  const handleMessageChange = (text) => {
    setMessageText(text);
  };

  // Handle audience change (called by AudienceSelector)
  const handleAudienceChange = (audience) => {
    setTargetAudience(audience);
  };

  // Handle showing feed (called by FeedButton)
  const handleShowFeed = () => {
    setShowFeed(true);
  };

  // Handle closing feed (called by FeedComponent)
  const handleCloseFeed = () => {
    setShowFeed(false);
  };

  // Validate user data before sending photo
  const validateUserData = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated');
      return false;
    }

    if (targetAudience !== 'yourself') {
      const { data: userData, error } = await supabase
        .from('users')
        .select('school, class')
        .eq('id', user.id)
        .single();

      if (error || !userData) {
        Alert.alert('Error', 'Unable to fetch user information');
        return false;
      }

      if (targetAudience === 'school' && !userData.school) {
        Alert.alert('Missing Information', 'Please update your school information in profile');
        return false;
      }

      if (targetAudience === 'class' && (!userData.school || !userData.class)) {
        Alert.alert('Missing Information', 'Please update your school and class information in profile');
        return false;
      }
    }

    return true;
  };

  // Handle sending photo (called by CameraComponent)
  const handlePhotoSent = async () => {
    if (!capturedImage) {
      Alert.alert('Error', 'No image to upload');
      return;
    }

    const isValid = await validateUserData();
    if (!isValid) return;

    setIsUploading(true);

    try {
      console.log('Starting upload process...');

      const result = await uploadService.uploadAndCreatePost(
        capturedImage,
        messageText,
        targetAudience,
        user.id
      );

      console.log('Upload successful:', result);

  // Success: silently reset preview and message (no blocking alert)
  setCapturedImage(null);
  setMessageText('');
  // DON'T reset targetAudience - keep the user's selection
  // setTargetAudience('yourself');

    } catch (error) {
      console.error('Upload failed:', error);

      Alert.alert(
        'Upload Failed',
        error.message || 'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsUploading(false);
    }
  };

  // ===== RENDER MAIN COMPONENT =====

  // If feed is showing, render only the feed
  if (showFeed) {
    return (
      <FeedComponent
        targetAudience={targetAudience}
        user={user}
        showFeed={showFeed}
        onCloseFeed={handleCloseFeed}
      />
    );
  }

  // Main app interface
  return (
    // ScreenWrapper make sure the element stay within the screen without dropping out
    <ScreenWrapper bg={theme.colors.backgroundLight}>
      <View style={styles.container}>
        {/* Upload overlay */}
        {isUploading && (
          <View style={styles.uploadingOverlay}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.uploadingText}>Uploading photo...</Text>
          </View>
        )}

        {/* 1. Top Header Component */}
        <TopHeader />
        {/* School info */}
        {/* <SchoolDisplay /> */}
        {/* 2. Camera Component (handles camera view, controls, and image preview) */}
        <CameraComponent
          onPhotoTaken={handlePhotoTaken} //Action to take photo
          onPhotoSent={handlePhotoSent} //Action to send photo
          capturedImage={capturedImage} //Action to store photo temporary
          onRetakePhoto={handleRetakePhoto} //Action to cancel and retake photo
          messageText={messageText} //Action to add message
          onMessageChange={handleMessageChange} //
          isUploading={isUploading} //Action to anounce uploading state
        />

        {/* 3. Audience Selector Component */}
        <View style={styles.AudienceSelector}>
          <AudienceSelector
            targetAudience={targetAudience}
            onAudienceChange={handleAudienceChange}
          />
        </View>
        {/* 4. Feed Button Component */}
        <View style={styles.FeedButton}>
          <Button
            width={wp(90)}
            height={hp(4)}
            fontSize={hp(3)}
            title='TAP TO SHOW OTHER TAP'
            onPress={() =>
              router.push({
                pathname: './postView',
                params: { targetAudience },
              })
            }
            top={-hp(.3)}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundLight,
  },

  // Permission & Loading Styles
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
  schoolDisplay: {
    alignSelf: 'center',
    fontFamily: 'VT323',
  },
  AudienceSelector: {
    position: 'absolute',
    top: hp(82),
    alignSelf: 'center'
  },
  FeedButton: {
    position: 'absolute',
    alignSelf: 'center',
    top: hp(84)
  },
  // Upload Overlay
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  uploadingText: {
    color: 'white',
    fontSize: hp(2),
    marginTop: 10,
    textAlign: 'center',
  },
  
});