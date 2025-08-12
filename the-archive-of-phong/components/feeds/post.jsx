// components/feeds/post.jsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';

// Format date as dd/mm/yy
const formatDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d)) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
};

const Post = ({ item, index }) => {
  // 🔑 THE ALTERNATING LOGIC - This is the core concept
  const isEvenIndex = index % 2 === 0;
  
  return (
    <View style={styles.postContainer}>
      {/* CONDITIONAL RENDERING - Changes based on index */}
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
            <View style={styles.userDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>name</Text>
                <Text style={styles.detailValue}>: {(item?.users?.name?.trim?.().split(/\s+/).pop()) || 'Unknown'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>class</Text>
                <Text style={styles.detailValue}>: {item?.users?.class || '12CL1'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>date</Text>
                <Text style={styles.detailValue}>: {formatDate(item.created_at)}</Text>
              </View>
            </View>
          </View>
        </>
      ) : (
        // Posts 1, 3, 5, 7... → Info LEFT, Image RIGHT
        <>
          <View style={styles.infoContainer}>
            <View style={styles.userDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>name</Text>
                <Text style={styles.detailValue}>: {(item?.users?.name?.trim?.().split(/\s+/).pop()) || 'Unknown'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>class</Text>
                <Text style={styles.detailValue}>: {item?.users?.class || '12CL1'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>date </Text>
                <Text style={styles.detailValue}>: {formatDate(item.created_at)}</Text>
              </View>
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
    minHeight: wp(45),
    marginHorizontal: wp(5),
    // marginBottom: hp(2),
  justifyContent: 'space-between'
  },
  imageContainer: {
  width: wp(45),
  },
  postImage: {
  width: '100%',
  height: wp(45),
    borderWidth: 2,
    borderColor: '#000',
  },
  infoContainer: {
  width: wp(45),
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center'
  },
  userDetails: {
    flex: 1,
    alignSelf: 'center',
    alignItems: 'flex-start',
    paddingLeft: wp(2)
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: wp(.1),
  },
  detailLabel: {
    fontFamily: "VT323_400Regular",
    fontSize: wp(6),
    color: '#000',
    width: wp(15),
    textAlign: 'left',
    paddingRight: wp(1),
  },
  detailValue: {
    fontFamily: "VT323_400Regular",
    fontSize: wp(6),
    color: '#000',
    flex: 1,
  },
});