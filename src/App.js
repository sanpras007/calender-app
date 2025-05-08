// src/App.js
import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, isSameMonth, setMonth, setYear } from 'date-fns';
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
    // Adjust for Monday start (0 = Sunday, 1 = Monday, etc.)
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
      prevMonthDays.push(new Date(prevMonthEnd.getFullYear(), prevMonthEnd.getMonth(), prevMonthEnd.getDate() - i));
    }
    return prevMonthDays;
  };

  // Get days from next month to fill the last week
  const getNextMonthDays = () => {
    const lastDayOfMonth = monthEnd.getDay();
    const nextMonthDays = [];
    // Adjust for Monday start
    const adjustedLastDay = lastDayOfMonth === 0 ? 6 : lastDayOfMonth - 1;
    const daysToAdd = 6 - adjustedLastDay;
    for (let i = 1; i <= daysToAdd; i++) {
      nextMonthDays.push(new Date(monthEnd.getFullYear(), monthEnd.getMonth(), monthEnd.getDate() + i));
    }
    return nextMonthDays;
  };

  const allDays = [...getPreviousMonthDays(), ...days, ...getNextMonthDays()];

  const handleMonthChange = (e) => {
    const newMonth = parseInt(e.target.value);
    setCurrentDate(prevDate => setMonth(prevDate, newMonth));
  };

  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value);
    setCurrentDate(prevDate => setYear(prevDate, newYear));
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  // Generate array of years (current year ± 10 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  // Array of months
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="app-container">
      <div className="calendar-container">
        {/* Header */}
        <div className="calendar-header">
          <div className="calendar-nav">
            <button
              onClick={prevMonth}
              className="calendar-nav-button"
            >
              Previous
            </button>
            <div className="calendar-title">
              <select 
                value={format(currentDate, 'MMMM')} 
                onChange={handleMonthChange}
                className="month-select"
              >
                {months.map((month, index) => (
                  <option key={month} value={index}>
                    {month}
                  </option>
                ))}
              </select>
              <select 
                value={format(currentDate, 'yyyy')} 
                onChange={handleYearChange}
                className="year-select"
              >
                {years.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={nextMonth}
              className="calendar-nav-button"
            >
              Next
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="calendar-grid">
          {/* Weekday Headers */}
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
            <div 
              key={day} 
              className={`weekday-header ${index === 6 ? 'weekend' : ''}`}
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
                onClick={() => handleDateClick(day)}
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