// src/App.js
import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, isSameMonth } from 'date-fns';
import './App.css';
import eventsData from './events.json';
import holidaysData from './holidays.json';
import SideMenu from './components/SideMenu';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [holidays, setHolidays] = useState([]);

  // Load events and holidays from JSON
  useEffect(() => {
    try {
      setEvents(eventsData || []);
      setHolidays(holidaysData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      setEvents([]);
      setHolidays([]);
    }
  }, []);

  // Navigate to next month
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  // Navigate to previous month
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Get days of the current month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get events for a specific date
  const getEventsForDate = (date) => {
    if (!date) return [];
    return events.filter(event => isSameDay(parseISO(event.date), date)).sort((a, b) => {
      return parseInt(a.time.replace(':', '')) - parseInt(b.time.replace(':', ''));
    });
  };

  // Get holiday for a specific date
  const getHolidayForDate = (date) => {
    if (!date) return null;
    const dateStr = format(date, 'yyyy-MM-dd');
    return holidays.find(holiday => holiday.date.startsWith(dateStr));
  };

  // Add new event
  const handleAddEvent = (newEvent) => {
    setEvents(prevEvents => [...prevEvents, newEvent]);
  };

  // Delete event
  const handleDeleteEvent = (eventToDelete) => {
    setEvents(prevEvents => 
      prevEvents.filter(event => 
        !(event.date === eventToDelete.date && 
          event.time === eventToDelete.time && 
          event.title === eventToDelete.title)
      )
    );
  };

  // Detect event conflicts (overlapping times)
  const hasConflict = (eventsOnDate) => {
    for (let i = 0; i < eventsOnDate.length - 1; i++) {
      for (let j = i + 1; j < eventsOnDate.length; j++) {
        const start1 = parseInt(eventsOnDate[i].time.replace(':', ''));
        const end1 = start1 + (eventsOnDate[i].duration * 100);
        const start2 = parseInt(eventsOnDate[j].time.replace(':', ''));
        const end2 = start2 + (eventsOnDate[j].duration * 100);
        if (start1 < end2 && end1 > start2) return true;
      }
    }
    return false;
  };

  // Get days from previous month to fill the first week
  const getPreviousMonthDays = () => {
    const firstDayOfMonth = monthStart.getDay();
    const prevMonthEnd = new Date(monthStart);
    prevMonthEnd.setDate(0);
    const prevMonthDays = [];
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      prevMonthDays.push(new Date(prevMonthEnd.getFullYear(), prevMonthEnd.getMonth(), prevMonthEnd.getDate() - i));
    }
    return prevMonthDays;
  };

  // Get days from next month to fill the last week
  const getNextMonthDays = () => {
    const lastDayOfMonth = monthEnd.getDay();
    const nextMonthDays = [];
    for (let i = 1; i <= 6 - lastDayOfMonth; i++) {
      nextMonthDays.push(new Date(monthEnd.getFullYear(), monthEnd.getMonth(), monthEnd.getDate() + i));
    }
    return nextMonthDays;
  };

  const allDays = [...getPreviousMonthDays(), ...days, ...getNextMonthDays()];

  return (
    <div className="app-container">
      <div className="calendar-container">
        {/* Header */}
        <div className="calendar-header">
          <button
            onClick={prevMonth}
            className="calendar-nav-button"
          >
            Previous
          </button>
          <h2 className="calendar-title">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button
            onClick={nextMonth}
            className="calendar-nav-button"
          >
            Next
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="calendar-grid">
          {/* Weekday Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <div 
              key={day} 
              className={`weekday-header ${index === 0 || index === 6 ? 'weekend' : ''}`}
            >
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {allDays.map((day) => {
            const eventsOnDate = getEventsForDate(day);
            const holiday = getHolidayForDate(day);
            const isToday = isSameDay(day, new Date());
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const hasEventConflict = hasConflict(eventsOnDate);
            const isWeekend = day.getDay() === 0 || day.getDay() === 6;
            const holidayType = holiday?.type?.[0]?.toLowerCase() || '';

            return (
              <div
                key={day.toISOString()}
                className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${!isCurrentMonth ? 'other-month' : ''} ${isWeekend ? 'weekend' : ''} ${holiday ? 'holiday' : ''}`}
                onClick={() => setSelectedDate(day)}
                data-type={holidayType}
              >
                <span>{format(day, 'd')}</span>
                {holiday && (
                  <div className="holiday-name" title={holiday.title}>
                    {holiday.title}
                  </div>
                )}
                {eventsOnDate.length > 0 && (
                  <div className="mt-1">
                    {eventsOnDate.map((event, index) => (
                      <div
                        key={index}
                        className={`event ${hasEventConflict ? 'bg-red-100 text-red-700' : ''}`}
                        title={`${event.title} (${event.time})`}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Side Menu */}
      <SideMenu
        selectedDate={selectedDate}
        onAddEvent={handleAddEvent}
        events={events}
        onDeleteEvent={handleDeleteEvent}
        holiday={selectedDate ? getHolidayForDate(selectedDate) : null}
      />
    </div>
  );
}

export default App;