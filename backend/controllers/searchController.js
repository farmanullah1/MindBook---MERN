const User = require('../models/User');
const Post = require('../models/Post');
const Group = require('../models/Group');

const globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ users: [], posts: [], groups: [] });

    const regex = new RegExp(q, 'i');

    const [users, posts, groups] = await Promise.all([
      User.find({ name: regex }).select('name profilePicture').limit(5),
      Post.find({ content: regex })
        .populate('user', 'name profilePicture')
        .limit(5)
        .sort({ createdAt: -1 }),
      Group.find({ name: regex }).limit(5),
    ]);

    res.json({
      users,
      posts,
      groups,
    });
  } catch (error) {
    console.error('GlobalSearch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  globalSearch,
};
