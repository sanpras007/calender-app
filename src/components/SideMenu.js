import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

function SideMenu({ selectedDate, onAddEvent, events, onDeleteEvent, holiday }) {
  const [isOpen, setIsOpen] = useState(true);
  const [newEvent, setNewEvent] = useState({
    title: '',
    time: '',
    duration: 1,
    description: ''
  });

  // Effect to automatically open side menu when a date with events is selected
  useEffect(() => {
    if (selectedDate) {
      const hasEvents = events.some(event => 
        event.date === format(selectedDate, 'yyyy-MM-dd')
      );
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
      setNewEvent({
        title: '',
        time: '',
        duration: 1,
        description: ''
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleSideMenu = () => {
    setIsOpen(!isOpen);
  };

  const eventsOnSelectedDate = selectedDate ? events.filter(event => 
    event.date === format(selectedDate, 'yyyy-MM-dd')
  ).sort((a, b) => {
    return parseInt(a.time.replace(':', '')) - parseInt(b.time.replace(':', ''));
  }) : [];

  if (!selectedDate) {
    return (
      <div className="side-menu">
        <div className="side-menu-header">
          <h3>Events</h3>
          <div className="selected-date">Please select a date</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`side-menu ${!isOpen ? 'closed' : ''}`}>
      <button className="side-menu-toggle" onClick={toggleSideMenu} aria-label={isOpen ? "Close menu" : "Open menu"}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      {isOpen && selectedDate && (
        <>
          <div className="side-menu-header">
            <h3>Events</h3>
            <div className="selected-date">
              {format(selectedDate, 'MMMM d, yyyy')}
            </div>
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

          <form onSubmit={handleSubmit} className="event-form">
            <div className="form-group">
              <label htmlFor="title">Event Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={newEvent.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="time">Time</label>
              <input
                type="time"
                id="time"
                name="time"
                value={newEvent.time}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="duration">Duration (hours)</label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={newEvent.duration}
                onChange={handleChange}
                min="1"
                max="24"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={newEvent.description}
                onChange={handleChange}
              />
            </div>
            <button type="submit" className="add-event-button">
              Add Event
            </button>
          </form>

          <div className="events-list">
            <h4>Events on {format(selectedDate, 'MMMM d')}</h4>
            {eventsOnSelectedDate.length > 0 ? (
              eventsOnSelectedDate.map((event, index) => (
                <div key={index} className="event-item">
                  <div className="event-item-header">
                    <span className="event-time">{event.time}</span>
                    <button
                      onClick={() => onDeleteEvent(event)}
                      className="delete-event-button"
                    >
                      ×
                    </button>
                  </div>
                  <h5>{event.title}</h5>
                  {event.description && (
                    <p className="event-description">{event.description}</p>
                  )}
                  <p className="event-duration">{event.duration} hour(s)</p>
                </div>
              ))
            ) : (
              <p className="no-events">No events scheduled</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default SideMenu; 