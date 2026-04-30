/**
 * CodeDNA
 * messages.js — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getConversations, getMessages, sendMessage, markMessagesAsRead } = require('../controllers/messageController');

router.get('/conversations', auth, getConversations);
router.get('/:userId', auth, getMessages);
router.post('/:userId', auth, sendMessage);
router.put('/:userId/read', auth, markMessagesAsRead);

module.exports = router;
