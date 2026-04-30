/**
 * CodeDNA
 * Conversation.js — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isGroup: { type: Boolean, default: false },
    groupName: { type: String },
    groupIcon: { type: String },
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    groupMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    lastMessage: {
      text: String,
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: Date
    },
    status: {
      type: String,
      enum: ['accepted', 'pending', 'spam'],
      default: 'accepted'
    },
    messageRequestStatus: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'accepted'
    },
    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Conversation', conversationSchema);
