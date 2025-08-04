// components/feeds/FeedComponent.jsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  ScrollView, 
  ActivityIndicator 
} from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { hp, wp } from '../../helpers/common';
import ScreenWrapper from '../ScreenWrapper';
import { uploadService } from '../../services/uploadService';

const FeedComponent = ({ 
  targetAudience, 
  user, 
  showFeed, 
  onCloseFeed 
}) => {
  const [posts, setPosts] = useState([]);
  const [feedLoading, setFeedLoading] = useState(false);

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

  // Function to get feed title based on audience
  const getFeedTitle = () => {
    switch (targetAudience) {
      case 'yourself': return 'Your Photos';
      case 'class': return 'Class Photos';
      case 'school': return 'School Photos';
      default: return 'Posts';
    }
  };

  // Function to get empty state message
  const getEmptyMessage = () => {
    if (targetAudience === 'yourself') {
      return 'Take a photo to start your collection!';
    }
    return `No ${targetAudience} photos available yet.`;
  };

  // If feed is not showing, don't render anything
  if (!showFeed) {
    return null;
  }

  return (
    <ScreenWrapper bg='black'>
      <View style={styles.feedContainer}>
        {/* Feed Header */}
        <View style={styles.feedHeader}>
          <Text style={styles.feedTitle}>
            {getFeedTitle()}
          </Text>
          <TouchableOpacity onPress={onCloseFeed}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* Feed Content */}
        {feedLoading ? (
          <View style={styles.feedLoading}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.feedLoadingText}>Loading posts...</Text>
          </View>
        ) : posts.length === 0 ? (
          <View style={styles.feedEmpty}>
            <Text style={styles.feedEmptyText}>No posts yet</Text>
            <Text style={styles.feedEmptySubtext}>
              {getEmptyMessage()}
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.feedContent}>
            {posts.map((post, index) => (
              <PostItem key={post.id} post={post} />
            ))}
          </ScrollView>
        )}
      </View>
    </ScreenWrapper>
  );
};

// Individual Post Item Component
const PostItem = ({ post }) => {
  return (
    <View style={styles.postItem}>
      <View style={styles.postHeader}>
        <Text style={styles.postAuthor}>
          {post.users?.name || 'Unknown User'}
        </Text>
        <Text style={styles.postAudience}>
          {post.audience_type}
        </Text>
      </View>
      
      <Image 
        source={{ uri: post.file }} 
        style={styles.postImage}
        contentFit="cover"
      />
      
      {post.body && (
        <Text style={styles.postBody}>{post.body}</Text>
      )}
      
      <Text style={styles.postDate}>
        {new Date(post.created_at).toLocaleDateString()}
      </Text>
    </View>
  );
};

// Feed Button Component (for when feed is not showing)
export const FeedButton = ({ onShowFeed }) => {
  return (
    <View style={styles.swipeIndicator}>
      <TouchableOpacity onPress={onShowFeed} style={styles.feedButton}>
        <Text style={styles.swipeText}>Tap to view posts</Text>
        <Ionicons name="images-outline" size={16} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default FeedComponent;

const styles = StyleSheet.create({
  // Feed Styles
  feedContainer: {
    flex: 1,
    backgroundColor: 'black',
    paddingTop: hp(2),
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(6),
    paddingBottom: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  feedTitle: {
    color: 'white',
    fontSize: hp(2.5),
    fontWeight: 'bold',
  },
  feedLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedLoadingText: {
    color: 'white',
    fontSize: hp(1.8),
    marginTop: 10,
  },
  feedEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(8),
  },
  feedEmptyText: {
    color: 'white',
    fontSize: hp(2.2),
    fontWeight: 'bold',
    marginBottom: 10,
  },
  feedEmptySubtext: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: hp(1.6),
    textAlign: 'center',
  },
  feedContent: {
    flex: 1,
    paddingHorizontal: wp(4),
  },
  
  // Post Item Styles
  postItem: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  postAuthor: {
    color: 'white',
    fontSize: hp(1.8),
    fontWeight: 'bold',
  },
  postAudience: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: hp(1.4),
    textTransform: 'capitalize',
  },
  postImage: {
    width: '100%',
    height: wp(80),
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  postBody: {
    color: 'white',
    fontSize: hp(1.6),
    padding: 15,
    paddingTop: 10,
  },
  postDate: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: hp(1.2),
    paddingHorizontal: 15,
    paddingBottom: 15,
  },

  // Feed Button & Indicator
  swipeIndicator: {
    alignItems: 'center',
    paddingBottom: hp(7),
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