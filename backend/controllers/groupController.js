const Group = require('../models/Group');
const Post = require('../models/Post');

const createGroup = async (req, res) => {
  try {
    const { name, description, coverPhoto, privacy } = req.body;

    if (!name || !description) {
      return res.status(400).json({ message: 'Name and description are required' });
    }

    const group = await Group.create({
      name,
      description,
      coverPhoto: coverPhoto || '',
      privacy: privacy || 'public',
      admin: req.user.id,
      members: [req.user.id], // Admin is automatically a member
    });

    res.status(201).json(group);
  } catch (error) {
    console.error('CreateGroup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getGroups = async (req, res) => {
  try {
    // Get all public groups OR groups where the user is a member
    const groups = await Group.find({
      $or: [
        { privacy: 'public' },
        { members: req.user.id }
      ]
    }).populate('admin', 'name profilePicture').sort({ createdAt: -1 });

    res.json(groups);
  } catch (error) {
    console.error('GetGroups error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('admin', 'name profilePicture')
      .populate('members', 'name profilePicture');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.privacy === 'private' && !group.members.some(m => m._id.toString() === req.user.id)) {
      return res.status(403).json({ message: 'This is a private group' });
    }

    res.json(group);
  } catch (error) {
    console.error('GetGroupById error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const joinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (group.members.includes(req.user.id)) {
      return res.status(400).json({ message: 'You are already a member' });
    }

    group.members.push(req.user.id);
    await group.save();

    res.json(group);
  } catch (error) {
    console.error('JoinGroup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (group.admin.toString() === req.user.id) {
      return res.status(400).json({ message: 'Admin cannot leave the group. Delete it instead.' });
    }

    group.members.pull(req.user.id);
    await group.save();

    res.json(group);
  } catch (error) {
    console.error('LeaveGroup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getGroupPosts = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (group.privacy === 'private' && !group.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Private group. Join to see posts.' });
    }

    const posts = await Post.find({ group: req.params.id })
      .populate('user', 'name profilePicture')
      .populate('comments.user', 'name profilePicture')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error('GetGroupPosts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createGroupPost = async (req, res) => {
  try {
    const { content, image } = req.body;
    
    if (!content && !image) {
      return res.status(400).json({ message: 'Post must have content or an image' });
    }

    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (!group.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'You must be a member to post' });
    }

    const post = await Post.create({
      user: req.user.id,
      group: req.params.id,
      content: content || '',
      image: image || '',
    });

    const populatedPost = await Post.findById(post._id)
      .populate('user', 'name profilePicture')
      .populate('comments.user', 'name profilePicture');

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('CreateGroupPost error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createGroup,
  getGroups,
  getGroupById,
  joinGroup,
  leaveGroup,
  getGroupPosts,
  createGroupPost
};
