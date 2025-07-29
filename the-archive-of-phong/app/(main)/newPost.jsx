import { StyleSheet, Text, View, Image, Pressable, ActivityIndicator, Alert } from 'react-native';
import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../constants/theme';

const NewPost = () => {
  const { user } = useAuth();
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    if (!image) return;
    try {
      setUploading(true);
      const response = await fetch(image);
      const blob = await response.blob();
      const fileName = `${user.id}_${Date.now()}.jpg`;
      let { data, error } = await supabase.storage
        .from('photos')
        .upload(fileName, blob, { contentType: 'image/jpeg' });
      if (error) throw error;
      const imageUrl = supabase.storage.from('photos').getPublicUrl(fileName).data.publicUrl;
      await savePost(user.id, imageUrl);
      Alert.alert('Success', 'Photo uploaded!');
      setImage(null);
    } catch (err) {
      Alert.alert('Upload error', err.message);
    } finally {
      setUploading(false);
    }
  };

  const savePost = async (userId, imageUrl) => {
    const { error } = await supabase
      .from('posts')
      .insert([{ user_id: userId, image_url: imageUrl, created_at: new Date() }]);
    if (error) throw error;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Post</Text>
      <Pressable style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>Take a Photo</Text>
      </Pressable>
      {image && (
        <Image source={{ uri: image }} style={styles.preview} />
      )}
      {image && !uploading && (
        <Pressable style={styles.button} onPress={uploadImage}>
          <Text style={styles.buttonText}>Upload</Text>
        </Pressable>
      )}
      {uploading && <ActivityIndicator size="large" color={theme.colors.primary} />}
    </View>
  );
};

export default NewPost;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  preview: {
    width: 250,
    height: 250,
    borderRadius: 10,
    marginVertical: 20,
  },
});