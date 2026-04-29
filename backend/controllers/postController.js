const Post = require('../models/Post');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

const createPost = async (req, res) => {
  try {
    const { content, image } = req.body;

    if (!content && !image) {
      return res.status(400).json({ message: 'Post must have content or an image' });
    }

    const post = await Post.create({
      user: req.user.id,
      content: content || '',
      image: image || '',
    });

    const populatedPost = await Post.findById(post._id)
      .populate('user', 'name profilePicture')
      .populate('comments.user', 'name profilePicture');

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('CreatePost error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getFeedPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const currentUser = await User.findById(req.user.id);
    const feedUsers = [req.user.id, ...currentUser.friends];

    const posts = await Post.find({ user: { $in: feedUsers } })
      .populate('user', 'name profilePicture')
      .populate('comments.user', 'name profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ user: { $in: feedUsers } });

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
    });
  } catch (error) {
    console.error('GetFeedPosts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .populate('user', 'name profilePicture')
      .populate('comments.user', 'name profilePicture')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error('GetUserPosts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'name profilePicture')
      .populate('comments.user', 'name profilePicture');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('GetPost error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own posts' });
    }

    const { content, image } = req.body;
    if (content !== undefined) post.content = content;
    if (image !== undefined) post.image = image;

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate('user', 'name profilePicture')
      .populate('comments.user', 'name profilePicture');

    res.json(updatedPost);
  } catch (error) {
    console.error('UpdatePost error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('DeletePost error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likeIndex = post.likes.indexOf(req.user.id);

    if (likeIndex === -1) {
      post.likes.push(req.user.id);
      await createNotification(post.user, req.user.id, 'like', post._id);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate('user', 'name profilePicture')
      .populate('comments.user', 'name profilePicture');

    res.json(updatedPost);
  } catch (error) {
    console.error('LikePost error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const commentOnPost = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push({
      user: req.user.id,
      text,
    });

    await post.save();
    
    await createNotification(post.user, req.user.id, 'comment', post._id, text.substring(0, 50));

    const updatedPost = await Post.findById(post._id)
      .populate('user', 'name profilePicture')
      .populate('comments.user', 'name profilePicture');

    res.json(updatedPost);
  } catch (error) {
    console.error('CommentOnPost error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.user.toString() !== req.user.id && post.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    post.comments.pull({ _id: req.params.commentId });
    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate('user', 'name profilePicture')
      .populate('comments.user', 'name profilePicture');

    res.json(updatedPost);
  } catch (error) {
    console.error('DeleteComment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getSavedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'savedPosts',
      populate: [
        { path: 'user', select: 'name profilePicture' },
        { path: 'comments.user', select: 'name profilePicture' }
      ]
    });
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Reverse array to show most recently saved first
    res.json(user.savedPosts.reverse());
  } catch (error) {
    console.error('GetSavedPosts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const toggleSavePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isSaved = user.savedPosts.includes(req.params.id);

    if (isSaved) {
      user.savedPosts.pull(req.params.id);
    } else {
      user.savedPosts.push(req.params.id);
    }

    await user.save();
    
    res.json({ savedPosts: user.savedPosts });
  } catch (error) {
    console.error('ToggleSavePost error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createPost,
  getFeedPosts,
  getUserPosts,
  getPost,
  updatePost,
  deletePost,
  likePost,
  commentOnPost,
  deleteComment,
  getSavedPosts,
  toggleSavePost,
};
