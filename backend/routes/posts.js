const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createPost,
  getFeedPosts,
  getUserPosts,
  getPost,
  updatePost,
  deletePost,
  likePost,
  commentOnPost,
  deleteComment,
  commentOnPost,
  deleteComment,
} = require('../controllers/postController');

router.get('/feed', auth, getFeedPosts);
router.get('/user/:userId', auth, getUserPosts);
router.post('/', auth, createPost);
router.get('/:id', auth, getPost);
router.put('/:id', auth, updatePost);
router.delete('/:id', auth, deletePost);
router.put('/:id/like', auth, likePost);
router.post('/:id/comment', auth, commentOnPost);
router.delete('/:id/comment/:commentId', auth, deleteComment);
module.exports = router;
