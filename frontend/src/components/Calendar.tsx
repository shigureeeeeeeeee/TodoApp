'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Event {
  _id: string;
  title: string;
  start: Date;
  end: Date;
}

interface Todo {
  _id: string;
  task: string;
  dueDate: Date;
  completed: boolean;
}

const EVENT_API_URL = 'http://localhost:5000/api/events';
const TODO_API_URL = 'http://localhost:5000/api/todos';

const localizer = momentLocalizer(moment);

interface SharedCalendarProps {
  isCompact?: boolean;
}

const SharedCalendar: React.FC<SharedCalendarProps> = ({ isCompact = false }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    fetchEventsAndTodos();
  }, []);

  const fetchEventsAndTodos = async () => {
    try {
      const [eventsResponse, todosResponse] = await Promise.all([
        fetch(EVENT_API_URL),
        fetch(TODO_API_URL)
      ]);

      if (!eventsResponse.ok || !todosResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const eventsData = await eventsResponse.json();
      const todosData = await todosResponse.json();

      const formattedEvents = eventsData.map((event: Event) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end)
      }));

      const todoEvents = todosData.map((todo: Todo) => ({
        _id: todo._id,
        title: `Todo: ${todo.task}`,
        start: new Date(todo.dueDate),
        end: new Date(todo.dueDate),
        allDay: true,
        todo: true,
        completed: todo.completed
      }));

      setEvents([...formattedEvents, ...todoEvents]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const eventStyleGetter = (event: Event & { todo?: boolean, completed?: boolean }) => {
    if (event.todo) {
      return {
        style: {
          backgroundColor: event.completed ? '#4CAF50' : '#FFA726',
        }
      };
    }
    return {};
  };

  const handleViewChange = (newView: View) => {
    setView(newView);
  };

  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Select value={view} onValueChange={(value: View) => handleViewChange(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Month</SelectItem>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="day">Day</SelectItem>
            <SelectItem value="agenda">Agenda</SelectItem>
          </SelectContent>
        </Select>
        <div className="space-x-2">
          <Button onClick={() => handleNavigate(new Date())}>Today</Button>
          <Button onClick={() => handleNavigate(new Date(date.getFullYear(), date.getMonth() - 1, 1))}>Prev</Button>
          <Button onClick={() => handleNavigate(new Date(date.getFullYear(), date.getMonth() + 1, 1))}>Next</Button>
        </div>
      </div>
      <div style={{ height: isCompact ? '400px' : '600px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          view={view}
          onView={handleViewChange}
          date={date}
          onNavigate={handleNavigate}
          eventPropGetter={eventStyleGetter}
          views={['month', 'week', 'day', 'agenda']}
        />
      </div>
    </div>
  );
};

export default SharedCalendar;