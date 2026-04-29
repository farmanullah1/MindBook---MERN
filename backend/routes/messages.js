const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getConversations, getMessages, sendMessage, markMessagesAsRead } = require('../controllers/messageController');

router.get('/conversations', auth, getConversations);
router.get('/:userId', auth, getMessages);
router.post('/:userId', auth, sendMessage);
router.put('/:userId/read', auth, markMessagesAsRead);

module.exports = router;
