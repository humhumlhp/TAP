// components/camera/CameraComponent.jsx
import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, TextInput, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { hp, wp } from '../../helpers/common';
import { useFocusEffect } from 'expo-router';

const CameraComponent = ({ 
  onPhotoTaken, 
  onPhotoSent, 
  capturedImage, 
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

  // Handle screen focus/unfocus to reinitialize camera
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

  // Take picture with 1:1 aspect ratio
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        
        const croppedUri = await cropImageToSquare(photo.uri, photo.width, photo.height);
        onPhotoTaken(croppedUri); // Call parent function with cropped image
        console.log('Photo taken and cropped:', croppedUri);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  // Function to crop image to 1:1 aspect ratio
  const cropImageToSquare = async (uri, width, height) => {
    try {
      const { manipulateAsync, SaveFormat } = await import('expo-image-manipulator');
      
      const size = Math.min(width, height);
      const originX = (width - size) / 2;
      const originY = (height - size) / 2;
      
      const croppedImage = await manipulateAsync(
        uri,
        [
          {
            crop: {
              originX,
              originY,
              width: size,
              height: size,
            },
          },
        ],
        { compress: 0.8, format: SaveFormat.JPEG }
      );
      
      return croppedImage.uri;
    } catch (error) {
      console.error('Error cropping image:', error);
      return uri;
    }
  };

  return (
    <View style={styles.container}>
      {/* Main Camera Area */}
      <View style={styles.mainCameraArea}>
        {capturedImage ? (
          <View style={styles.imagePreviewContainer}>
            <Image 
              source={{ uri: capturedImage }} 
              style={styles.imagePreview}
              contentFit="cover"
            />
            <View style={styles.messageInputContainer}>
              <TextInput
                style={styles.messageInput}
                placeholder="Nhập nội dung"
                placeholderTextColor="rgba(255,255,255,0.7)"
                value={messageText}
                onChangeText={onMessageChange}
                multiline={true}
                maxLength={50}
              />
            </View>
          </View>
        ) : (
          <View style={styles.cameraContainer}>
            {isScreenFocused && isCameraReady && (
              <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing={facing}
                flash={flash}
                mode="picture"
              />
            )}
          </View>
        )}
      </View>

      {/* Camera Controls */}
      {capturedImage ? (
        // Controls when image is captured
        <View style={styles.sendButtonContainer}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={onRetakePhoto}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.sendButton, isUploading && styles.sendButtonDisabled]}
            onPress={onPhotoSent}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="send" size={24} color="white" />
            )}
          </TouchableOpacity>

          <View style={styles.emptySpace} />
        </View>
      ) : (
        // Controls when camera is active
        <View style={styles.cameraControls}>
          <TouchableOpacity 
            style={styles.sideControlButton}
            onPress={toggleFlash}
          >
            <Ionicons 
              name={getFlashIcon()} 
              size={28} 
              color="white" 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.captureButton}
            onPress={takePicture}
          >
            <View style={styles.captureButtonOuter}>
              <View style={styles.captureButtonInner} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.sideControlButton}
            onPress={toggleCameraFacing}
          >
            <MaterialIcons name="flip-camera-ios" size={28} color="white" />
          </TouchableOpacity>
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
    width: '100%',
    aspectRatio: 1, // This ensures 1:1 ratio regardless of width
    marginVertical: hp(1),
    borderRadius: wp(15), // Remove border radius for true full width look
    overflow: 'hidden',
    borderWidth: 0, // Remove border for full width
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
    bottom: 20,
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
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
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
    paddingVertical: hp(3),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  sendButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
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