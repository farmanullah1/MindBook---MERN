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
  getSuggestedFriends,
  searchUsers,
  toggleSavePost,
  getMutualFriends,
  deleteAccount,
} = require('../controllers/userController');

router.get('/search', auth, searchUsers);
router.get('/suggestions', auth, getSuggestedFriends);
router.get('/', auth, getAllUsers);
router.get('/:id', auth, getUser);
router.get('/:id/mutual-friends', auth, getMutualFriends);
router.put('/profile', auth, updateUser); // New route for updating own profile
router.put('/:id', auth, updateUser); // Keep old one for compatibility if needed
router.post('/friend-request', auth, sendFriendRequest);
router.post('/friend-request/accept', auth, acceptFriendRequest);
router.post('/friend-request/decline', auth, declineFriendRequest);
router.post('/unfriend', auth, removeFriend);
router.post('/save-post/:postId', auth, toggleSavePost);
router.delete('/account', auth, deleteAccount);

module.exports = router;
