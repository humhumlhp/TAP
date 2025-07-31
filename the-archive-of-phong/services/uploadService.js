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
        userId: userId, // Use camelCase userId to match your schema
        audience_type: dbAudienceType,
        created_at: new Date().toISOString()
      };

      console.log('Post data being inserted:', postData);

      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert([postData])
        .select()
        .single();

      if (postError) {
        console.error('Error creating post:', postError);
        // If post creation fails, try to delete the uploaded image
        await this.deleteImage(imageUrl);
        throw new Error('Failed to create post');
      }

      console.log('Post created successfully:', post);

      // Step 4: Calculate audience count for user feedback
      const audienceCount = await this.calculateAudienceCount(targetAudience, userData);

      return {
        post,
        imageUrl,
        audienceCount,
        message: 'Post created successfully'
      };

    } catch (error) {
      console.error('Upload service error:', error);
      throw error;
    }
  }

  /**
   * Upload image file to Supabase Storage (React Native optimized)
   * @param {string} imageUri - Local image URI
   * @param {string} userId - User ID for organizing files
   * @returns {Promise<string>} - Public URL of uploaded image
   */
  async uploadImage(imageUri, userId) {
    try {
      // Create a unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileName = `${userId}/${timestamp}_${randomString}.jpg`;

      console.log('Uploading image with filename:', fileName);
      console.log('Image URI:', imageUri);

      // React Native specific file upload using FormData
      const formData = new FormData();
      
      // React Native file object for FormData
      const fileObject = {
        uri: imageUri,
        type: 'image/jpeg',
        name: `${timestamp}_${randomString}.jpg`,
      };
      
      formData.append('file', fileObject);
      console.log('FormData created with file object:', fileObject);

      // For React Native, we need to use the file object directly, not FormData
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
   * Fetch posts based on user's audience criteria
   * @param {string} userId - Current user ID
   * @param {string} audienceFilter - 'all', 'school', 'class', or 'yourself'
   * @returns {Promise<Array>} - Array of posts with user data
   */
  async fetchPosts(userId, audienceFilter = 'all') {
    try {
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

      // Apply audience filtering
      switch (audienceFilter) {
        case 'yourself':
          query = query.eq('userId', userId); // Use camelCase consistently
          break;
        case 'class':
          // Show posts from same class or personal posts by user
          query = query.or(`and(audience_type.eq.class,users.school.eq.${currentUser.school},users.class.eq.${currentUser.class}),and(audience_type.eq.personal,userId.eq.${userId})`);
          break;
        case 'school':
          // Show posts from same school or personal posts by user
          query = query.or(`and(audience_type.eq.school,users.school.eq.${currentUser.school}),and(audience_type.eq.class,users.school.eq.${currentUser.school},users.class.eq.${currentUser.class}),and(audience_type.eq.personal,userId.eq.${userId})`);
          break;
        case 'all':
        default:
          // Show all posts user has access to based on their school/class
          query = query.or(`and(audience_type.eq.school,users.school.eq.${currentUser.school}),and(audience_type.eq.class,users.school.eq.${currentUser.school},users.class.eq.${currentUser.class}),and(audience_type.eq.personal,userId.eq.${userId})`);
          break;
      }

      const { data: posts, error } = await query;

      if (error) {
        console.error('Error fetching posts:', error);
        return [];
      }

      return posts || [];

    } catch (error) {
      console.error('Fetch posts error:', error);
      return [];
    }
  }
}

// Export singleton instance
export const uploadService = new UploadService();