/**
 * CodeDNA
 * cleanup.js — media cleanup utility
 * exports: none
 * used_by: server.js
 * rules: Daily orphaned file cleanup
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Implemented orphaned media cleanup
 */

const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const Message = require('../models/Message');

const cleanupOrphanedMedia = async () => {
  console.log('Running media cleanup job...');
  const uploadDir = path.join(__dirname, '../uploads/messages');
  
  if (!fs.existsSync(uploadDir)) return;

  try {
    const files = fs.readdirSync(uploadDir);
    const now = Date.now();
    const ONE_DAY = 24 * 60 * 60 * 1000;

    for (const file of files) {
      const filePath = path.join(uploadDir, file);
      const stats = fs.statSync(filePath);

      // Only check files older than 24 hours to avoid deleting active uploads
      if (now - stats.mtimeMs > ONE_DAY) {
        const mediaUrl = `/uploads/messages/${file}`;
        const messageExists = await Message.findOne({ 
          $or: [{ mediaUrl }, { thumbnailUrl: mediaUrl }] 
        });

        if (!messageExists) {
          fs.unlinkSync(filePath);
          console.log(`Deleted orphaned file: ${file}`);
        }
      }
    }
    console.log('Media cleanup job completed.');
  } catch (error) {
    console.error('Error during media cleanup:', error);
  }
};

// Schedule to run every day at midnight
const initCleanupJob = () => {
  cron.schedule('0 0 * * *', cleanupOrphanedMedia);
  console.log('Orphaned media cleanup job scheduled (Daily at Midnight)');
};

module.exports = { initCleanupJob, cleanupOrphanedMedia };
