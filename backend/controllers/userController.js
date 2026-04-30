/**
 * CodeDNA
 * userController.js — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

const User = require('../models/User');
const { createNotification } = require('./notificationController');

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('friends', 'name profilePicture')
      .populate('friendRequests', 'name profilePicture');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('GetUser error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(users);
  } catch (error) {
    console.error('GetAllUsers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateUser = async (req, res) => {
  try {
    if (req.params.id && req.params.id !== req.user.id && req.originalUrl.includes(req.params.id)) {
      return res.status(403).json({ message: 'You can only update your own profile' });
    }

    const userId = req.params.id || req.user.id;
    
    const allowedFields = [
      'name', 'bio', 'location', 'work', 'education', 
      'profilePicture', 'coverPicture', 'privacySettings', 
      'notificationPreferences', 'gender', 'birthdate', 'mobileNumber'
    ];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('UpdateUser error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const sendFriendRequest = async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user.id;

    if (userId === friendId) {
      return res.status(400).json({ message: 'You cannot send a friend request to yourself' });
    }

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!friend) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.friends.includes(friendId)) {
      return res.status(400).json({ message: 'You are already friends with this user' });
    }

    if (user.sentFriendRequests.includes(friendId)) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    if (user.friendRequests.includes(friendId)) {
      return res.status(400).json({ message: 'This user has already sent you a friend request. Accept it instead.' });
    }

    user.sentFriendRequests.push(friendId);
    friend.friendRequests.push(userId);

    await user.save();
    await friend.save();

    await createNotification(req.app.get('io'), friendId, userId, 'friend_request');

    res.json({ message: 'Friend request sent successfully' });
  } catch (error) {
    console.error('SendFriendRequest error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const acceptFriendRequest = async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!friend) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.friendRequests.includes(friendId)) {
      return res.status(400).json({ message: 'No friend request from this user' });
    }

    user.friends.push(friendId);
    friend.friends.push(userId);

    user.friendRequests = user.friendRequests.filter((id) => id.toString() !== friendId);
    friend.sentFriendRequests = friend.sentFriendRequests.filter((id) => id.toString() !== userId);

    await user.save();
    await friend.save();

    await createNotification(req.app.get('io'), friendId, userId, 'friend_accept');

    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    console.error('AcceptFriendRequest error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const declineFriendRequest = async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!friend) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.friendRequests = user.friendRequests.filter((id) => id.toString() !== friendId);
    friend.sentFriendRequests = friend.sentFriendRequests.filter((id) => id.toString() !== userId);

    await user.save();
    await friend.save();

    res.json({ message: 'Friend request declined' });
  } catch (error) {
    console.error('DeclineFriendRequest error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const removeFriend = async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!friend) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.friends = user.friends.filter((id) => id.toString() !== friendId);
    friend.friends = friend.friends.filter((id) => id.toString() !== userId);

    await user.save();
    await friend.save();

    res.json({ message: 'Friend removed' });
  } catch (error) {
    console.error('RemoveFriend error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('friends', 'name profilePicture isOnline lastActive');
    res.json(user.friends);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getFriendRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('friendRequests', 'name profilePicture')
      .populate('sentFriendRequests', 'name profilePicture');
    
    res.json({
      incoming: user.friendRequests,
      outgoing: user.sentFriendRequests
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const cancelFriendRequest = async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!friend) return res.status(404).json({ message: 'User not found' });

    user.sentFriendRequests = user.sentFriendRequests.filter((id) => id.toString() !== friendId);
    friend.friendRequests = friend.friendRequests.filter((id) => id.toString() !== userId);

    await user.save();
    await friend.save();

    res.json({ message: 'Friend request cancelled' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getSuggestedFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const excludeIds = [
      req.user.id,
      ...user.friends.map((f) => f.toString()),
      ...user.sentFriendRequests.map((f) => f.toString()),
      ...user.friendRequests.map((f) => f.toString()),
    ];

    // Smarter suggestions: Friends of friends
    const friendsOfFriends = await User.find({
      _id: { $nin: excludeIds },
      friends: { $in: user.friends }
    })
    .select('name profilePicture friends')
    .limit(10);

    // Add mutual friends count
    const suggestions = friendsOfFriends.map(suggestion => {
      const mutualCount = suggestion.friends.filter(id => user.friends.includes(id)).length;
      const { friends, ...data } = suggestion.toObject();
      return { ...data, mutualFriendsCount: mutualCount };
    });

    // If not enough suggestions, add random users
    if (suggestions.length < 5) {
      const randomUsers = await User.find({
        _id: { $nin: [...excludeIds, ...suggestions.map(s => s._id.toString())] }
      })
      .select('name profilePicture')
      .limit(10 - suggestions.length);
      
      suggestions.push(...randomUsers.map(u => ({ ...u.toObject(), mutualFriendsCount: 0 })));
    }

    res.json(suggestions);
  } catch (error) {
    console.error('GetSuggestedFriends error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const users = await User.find({
      $and: [
        { _id: { $ne: req.user.id } },
        {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } }
          ]
        }
      ]
    }).select('name profilePicture bio');

    res.json(users);
  } catch (error) {
    console.error('SearchUsers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMutualFriends = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = await User.findById(req.user.id);
    const otherUser = await User.findById(id).populate('friends', 'name profilePicture');

    if (!otherUser) return res.status(404).json({ message: 'User not found' });

    const mutualFriends = otherUser.friends.filter(friend => 
      currentUser.friends.includes(friend._id.toString())
    );

    res.json(mutualFriends);
  } catch (error) {
    console.error('GetMutualFriends error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserMedia = async (req, res) => {
  try {
    const Post = require('../models/Post');
    const posts = await Post.find({
      user: req.params.id,
      $or: [
        { image: { $ne: '' } },
        { video: { $ne: '' } }
      ]
    }).select('image video createdAt');

    res.json(posts);
  } catch (error) {
    console.error('GetUserData error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: 'Password is required to delete account' });
    }
    const user = await User.findById(req.user.id);
    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password' });
    }
    await User.findByIdAndDelete(req.user.id);
    // Ideally cleanup posts, comments, etc.
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('DeleteAccount error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getUser,
  getAllUsers,
  updateUser,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
  removeFriend,
  getFriends,
  getFriendRequests,
  getSuggestedFriends,
  searchUsers,
  getMutualFriends,
  getUserMedia,
  deleteAccount,
};
