const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getConversations,
  createConversation,
  getMessages,
  markAsRead
} = require('../controllers/conversationController');
const {
  sendMessage,
  deleteMessage,
  deleteForEveryone
} = require('../controllers/messageController');

router.get('/', auth, getConversations);
router.post('/', auth, createConversation);
router.get('/:conversationId/messages', auth, getMessages);
router.post('/:conversationId/messages', auth, sendMessage);
router.post('/:conversationId/read', auth, markAsRead);
router.put('/:conversationId/accept', auth, acceptRequest);
router.delete('/:conversationId', auth, deleteConversation);
router.delete('/messages/:messageId', auth, deleteMessage);
router.put('/messages/:messageId/delete-everyone', auth, deleteForEveryone);

module.exports = router;
