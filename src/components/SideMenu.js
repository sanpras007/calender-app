import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

function SideMenu({ selectedDate, onAddEvent, events, onDeleteEvent, holiday }) {
  const [newEvent, setNewEvent] = useState({ title: '', time: '', description: '', duration: 1 });
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  // Auto-open side menu when a date with events or holiday is selected
  useEffect(() => {
    if (selectedDate) {
      const hasEvents = events.some(event => event.date === format(selectedDate, 'yyyy-MM-dd'));
      if (hasEvents || holiday) {
        setIsOpen(true);
      }
    }
  }, [selectedDate, events, holiday]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedDate && newEvent.title && newEvent.time) {
      onAddEvent({
        ...newEvent,
        date: format(selectedDate, 'yyyy-MM-dd')
      });
      setNewEvent({ title: '', time: '', description: '', duration: 1 });
      setIsAddingEvent(false);
    }
  };

  const eventsOnSelectedDate = selectedDate
    ? events.filter(event => event.date === format(selectedDate, 'yyyy-MM-dd'))
    : [];

  return (
    <div className={`side-menu ${!isOpen ? 'closed' : ''}`}>
      <button 
        className="side-menu-toggle" 
        onClick={() => setIsOpen(!isOpen)} 
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="side-menu-header">
            <h3>Events & Details</h3>
            {selectedDate && (
              <div className="selected-date">
                {format(selectedDate, 'MMMM d, yyyy')}
              </div>
            )}
          </div>

          {holiday && (
            <div className="holiday-info">
              <h4 className="holiday-title">{holiday.title}</h4>
              <div className="holiday-types">
                {holiday.type && holiday.type.map((type, index) => (
                  <span key={index} className="holiday-type">{type}</span>
                ))}
              </div>
              <p className="holiday-description">{holiday.description}</p>
            </div>
          )}

          <div className="events-section">
            <div className="events-header">
              <h4>Events</h4>
            </div>

            <div className="events-list">
              {eventsOnSelectedDate.length > 0 ? (
                eventsOnSelectedDate.map((event, index) => (
                  <div key={index} className="event-item">
                    <div className="event-item-header">
                      <span className="event-time">{event.time}</span>
                      <button
                        className="delete-event-button"
                        onClick={() => onDeleteEvent(event)}
                      >
                        ×
                      </button>
                    </div>
                    <h5>{event.title}</h5>
                    {event.description && (
                      <p className="event-description">{event.description}</p>
                    )}
                    <p className="event-duration">{event.duration} hour{event.duration !== 1 ? 's' : ''}</p>
                  </div>
                ))
              ) : (
                <div className="no-events">No events scheduled for this date</div>
              )}
            </div>

            <div className="events-header" style={{ marginTop: '1rem' }}>
              <button 
                className="add-event-toggle"
                onClick={() => setIsAddingEvent(!isAddingEvent)}
              >
                {isAddingEvent ? 'Cancel' : '+ Add Event'}
              </button>
            </div>

            {isAddingEvent && (
              <form onSubmit={handleSubmit} className="event-form">
                <div className="form-group">
                  <label htmlFor="title">Event Title</label>
                  <input
                    type="text"
                    id="title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="time">Time</label>
                  <input
                    type="time"
                    id="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="duration">Duration (hours)</label>
                  <input
                    type="number"
                    id="duration"
                    min="1"
                    max="24"
                    value={newEvent.duration}
                    onChange={(e) => setNewEvent({ ...newEvent, duration: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Add event details..."
                  />
                </div>
                <button type="submit" className="add-event-button">
                  Add Event
                </button>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default SideMenu; 