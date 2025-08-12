// components/camera/CameraComponent.jsx
import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, TextInput, ActivityIndicator, Animated, InteractionManager } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import * as MediaLibrary from 'expo-media-library';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { hp, wp } from '../../helpers/common';
import { useFocusEffect } from 'expo-router';
import { manipulateAsync, SaveFormat, FlipType } from 'expo-image-manipulator'; 
import Button from '../Button';
import { useFonts } from 'expo-font';
import { VT323_400Regular } from '@expo-google-fonts/vt323'
import { theme } from '../../constants/theme';
const CameraComponent = ({
  onPhotoTaken,
  onPhotoSent,
  capturedImage, // legacy (will be ignored in new flow; we use internal state)
  onRetakePhoto,
  messageText,
  onMessageChange,
  isUploading
}) => {
  const cameraRef = useRef(null);
  const [facing, setFacing] = useState('back');
  const [flash, setFlash] = useState('off');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isScreenFocused, setIsScreenFocused] = useState(true);
  const [capturedImageUri, setCapturedImageUri] = useState(null); // fast preview (raw then processed)
  const previewOpacity = useRef(new Animated.Value(0)).current;

  const [fontsLoaded] = useFonts({ VT323_400Regular });

  // IMPORTANT: All hooks must run on every render in the same order.
  // The previous version returned early BEFORE calling useFocusEffect when fonts weren't loaded yet,
  // causing "Rendered more hooks than during the previous render" once fontsLoaded became true.
  // We move/use the hook before any conditional return so hook order stays stable.
  useFocusEffect(
    React.useCallback(() => {
      setIsScreenFocused(true);
      setIsCameraReady(false);

      const timer = setTimeout(() => {
        setIsCameraReady(true);
      }, 100);

      return () => {
        setIsScreenFocused(false);
        setIsCameraReady(false);
        clearTimeout(timer);
      };
    }, [])
  );

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading fonts...</Text>
      </View>
    );
  }

  // Toggle camera facing (front/back)
  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  // Toggle flash
  const toggleFlash = () => {
    setFlash(current => {
      switch (current) {
        case 'off': return 'on';
        case 'on': return 'off';
        default: return 'off';
      }
    });
  };

  // Get flash icon based on current flash mode
  const getFlashIcon = () => {
    switch (flash) {
      case 'on': return 'flash';
      case 'off': return 'flash-off';
      default: return 'flash-off';
    }
  };

  const cropImageToSquare = async (uri, width, height) => {
    try {
      const size = Math.min(width, height);
      const originX = (width - size) / 2;
      const originY = (height - size) / 2;
      const result = await manipulateAsync(
        uri,
        [{ crop: { originX, originY, width: size, height: size } }],
        { compress: 0.9, format: SaveFormat.JPEG }
      );
      return result.uri;
    } catch (e) {
      console.warn('Crop failed:', e);
      return uri;
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        skipProcessing: true,
        base64: false,
      });

      // Instant raw preview - flip front camera immediately for consistency
      let initialUri = photo.uri;
      if (facing === 'front') {
        try {
          const quickFlipped = await manipulateAsync(
            photo.uri,
            [{ flip: FlipType.Horizontal }],
            { compress: 0.9, format: SaveFormat.JPEG }
          );
          initialUri = quickFlipped.uri;
        } catch (e) {
          console.warn('Quick flip failed, using original', e);
        }
      }
      setCapturedImageUri(initialUri);
      previewOpacity.setValue(1); // Instant, no fade animation

      InteractionManager.runAfterInteractions(async () => {
        // Crop the already-flipped image (for front camera) or raw image (for back camera)
        const cropped = await cropImageToSquare(initialUri, photo.width, photo.height);
        setCapturedImageUri(cropped);
        onPhotoTaken && onPhotoTaken(cropped);
      });
    } catch (e) {
      console.error('Error taking picture:', e);
    }
  };

  const handleRetake = () => {
    previewOpacity.setValue(0);
    setCapturedImageUri(null);
    onRetakePhoto && onRetakePhoto();
  };

  const hasImage = !!capturedImageUri;

  const handleDownload = async () => {
    if (!capturedImageUri) return;
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Media library permission not granted');
        return;
      }
  await MediaLibrary.createAssetAsync(capturedImageUri);
    } catch (e) {
      console.warn('Save failed:', e?.message || e);
    }
  };

  const handleSend = async () => {
    try {
      const result = await (onPhotoSent ? onPhotoSent() : Promise.resolve());
      // If parent didn't explicitly signal failure (return false or throw), reset to camera
      if (result !== false) {
        handleRetake();
      }
    } catch (e) {
      // Keep preview on error
      console.warn('Send failed, keeping preview:', e?.message || e);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainCameraArea}>
        <View style={styles.cameraContainer}>
          {isScreenFocused && isCameraReady && (
            <CameraView
              ref={cameraRef}
              style={[styles.camera, hasImage && { opacity: 0 }]}
              facing={facing}
              flash={flash}
              mode="picture"
            />
          )}
          {hasImage && (
            <Animated.View style={[StyleSheet.absoluteFill, { opacity: previewOpacity }]}>
              <Image 
                source={{ uri: capturedImageUri }} 
                style={styles.imagePreview} 
                contentFit="cover"
                priority="high"
                cachePolicy="memory"
              />
              <View style={styles.messageInputContainer}>
                <TextInput
                  style={styles.messageInput}
                  placeholder="Nhập nội dung"
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  value={messageText}
                  onChangeText={onMessageChange}
                  multiline
                  maxLength={50}
                />
              </View>
            </Animated.View>
          )}
        </View>
      </View>

      {hasImage ? (
        <View style={styles.sendButtonContainer}>
          <Button
            width={wp(10)}
            height={wp(10)}
            onPress={handleRetake}
          >
            <Ionicons name="close" size={30} color="black" />
          </Button>

          <View style={styles.shadowContainer}>
            <View style={styles.shadow} />
            <TouchableOpacity
              style={[styles.sendButton, isUploading && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="send" size={45} color="black" />
              )}
            </TouchableOpacity>
          </View>
          <Button
            width={wp(10)}
            height={wp(10)}
            onPress={handleDownload}>
            <Ionicons name="download" size={30} color="black" />
          </Button>
        </View>
      ) : (
        <View style={styles.cameraControls}>
          <Button width={wp(10)} height={wp(10)} onPress={toggleFlash}>
            <Ionicons name={getFlashIcon()} size={28} color="black" />
          </Button>
          <Button width={wp(23)} height={wp(23)} onPress={takePicture} top={-wp(1)} title='TAP' fontSize={wp(15)} />
          <Button width={wp(10)} height={wp(10)} onPress={toggleCameraFacing}>
            <MaterialIcons name="flip-camera-ios" size={28} color="black" />
          </Button>
        </View>
      )}
    </View>
  );
};

export default CameraComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Main Camera Area - True full width, 1:1 aspect ratio
  mainCameraArea: {
    width: wp(90),
    aspectRatio: 1, // This ensures 1:1 ratio regardless of width
    marginVertical: hp(2),
    // borderRadius: wp(5), 
    overflow: 'hidden',
    borderWidth: 5,
    alignSelf: 'center',
  },
  cameraContainer: {
    flex: 1,
    width: '100%',

  },
  camera: {
    flex: 1,
  },

  // Image Preview
  imagePreviewContainer: {
    flex: 1,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 0, // Remove border radius for full width
  },

  // Message Input
  messageInputContainer: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    right: 20,
    alignItems: 'center'
  },
  messageInput: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    fontSize: hp(1.8),
    minHeight: 44,
    maxHeight: 100,
    textAlign: 'center'
  },

  // Camera Controls - Add horizontal padding here instead
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(10),
    paddingVertical: hp(4),
    // borderBottomWidth: 1,
    // borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  sideControlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: 'orange',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },

  // Send Button Container
  sendButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(10),
    paddingVertical: hp(4)
  },
  shadowContainer: {
    position: 'relative',
    alignSelf: 'center',

  },
  shadow: {
    position: 'absolute',
    top: 5,
    left: 4,
    right: -4,
    bottom: -5,
    backgroundColor: 'black'
  },
  sendButton: {
    width: wp(23),
    height: wp(23),
    borderWidth: 1,
    borderColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.orange,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  cancelButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  emptySpace: {
    width: 50,
    height: 50,
  },
});