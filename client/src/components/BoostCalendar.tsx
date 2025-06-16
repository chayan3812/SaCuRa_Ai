import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

interface ScheduledBoost {
  id: string;
  postId: string;
  date: string;
  budget?: number;
  status?: string;
}

interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  postId: string;
  budget?: number;
  status?: string;
}

export const BoostCalendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScheduledBoosts();
  }, []);

  const loadScheduledBoosts = async () => {
    try {
      const response = await fetch("/api/facebook/scheduled-boosts", {
        credentials: 'include'
      });
      const data: ScheduledBoost[] = await response.json();
      
      const calendarEvents = data.map((boost) => ({
        title: `Boost: ${boost.postId}${boost.budget ? ` ($${boost.budget})` : ''}`,
        start: new Date(boost.date),
        end: new Date(boost.date),
        postId: boost.postId,
        budget: boost.budget,
        status: boost.status
      }));
      
      setEvents(calendarEvents);
    } catch (error) {
      console.error('Error loading scheduled boosts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async ({ start }: { start: Date }) => {
    const postId = prompt("Enter Post ID to schedule boost:");
    if (!postId) return;

    const budget = prompt("Enter daily budget (optional):");
    const budgetValue = budget ? parseFloat(budget) : undefined;

    try {
      const response = await fetch("/api/facebook/scheduled-boosts", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          postId,
          date: start.toISOString(),
          budget: budgetValue
        })
      });

      if (response.ok) {
        alert("Scheduled boost added!");
        loadScheduledBoosts(); // Reload events
      } else {
        alert("Failed to schedule boost");
      }
    } catch (error) {
      console.error('Error scheduling boost:', error);
      alert("Error scheduling boost");
    }
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    const message = `Post ID: ${event.postId}\n` +
                   `Date: ${moment(event.start).format('YYYY-MM-DD')}\n` +
                   `Budget: ${event.budget ? `$${event.budget}` : 'Not specified'}\n` +
                   `Status: ${event.status || 'Scheduled'}`;
    alert(message);
  };

  if (loading) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">📅 Scheduled Boost Calendar</h2>
        <div className="text-center py-8">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📅 Scheduled Boost Calendar</h2>
      <div className="mb-4 text-sm text-gray-600">
        Click on a date to schedule a new boost. Click on existing events to view details.
      </div>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        selectable
        onSelectSlot={handleSelect}
        onSelectEvent={handleSelectEvent}
        views={['month', 'week', 'day']}
        defaultView="month"
      />
    </div>
  );
};