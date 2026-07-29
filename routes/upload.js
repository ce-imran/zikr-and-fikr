const express = require('express');
const router = express.Router();
const multer = require('multer');
const { supabase } = require('../config/supabase');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// POST /api/upload - Handle image upload directly to Supabase Storage
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Supabase client is not connected.' });
    }

    const cleanFileName = file.originalname ? file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_') : 'image.jpg';
    const filePath = `uploads/${Date.now()}_${cleanFileName}`;

    const { data, error } = await supabase
      .storage
      .from('profile_pictures')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype
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
      filename: file.originalname
    });
  } catch (err) {
    console.error('Upload Error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
