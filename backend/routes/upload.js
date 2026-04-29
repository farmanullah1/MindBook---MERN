const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');

router.post('/', auth, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  // Return the full URL for the uploaded image
  res.json({ imageUrl: `http://localhost:5000/uploads/${req.file.filename}` });
});

module.exports = router;
