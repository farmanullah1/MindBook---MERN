/**
 * CodeDNA
 * cleanup.js — file cleanup utility
 * exports: initCleanupJob
 * used_by: server.js
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const Message = require('../models/Message');

const initCleanupJob = () => {
  // Run every day at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily media cleanup job...');
    
    const uploadDir = path.join(__dirname, '../uploads/messages');
    if (!fs.existsSync(uploadDir)) return;

    try {
      const files = fs.readdirSync(uploadDir);
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;

      for (const file of files) {
        const filePath = path.join(uploadDir, file);
        const stats = fs.statSync(filePath);

        // Only consider files older than 24 hours
        if (now - stats.mtimeMs > oneDay) {
          const fileUrl = `/uploads/messages/${file}`;
          
          // Check if file is referenced in any message
          const messageCount = await Message.countDocuments({
            $or: [
              { mediaUrl: fileUrl },
              { thumbnailUrl: fileUrl }
            ]
          });

          if (messageCount === 0) {
            fs.unlinkSync(filePath);
            console.log(`Deleted orphaned file: ${file}`);
          }
        }
      }
      console.log('Cleanup job completed.');
    } catch (err) {
      console.error('Cleanup job error:', err);
    }
  });
};

module.exports = { initCleanupJob };
