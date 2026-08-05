const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { requireAdminAuth } = require('../middleware/auth');

// POST /api/upload - Handle image upload directly to Supabase Storage via Base64 JSON
router.post('/', requireAdminAuth, express.json({ limit: '10mb' }), async (req, res) => {
  try {
    const { imageBase64, filename, mimeType } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!mimeType || !ALLOWED_MIME_TYPES.includes(mimeType)) {
      return res.status(400).json({ success: false, message: 'Invalid file type. Only JPG, PNG, WEBP, GIF, and SVG are allowed.' });
    }

    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Supabase client is not connected.' });
    }

    const cleanFileName = filename ? filename.replace(/[^a-zA-Z0-9.-]/g, '_') : 'image.jpg';
    const filePath = `uploads/${Date.now()}_${cleanFileName}`;
    const buffer = Buffer.from(imageBase64, 'base64');

    const { data, error } = await supabase
      .storage
      .from('profile_pictures')
      .upload(filePath, buffer, {
        contentType: mimeType || 'image/jpeg'
      });

    if (error) {
      console.error('Supabase Storage Upload Error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }

    const { data: urlData } = supabase
      .storage
      .from('profile_pictures')
      .getPublicUrl(filePath);

    const publicUrl = urlData?.publicUrl || '';

    return res.json({
      success: true,
      message: 'Image uploaded successfully!',
      url: publicUrl,
      publicUrl: publicUrl,
      filename: cleanFileName
    });
  } catch (err) {
    console.error('Upload Error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
