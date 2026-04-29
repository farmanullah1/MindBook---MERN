const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');

router.post('/', auth, upload.single('media'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const isVideo = req.file.mimetype.startsWith('video');
  res.json({ 
    url: `http://localhost:5000/uploads/${req.file.filename}`,
    type: isVideo ? 'video' : 'image'
  });
});

module.exports = router;
