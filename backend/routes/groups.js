/**
 * CodeDNA
 * groups.js — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createGroup,
  getGroups,
  getGroup,
  joinGroup,
  leaveGroup,
  approveJoinRequest,
  declineJoinRequest,
  getGroupFeed,
  updateGroup,
  manageMember,
  pinPost,
  unpinPost,
  getDiscoverGroups,
  getGroupMedia
} = require('../controllers/groupController');

router.get('/', auth, getGroups);
router.post('/', auth, createGroup);
router.get('/discover', auth, getDiscoverGroups);
router.get('/:id', auth, getGroup);
router.get('/:id/media', auth, getGroupMedia);
router.put('/:id', auth, updateGroup);
router.post('/:id/join', auth, joinGroup);
router.post('/:id/leave', auth, leaveGroup);
router.post('/:id/approve', auth, approveJoinRequest);
router.post('/:id/decline', auth, declineJoinRequest);
router.get('/:id/feed', auth, getGroupFeed);
router.post('/:id/manage-member', auth, manageMember);
router.post('/:id/pin', auth, pinPost);
router.post('/:id/unpin', auth, unpinPost);

module.exports = router;
