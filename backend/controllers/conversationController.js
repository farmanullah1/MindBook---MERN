const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id
    })
    .populate('participants', 'name profilePicture isOnline lastActive')
    .populate('groupMembers', 'name profilePicture isOnline lastActive')
    .populate('lastMessage.sender', 'name')
    .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    console.error('GetConversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createConversation = async (req, res) => {
  try {
    const { participantId, isGroup, groupName, groupMembers } = req.body;

    if (!isGroup) {
      // Check if 1-on-1 conversation already exists
      let conversation = await Conversation.findOne({
        isGroup: false,
        participants: { $all: [req.user.id, participantId], $size: 2 }
      });

      if (conversation) {
        return res.json(conversation);
      }

      // Check if blocked
      const user = await User.findById(req.user.id);
      const recipient = await User.findById(participantId);
      
      if (user.blockedUsers.includes(participantId) || recipient.blockedUsers.includes(req.user.id)) {
        return res.status(403).json({ message: 'Cannot message this user' });
      }

      conversation = await Conversation.create({
        participants: [req.user.id, participantId]
      });

      const populatedConversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name profilePicture isOnline lastActive');

      return res.status(201).json(populatedConversation);
    } else {
      // Create group conversation
      const conversation = await Conversation.create({
        isGroup: true,
        groupName,
        groupAdmin: req.user.id,
        participants: [req.user.id, ...groupMembers],
        groupMembers: [req.user.id, ...groupMembers]
      });

      const populatedConversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name profilePicture isOnline lastActive')
        .populate('groupMembers', 'name profilePicture isOnline lastActive');

      return res.status(201).json(populatedConversation);
    }
  } catch (error) {
    console.error('CreateConversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name profilePicture')
      .populate('repliedTo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(messages.reverse());
  } catch (error) {
    console.error('GetMessages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    await Message.updateMany(
      { 
        conversation: conversationId, 
        sender: { $ne: req.user.id },
        readBy: { $ne: req.user.id }
      },
      { 
        $addToSet: { readBy: req.user.id },
        readAt: new Date()
      }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('MarkAsRead error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getConversations,
  createConversation,
  getMessages,
  markAsRead
};
