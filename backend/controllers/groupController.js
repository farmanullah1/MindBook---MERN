/**
 * CodeDNA
 * groupController.js — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

const Group = require('../models/Group');
const Post = require('../models/Post');
const User = require('../models/User');

const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '')    // Remove all non-word chars
    .replace(/--+/g, '-');    // Replace multiple - with single -
};

const createGroup = async (req, res) => {
  try {
    const { name, description, privacy, coverPhoto } = req.body;

    const slug = generateSlug(name);
    
    // Check if group name exists
    const existingGroup = await Group.findOne({ name });
    if (existingGroup) {
      return res.status(400).json({ message: 'Group name already taken' });
    }

    const group = await Group.create({
      name,
      slug,
      description,
      privacy,
      coverPhoto: coverPhoto || '',
      creator: req.user.id,
      admins: [req.user.id],
      members: [req.user.id],
    });

    res.status(201).json(group);
  } catch (error) {
    console.error('CreateGroup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getGroups = async (req, res) => {
  try {
    const userId = req.user.id;
    const memberGroups = await Group.find({ members: userId })
      .populate('members', 'name profilePicture');
    
    const suggestedGroups = await Group.find({ 
      members: { $ne: userId },
      privacy: 'public'
    }).limit(5).populate('members', 'name profilePicture');

    res.json({ memberGroups, suggestedGroups });
  } catch (error) {
    console.error('GetGroups error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getDiscoverGroups = async (req, res) => {
  try {
    const userId = req.user.id;
    const groups = await Group.find({ 
      members: { $ne: userId },
      privacy: 'public'
    }).populate('members', 'name profilePicture');

    res.json(groups);
  } catch (error) {
    console.error('GetDiscoverGroups error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('admins', 'name profilePicture')
      .populate('moderators', 'name profilePicture')
      .populate('members', 'name profilePicture')
      .populate('creator', 'name profilePicture')
      .populate('joinRequests.user', 'name profilePicture');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is banned
    if (group.bannedMembers.includes(req.user.id)) {
      return res.status(403).json({ message: 'You are banned from this group' });
    }

    // Determine membership status
    const isMember = group.members.some(m => m._id.toString() === req.user.id);
    const isAdmin = group.admins.some(m => m._id.toString() === req.user.id);
    const isModerator = group.moderators.some(m => m._id.toString() === req.user.id);
    const isPending = group.joinRequests.some(r => r.user.toString() === req.user.id);

    res.json({
      ...group._doc,
      isMember,
      isAdmin,
      isModerator,
      isPending
    });
  } catch (error) {
    console.error('GetGroup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const joinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (group.members.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already a member' });
    }

    if (group.bannedMembers.includes(req.user.id)) {
      return res.status(403).json({ message: 'You are banned from this group' });
    }

    if (group.privacy === 'public') {
      group.members.push(req.user.id);
      await group.save();
      return res.json({ message: 'Joined successfully', status: 'member' });
    } else {
      // Private group - send request
      if (group.joinRequests.some(r => r.user.toString() === req.user.id)) {
        return res.status(400).json({ message: 'Join request already pending' });
      }
      group.joinRequests.push({ user: req.user.id });
      await group.save();
      return res.json({ message: 'Join request sent', status: 'pending' });
    }
  } catch (error) {
    console.error('JoinGroup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (!group.members.includes(req.user.id)) {
      return res.status(400).json({ message: 'Not a member of this group' });
    }

    // If only admin, must promote someone else
    if (group.admins.length === 1 && group.admins[0].toString() === req.user.id) {
      if (group.members.length > 1) {
        return res.status(400).json({ message: 'Please promote another admin before leaving' });
      } else {
        // Only member and only admin - delete group or just leave (group becomes empty)
        // Usually, deleting is better.
      }
    }

    group.members.pull(req.user.id);
    group.admins.pull(req.user.id);
    group.moderators.pull(req.user.id);
    
    await group.save();
    res.json({ message: 'Left group successfully' });
  } catch (error) {
    console.error('LeaveGroup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const approveJoinRequest = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Check permissions (admin or moderator)
    const canManage = group.admins.includes(req.user.id) || group.moderators.includes(req.user.id);
    if (!canManage) return res.status(403).json({ message: 'Not authorized' });

    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'User ID required' });

    // Remove from requests and add to members
    group.joinRequests.pull({ user: userId });
    if (!group.members.includes(userId)) {
      group.members.push(userId);
    }
    
    await group.save();
    res.json({ message: 'Request approved' });
  } catch (error) {
    console.error('ApproveRequest error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const declineJoinRequest = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const canManage = group.admins.includes(req.user.id) || group.moderators.includes(req.user.id);
    if (!canManage) return res.status(403).json({ message: 'Not authorized' });

    const { userId } = req.body;
    group.joinRequests.pull({ user: userId });
    
    await group.save();
    res.json({ message: 'Request declined' });
  } catch (error) {
    console.error('DeclineRequest error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getGroupFeed = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Check privacy
    if (group.privacy === 'private' && !group.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Private group content is only for members' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get pinned posts first if page 1
    let pinnedPosts = [];
    if (page === 1) {
      pinnedPosts = await Post.find({ _id: { $in: group.pinnedPosts } })
        .populate('user', 'name profilePicture')
        .populate('comments.user', 'name profilePicture');
    }

    const posts = await Post.find({ 
      group: req.params.id,
      _id: { $nin: group.pinnedPosts } 
    })
      .populate('user', 'name profilePicture')
      .populate('comments.user', 'name profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      pinnedPosts,
      posts,
      page,
      hasMore: posts.length === limit
    });
  } catch (error) {
    console.error('GetGroupFeed error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (!group.admins.includes(req.user.id)) {
      return res.status(403).json({ message: 'Only admins can update group settings' });
    }

    const { name, description, privacy, coverPhoto, rules } = req.body;
    if (name) {
      group.name = name;
      group.slug = generateSlug(name);
    }
    if (description !== undefined) group.description = description;
    if (privacy) group.privacy = privacy;
    if (coverPhoto) group.coverPhoto = coverPhoto;
    if (rules) group.rules = rules;

    await group.save();
    res.json(group);
  } catch (error) {
    console.error('UpdateGroup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const manageMember = async (req, res) => {
  try {
    const { userId, action } = req.body;
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Only admins can manage roles
    if (!group.admins.includes(req.user.id)) {
      return res.status(403).json({ message: 'Only admins can manage member roles' });
    }

    if (action === 'promote-admin') {
      if (!group.admins.includes(userId)) group.admins.push(userId);
      group.moderators.pull(userId);
    } else if (action === 'promote-mod') {
      if (!group.moderators.includes(userId)) group.moderators.push(userId);
      group.admins.pull(userId);
    } else if (action === 'demote') {
      group.admins.pull(userId);
      group.moderators.pull(userId);
    } else if (action === 'remove') {
      group.members.pull(userId);
      group.admins.pull(userId);
      group.moderators.pull(userId);
    } else if (action === 'ban') {
      group.members.pull(userId);
      group.admins.pull(userId);
      group.moderators.pull(userId);
      if (!group.bannedMembers.includes(userId)) group.bannedMembers.push(userId);
    }

    await group.save();
    res.json({ message: 'Member updated successfully' });
  } catch (error) {
    console.error('ManageMember error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const pinPost = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (!group.admins.includes(req.user.id) && !group.moderators.includes(req.user.id)) {
      return res.status(403).json({ message: 'Only admins and moderators can pin posts' });
    }

    const { postId } = req.body;
    if (!group.pinnedPosts.includes(postId)) {
      group.pinnedPosts.push(postId);
      await group.save();
    }
    res.json({ message: 'Post pinned successfully' });
  } catch (error) {
    console.error('PinPost error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const unpinPost = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (!group.admins.includes(req.user.id) && !group.moderators.includes(req.user.id)) {
      return res.status(403).json({ message: 'Only admins and moderators can unpin posts' });
    }

    const { postId } = req.body;
    group.pinnedPosts.pull(postId);
    await group.save();
    res.json({ message: 'Post unpinned successfully' });
  } catch (error) {
    console.error('UnpinPost error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createGroup,
  getGroups,
  getGroup,
  joinGroup,
  leaveGroup,
  approveJoinRequest,
  declineJoinRequest,
  getGroupFeed,
  updateGroup,
  manageMember,
  pinPost,
  unpinPost,
  getDiscoverGroups,
  getGroupMedia: async (req, res) => {
    try {
      const posts = await Post.find({ 
        group: req.params.id, 
        mediaUrl: { $ne: '' } 
      }).select('mediaUrl mediaType createdAt');
      
      res.status(200).json(posts);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};
