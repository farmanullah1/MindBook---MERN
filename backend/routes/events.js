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
