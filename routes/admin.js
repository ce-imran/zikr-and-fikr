const express = require('express');
const router = express.Router();
const slugify = require('slugify');
const { broadcastNotification } = require('../services/pushService');
const { admin, isFirebaseAdminConfigured } = require('../services/firebaseAdmin');
const { supabase, formatPost, toSupabasePostPayload, maskedKey } = require('../config/supabase');
const { requireAdminAuth } = require('../middleware/auth');

// GET /api/admin/stats - CMS Overview Stats
router.get('/stats', requireAdminAuth, async (req, res) => {
  try {
    if (!supabase) {
      return res.json({
        success: true,
        stats: { totalPosts: 0, publishedPosts: 0, draftPosts: 0, subscribersCount: 0, totalViews: 0 }
      });
    }

    const [
      { count: totalPosts },
      { count: publishedPosts },
      { count: draftPosts },
      { count: subscribersCount },
      { data: viewsData }
    ] = await Promise.all([
      supabase.from('posts').select('*', { count: 'exact', head: true }),
      supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
      supabase.from('fcm_subscriptions').select('*', { count: 'exact', head: true }),
      supabase.from('posts').select('views')
    ]);

    const totalViews = (viewsData || []).reduce((acc, p) => acc + (p.views || 0), 0);

    return res.json({
      success: true,
      stats: {
        totalPosts: totalPosts || 0,
        publishedPosts: publishedPosts || 0,
        draftPosts: draftPosts || 0,
        subscribersCount: subscribersCount || 0,
        totalViews
      }
    });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch admin stats.' });
  }
});

// GET /api/admin/posts - List all posts
router.get('/posts', requireAdminAuth, async (req, res) => {
  try {
    if (!supabase) {
      return res.json({ success: true, posts: [] });
    }

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch admin posts.' });
    }

    const posts = (data || []).map(formatPost);
    return res.json({ success: true, posts });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch admin posts.' });
  }
});

// POST /api/admin/posts - Strictly Create post in Supabase & Broadcast Notifications
router.post('/posts', requireAdminAuth, async (req, res) => {
  try {
    const activeUser = req.user || req.session?.adminUser;
    const authorId = req.user?.id || req.user?._id || activeUser?.id || activeUser?._id;

    console.log("Attempting to create post for User ID:", req.user?.id || authorId);

    if (!req.user?.id && !authorId) {
      return res.status(401).json({ error: "Unauthorized: Missing user ID" });
    }

    if (!supabase) {
      console.error('Supabase Insert Error: Supabase client is not connected.');
      return res.status(500).json({ error: 'Supabase client is not connected.' });
    }

    const {
      content_type = 'image_text',
      postType,
      title,
      summary,
      body,
      content,
      image_url,
      coverImage,
      category,
      tags,
      status
    } = req.body;

    const finalContentType = ['text_only', 'image_only', 'image_text'].includes(content_type || postType)
      ? (content_type || postType)
      : 'image_text';

    const finalBody = body || content || (finalContentType === 'image_only' ? 'Visual Reflection' : 'Daily Islamic Reflection Content');
    let finalImageUrl = image_url || coverImage || '/assets/default-cover.svg';

    // If coverImage is a base64 string, upload it to Supabase Storage
    if (finalImageUrl.startsWith('data:image')) {
      try {
        const mimeTypeMatch = finalImageUrl.match(/data:(image\/[a-zA-Z+]+);base64,/);
        if (mimeTypeMatch && mimeTypeMatch[1]) {
          const mimeType = mimeTypeMatch[1];
          const base64Data = finalImageUrl.replace(/^data:image\/\w+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          const ext = mimeType.split('/')[1];
          const fileName = `posts/cover_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

          const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('profile_pictures')
            .upload(fileName, buffer, { contentType: mimeType });

          if (!uploadError) {
            const { data: publicUrlData } = supabase
              .storage
              .from('profile_pictures')
              .getPublicUrl(fileName);
            finalImageUrl = publicUrlData.publicUrl;
          } else {
            console.error("Cover image upload failed:", uploadError);
          }
        }
      } catch (e) {
        console.error("Base64 cover image processing error:", e);
      }
    }

    const postTitle = title || (finalContentType === 'image_only' ? 'Visual Reflection ' + new Date().toLocaleDateString() : 'Islamic Reflection');

    const validCategories = ['Daily Reflection', 'Quranic Insights', 'Hadith Commentary', 'Islamic History', 'Fiqh & Character'];
    const finalCategory = validCategories.includes(category) ? category : 'Daily Reflection';

    // Generate unique slug
    let baseSlug = slugify(postTitle, { lower: true, strict: true }) || 'post-' + Date.now();
    let uniqueSlug = baseSlug;
    let counter = 1;

    while (true) {
      const { data: existing } = await supabase.from('posts').select('id').eq('slug', uniqueSlug).maybeSingle();
      if (!existing) break;
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const wordCount = finalBody.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    const postStatus = req.body.status || 'draft';
    const publishedAt = postStatus === 'published' ? new Date().toISOString() : null;

    const candidatePayloads = [
      // 1. Exact schema match payload
      {
        title: postTitle,
        slug: uniqueSlug,
        excerpt: summary || (finalContentType === 'image_only' ? 'Visual Reflection' : (finalBody ? finalBody.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '')),
        content: finalBody,
        cover_image: finalImageUrl,
        category: finalCategory,
        tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : ['Islamic']),
        status: postStatus,
        published_at: publishedAt,
        author_id: authorId,
        views: 0,
        likes: 0
      },
      // 2. Fallback (no views/likes)
      {
        title: postTitle,
        slug: uniqueSlug,
        excerpt: summary || (finalContentType === 'image_only' ? 'Visual Reflection' : (finalBody ? finalBody.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '')),
        content: finalBody,
        cover_image: finalImageUrl,
        category: finalCategory,
        tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : ['Islamic']),
        status: postStatus,
        published_at: publishedAt,
        author_id: authorId
      }
    ];

    // 1. STRICT SUPABASE INSERT (WITH SCHEMA FALLBACK CANDIDATES)
    let insertedData = null;
    let error = null;

    for (const payload of candidatePayloads) {
      Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);
      const resAttempt = await supabase
        .from('posts')
        .insert([payload])
        .select();

      if (!resAttempt.error && resAttempt.data && resAttempt.data.length > 0) {
        insertedData = resAttempt.data;
        error = null;
        break;
      }
      error = resAttempt.error;
    }

    if (error && !insertedData) {
      console.error('Supabase Insert Error:', error);
      return res.status(500).json({ error: error.message, message: `Supabase Insert Error: ${error.message}` });
    }

    if (!insertedData || insertedData.length === 0) {
      console.error('Supabase Insert Error: No data returned from Supabase insert.');
      return res.status(500).json({ error: 'No data returned from Supabase insert.' });
    }

    const createdPost = insertedData[0];
    const formattedPost = formatPost(createdPost);

    // 2. STRICT NOTIFICATION BROADCAST (ONLY IF POST SUCCEEDS & IS PUBLISHED)
    if (formattedPost.status === 'published') {
      try {
        // Query fcm_subscriptions table
        const { data: subs, error: subsError } = await supabase
          .from('fcm_subscriptions')
          .select('*');

        if (subsError) {
          console.warn('fcm_subscriptions query warning:', subsError.message);
        }

        const tokens = (subs || [])
          .map(s => s.token || s.endpoint || s.keys_p256dh)
          .filter(Boolean);

        if (!tokens || tokens.length === 0) {
          console.log('No notification tokens found in fcm_subscriptions table.');
        } else {
          // Send via Firebase Admin SDK if configured
          if (isFirebaseAdminConfigured() && admin && admin.messaging) {
            try {
              const deviceTokens = tokens.filter(t => !t.startsWith('http'));
              if (deviceTokens.length > 0) {
                await admin.messaging().sendEachForMulticast({
                  tokens: deviceTokens,
                  notification: {
                    title: `📖 New Reflection: ${formattedPost.title}`,
                    body: formattedPost.summary || 'A new reflection has been published.'
                  }
                });
                console.log(`📡 Broadcasted FCM Push to ${deviceTokens.length} devices.`);
              }
            } catch (fbErr) {
              console.error('Firebase Multicast Broadcast Error:', fbErr.message);
            }
          }

          // Broadcast Web Push
          try {
            await broadcastNotification({
              title: `📖 New Reflection: ${formattedPost.title}`,
              body: formattedPost.summary || 'A new daily reflection has been published on Zikr & Fikr.',
              icon: '/icons/icon-192x192.png',
              url: `/post/${formattedPost.slug}`
            });
          } catch (webPushErr) {
            console.error('Web Push Broadcast Error:', webPushErr.message);
          }
        }
      } catch (notifyErr) {
        console.error('Notification logic error:', notifyErr);
      }
    }

    // Return 201 Created ONLY after successful Supabase insert
    return res.status(201).json({
      success: true,
      message: 'Post published successfully!',
      post: formattedPost
    });

  } catch (err) {
    console.error('Post Creation Route Error:', err);
  }
});

// PUT & PATCH /api/admin/posts/:id - Update existing post strictly using Supabase
const handlePostUpdate = async (req, res) => {
  try {
    if (!supabase) {
      console.error('Supabase Update Error: Supabase client is not connected.');
      return res.status(500).json({ error: 'Supabase client is not connected.' });
    }

    // Verify ownership
    const { data: existingPost, error: fetchError } = await supabase
      .from('posts')
      .select('id, author_id')
      .eq('id', req.params.id)
      .maybeSingle();

    if (fetchError) {
      return res.status(500).json({ error: `Database error during fetch: ${fetchError.message}` });
    }
    if (!existingPost) {
      return res.status(404).json({ error: `Post not found in DB. Passed ID: "${req.params.id}"` });
    }

    const currentUserId = req.user?.id || req.user?._id || req.session?.adminUser?.id || req.session?.adminUser?._id;
    const postAuthorId = existingPost.author_id || existingPost.user_id || existingPost.created_by;

    if (existingPost.author_id !== undefined && req.user && req.user.id) {
      if (existingPost.author_id !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    } else if (postAuthorId && currentUserId && String(postAuthorId) !== String(currentUserId)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const postStatus = req.body.status || 'draft';
    const publishedAt = postStatus === 'published' ? new Date().toISOString() : null;

    const candidateUpdates = [
        // 1. Exact schema match payload
        {
          title: req.body.title,
          content: req.body.content || req.body.body,
          excerpt: req.body.summary || req.body.excerpt,
          cover_image: req.body.coverImage || req.body.cover_image || req.body.image_url,
          category: req.body.category,
          tags: req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map(t => t.trim())) : undefined,
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
        
      console.log('Update Attempt Result:', resAttempt);

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
      return res.status(403).json({ error: `Update blocked by RLS. Key used: ${maskedKey}. resAttempt: ${JSON.stringify(resAttempt.error)}` });
    }

    const updatedRow = data[0];
    const formatted = formatPost(updatedRow);

    // Optional push notification if updated post is published
    if (formatted.status === 'published' && req.body.broadcastPush) {
      try {
        await broadcastNotification({
          title: `📖 Reflection Updated: ${formatted.title}`,
          body: formatted.summary || 'A reflection has been updated on Zikr & Fikr.',
          icon: '/icons/icon-192x192.png',
          url: `/post/${formatted.slug}`
        });
      } catch (pushErr) {
        console.error('Push broadcast error on update:', pushErr);
      }
    }

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

router.put('/posts/:id', requireAdminAuth, handlePostUpdate);
router.patch('/posts/:id', requireAdminAuth, handlePostUpdate);

// DELETE /api/admin/posts/:id - Delete post
router.delete('/posts/:id', requireAdminAuth, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Supabase client is not connected.' });
    }

    // Verify ownership
    const { data: existingPost, error: fetchError } = await supabase
      .from('posts')
      .select('id, author_id')
      .eq('id', req.params.id)
      .maybeSingle();

    if (fetchError) {
      return res.status(500).json({ success: false, message: `Database error during fetch: ${fetchError.message}` });
    }
    if (!existingPost) {
      return res.status(404).json({ success: false, message: `Post not found in DB. Passed ID: "${req.params.id}"` });
    }

    const currentUserId = req.user?.id || req.user?._id || req.session?.adminUser?.id || req.session?.adminUser?._id;
    const postAuthorId = existingPost.author_id || existingPost.user_id || existingPost.created_by;

    if (existingPost.author_id !== undefined && req.user && req.user.id) {
      if (existingPost.author_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }
    } else if (postAuthorId && currentUserId && String(postAuthorId) !== String(currentUserId)) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('posts')
      .delete()
      .eq('id', req.params.id)
      .select()
      .maybeSingle();

    if (error || !data) {
      return res.status(403).json({ success: false, message: `Delete failed. Key used: ${maskedKey}. Error: ${JSON.stringify(error)}` });
    }

    return res.json({ success: true, message: 'Post deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete post.' });
  }
});

module.exports = router;

