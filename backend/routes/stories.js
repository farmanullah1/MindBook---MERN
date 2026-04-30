/**
 * CodeDNA
 * stories.js — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createStory, getFeedStories, deleteStory, reactToStory, replyToStory } = require('../controllers/storyController');

router.post('/', auth, createStory);
router.get('/', auth, getFeedStories);
router.delete('/:id', auth, deleteStory);
router.post('/:id/react', auth, reactToStory);
router.post('/:id/reply', auth, replyToStory);

module.exports = router;
