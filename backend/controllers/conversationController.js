/**
 * CodeDNA
 * conversationController.js — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

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
      
      if (!recipient || !recipient.isActive) {
        return res.status(400).json({ message: 'User account is deactivated' });
      }

      if (user.blockedUsers.includes(participantId) || recipient.blockedUsers.includes(req.user.id)) {
        return res.status(403).json({ message: 'Cannot message this user' });
      }

      // Spam prevention: Check if user started > 5 conversations with non-friends in 24h
      const isFriend = user.friends.includes(participantId);
      if (!isFriend) {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const nonFriendConvs = await Conversation.countDocuments({
          participants: req.user.id,
          status: 'pending',
          createdAt: { $gt: twentyFourHoursAgo }
        });

        if (nonFriendConvs >= 5) {
          return res.status(429).json({ message: 'Spam protection: You can only message 5 new people per day.' });
        }
      }

      const status = isFriend ? 'accepted' : 'pending';

      conversation = await Conversation.create({
        participants: [req.user.id, participantId],
        status
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

const acceptRequest = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

    // Check if user is the recipient
    if (conversation.participants[1].toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the recipient can accept the request' });
    }

    conversation.status = 'accepted';
    conversation.messageRequestStatus = 'accepted';
    await conversation.save();

    res.json({ message: 'Request accepted' });
  } catch (error) {
    console.error('AcceptRequest error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Add to deletedFor list
    conversation.deletedFor.push(req.user.id);
    await conversation.save();

    res.json({ message: 'Conversation deleted' });
  } catch (error) {
    console.error('DeleteConversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getSuggestions = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('friends', 'name profilePicture isOnline lastActive');
    
    // Get all conversation participant IDs for the current user
    const existingConvs = await Conversation.find({
      participants: req.user.id,
      isGroup: false
    });
    
    const chattedUserIds = existingConvs.reduce((acc, conv) => {
      const otherId = conv.participants.find(p => p.toString() !== req.user.id);
      if (otherId) acc.push(otherId.toString());
      return acc;
    }, []);

    // Filter friends who don't have an active conversation
    let suggestedUsers = user.friends.filter(friend => 
      !chattedUserIds.includes(friend._id.toString()) && 
      !user.blockedUsers.includes(friend._id)
    );

    // If fewer than 10 direct friends, suggest mutual friends (friends of friends)
    if (suggestedUsers.length < 10) {
      const friendOfFriends = await User.find({
        friends: { $in: user.friends.map(f => f._id) },
        _id: { $nin: [req.user.id, ...user.friends.map(f => f._id), ...chattedUserIds] },
        blockedUsers: { $ne: req.user.id }
      })
      .select('name profilePicture isOnline lastActive')
      .limit(10 - suggestedUsers.length);
      
      suggestedUsers = [...suggestedUsers, ...friendOfFriends];
    }

    res.json(suggestedUsers.slice(0, 15));
  } catch (error) {
    console.error('GetSuggestions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getConversationWithUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'Cannot chat with yourself' });
    }

    let conversation = await Conversation.findOne({
      isGroup: false,
      participants: { $all: [req.user.id, userId], $size: 2 }
    })
    .populate('participants', 'name profilePicture isOnline lastActive')
    .populate('lastMessage.sender', 'name');

    if (!conversation) {
      // Create new conversation
      const user = await User.findById(req.user.id);
      const recipient = await User.findById(userId);
      
      if (!recipient || !recipient.isActive) {
        return res.status(400).json({ message: 'User account is deactivated' });
      }

      if (user.blockedUsers.includes(userId) || recipient.blockedUsers.includes(req.user.id)) {
        return res.status(403).json({ message: 'Cannot message this user' });
      }

      const isFriend = user.friends.includes(userId);
      const status = isFriend ? 'accepted' : 'pending';

      conversation = await Conversation.create({
        participants: [req.user.id, userId],
        status
      });

      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name profilePicture isOnline lastActive');
    }

    res.json(conversation);
  } catch (error) {
    console.error('GetConversationWithUser error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    const conversation = await Conversation.findById(id);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    if (conversation.groupAdmin.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only admin can add members' });
    }

    await Conversation.findByIdAndUpdate(id, {
      $addToSet: { participants: userId, groupMembers: userId }
    });

    // Create notification
    const { createNotification } = require('./notificationController');
    await createNotification(
      userId,
      req.user.id,
      'group_invite', // You can use a specific type or 'mention'
      id,
      `added you to the group: ${conversation.groupName}`
    );

    res.json({ message: 'Member added' });
  } catch (error) {
    console.error('AddMember error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;
    
    const conversation = await Conversation.findById(id);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    if (conversation.groupAdmin.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only admin can remove members' });
    }

    await Conversation.findByIdAndUpdate(id, {
      $pull: { participants: userId, groupMembers: userId }
    });

    res.json({ message: 'Member removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const changeAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    const conversation = await Conversation.findById(id);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    if (conversation.groupAdmin.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only current admin can change admin' });
    }

    await Conversation.findByIdAndUpdate(id, { groupAdmin: userId });

    res.json({ message: 'Admin changed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateGroupIcon = async (req, res) => {
  try {
    const { id } = req.params;
    const { groupIcon } = req.body;
    
    const conversation = await Conversation.findById(id);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    if (conversation.groupAdmin.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only admin can change icon' });
    }

    await Conversation.findByIdAndUpdate(id, { groupIcon });

    res.json({ message: 'Group icon updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const leaveGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findById(id);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

    if (!conversation.participants.includes(req.user.id)) {
      return res.status(400).json({ message: 'Not a member of this group' });
    }

    // If admin leaves, assign new admin if possible
    if (conversation.groupAdmin.toString() === req.user.id) {
      const nextMember = conversation.participants.find(p => p.toString() !== req.user.id);
      if (nextMember) {
        conversation.groupAdmin = nextMember;
      } else {
        // No one left?
      }
    }

    conversation.participants.pull(req.user.id);
    conversation.groupMembers.pull(req.user.id);
    
    await conversation.save();
    res.json({ message: 'Left group successfully' });
  } catch (error) {
    console.error('LeaveGroup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
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
};
