/**
 * CodeDNA
 * Events.tsx — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

import React, { useState, useEffect } from 'react';
import { FiCalendar, FiMapPin, FiUsers, FiPlus, FiX } from 'react-icons/fi';
import Navbar from '../../components/Navbar/Navbar';
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar';
import RightSidebar from '../../components/RightSidebar/RightSidebar';
import api, { uploadFile } from '../../services/api';
import { useAppSelector } from '../../store/hooks';
import { IEvent } from '../../types';
import { getInitials } from '../../utils/helpers';
import './Events.css';

const Events: React.FC = () => {
  const { user } = useAppSelector(state => state.auth);
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '', location: '', coverImage: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let coverImage = '';
      if (imageFile) {
        const res = await uploadFile(imageFile);
        coverImage = res.url;
      }
      await api.post('/events', { ...newEvent, coverImage });
      setShowCreateModal(false);
      setNewEvent({ title: '', description: '', date: '', location: '', coverImage: '' });
      setImageFile(null);
      fetchEvents();
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  const handleRSVP = async (eventId: string) => {
    try {
      await api.put(`/events/${eventId}/rsvp`);
      fetchEvents();
    } catch (error) {
      console.error('Failed to RSVP:', error);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await api.delete(`/events/${eventId}`);
        fetchEvents();
      } catch (error) {
        console.error('Failed to delete event:', error);
      }
    }
  };

  return (
    <div className="app-container">
      <Navbar />
      <div className="main-content-layout">
        <LeftSidebar />
        <main className="main-feed-area">
          <div className="events-page-container">
            <div className="events-header">
              <h1>Events</h1>
              <button className="btn btn-primary create-event-btn" onClick={() => setShowCreateModal(true)}>
                <FiPlus size={18} /> Create Event
              </button>
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                <div className="spinner"></div>
              </div>
            ) : events.length === 0 ? (
              <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <FiCalendar size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <h3>No upcoming events</h3>
                <p>Create an event to gather your friends together!</p>
              </div>
            ) : (
              <div className="events-grid">
                {events.map(event => {
                  const eventDate = new Date(event.date);
                  const isAttending = event.attendees.some(a => a._id === user?._id);
                  const isCreator = event.creator._id === user?._id;

                  return (
                    <div key={event._id} className="card event-card">
                      {event.coverImage ? (
                        <img src={event.coverImage} alt={event.title} className="event-cover" />
                      ) : (
                        <div className="event-cover-placeholder">
                          <FiCalendar size={48} />
                        </div>
                      )}
                      <div className="event-details">
                        <div style={{ display: 'flex', gap: '16px' }}>
                          <div className="event-date-badge">
                            <span className="event-date-month">{eventDate.toLocaleString('default', { month: 'short' })}</span>
                            <span className="event-date-day">{eventDate.getDate()}</span>
                          </div>
                          <div>
                            <h3 className="event-title">{event.title}</h3>
                            <div className="event-meta">
                              <span className="event-meta-item">
                                <FiCalendar size={14} />
                                {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {event.location && (
                                <span className="event-meta-item">
                                  <FiMapPin size={14} />
                                  {event.location}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {event.description && (
                          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {event.description}
                          </p>
                        )}

                        <div className="event-attendees">
                          <div className="attendees-avatars">
                            {event.attendees.slice(0, 3).map((attendee, i) => (
                              <div key={attendee._id} className="attendee-avatar" style={{ zIndex: 3 - i }}>
                                {attendee.profilePicture ? (
                                  <img src={attendee.profilePicture} alt={attendee.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                ) : (
                                  <div className="avatar-initials" style={{ width: '100%', height: '100%', fontSize: '10px' }}>{getInitials(attendee.name)}</div>
                                )}
                              </div>
                            ))}
                          </div>
                          <span className="attendees-count">
                            {event.attendees.length} {event.attendees.length === 1 ? 'attendee' : 'attendees'}
                          </span>
                        </div>

                        <div className="event-actions">
                          <button 
                            className={`btn ${isAttending ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                            onClick={() => handleRSVP(event._id)}
                            style={{ flex: 1, marginRight: isCreator ? '8px' : '0' }}
                          >
                            {isAttending ? 'Not Going' : 'Going'}
                          </button>
                          {isCreator && (
                            <button className="btn btn-secondary btn-sm" onClick={() => handleDelete(event._id)}>
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
        <RightSidebar />
      </div>

      {showCreateModal && (
        <div className="event-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="card event-modal" onClick={e => e.stopPropagation()}>
            <div className="event-modal-header">
              <h2>Create Event</h2>
              <button className="close-modal-btn" onClick={() => setShowCreateModal(false)}>
                <FiX size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="event-form-group">
                <label>Event Name</label>
                <input 
                  type="text" 
                  className="event-form-input" 
                  placeholder="What is the event called?"
                  required 
                  value={newEvent.title}
                  onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                />
              </div>
              <div className="event-form-group">
                <label>Date & Time</label>
                <input 
                  type="datetime-local" 
                  className="event-form-input" 
                  required 
                  value={newEvent.date}
                  onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                />
              </div>
              <div className="event-form-group">
                <label>Location</label>
                <input 
                  type="text" 
                  className="event-form-input" 
                  placeholder="Where is it happening?"
                  value={newEvent.location}
                  onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                />
              </div>
              <div className="event-form-group">
                <label>Description</label>
                <textarea 
                  className="event-form-input" 
                  placeholder="Tell people more about the event"
                  rows={4}
                  value={newEvent.description}
                  onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                ></textarea>
              </div>
              <div className="event-form-group">
                <label>Cover Image</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)}
                />
              </div>
              <div className="event-modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
