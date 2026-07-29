require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';

let supabase = null;

if (supabaseUrl && supabaseUrl.startsWith('http')) {
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false
      }
    });
  } catch (e) {
    console.warn('Supabase initialization warning:', e.message);
  }
} else {
  console.warn('⚠️ Supabase URL or Service Role Key missing in environment variables.');
}

const isSupabaseConfigured = () => !!supabase;

function formatPost(row) {
  if (!row) return null;

  const joinedAuthor = Array.isArray(row.author) ? row.author[0] : (row.author || row.users || row.user || {});
  const displayName = joinedAuthor.display_name || joinedAuthor.full_name || joinedAuthor.name || row.author_name || '';
  const avatarUrl = joinedAuthor.avatar_url || joinedAuthor.avatar || row.author_avatar || null;
  const authorTitle = joinedAuthor.title || joinedAuthor.role || joinedAuthor.bio || row.author_title || row.author_role || row.author_bio || '';
  const roleTag = joinedAuthor.role || joinedAuthor.title || joinedAuthor.bio || row.author_role || row.author_title || row.author_bio || '';
  const authorEmail = joinedAuthor.email || row.author_email || '';

  return {
    _id: row.id,
    id: row.id,
    author_id: row.author_id || row.user_id || row.created_by,
    user_id: row.user_id || row.author_id || row.created_by,
    postType: row.post_type || 'image_text',
    title: row.title || '',
    slug: row.slug || '',
    summary: row.summary || row.excerpt || '',
    content: row.content || '',
    coverImage: row.cover_image || '',
    category: row.category || 'Daily Reflection',
    tags: Array.isArray(row.tags) ? row.tags : [],
    author: {
      display_name: displayName,
      avatar_url: avatarUrl,
      title: authorTitle,
      role: roleTag,
      name: displayName,
      avatar: avatarUrl,
      bio: roleTag,
      email: authorEmail
    },
    status: row.status || 'published',
    publishedAt: row.published_at || row.created_at,
    published_at: row.published_at || row.created_at,
    created_at: row.created_at || row.published_at,
    createdAt: row.created_at || row.published_at,
    views: row.views || 0,
    likes: row.likes || 0,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    updatedAt: row.updated_at
  };
}

function toSupabasePostPayload(data) {
  const payload = {};
  if (data.postType !== undefined || data.post_type !== undefined) payload.post_type = data.postType || data.post_type;
  if (data.title !== undefined) payload.title = data.title;
  if (data.slug !== undefined) payload.slug = data.slug;
  if (data.summary !== undefined) payload.summary = data.summary;
  if (data.content !== undefined) payload.content = data.content;
  if (data.coverImage !== undefined || data.cover_image !== undefined) payload.cover_image = data.coverImage || data.cover_image;
  if (data.category !== undefined) payload.category = data.category;
  if (data.tags !== undefined) payload.tags = Array.isArray(data.tags) ? data.tags : [];
  if (data.author) {
    if (data.author.name) payload.author_name = data.author.name;
    if (data.author.email) payload.author_email = data.author.email;
  }
  if (data.status !== undefined) payload.status = data.status;
  if (data.publishedAt !== undefined || data.published_at !== undefined) payload.published_at = data.publishedAt || data.published_at;
  if (data.readTime !== undefined || data.read_time !== undefined) payload.read_time = data.readTime || data.read_time;
  if (data.views !== undefined) payload.views = data.views;
  if (data.likes !== undefined) payload.likes = data.likes;
  if (data.seoTitle !== undefined) payload.seo_title = data.seoTitle;
  if (data.seoDescription !== undefined) payload.seo_description = data.seoDescription;
  return payload;
}

function formatUser(row) {
  if (!row) return null;
  const name = row.full_name || row.name || 'Authorized Manager';
  const hasCustomName = name && name !== 'Google Admin User' && name !== 'Authorized Manager';
  // Existing accounts that already logged in or have a profile should never be repeatedly prompted for setup
  const isFirst = row.is_first_time !== undefined ? row.is_first_time : (hasCustomName ? false : false);

  return {
    _id: row.id,
    id: row.id,
    googleId: row.google_id || row.googleId,
    email: row.email,
    name: name,
    avatar: row.avatar || '',
    isAdmin: row.is_admin ?? row.isAdmin ?? true,
    secretVerified: row.secret_verified ?? row.secretVerified ?? false,
    isFirstTime: isFirst,
    lastLogin: row.last_login || row.lastLogin,
    createdAt: row.created_at || row.createdAt
  };
}

function formatSubscription(row) {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    endpoint: row.endpoint,
    keys: {
      p256dh: row.keys_p256dh,
      auth: row.keys_auth
    },
    userAgent: row.user_agent,
    subscribedAt: row.subscribed_at
  };
}

module.exports = {
  supabase,
  isSupabaseConfigured,
  formatPost,
  toSupabasePostPayload,
  formatUser,
  formatSubscription
};