// Your existing postView.jsx - with mock data for testing
import { FlatList, StyleSheet, Text, View, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { theme } from '../../constants/theme'
import Button from '../../components/Button'
import { hp, wp } from '../../helpers/common'
import { router, useLocalSearchParams } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useFonts } from 'expo-font';
import { VT323_400Regular } from '@expo-google-fonts/vt323'
import Post from '../../components/feeds/Post.jsx'
import { uploadService } from '../../services/uploadService'
import { useAuth } from '../../contexts/AuthContext'


const postView = ({
  targetAudience: propAudience = 'school',
  user, // Default to mock user
}) => {
  // Prefer audience from navigation params
  const params = useLocalSearchParams();
  const routeAudience = typeof params?.targetAudience === 'string' ? params.targetAudience : undefined;
  const targetAudience = routeAudience || propAudience;
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
 
  const [fontsLoaded] = useFonts({
    VT323_400Regular
  });

    // � Load posts from Supabase via service
    const { user: authUser } = useAuth();

    const loadPosts = async () => {
      try {
        setLoading(true);

        // Determine current user id (prefer AuthContext, fallback to prop/mock)
        const currentUserId = authUser?.id || user?.id;
        if (!currentUserId) {
          console.warn('No authenticated user found. Cannot fetch posts.');
          setPosts([]);
          return;
        }

        // Map audience to service filter
        const validFilters = ['yourself', 'class', 'school'];
        const audienceFilter = validFilters.includes(targetAudience)
          ? targetAudience
          : 'all';

        const fetchedPosts = await uploadService.fetchPosts(currentUserId, audienceFilter);
        setPosts(Array.isArray(fetchedPosts) ? fetchedPosts : []);
        console.log(`Loaded ${fetchedPosts?.length || 0} posts for audience: ${targetAudience}`);

      } catch (error) {
        console.error('Error loading posts from Supabase:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }

  // Load posts when component mounts or targetAudience changes
  useEffect(() => {
    loadPosts();
  }, [targetAudience, authUser?.id]);

  // Mock refresh function
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  // 🔑 The render function that creates alternating layout
  const renderPost = ({ item, index }) => {
    return <Post item={item} index={index} />;
  };

  // 🔑 Key extractor for FlatList performance
  const keyExtractor = (item, index) => item.id?.toString() || index.toString();

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading fonts...</Text>
      </View>
    );
  }

  // Loading state
  if (loading) {
    return (
      <ScreenWrapper bg={theme.colors.backgroundLight}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Loading posts...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <ScreenWrapper bg={theme.colors.backgroundLight}>
        <View style={styles.backButtonContainer}>
          <Button
            width={wp(10)}
            height={wp(10)}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="black" />
          </Button>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No posts found for {targetAudience}</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper bg={theme.colors.backgroundLight}>
      <View style={styles.backButtonContainer}>
        <Button
          width={wp(10)}
          height={wp(10)}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="black" />
        </Button>
      </View>

      {/* Debug info - Remove this later */}
      <View style={styles.debugContainer}>
        <Text style={styles.debugText}>
          Showing {posts.length} posts • Audience: {targetAudience}
        </Text>
      </View>

      {/* 🔑 FLATLIST WITH ALTERNATING LAYOUT */}
      <FlatList
        data={posts}
        renderItem={renderPost} // This makes the alternating magic happen
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={5}
        windowSize={10} // set limit to render the item outside of view box
       
        // Pull to refresh
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </ScreenWrapper>
  )
}

export default postView

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonContainer: {
    position: 'absolute',
    top: hp(5),
    left: wp(5),
    zIndex: 10,
  },
  listContainer: {
    paddingTop: hp(15), // Space for back button + debug info
    paddingBottom: hp(5),
  },
  loadingText: {
    fontFamily: "VT323_400Regular",
    fontSize: hp(2.5),
    marginTop: hp(2),
    color: '#000',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: "VT323_400Regular",
    fontSize: hp(2.5),
    color: '#000',
  },
  // Debug container - Remove this later
  debugContainer: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: hp(1),
    marginTop: hp(8),
    marginHorizontal: wp(5),
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#000',
  },
  debugText: {
    fontFamily: "VT323_400Regular",
    fontSize: hp(1.8),
    color: '#000',
    textAlign: 'center',
  },
})