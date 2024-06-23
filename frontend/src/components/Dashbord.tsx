'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import SharedCalendar from './Calendar';
import { format } from 'date-fns';

interface Todo {
  _id: string;
  task: string;
  completed: boolean;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
}

const TODO_API_URL = 'http://localhost:5000/api/todos';

const priorityColors = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

const Dashboard: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch(TODO_API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch todos');
      }
      const data = await response.json();
      setTodos(data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const toggleTodo = async (id: string) => {
    try {
      const todoToUpdate = todos.find(todo => todo._id === id);
      if (!todoToUpdate) return;
  
      const response = await fetch(`${TODO_API_URL}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !todoToUpdate.completed }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update todo');
      }
  
      const updatedTodo = await response.json();
  
      setTodos(prevTodos => 
        prevTodos.map(todo => 
          todo._id === id ? updatedTodo : todo
        )
      );
    } catch (error) {
      console.error('Error updating todo:', error);
      // ここでユーザーにエラーを通知することもできます
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {todos.map((todo) => (
              <li key={todo._id} className="flex items-center space-x-4">
                <Checkbox
                  checked={todo.completed}
                  onCheckedChange={() => toggleTodo(todo._id)}
                />
                <div className="flex-grow">
                  <p className={`${todo.completed ? 'line-through text-gray-500' : ''}`}>
                    {todo.task}
                  </p>
                  <p className="text-sm text-gray-500">
                    Due: {format(new Date(todo.dueDate), 'MMM d, yyyy')}
                  </p>
                </div>
                {todo.priority && (
                  <Badge className={priorityColors[todo.priority]}>
                    {todo.priority}
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events and Todos</CardTitle>
        </CardHeader>
        <CardContent>
          <SharedCalendar isCompact={true} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;