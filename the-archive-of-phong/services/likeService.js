// services/likeService.js
import { supabase } from '../lib/supabase';

class LikeService {
  async getLikeCount(postId) {
    try {
      const { count, error } = await supabase
        .from('postLikes')
        .select('id', { count: 'exact', head: true })
        .eq('postId', postId);
      if (error) throw error;
      return count || 0;
    } catch (e) {
      console.log('getLikeCount error:', e);
      return 0;
    }
  }

  async hasUserLiked(postId, userId) {
    try {
      const { count, error } = await supabase
        .from('postLikes')
        .select('id', { count: 'exact', head: true })
        .eq('postId', postId)
        .eq('userId', userId);
      if (error) throw error;
      return (count || 0) > 0;
    } catch (e) {
      console.log('hasUserLiked error:', e);
      return false;
    }
  }

  async like(postId, userId) {
    const { error } = await supabase.from('postLikes').insert({ postId, userId });
    if (error) throw error;
  }

  async unlike(postId, userId) {
    const { error } = await supabase
      .from('postLikes')
      .delete()
      .eq('postId', postId)
      .eq('userId', userId);
    if (error) throw error;
  }

  // Toggle like and return { liked, count }
  async toggle(postId, userId) {
    const liked = await this.hasUserLiked(postId, userId);
    if (liked) {
      await this.unlike(postId, userId);
    } else {
      await this.like(postId, userId);
    }
    const count = await this.getLikeCount(postId);
    return { liked: !liked, count };
  }
}

export const likeService = new LikeService();
