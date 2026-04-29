const Message = require('../models/Message');
const User = require('../models/User');

const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    // Find all unique users the current user has chatted with
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    }).sort({ createdAt: -1 });

    const conversationsMap = new Map();

    messages.forEach(msg => {
      const otherUserId = msg.sender.toString() === userId ? msg.receiver.toString() : msg.sender.toString();
      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          latestMessage: msg,
          unreadCount: msg.receiver.toString() === userId && !msg.read ? 1 : 0
        });
      } else {
        if (msg.receiver.toString() === userId && !msg.read) {
          const conv = conversationsMap.get(otherUserId);
          conv.unreadCount += 1;
        }
      }
    });

    const conversationUsers = await User.find({ _id: { $in: Array.from(conversationsMap.keys()) } })
      .select('name profilePicture');

    const conversations = conversationUsers.map(user => ({
      user,
      latestMessage: conversationsMap.get(user._id.toString()).latestMessage,
      unreadCount: conversationsMap.get(user._id.toString()).unreadCount
    })).sort((a, b) => new Date(b.latestMessage.createdAt) - new Date(a.latestMessage.createdAt));

    res.json(conversations);
  } catch (error) {
    console.error('GetConversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error('GetMessages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Text is required' });

    const message = await Message.create({
      sender: req.user.id,
      receiver: req.params.userId,
      text
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('SendMessage error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const markMessagesAsRead = async (req, res) => {
  try {
    await Message.updateMany(
      { sender: req.params.userId, receiver: req.user.id, read: false },
      { $set: { read: true } }
    );
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('MarkMessagesAsRead error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  markMessagesAsRead
};
