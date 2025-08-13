// components/feeds/post.jsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
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
  //  THE ALTERNATING LOGIC - This is the core concept
  const isEvenIndex = index % 2 === 0;
  const { user: authUser, setUserData } = useAuth();
  const handlePress = () => {
    router.push({
      pathname: '/(main)/postUno',
      params: {
        file: item?.file || '',
        name: item?.users?.name || '',
        klass: item?.users?.class || '',
        date: item?.created_at || '',
  body: item?.body || '',
  image: item?.users?.image || '',
      },
    });
  };

  return (
    <TouchableOpacity style={styles.postContainer} activeOpacity={0.85} onPress={handlePress}>
      {/* CONDITIONAL RENDERING - Changes based on index */}
      {isEvenIndex ? (
        // Posts 0, 2, 4, 6... → Image LEFT, Info RIGHT
        <>
          <View style={styles.imageContainer}>
            <View style={styles.shadowLayer} />
            <Image
              source={{ uri: item.file }}
              style={styles.postImage}
              contentFit="cover"
            />
          </View>
          <View style={styles.infoContainer}>
            <View style={styles.userDetailsContainer}>
              <View style={styles.userDetails}>
                <View style={styles.userAvatar}>
                  {item?.users?.image ? (
                    <Image
                      source={{ uri: item?.users?.image }}
                      style={styles.avatar}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={[styles.avatar, styles.center]}>
                      <Ionicons name='person' size={wp(10)} />
                    </View>
                  )}
                </View>
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
          </View>
        </>
      ) : (
        // Posts 1, 3, 5, 7... → Info LEFT, Image RIGHT
        <>
          <View style={styles.infoContainer}>
            <View style={styles.userDetailsContainer}>
              <View style={styles.userDetails}>
                <View style={styles.userAvatar}>
                  {authUser?.image ? (
                    <Image
                      source={{ uri: item?.users?.image }}
                      style={styles.avatar}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={[styles.avatar, styles.center]}>
                      <Ionicons name='person' size={hp(7)} />
                    </View>
                  )}
                </View>
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
          </View>
          <View style={styles.imageContainer}>
            <View style={styles.shadowLayer} />
            <Image
              source={{ uri: item.file }}
              style={styles.postImage}
              contentFit="cover"
            />
          </View>
        </>
      )}
    </TouchableOpacity>
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
  shadowLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
    transform: [{ translateX: 4 }, { translateY: 5 }],
    zIndex: 0,
    borderWidth: 2,
    borderColor: 'black'
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
  userAvatar:{
     position: 'relative',
    alignSelf: 'left',
  },
  avatar: {
    height: wp(16),
    width: wp(16),
    borderWidth: 1,
    backgroundColor: theme.colors.orange,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDetailsContainer: {
    width: wp(45),
    alignItems: 'center',
    justifyContent: 'center'
  },
  userDetails: {
    // Center the block within its container but keep text left-aligned inside
    alignSelf: 'center',
    alignItems: 'flex-start',
    width: '90%',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
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