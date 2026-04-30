/**
 * CodeDNA
 * eventController.js — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

const Event = require('../models/Event');
const { createNotification } = require('./notificationController');

// Create event
exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, location, coverImage } = req.body;
    const event = new Event({
      creator: req.user.id,
      title,
      description,
      date,
      location,
      coverImage,
      attendees: [req.user.id], // Creator attends by default
    });
    await event.save();
    
    // Populate creator
    await event.populate('creator', 'name profilePicture');
    
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error creating event', error: error.message });
  }
};

// Get all events (upcoming)
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find({ date: { $gte: new Date() } })
      .populate('creator', 'name profilePicture')
      .populate('attendees', 'name profilePicture')
      .sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
};

// Get single event
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('creator', 'name profilePicture')
      .populate('attendees', 'name profilePicture');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event', error: error.message });
  }
};

// RSVP to event
exports.rsvpEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const isAttending = event.attendees.includes(req.user.id);

    if (isAttending) {
      event.attendees.pull(req.user.id);
    } else {
      event.attendees.push(req.user.id);
      
      // Notify creator if someone else RSVPs
      if (event.creator.toString() !== req.user.id) {
        await createNotification(req.app.get('io'), event.creator, req.user.id, 'event_rsvp', null, `RSVP'd to your event: ${event.title}`);
      }
    }

    await event.save();
    res.json(event.attendees);
  } catch (error) {
    res.status(500).json({ message: 'Error RSVPing to event', error: error.message });
  }
};

// Delete event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await event.deleteOne();
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting event', error: error.message });
  }
};
