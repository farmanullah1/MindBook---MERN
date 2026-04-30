/**
 * CodeDNA
 * conversations.js — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getConversations,
  createConversation,
  getMessages,
  markAsRead,
  acceptRequest,
  deleteConversation,
  getSuggestions,
  getConversationWithUser,
  addMember,
  removeMember,
  changeAdmin,
  leaveGroup,
  updateGroupIcon
} = require('../controllers/conversationController');
const {
  sendMessage,
  deleteMessage,
  deleteForEveryone,
  forwardMessage,
  uploadMessageMedia
} = require('../controllers/messageController');
const upload = require('../middleware/upload');

router.post('/upload', auth, upload.single('media'), uploadMessageMedia);
router.post('/:id/members', auth, addMember);
router.delete('/:id/members/:userId', auth, removeMember);
router.put('/:id/admin', auth, changeAdmin);
router.put('/:id/leave', auth, leaveGroup);
router.put('/:id/icon', auth, updateGroupIcon);

router.get('/', auth, getConversations);
router.get('/suggestions', auth, getSuggestions);
router.get('/with/:userId', auth, getConversationWithUser);
router.post('/', auth, createConversation);
router.get('/:conversationId/messages', auth, getMessages);
router.post('/:conversationId/messages', auth, sendMessage);
router.post('/:conversationId/read', auth, markAsRead);
router.put('/:conversationId/accept', auth, acceptRequest);
router.delete('/:conversationId', auth, deleteConversation);
router.delete('/messages/:messageId', auth, deleteMessage);
router.put('/messages/:messageId/delete-everyone', auth, deleteForEveryone);
router.post('/messages/:messageId/forward', auth, forwardMessage);

module.exports = router;
