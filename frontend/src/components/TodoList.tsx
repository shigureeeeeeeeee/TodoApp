'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Edit2, Check, X, ArrowUpDown, GripVertical } from 'lucide-react';

interface Todo {
  _id: string;
  task: string;
  completed: boolean;
  dueDate: Date;
  memo: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
}

const API_URL = 'http://localhost:5000/api/todos';

const priorityColors = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

const TodoItem: React.FC<{
  todo: Todo;
  index: number;
  toggleCompletion: (id: string) => void;
  removeTask: (id: string) => void;
  editTask: (id: string, updatedTodo: Partial<Todo>) => void;
}> = ({ todo, index, toggleCompletion, removeTask, editTask }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(todo.task);
  const [editedDueDate, setEditedDueDate] = useState(new Date(todo.dueDate));
  const [editedMemo, setEditedMemo] = useState(todo.memo);
  const [editedTags, setEditedTags] = useState(todo.tags.join(', '));
  const [editedPriority, setEditedPriority] = useState(todo.priority);

  const handleEdit = () => {
    editTask(todo._id, {
      task: editedTask,
      dueDate: editedDueDate,
      memo: editedMemo,
      tags: editedTags.split(',').map(tag => tag.trim()),
      priority: editedPriority,
    });
    setIsEditing(false);
  };

  return (
    <Draggable draggableId={todo._id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <Card className={`mb-2 ${todo.completed ? 'opacity-50' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div {...provided.dragHandleProps}>
                  <GripVertical className="h-5 w-5 text-gray-500" />
                </div>
                {isEditing ? (
                  <div className="flex-grow space-y-2">
                    <Input
                      value={editedTask}
                      onChange={(e) => setEditedTask(e.target.value)}
                      className="w-full"
                    />
                    <Input
                      type="date"
                      value={editedDueDate.toISOString().split('T')[0]}
                      onChange={(e) => setEditedDueDate(new Date(e.target.value))}
                      className="w-full"
                    />
                    <Textarea
                      value={editedMemo}
                      onChange={(e) => setEditedMemo(e.target.value)}
                      placeholder="Memo"
                      className="w-full"
                    />
                    <Input
                      value={editedTags}
                      onChange={(e) => setEditedTags(e.target.value)}
                      placeholder="Tags (comma separated)"
                      className="w-full"
                    />
                    <Select value={editedPriority} onValueChange={(value: 'low' | 'medium' | 'high') => setEditedPriority(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="space-x-2">
                      <Button onClick={handleEdit}>Save</Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <span className={`flex-1 ${todo.completed ? 'line-through' : ''}`}>{todo.task}</span>
                      <div className="space-x-2">
                        <Button size="icon" variant="outline" onClick={() => toggleCompletion(todo._id)}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="outline" onClick={() => setIsEditing(true)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="outline" onClick={() => removeTask(todo._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">Due: {new Date(todo.dueDate).toLocaleDateString()}</p>
                    {todo.memo && <p className="text-sm">{todo.memo}</p>}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {todo.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                    <Badge className={priorityColors[todo.priority]}>{todo.priority}</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
};

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState('');
  const [newDueDate, setNewDueDate] = useState<Date | undefined>(new Date());
  const [newMemo, setNewMemo] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'task' | 'completed'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [tagFilter, setTagFilter] = useState<string>('__all__');
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    fetchTodos();
  }, []);

  useEffect(() => {
    const tags = Array.from(new Set(todos.flatMap(todo => todo.tags)));
    setAllTags(tags);
  }, [todos]);

  const fetchTodos = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch todos');
      }
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const addTask = async () => {
    if (newTask.trim() && newDueDate) {
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            task: newTask,
            dueDate: newDueDate,
            memo: newMemo,
            tags: newTags.split(',').map(tag => tag.trim()),
            priority: newPriority,
          }),
        });
        if (!response.ok) {
          throw new Error('Failed to add todo');
        }
        const data = await response.json();
        setTodos([...todos, data]);
        setNewTask('');
        setNewDueDate(new Date());
        setNewMemo('');
        setNewTags('');
        setNewPriority('medium');
      } catch (error) {
        console.error('Error adding todo:', error);
      }
    }
  };

  const toggleCompletion = async (id: string) => {
    try {
      const todo = todos.find(t => t._id === id);
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !todo?.completed }),
      });
      if (!response.ok) {
        throw new Error('Failed to update todo');
      }
      const updatedTodo = await response.json();
      setTodos(todos.map(todo => todo._id === id ? updatedTodo : todo));
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const removeTask = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete todo');
      }
      setTodos(todos.filter(todo => todo._id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const editTask = async (id: string, updatedTodo: Partial<Todo>) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTodo),
      });
      if (!response.ok) {
        throw new Error('Failed to update todo');
      }
      const updatedTodoData = await response.json();
      setTodos(todos.map(todo => todo._id === id ? updatedTodoData : todo));
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const sortedAndFilteredTodos = todos
    .filter(todo => {
      if (filter === 'active') return !todo.completed;
      if (filter === 'completed') return todo.completed;
      return true;
    })
    .filter(todo => {
      if (tagFilter === '__all__' || tagFilter === '') return true;
      return todo.tags.includes(tagFilter);
    })
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        return sortOrder === 'asc' 
          ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      } else if (sortBy === 'task') {
        return sortOrder === 'asc' 
          ? a.task.localeCompare(b.task)
          : b.task.localeCompare(a.task);
      } else {
        return sortOrder === 'asc'
          ? (a.completed ? 1 : 0) - (b.completed ? 1 : 0)
          : (b.completed ? 1 : 0) - (a.completed ? 1 : 0);
      }
    });

  const toggleSort = (newSortBy: 'dueDate' | 'task' | 'completed') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(todos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTodos(items);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Add a task"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
            />
            <Input
              type="date"
              value={newDueDate ? newDueDate.toISOString().split('T')[0] : ''}
              onChange={(e) => setNewDueDate(new Date(e.target.value))}
            />
            <Textarea
              placeholder="Memo (optional)"
              value={newMemo}
              onChange={(e) => setNewMemo(e.target.value)}
            />
            <Input
              type="text"
              placeholder="Tags (comma separated)"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
            />
            <Select value={newPriority} onValueChange={(value: 'low' | 'medium' | 'high') => setNewPriority(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={addTask}>Add Todo</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Todo List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 space-y-2">
            <div className="flex space-x-2">
              <Select value={filter} onValueChange={(value: 'all' | 'active' | 'completed') => setFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter tasks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={tagFilter} onValueChange={setTagFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Tags</SelectItem>
                  {allTags.map(tag => (
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => toggleSort('dueDate')} variant="outline">
                Due Date {sortBy === 'dueDate' && <ArrowUpDown className="ml-2 h-4 w-4" />}
              </Button>
              <Button onClick={() => toggleSort('task')} variant="outline">
                Task {sortBy === 'task' && <ArrowUpDown className="ml-2 h-4 w-4" />}
              </Button>
              <Button onClick={() => toggleSort('completed')} variant="outline">
                Status {sortBy === 'completed' && <ArrowUpDown className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </div>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="todos">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {sortedAndFilteredTodos.map((todo, index) => (
                    <TodoItem
                      key={todo._id}
                      todo={todo}
                      index={index}
                      toggleCompletion={toggleCompletion}
                      removeTask={removeTask}
                      editTask={editTask}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </CardContent>
      </Card>
    </div>
  );
};

export default TodoList;
