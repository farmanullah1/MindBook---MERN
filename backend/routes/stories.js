const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createStory, getFeedStories, deleteStory } = require('../controllers/storyController');

router.post('/', auth, createStory);
router.get('/', auth, getFeedStories);
router.delete('/:id', auth, deleteStory);

module.exports = router;
