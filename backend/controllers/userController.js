const User = require('../models/User');

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
    if (req.params.id !== req.user.id) {
      return res.status(403).json({ message: 'You can only update your own profile' });
    }

    const allowedFields = ['name', 'bio', 'city', 'workplace', 'profilePicture', 'coverPicture'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
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

const getSuggestedFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const excludeIds = [
      req.user.id,
      ...user.friends.map((f) => f.toString()),
      ...user.sentFriendRequests.map((f) => f.toString()),
      ...user.friendRequests.map((f) => f.toString()),
    ];

    const suggestions = await User.find({ _id: { $nin: excludeIds } })
      .select('name profilePicture')
      .limit(10);

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
    const users = await User.find({ name: { $regex: q, $options: 'i' } })
      .select('name profilePicture')
      .limit(10);
    res.json(users);
  } catch (error) {
    console.error('SearchUsers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const toggleSavePost = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const postId = req.params.postId;

    if (user.savedPosts.includes(postId)) {
      user.savedPosts = user.savedPosts.filter((id) => id.toString() !== postId);
    } else {
      user.savedPosts.push(postId);
    }
    await user.save();
    
    // Return updated user object
    res.json(user);
  } catch (error) {
    console.error('ToggleSavePost error:', error);
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
  removeFriend,
  getSuggestedFriends,
  searchUsers,
  toggleSavePost,
};
