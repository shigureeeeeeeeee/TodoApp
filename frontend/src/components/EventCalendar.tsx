"use client"

import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const localizer = momentLocalizer(moment);

interface Event {
  _id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  color?: string;
  isEvent: boolean;
}

interface EventCalendarProps {
    compact?: boolean;
}

interface Todo {
  _id: string;
  task: string;
  dueDate: Date;
  completed: boolean;
}

const EVENT_API_URL = 'http://localhost:5000/api/events';
const TODO_API_URL = 'http://localhost:5000/api/todos';

const EventCalendar: React.FC<EventCalendarProps> = ({compact = false}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({ isEvent: true });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showEvents, setShowEvents] = useState(true);
  const [showTodos, setShowTodos] = useState(true);

  useEffect(() => {
    fetchEvents();
    fetchTodos();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(EVENT_API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      setEvents(prevEvents => [
        ...prevEvents.filter(e => !e.isEvent),
        ...data.map((event: Event) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
          isEvent: true,
        }))
      ]);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchTodos = async () => {
    try {
      const response = await fetch(TODO_API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch todos');
      }
      const data = await response.json();
      setEvents(prevEvents => [
        ...prevEvents.filter(e => e.isEvent),
        ...data.map((todo: Todo) => ({
          _id: todo._id,
          title: todo.task,
          start: new Date(todo.dueDate),
          end: new Date(todo.dueDate),
          color: todo.completed ? '#4CAF50' : '#FFC107',
          isEvent: false,
        }))
      ]);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const handleAddEvent = async () => {
    if (newEvent.title && newEvent.start && newEvent.end) {
      try {
        const response = await fetch(EVENT_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newEvent),
        });
        if (!response.ok) {
          throw new Error('Failed to add event');
        }
        const data = await response.json();
        setEvents([...events, {
          ...data,
          start: new Date(data.start),
          end: new Date(data.end),
          isEvent: true,
        }]);
        setNewEvent({ isEvent: true });
        setIsDialogOpen(false);
      } catch (error) {
        console.error('Error adding event:', error);
      }
    }
  };

  const filteredEvents = events.filter(event => 
    (showEvents && event.isEvent) || (showTodos && !event.isEvent)
  );

  return (
    <div>
      <div className="mb-4 space-x-2">
        <Select 
          value={showEvents ? (showTodos ? 'both' : 'events') : 'todos'} 
          onValueChange={(value) => {
            if (value === 'both') {
              setShowEvents(true);
              setShowTodos(true);
            } else if (value === 'events') {
              setShowEvents(true);
              setShowTodos(false);
            } else {
              setShowEvents(false);
              setShowTodos(true);
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="both">Show Both</SelectItem>
            <SelectItem value="events">Events Only</SelectItem>
            <SelectItem value="todos">Todos Only</SelectItem>
          </SelectContent>
        </Select>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Event</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Event Title"
                value={newEvent.title || ''}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              />
              <Input
                type="datetime-local"
                placeholder="Start Date"
                value={newEvent.start ? moment(newEvent.start).format('YYYY-MM-DDTHH:mm') : ''}
                onChange={(e) => setNewEvent({ ...newEvent, start: new Date(e.target.value) })}
              />
              <Input
                type="datetime-local"
                placeholder="End Date"
                value={newEvent.end ? moment(newEvent.end).format('YYYY-MM-DDTHH:mm') : ''}
                onChange={(e) => setNewEvent({ ...newEvent, end: new Date(e.target.value) })}
              />
              <Input
                placeholder="Description"
                value={newEvent.description || ''}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              />
              <Input
                type="color"
                placeholder="Color"
                value={newEvent.color || '#3788d8'}
                onChange={(e) => setNewEvent({ ...newEvent, color: e.target.value })}
              />
              <Button onClick={handleAddEvent}>Add Event</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Calendar
        localizer={localizer}
        events={filteredEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: event.color,
          },
        })}
      />
    </div>
  );
};

export default EventCalendar;