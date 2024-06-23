'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Todo {
  _id: string;
  task: string;
  pomodorosCompleted: number;
  workTime: number;
}

const PomodoroReport: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/todos');
        if (!response.ok) {
          throw new Error('Failed to fetch todos');
        }
        const data = await response.json();
        setTodos(data);
      } catch (error) {
        console.error('Error fetching todos:', error);
      }
    };

    fetchTodos();
  }, []);

  const reportData = todos.map(todo => ({
    name: todo.task,
    pomodoros: todo.pomodorosCompleted || 0,
    totalWorkTime: (todo.pomodorosCompleted || 0) * (todo.workTime / 60), // Convert seconds to minutes
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pomodoro Usage Report</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={reportData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="pomodoros" fill="#8884d8" name="Completed Pomodoros" />
            <Bar yAxisId="right" dataKey="totalWorkTime" fill="#82ca9d" name="Total Work Time (minutes)" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default PomodoroReport;