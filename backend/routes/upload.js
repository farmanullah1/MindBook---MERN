/**
 * CodeDNA
 * upload.js — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');

router.post('/', auth, upload.single('media'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const isVideo = req.file.mimetype.startsWith('video');
  const isAudio = req.file.mimetype.startsWith('audio');
  const isImage = req.file.mimetype.startsWith('image');
  
  let type = 'file';
  if (isImage) type = 'image';
  else if (isVideo) type = 'video';
  else if (isAudio) type = 'audio';

  res.json({ 
    url: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`,
    type
  });
});

module.exports = router;
