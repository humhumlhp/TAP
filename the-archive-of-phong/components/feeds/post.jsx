// components/feeds/post.jsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';

const Post = ({ item, index }) => {
  // 🔑 THE ALTERNATING LOGIC - This is the core concept
  const isEvenIndex = index % 2 === 0;
  
  return (
    <View style={styles.postContainer}>
      {/* 🔄 CONDITIONAL RENDERING - Changes based on index */}
      {isEvenIndex ? (
        // Posts 0, 2, 4, 6... → Image LEFT, Info RIGHT
        <>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.file }}
              style={styles.postImage}
              contentFit="cover"
            />
          </View>
          <View style={styles.infoContainer}>
            <View style={styles.userIcon}>
              <Ionicons name="person" size={24} color="#000" />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.detailText}>name: {item.users?.name || 'Unknown'}</Text>
              <Text style={styles.detailText}>class: {item.users?.class || '12CL1'}</Text>
              <Text style={styles.detailText}>date: {new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
          </View>
        </>
      ) : (
        // Posts 1, 3, 5, 7... → Info LEFT, Image RIGHT
        <>
          <View style={styles.infoContainer}>
            <View style={styles.userIcon}>
              <Ionicons name="person" size={24} color="#000" />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.detailText}>name: {item.users?.name || 'Unknown'}</Text>
              <Text style={styles.detailText}>class: {item.users?.class || '12CL1'}</Text>
              <Text style={styles.detailText}>date: {new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
          </View>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.file }}
              style={styles.postImage}
              contentFit="cover"
            />
          </View>
        </>
      )}
    </View>
  );
};

export default Post;

const styles = StyleSheet.create({
  postContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: hp(15),
    backgroundColor: theme.colors.orange || '#f5f3e7',
    marginHorizontal: wp(5),
    marginBottom: hp(2),
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#000',
  },
  imageContainer: {
    flex: 1,
    margin: wp(2),
  },
  postImage: {
    height: hp(12),
    width: hp(12),
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#000',
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(3),
  },
  userIcon: {
    marginRight: wp(3),
    padding: wp(2),
  },
  userDetails: {
    flex: 1,
  },
  detailText: {
    fontFamily: "VT323_400Regular",
    fontSize: hp(2),
    fontWeight: 'bold',
    color: '#000',
    marginBottom: hp(0.5),
  },
});