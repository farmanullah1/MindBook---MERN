const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
  createGroup, 
  getGroups, 
  getGroupById, 
  joinGroup, 
  leaveGroup,
  getGroupPosts,
  createGroupPost
} = require('../controllers/groupController');

router.post('/', auth, createGroup);
router.get('/', auth, getGroups);
router.get('/:id', auth, getGroupById);
router.post('/:id/join', auth, joinGroup);
router.post('/:id/leave', auth, leaveGroup);
router.get('/:id/posts', auth, getGroupPosts);
router.post('/:id/posts', auth, createGroupPost);

module.exports = router;
