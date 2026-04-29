const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

const sendMessage = async (req, res) => {
  try {
    const { conversationId, text, mediaUrl, mediaType, repliedTo } = req.body;

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user.id,
      text,
      mediaUrl,
      mediaType,
      repliedTo,
      readBy: [req.user.id]
    });

    // Update conversation last message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: {
        text: text || `Sent an ${mediaType}`,
        sender: req.user.id,
        createdAt: new Date()
      },
      updatedAt: new Date()
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name profilePicture')
      .populate('repliedTo');

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('SendMessage error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);

    if (!message) return res.status(404).json({ message: 'Message not found' });

    await Message.findByIdAndUpdate(messageId, {
      $addToSet: { deletedFor: req.user.id }
    });

    res.json({ message: 'Message deleted for you' });
  } catch (error) {
    console.error('DeleteMessage error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteForEveryone = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);

    if (!message) return res.status(404).json({ message: 'Message not found' });
    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check 10 min limit
    const diff = (new Date() - message.createdAt) / 1000 / 60;
    if (diff > 10) {
      return res.status(400).json({ message: 'Cannot delete message after 10 minutes' });
    }

    await Message.findByIdAndUpdate(messageId, {
      isDeleted: true,
      text: 'This message was deleted',
      mediaUrl: '',
      mediaType: ''
    });

    res.json({ message: 'Message deleted for everyone' });
  } catch (error) {
    console.error('DeleteForEveryone error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  sendMessage,
  deleteMessage,
  deleteForEveryone
};
