/**
 * CodeDNA
 * Message.js — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      default: '',
    },
    mediaUrl: {
      type: String,
      default: '',
    },
    mediaType: {
      type: String,
      enum: ['image', 'video', 'audio', 'document', 'story_reply', ''],
      default: '',
    },
    mediaMetadata: {
      fileName: { type: String },
      fileSize: { type: Number },
      duration: { type: Number } // for audio/video
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    repliedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    storyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Story',
    },
    deliveredAt: {
      type: Date,
    },
    readAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
