/**
 * CodeDNA
 * Story.js — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

const mongoose = require('mongoose');

const storySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    image: {
      type: String,
      default: '',
    },
    video: {
      type: String,
      default: '',
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 86400, // Automatically delete document after 24 hours (86400 seconds)
    },
    reactions: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      emoji: { type: String }, // ❤️, 😂, 😮, etc.
      createdAt: { type: Date, default: Date.now }
    }],
    replies: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      message: { type: String }, // text reply
      createdAt: { type: Date, default: Date.now }
    }]
  }
);

module.exports = mongoose.model('Story', storySchema);
