const Story = require('../models/Story');
const User = require('../models/User');

const createStory = async (req, res) => {
  try {
    const { image, video } = req.body;
    if (!image && !video) {
      return res.status(400).json({ message: 'Image or video is required for a story' });
    }

    const story = await Story.create({
      user: req.user.id,
      image: image || '',
      video: video || '',
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

module.exports = {
  createStory,
  getFeedStories,
  deleteStory,
};
