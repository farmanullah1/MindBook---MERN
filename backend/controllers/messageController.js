/**
 * CodeDNA
 * messageController.js — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

const generateVideoThumbnail = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .screenshots({
        timestamps: ['00:00:01'],
        filename: path.basename(outputPath),
        folder: path.dirname(outputPath),
        size: '320x?'
      })
      .on('end', () => resolve(outputPath))
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        reject(err);
      });
  });
};

const sendMessage = async (req, res) => {
  try {
    const { conversationId, text, mediaUrl, mediaType, mediaMetadata, repliedTo } = req.body;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

    // One-message limit for pending requests from non-friends
    if (conversation.messageRequestStatus === 'pending') {
      const messageCount = await Message.countDocuments({ 
        conversation: conversationId, 
        sender: req.user.id 
      });
      if (messageCount >= 1) {
        return res.status(403).json({ 
          message: 'MESSAGE_LIMIT_REACHED', 
          error: 'Waiting for recipient to accept your message request. Only one message can be sent until then.' 
        });
      }
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user.id,
      text,
      mediaUrl,
      mediaType,
      mediaMetadata,
      repliedTo,
      readBy: [req.user.id]
    });

    // Update conversation last message
    conversation.lastMessage = {
      text: text || `Sent an ${mediaType}`,
      sender: req.user.id,
      createdAt: new Date()
    };
    conversation.updatedAt = new Date();
    await conversation.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name profilePicture')
      .populate('repliedTo');

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('SendMessage error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMediaType = (mimetype) => {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('audio/')) {
    // Distinguish between general audio and voice recordings if needed
    // For now, if it's webm audio, we'll treat it as voice if that's the convention
    return 'audio';
  }
  const docs = [
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];
  if (docs.includes(mimetype)) return 'document';
  return 'file';
};

const uploadMessageMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const baseUrl = `${protocol}://${host}`;
    
    const mediaUrl = `${baseUrl}/uploads/${req.file.filename}`;
    const mediaType = getMediaType(req.file.mimetype);
    
    let thumbnailUrl = '';
    if (mediaType === 'video') {
      const thumbnailName = `thumb-${path.parse(req.file.filename).name}.jpg`;
      const thumbnailPath = path.join(__dirname, '..', 'uploads', thumbnailName);
      try {
        await generateVideoThumbnail(req.file.path, thumbnailPath);
        thumbnailUrl = `${baseUrl}/uploads/${thumbnailName}`;
      } catch (err) {
        console.error('Thumbnail generation failed:', err);
      }
    }

    const mediaMetadata = {
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype
    };

    res.json({ 
      success: true,
      mediaUrl, 
      mediaType,
      mediaMetadata,
      thumbnailUrl
    });
  } catch (error) {
    console.error('UploadMessageMedia error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);

    if (!message) return res.status(404).json({ message: 'Message not found' });

    await Message.findByIdAndUpdate(messageId, {
      $addToSet: { deletedFor: req.user.id }
    });

    res.json({ message: 'Message deleted for you' });
  } catch (error) {
    console.error('DeleteMessage error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteForEveryone = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);

    if (!message) return res.status(404).json({ message: 'Message not found' });
    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check 10 min limit
    const diff = (new Date() - message.createdAt) / 1000 / 60;
    if (diff > 10) {
      return res.status(400).json({ message: 'Cannot delete message after 10 minutes' });
    }

    await Message.findByIdAndUpdate(messageId, {
      isDeleted: true,
      text: 'This message was deleted',
      mediaUrl: '',
      mediaType: ''
    });

    res.json({ message: 'Message deleted for everyone' });
  } catch (error) {
    console.error('DeleteForEveryone error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const forwardMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { conversationId } = req.body;
    
    const originalMessage = await Message.findById(messageId);
    if (!originalMessage) return res.status(404).json({ message: 'Message not found' });

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user.id,
      text: originalMessage.text,
      mediaUrl: originalMessage.mediaUrl,
      mediaType: originalMessage.mediaType,
      readBy: [req.user.id]
    });

    // Update conversation last message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: {
        text: message.text || `Sent an ${message.mediaType}`,
        sender: req.user.id,
        createdAt: new Date()
      },
      updatedAt: new Date()
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name profilePicture')
      .populate('repliedTo');

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('ForwardMessage error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    await Message.updateMany(
      { conversation: conversationId, sender: { $ne: req.user.id }, readBy: { $ne: req.user.id } },
      { $addToSet: { readBy: req.user.id } }
    );
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('MarkAsRead error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  sendMessage,
  deleteMessage,
  deleteForEveryone,
  forwardMessage,
  markAsRead,
  uploadMessageMedia
};
