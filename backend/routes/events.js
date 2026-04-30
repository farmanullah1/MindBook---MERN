/**
 * CodeDNA
 * events.js — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createEvent,
  getEvents,
  getEvent,
  rsvpEvent,
  deleteEvent
} = require('../controllers/eventController');

router.post('/', auth, createEvent);
router.get('/', auth, getEvents);
router.get('/:id', auth, getEvent);
router.put('/:id/rsvp', auth, rsvpEvent);
router.delete('/:id', auth, deleteEvent);

module.exports = router;
