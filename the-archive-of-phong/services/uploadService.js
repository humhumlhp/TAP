// services/uploadService.js
import { supabase } from '../lib/supabase';

class UploadService {
  /**
   * Upload image to Supabase Storage and create a post
   * @param {string} imageUri - Local image URI
   * @param {string} messageText - Post body text
   * @param {string} targetAudience - 'yourself', 'class', or 'school'
   * @param {string} userId - Current user ID
   * @returns {Promise<Object>} - Upload result with post data
   */
  async uploadAndCreatePost(imageUri, messageText, targetAudience, userId) {
    try {
      console.log('Starting upload process...', { imageUri, targetAudience, userId });

      // Step 1: Get user data to determine school and class
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('school, class, name')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
        throw new Error('Failed to fetch user information');
      }

      if (!userData) {
        throw new Error('User not found');
      }

      console.log('User data:', userData);

      // Step 2: Upload image to Supabase Storage
      const imageUrl = await this.uploadImage(imageUri, userId);
      console.log('Image uploaded successfully:', imageUrl);

      // Step 3: Create post in database
      // Map audience types to database values
      let dbAudienceType;
      switch (targetAudience) {
        case 'yourself':
          dbAudienceType = 'personal'; // Database expects 'personal'
          break;
        case 'class':
          dbAudienceType = 'class';
          break;
        case 'school':
          dbAudienceType = 'school';
          break;
        default:
          dbAudienceType = 'personal';
      }

      const postData = {
        body: messageText || '', // Use empty string if no message
        file: imageUrl,
        userId: userId, // Use camelCase consistently
        audience_type: dbAudienceType
      };

      console.log('Creating post with data:', postData);

      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert(postData)
        .select()
        .single();

      if (postError) {
        console.error('Error creating post:', postError);
        // Try to cleanup uploaded image if post creation fails
        await this.deleteImage(imageUrl);
        throw new Error(`Failed to create post: ${postError.message}`);
      }

      console.log('Post created successfully:', post);

      // Step 4: Calculate audience count for user feedback
      const audienceCount = await this.calculateAudienceCount(targetAudience, userData);

      return {
        success: true,
        post: post,
        audienceCount: audienceCount,
        imageUrl: imageUrl
      };

    } catch (error) {
      console.error('Upload and create post error:', error);
      throw error;
    }
  }

  /**
   * Upload image to Supabase Storage
   * @param {string} imageUri - Local image URI
   * @param {string} userId - Current user ID
   * @returns {Promise<string>} - Public URL of uploaded image
   */
  async uploadImage(imageUri, userId) {
    try {
      console.log('Starting image upload...', imageUri);

      // Create unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const fileName = `${userId}/${timestamp}_${randomString}.jpg`;

      console.log('Generated filename:', fileName);

      // Create file object for React Native
      const fileObject = {
        uri: imageUri,
        type: 'image/jpeg',
        name: `${timestamp}_${randomString}.jpg`,
      };
      
      console.log('File object created:', fileObject);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('posts')
        .upload(fileName, fileObject, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (error) {
        console.error('Storage upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      console.log('Storage upload successful:', data);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('posts')
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;
      console.log('Public URL generated:', publicUrl);

      return publicUrl;

    } catch (error) {
      console.error('Image upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  /**
   * Delete image from Supabase Storage (cleanup on failed post creation)
   * @param {string} imageUrl - Public URL of the image to delete
   */
  async deleteImage(imageUrl) {
    try {
      // Extract filename from URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const userFolder = urlParts[urlParts.length - 2];
      const fullPath = `${userFolder}/${fileName}`;

      const { error } = await supabase.storage
        .from('posts')
        .remove([fullPath]);

      if (error) {
        console.error('Error deleting image:', error);
      } else {
        console.log('Image deleted successfully:', fullPath);
      }
    } catch (error) {
      console.error('Delete image error:', error);
    }
  }

  /**
   * Calculate audience count for user feedback
   * @param {string} targetAudience - 'yourself', 'class', or 'school'
   * @param {Object} userData - User data with school and class info
   * @returns {Promise<number>} - Estimated audience count
   */
  async calculateAudienceCount(targetAudience, userData) {
    try {
      let query = supabase.from('users').select('id', { count: 'exact', head: true });

      switch (targetAudience) {
        case 'school':
          if (userData.school) {
            query = query.eq('school', userData.school);
          }
          break;
        case 'class':
          if (userData.school && userData.class) {
            query = query.eq('school', userData.school).eq('class', userData.class);
          }
          break;
        case 'yourself':
          return 1; // Just the user themselves
        default:
          return 1;
      }

      const { count, error } = await query;

      if (error) {
        console.error('Error calculating audience count:', error);
        return 1; // Fallback to 1
      }

      return count || 1;

    } catch (error) {
      console.error('Calculate audience count error:', error);
      return 1; // Fallback to 1
    }
  }

  /**
   * Fetch posts based on user's audience criteria - CORRECTED LOGIC
   * @param {string} userId - Current user ID
   * @param {string} audienceFilter - 'all', 'school', 'class', or 'yourself'
   * @returns {Promise<Array>} - Array of posts with user data
   */
  async fetchPosts(userId, audienceFilter = 'all') {
    try {
      console.log('Fetching posts with filter:', audienceFilter, 'for user:', userId);

      // Get current user data first
      const { data: currentUser, error: userError } = await supabase
        .from('users')
        .select('school, class')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error fetching current user:', userError);
        return [];
      }

      if (!currentUser) {
        console.log('No current user found');
        return [];
      }

      console.log('Current user data:', currentUser);

      let query = supabase
        .from('posts')
        .select(`
          *,
          users!posts_userId_fkey (
            id,
            name,
            image,
            school,
            class
          )
        `)
        .order('created_at', { ascending: false });

      // Apply simple audience filtering
      switch (audienceFilter) {
        case 'yourself':
          // Only user's own personal posts
          query = query
            .eq('userId', userId)
            .eq('audience_type', 'personal');
          break;

        case 'class':
          // Only posts with audience_type = 'class' from same class
          query = query.eq('audience_type', 'class');
          break;

        case 'school':
          // Only posts with audience_type = 'school' from same school
          query = query.eq('audience_type', 'school');
          break;

        case 'all':
        default:
          // All posts (no filtering)
          break;
      }

      const { data: posts, error } = await query;

      if (error) {
        console.error('Error fetching posts:', error);
        return [];
      }

      let filteredPosts = posts || [];

      // Apply user-based filtering after the query
      if (audienceFilter === 'class' && currentUser.school && currentUser.class) {
        // Filter class posts to only show from same school and class
        filteredPosts = filteredPosts.filter(post => 
          post.users?.school === currentUser.school && 
          post.users?.class === currentUser.class
        );
      } else if (audienceFilter === 'school' && currentUser.school) {
        // Filter school posts to only show from same school
        filteredPosts = filteredPosts.filter(post => 
          post.users?.school === currentUser.school
        );
      }

      console.log('Fetched posts count:', filteredPosts.length);
      return filteredPosts;

    } catch (error) {
      console.error('Fetch posts error:', error);
      return [];
    }
  }
}

// Export singleton instance
export const uploadService = new UploadService();