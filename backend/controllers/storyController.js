/**
 * CodeDNA
 * storyController.js — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

const Story = require('../models/Story');
const User = require('../models/User');

const createStory = async (req, res) => {
  try {
    const { image, video, caption } = req.body;
    if (!image && !video) {
      return res.status(400).json({ message: 'Image or video is required for a story' });
    }

    const story = await Story.create({
      user: req.user.id,
      image: image || '',
      video: video || '',
      caption: caption || '',
    });

    const populatedStory = await Story.findById(story._id).populate('user', 'name profilePicture');
    res.status(201).json(populatedStory);
  } catch (error) {
    console.error('CreateStory error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getFeedStories = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Get stories from friends and the user themselves
    const relevantUserIds = [...user.friends, req.user.id];

    // Mongoose will automatically filter out expired documents due to TTL index, 
    // but we add a safety check for stories within the last 24h just in case.
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const stories = await Story.find({
      user: { $in: relevantUserIds },
      createdAt: { $gte: oneDayAgo }
    })
    .populate('user', 'name profilePicture')
    .sort({ createdAt: -1 });

    // Group stories by user so each user has one "Story Card" on the frontend
    const groupedStories = [];
    const userStoryMap = new Map();

    stories.forEach(story => {
      const userIdStr = story.user._id.toString();
      if (!userStoryMap.has(userIdStr)) {
        userStoryMap.set(userIdStr, {
          user: story.user,
          stories: [story],
          latestUpdate: story.createdAt
        });
      } else {
        userStoryMap.get(userIdStr).stories.push(story);
      }
    });

    // Convert map to array and sort by latest update
    groupedStories.push(...userStoryMap.values());
    groupedStories.sort((a, b) => new Date(b.latestUpdate) - new Date(a.latestUpdate));

    res.json(groupedStories);
  } catch (error) {
    console.error('GetFeedStories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });
    if (story.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this story' });
    }
    await story.deleteOne();
    res.json({ message: 'Story deleted' });
  } catch (error) {
    console.error('DeleteStory error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const reactToStory = async (req, res) => {
  try {
    const { emoji } = req.body;
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    // Remove existing reaction from this user if any
    story.reactions = story.reactions.filter(r => r.user.toString() !== req.user.id);
    
    // Add new reaction
    story.reactions.push({ user: req.user.id, emoji });
    await story.save();

    // Create notification for story owner
    if (story.user.toString() !== req.user.id) {
      const { createNotification } = require('./notificationController');
      await createNotification(
        story.user,
        req.user.id,
        'story_reaction',
        story._id,
        `reacted to your story: ${emoji}`
      );
    }

    res.json(story.reactions);
  } catch (error) {
    console.error('ReactToStory error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const replyToStory = async (req, res) => {
  try {
    const { message } = req.body;
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    story.replies.push({ user: req.user.id, message });
    await story.save();

    // Send as a direct message in conversation
    const Conversation = require('../models/Conversation');
    const Message = require('../models/Message');

    let conversation = await Conversation.findOne({
      isGroup: false,
      participants: { $all: [req.user.id, story.user.toString()] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user.id, story.user],
        status: 'accepted'
      });
    }

    const newMessage = await Message.create({
      conversation: conversation._id,
      sender: req.user.id,
      text: message,
      mediaType: 'story_reply',
      storyId: story._id
    });

    // Update conversation last message
    conversation.lastMessage = {
      text: `Replied to story: ${message}`,
      sender: req.user.id,
      createdAt: new Date()
    };
    await conversation.save();

    // Create notification
    const { createNotification } = require('./notificationController');
    await createNotification(
      story.user,
      req.user.id,
      'story_reply',
      story._id,
      `replied to your story: "${message}"`
    );

    res.json({ message: 'Reply sent', chatMessage: newMessage });
  } catch (error) {
    console.error('ReplyToStory error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createStory,
  getFeedStories,
  deleteStory,
  reactToStory,
  replyToStory
};
