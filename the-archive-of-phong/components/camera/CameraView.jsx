import { StyleSheet, Text, View } from 'react-native'
import React, { useRef, useState } from 'react'
import { hp, wp } from '../../helpers/common'
import { useFocusEffect } from 'expo-router';

const CameraView = () => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [isScreenFocused, setIsScreenFocused] = useState(true);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const cameraRef = useRef(null);
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
      const takePicture = async () => {
              if (cameraRef.current) {
                  try {
                      const photo = await cameraRef.current.takePictureAsync({
                          quality: 0.8,
                          base64: false,
                      });
                      
                      const croppedUri = await cropImageToSquare(photo.uri, photo.width, photo.height);
                      setCapturedImage(croppedUri);
                      console.log('Photo taken and cropped:', croppedUri);
                  } catch (error) {
                      console.error('Error taking picture:', error);
                      Alert.alert('Error', 'Failed to take picture');
                  }
              }
          };
  return (
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
              onChangeText={setMessageText}
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
  )
}

export default CameraView

const styles = StyleSheet.create({
  mainCameraArea: {
    width: wp(100),
    height: wp(100),
    marginVertical: hp(1),
    // marginHorizontal: wp(),
    borderRadius: 70,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 1)',
    alignSelf: 'center',
  },
  imagePreviewContainer: {
    flex: 1,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
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

})