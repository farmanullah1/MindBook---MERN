/**
 * CodeDNA
 * posts.js — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

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
  reactToPost,
  commentOnPost,
  deleteComment,
  getSavedPosts,
  toggleSavePost,
  likeComment,
  replyToComment
} = require('../controllers/postController');

router.get('/user/saved', auth, getSavedPosts); // Needs to be above /:id
router.get('/feed', auth, getFeedPosts);
router.get('/user/:userId', auth, getUserPosts);
router.post('/', auth, createPost);
router.get('/:id', auth, getPost);
router.put('/:id', auth, updatePost);
router.delete('/:id', auth, deletePost);
router.put('/:id/react', auth, reactToPost);
router.post('/:id/comment', auth, commentOnPost);
router.delete('/:id/comment/:commentId', auth, deleteComment);
router.put('/:id/comment/:commentId/like', auth, likeComment);
router.post('/:id/comment/:commentId/reply', auth, replyToComment);
router.put('/:id/save', auth, toggleSavePost);

module.exports = router;
