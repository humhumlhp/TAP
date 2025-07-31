// components/PostFeed.js
import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, Image, StyleSheet } from 'react-native';
import { uploadService } from '../services/uploadService';
import { useAuth } from '../contexts/AuthContext';

const PostFeed = ({ audienceFilter = 'all' }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, [audienceFilter]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const fetchedPosts = await uploadService.fetchPosts(user.id, audienceFilter);
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderPost = ({ item }) => (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <Text style={styles.authorName}>{item.users?.name || 'Unknown'}</Text>
        <Text style={styles.audienceType}>{item.audience_type}</Text>
      </View>
      <Image source={{ uri: item.file }} style={styles.postImage} />
      {item.body && <Text style={styles.postBody}>{item.body}</Text>}
      <Text style={styles.postDate}>
        {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </View>
  );

  if (loading) {
    return <Text>Loading posts...</Text>;
  }

  return (
    <FlatList
      data={posts}
      renderItem={renderPost}
      keyExtractor={(item) => item.id.toString()}
      onRefresh={loadPosts}
      refreshing={loading}
    />
  );
};

const styles = StyleSheet.create({
  postContainer: {
    margin: 10,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  authorName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  audienceType: {
    color: 'gray',
    fontSize: 12,
  },
  postImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 10,
  },
  postBody: {
    fontSize: 14,
    marginBottom: 10,
  },
  postDate: {
    color: 'gray',
    fontSize: 12,
  },
});

export default PostFeed;