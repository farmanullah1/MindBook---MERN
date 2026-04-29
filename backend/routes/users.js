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
} = require('../controllers/userController');

router.get('/suggestions', auth, getSuggestedFriends);
router.get('/', auth, getAllUsers);
router.get('/:id', auth, getUser);
router.put('/:id', auth, updateUser);
router.post('/friend-request', auth, sendFriendRequest);
router.post('/friend-request/accept', auth, acceptFriendRequest);
router.post('/friend-request/decline', auth, declineFriendRequest);
router.post('/unfriend', auth, removeFriend);

module.exports = router;
