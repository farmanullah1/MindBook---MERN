/**
 * CodeDNA
 * users.js — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getUser,
  getAllUsers,
  updateUser,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  getFriends,
  getFriendRequests,
  getSuggestedFriends,
  searchUsers,
  getMutualFriends,
  getUserMedia,
  deleteAccount,
  cancelFriendRequest,
} = require('../controllers/userController');
const { toggleSavePost } = require('../controllers/postController');

router.get('/friends', auth, getFriends);
router.get('/friend-requests', auth, getFriendRequests);
router.get('/search', auth, searchUsers);
router.get('/suggestions', auth, getSuggestedFriends);
router.get('/', auth, getAllUsers);
router.get('/:id', auth, getUser);
router.get('/:id/mutual-friends', auth, getMutualFriends);
router.get('/:id/media', auth, getUserMedia);
router.put('/profile', auth, updateUser);
router.put('/settings/account', auth, updateUser);
router.put('/settings/privacy', auth, updateUser);
router.put('/settings/notifications', auth, updateUser);
router.put('/:id', auth, updateUser);
router.post('/friend-request', auth, sendFriendRequest);
router.post('/friend-request/accept', auth, acceptFriendRequest);
router.post('/friend-request/decline', auth, declineFriendRequest);
router.post('/friend-request/cancel', auth, cancelFriendRequest);
router.post('/unfriend', auth, removeFriend);
router.post('/save-post/:postId', auth, toggleSavePost);
router.delete('/account', auth, deleteAccount);

module.exports = router;
