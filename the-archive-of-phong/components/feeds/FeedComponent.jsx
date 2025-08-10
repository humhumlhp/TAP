// components/feeds/FeedComponent.jsx - Simple Camera-like Layout
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Dimensions,
  FlatList
} from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { hp, wp } from '../../helpers/common';
import ScreenWrapper from '../ScreenWrapper';
import { uploadService } from '../../services/uploadService';
import TopHeader from '../TopHeader';
import Button from '../Button';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const FeedComponent = ({
  targetAudience,
  user,
  showFeed,
  onCloseFeed
}) => {
  const [posts, setPosts] = useState([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  // Load posts when component mounts or audience changes
  useEffect(() => {
    if (showFeed) {
      loadPosts();
    }
  }, [targetAudience, showFeed]);

  // Load posts function - Filter by selected audience
  const loadPosts = async () => {
    try {
      setFeedLoading(true);
      console.log('Loading posts for user:', user?.id, 'audience:', targetAudience);

      // Use the selected audience for filtering
      const audienceFilter = targetAudience === 'yourself' ? 'yourself' : targetAudience;
      const fetchedPosts = await uploadService.fetchPosts(user?.id, audienceFilter);

      console.log('Fetched posts:', fetchedPosts);
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
      setPosts([]);
    } finally {
      setFeedLoading(false);
    }
  };

  // Handle scroll to track current post
  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.y;
    const index = Math.round(scrollPosition / SCREEN_HEIGHT);
    setCurrentIndex(index);
  };

  // Render individual post (simple camera-like layout)
  const renderPost = ({ item: post, index }) => (
    <View style={styles.container}>
      {/* Close button - Top right (like camera) */}
      <TouchableOpacity style={styles.closeButton} onPress={onCloseFeed}>
        <Ionicons name="close" size={40} color="white" />
      </TouchableOpacity>

      {/* Main Image Area - Same size and position as camera */}
      <View style={styles.mainImageArea}>
        <Image
          source={{ uri: post.file }}
          style={styles.postImage}
          contentFit="cover"
        />

        {/* Post message overlay (like camera message input) */}
        {post.body && (
          <View style={styles.messageOverlay}>
            <Text style={styles.messageText}>{post.body}</Text>
          </View>
        )}
      </View>

      {/* Bottom info - Same position as camera controls */}
      <View style={styles.bottomInfo}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={20} color="white" />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.username}>
              {post.users?.name || 'Unknown User'}
            </Text>
            <Text style={styles.userClass}>
              {post.users?.class || '12TAP'}
            </Text>
          </View>
        </View>

        <Text style={styles.postDate}>
          {new Date(post.created_at).toLocaleDateString('vi-VN')}
        </Text>
      </View>

      {/* Post indicator - Bottom center */}
      {posts.length > 1 && (
        <View style={styles.indicatorContainer}>
          <Text style={styles.indicatorText}>
            {index + 1} / {posts.length}
          </Text>
        </View>
      )}
    </View>
  );

  // Function to get feed title based on audience
  const getFeedTitle = () => {
    switch (targetAudience) {
      case 'yourself': return 'Your Photos';
      case 'class': return 'Class Photos';
      case 'school': return 'School Photos';
      default: return 'Posts';
    }
  };

  // If feed is not showing, don't render anything
  if (!showFeed) {
    return null;
  }

  // Loading state
  if (feedLoading) {
    return (
      <ScreenWrapper bg='black'>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Loading {getFeedTitle().toLowerCase()}...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <ScreenWrapper bg='black'>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={onCloseFeed}>
            <Ionicons name="close" size={40} color="white" />
          </TouchableOpacity>

          <View style={styles.emptyContainer}>
            <Ionicons name="images-outline" size={80} color="rgba(255,255,255,0.3)" />
            <Text style={styles.emptyTitle}>No posts yet</Text>
            <Text style={styles.emptySubtext}>
              {targetAudience === 'yourself'
                ? 'Take a photo to start your collection!'
                : `No ${targetAudience} photos available yet.`}
            </Text>
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  // Main feed with posts
  return (
    <ScreenWrapper bg='black'>
      <TopHeader />
      <FlatList
        ref={flatListRef}
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id.toString()}
        pagingEnabled={true}
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.flatList}
      />
    </ScreenWrapper>
  );
};

// Feed Button Component (for when feed is not showing)
export const FeedButton = ({ onShowFeed }) => {
  return (
    <View style={styles.swipeIndicator}>
      <Button
       onPress={onShowFeed} 
       width={wp(90)}
       height={hp(5)}
       title = 'TAP TO SHOW OTHER TAP'
       fontSize={hp(2.8)}
       >
      </Button>
    </View>
  );
};

export default FeedComponent;

const styles = StyleSheet.create({
  // Main container - Same as camera
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: 'black',
  },

  flatList: {
    flex: 1,
  },

  // Close button - Top right (same position as camera)
  closeButton: {
    position: 'absolute',
    top: hp(65),
    width: 80,
    height: 80,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },

  // Main Image Area - Same as camera view
  mainImageArea: {
    width: '100%',
    aspectRatio: 1,
    marginVertical: hp(1),
    overflow: 'hidden',
    alignSelf: 'center',
    position: 'relative',
    borderRadius: wp(15)
  },

  // Post Image - Fills the image area
  postImage: {
    width: '100%',
    height: '100%',
  },

  // Message overlay - Same position as camera message input
  messageOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },

  messageText: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    fontSize: hp(1.8),
    textAlign: 'center',
  },

  // Bottom info - Same position as camera controls
  bottomInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(10),
    paddingVertical: hp(3),
  },

  // User info section
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  userDetails: {
    gap: 2,
  },

  username: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  userClass: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },

  // Post date
  postDate: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },

  // Post indicator - Bottom center
  indicatorContainer: {
    position: 'absolute',
    bottom: hp(1),
    left: 0,
    right: 0,
    alignItems: 'center',
  },

  indicatorText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },

  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },

  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 12,
  },

  // Empty state
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: hp(35)
  },

  emptyTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    // marginTop: 20,
    // marginBottom: 12,
    alignSelf: 'center',
  },

  emptySubtext: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },

  // Feed Button & Indicator (for main screen)
  swipeIndicator: {
    marginVertical: hp(2),
    alignItems: 'center',
    paddingBottom: hp(5),
  },
  feedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    gap: 8,
  },
  swipeText: {
    color: 'white',
    fontSize: hp(1.6),
    opacity: 0.9,
    
  },
});