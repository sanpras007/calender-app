import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SideMenu = ({ events, onEventClick }) => {
  const [isClosed, setIsClosed] = useState(false);

  const toggleMenu = () => {
    setIsClosed(!isClosed);
  };

  return (
    <div className={`side-menu ${isClosed ? 'closed' : ''}`}>
      <button className="side-menu-toggle" onClick={toggleMenu}>
        {isClosed ? <ChevronRight /> : <ChevronLeft />}
      </button>
      
      {!isClosed && (
        <>
          <div className="side-menu-header">
            <h2>Upcoming Events</h2>
          </div>
          <div className="side-menu-content">
            {events.length > 0 ? (
              events.map((event) => (
                <div
                  key={event.id}
                  className="event-item"
                  onClick={() => onEventClick(event)}
                >
                  <div className="event-date">
                    <span className="event-day">{event.day}</span>
                    <span className="event-month">{event.month}</span>
                  </div>
                  <div className="event-details">
                    <h3>{event.title}</h3>
                    <p>{event.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-events">No upcoming events</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SideMenu; 