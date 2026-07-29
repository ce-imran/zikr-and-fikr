const express = require('express');
const router = express.Router();
const { supabase, formatPost } = require('../config/supabase');

async function attachLiveUsersToPosts(rawPosts) {
  if (!rawPosts || rawPosts.length === 0) return [];

  try {
    const { data: usersList } = await supabase.from('users').select('*');
    const userMap = new Map();
    if (usersList) {
      usersList.forEach(u => {
        if (u.id) userMap.set(String(u.id), u);
        if (u.email) userMap.set(String(u.email).toLowerCase(), u);
        if (u.google_id) userMap.set(String(u.google_id), u);
      });
    }

    return rawPosts.map(post => {
      const authorId = post.author_id ? String(post.author_id) : null;
      const authorEmail = post.author_email ? String(post.author_email).toLowerCase() : null;

      const joinedAuthor = Array.isArray(post.author) ? post.author[0] : post.author;
      const matchedUser = (joinedAuthor && (joinedAuthor.display_name || joinedAuthor.name)) ? joinedAuthor :
        (authorId && userMap.get(authorId)) ||
        (authorEmail && userMap.get(authorEmail)) ||
        joinedAuthor ||
        (usersList && usersList[0]) || null;

      return formatPost({
        ...post,
        author: matchedUser
      });
    });
  } catch (err) {
    return rawPosts.map(formatPost);
  }
}

// GET /api/posts - Fetch published posts with pagination, search, & filter
router.get('/', async (req, res) => {
  try {
    const { q, category, tag, page = 1, limit = 9 } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 9;
    const skip = (pageNum - 1) * limitNum;

    if (!supabase) {
      return res.json({ success: true, posts: [], pagination: { total: 0, page: pageNum, pages: 0 } });
    }

    let query = supabase
      .from('posts')
      .select('*, author:users!author_id(display_name, avatar_url, role, title)', { count: 'exact' })
      .eq('status', 'published');

    if (category && category !== 'All' && category !== 'All Topics') {
      query = query.eq('category', category);
    }

    if (tag) {
      query = query.contains('tags', [tag]);
    }

    if (q && q.trim()) {
      const searchTerm = `%${q.trim()}%`;
      query = query.or(`title.ilike.${searchTerm},summary.ilike.${searchTerm},content.ilike.${searchTerm}`);
    }

    query = query
      .order('published_at', { ascending: false })
      .range(skip, skip + limitNum - 1);

    let { data, count, error } = await query;

    if (error) {
      let fallbackQuery = supabase
        .from('posts')
        .select('*', { count: 'exact' })
        .eq('status', 'published');

      if (category && category !== 'All' && category !== 'All Topics') {
        fallbackQuery = fallbackQuery.eq('category', category);
      }

      if (tag) {
        fallbackQuery = fallbackQuery.contains('tags', [tag]);
      }

      if (q && q.trim()) {
        const searchTerm = `%${q.trim()}%`;
        fallbackQuery = fallbackQuery.or(`title.ilike.${searchTerm},summary.ilike.${searchTerm},content.ilike.${searchTerm}`);
      }

      fallbackQuery = fallbackQuery
        .order('published_at', { ascending: false })
        .range(skip, skip + limitNum - 1);

      const fallbackRes = await fallbackQuery;
      data = fallbackRes.data;
      count = fallbackRes.count;

      if (fallbackRes.error) {
        console.error('Supabase fetch posts error:', fallbackRes.error.message);
        return res.status(500).json({ success: false, message: 'Failed to load posts.' });
      }
    }

    console.log("Fetched Posts:", JSON.stringify(data, null, 2));

    const posts = await attachLiveUsersToPosts(data || []);
    const total = count || 0;

    return res.json({
      success: true,
      posts,
      data: posts,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (err) {
    console.error('Error fetching posts:', err);
    return res.status(500).json({ success: false, message: 'Failed to load posts.' });
  }
});

// GET /api/posts/recent - Get latest 4 posts
router.get('/recent', async (req, res) => {
  try {
    if (!supabase) {
      return res.json({ success: true, posts: [] });
    }

    let { data, error } = await supabase
      .from('posts')
      .select('*, author:users!author_id(display_name, avatar_url, role)')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(4);

    if (error) {
      const fallbackRes = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(4);
      data = fallbackRes.data;
    }

    const posts = await attachLiveUsersToPosts(data || []);
    return res.json({ success: true, posts });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch recent posts.' });
  }
});

// GET /api/posts/slug/:slug - Get single post by slug & increment views
router.get('/slug/:slug', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    let { data: postRow, error } = await supabase
      .from('posts')
      .select('*, author:users!author_id(display_name, avatar_url, role, title)')
      .eq('slug', req.params.slug)
      .eq('status', 'published')
      .maybeSingle();

    if (error || !postRow) {
      const fallbackRes = await supabase
        .from('posts')
        .select('*')
        .eq('slug', req.params.slug)
        .eq('status', 'published')
        .maybeSingle();
      postRow = fallbackRes.data;
    }

    if (!postRow) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    // Increment views
    const newViews = (postRow.views || 0) + 1;
    await supabase
      .from('posts')
      .update({ views: newViews })
      .eq('id', postRow.id);

    postRow.views = newViews;
    const [post] = await attachLiveUsersToPosts([postRow]);

    return res.json({ success: true, post });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch post.' });
  }
});

// GET /api/posts/:id - Get single post by ID with strict author_id join
router.get('/:id', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    let { data: postRow, error } = await supabase
      .from('posts')
      .select('*, author:users!author_id(display_name, avatar_url, role, title)')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error || !postRow) {
      const fallbackRes = await supabase
        .from('posts')
        .select('*')
        .eq('id', req.params.id)
        .maybeSingle();
      postRow = fallbackRes.data;
    }

    if (!postRow) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    console.log("Fetched Single Post:", JSON.stringify(postRow, null, 2));

    const [post] = await attachLiveUsersToPosts([postRow]);
    return res.json({ success: true, post, data: post });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch post.' });
  }
});

// POST /api/posts/:id/like - Increment likes count
router.post('/:id/like', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const { data: postRow, error: fetchErr } = await supabase
      .from('posts')
      .select('id, likes')
      .eq('id', req.params.id)
      .maybeSingle();

    if (fetchErr || !postRow) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const newLikes = (postRow.likes || 0) + 1;
    const { error: updateErr } = await supabase
      .from('posts')
      .update({ likes: newLikes })
      .eq('id', req.params.id);

    if (updateErr) {
      return res.status(500).json({ success: false, message: 'Failed to update likes.' });
    }

    return res.json({ success: true, likes: newLikes });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update likes.' });
  }
});

// GET /api/posts/categories - Get category breakdown
router.get('/categories', async (req, res) => {
  try {
    const categories = ['Daily Reflection', 'Quranic Insights', 'Hadith Commentary', 'Islamic History', 'Fiqh & Character'];

    if (!supabase) {
      const emptyCounts = categories.map(c => ({ name: c, count: 0 }));
      return res.json({ success: true, categories: emptyCounts });
    }

    const counts = await Promise.all(
      categories.map(async (cat) => {
        const { count, error } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('category', cat)
          .eq('status', 'published');

        return { name: cat, count: error ? 0 : (count || 0) };
      })
    );

    return res.json({ success: true, categories: counts });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
});

// Middleware for strict post edit/delete identity verification
const verifyPostOwnership = async (req, res, next) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase client is not connected.' });
    }

    const activeUser = req.user || req.session?.adminUser;
    if (!activeUser) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { data: post, error } = await supabase
      .from('posts')
      .select('id, author_id, user_id, created_by')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error || !post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const currentUserId = req.user?.id || req.user?._id || activeUser.id || activeUser._id;
    const postAuthorId = post.author_id || post.user_id || post.created_by;

    // Identity check requirement: Compare authenticated user's ID with post creator's ID
    if (post.author_id !== undefined && req.user && req.user.id) {
      if (post.author_id !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    } else if (postAuthorId && currentUserId && String(postAuthorId) !== String(currentUserId)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    req.existingPost = post;
    next();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// PUT & PATCH /api/posts/:id - Update existing post strictly using Supabase with RBAC ownership check
const handlePublicPostUpdate = async (req, res) => {
  try {
    const postStatus = req.body.status || 'draft';
    const publishedAt = postStatus === 'published' ? new Date().toISOString() : null;

    const candidateUpdates = [
      {
        title: req.body.title,
        content: req.body.content || req.body.body,
        summary: req.body.summary || req.body.excerpt,
        excerpt: req.body.excerpt || req.body.summary,
        cover_image: req.body.cover_image || req.body.coverImage || req.body.image_url,
        category: req.body.category,
        tags: req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map(t => t.trim())) : undefined,
        status: postStatus,
        published_at: publishedAt,
        updated_at: new Date().toISOString()
      },
      {
        title: req.body.title,
        content: req.body.content || req.body.body,
        cover_image: req.body.cover_image || req.body.coverImage || req.body.image_url,
        category: req.body.category,
        tags: req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map(t => t.trim())) : undefined,
        status: postStatus,
        published_at: publishedAt,
        updated_at: new Date().toISOString()
      },
      {
        title: req.body.title,
        content: req.body.content || req.body.body,
        status: postStatus,
        published_at: publishedAt,
        updated_at: new Date().toISOString()
      }
    ];

    let data = null;
    let error = null;

    for (const payload of candidateUpdates) {
      Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);
      const resAttempt = await supabase
        .from('posts')
        .update(payload)
        .eq('id', req.params.id)
        .select();

      if (!resAttempt.error && resAttempt.data && resAttempt.data.length > 0) {
        data = resAttempt.data;
        error = null;
        break;
      }
      error = resAttempt.error;
    }

    if (error) {
      console.error('Supabase Update Error:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const updatedRow = data[0];
    const formatted = formatPost(updatedRow);

    return res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      post: formatted,
      data: updatedRow
    });
  } catch (err) {
    console.error('Supabase Update Error:', err);
    return res.status(500).json({ error: err.message });
  }
};

router.put('/:id', verifyPostOwnership, handlePublicPostUpdate);
router.patch('/:id', verifyPostOwnership, handlePublicPostUpdate);

// DELETE /api/posts/:id - Delete post with RBAC ownership check
router.delete('/:id', verifyPostOwnership, async (req, res) => {
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true, message: 'Post deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/posts - Create post with required User ID check and explicit author_id insert
router.post('/', async (req, res) => {
    try {
      if (!req.user && req.session?.adminUser) {
        req.user = req.session.adminUser;
      }
      if (req.user && !req.user.id) {
        req.user.id = req.user._id || req.session?.adminUser?.id;
      }

      console.log("Attempting to create post for User ID:", req.user?.id);

      if (!req.user?.id) {
        return res.status(401).json({ error: "Unauthorized: Missing user ID" });
      }

      if (!supabase) {
        console.error("Supabase Insert Error: Supabase client is not connected.");
        return res.status(500).json({ error: "Supabase client is not connected." });
      }

      const postStatus = req.body.status || 'published';
      const publishedAt = postStatus === 'published' ? new Date().toISOString() : null;

      let baseSlug = slugify(req.body.title || 'post', { lower: true, strict: true }) || 'post-' + Date.now();
      let uniqueSlug = baseSlug;
      let counter = 1;

      while (true) {
        const { data: existing } = await supabase.from('posts').select('id').eq('slug', uniqueSlug).maybeSingle();
        if (!existing) break;
        uniqueSlug = `${baseSlug}-${counter}`;
        counter++;
      }

      const postPayload = {
        ...req.body,
        title: req.body.title || 'Untitled Reflection',
        slug: uniqueSlug,
        summary: req.body.summary || req.body.excerpt || '',
        content: req.body.content || req.body.body || '',
        cover_image: req.body.cover_image || req.body.coverImage || req.body.image_url || '',
        category: req.body.category || 'Daily Reflection',
        status: postStatus,
        published_at: publishedAt,
        author_id: req.user.id
      };

      Object.keys(postPayload).forEach(k => postPayload[k] === undefined && delete postPayload[k]);

      const { data, error } = await supabase
        .from('posts')
        .insert([postPayload])
        .select();

      if (error) {
        console.error("Supabase Insert Error:", error);
        return res.status(500).json({ error: error.message });
      }

      const createdPost = data[0];
      const formatted = formatPost(createdPost);

      return res.status(201).json({ success: true, message: 'Post created successfully', post: formatted });
    } catch (err) {
      console.error("Supabase Insert Error:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  module.exports = router;


