const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');

// Get all todos
router.get('/', async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new todo
router.post('/', async (req, res) => {
  const todo = new Todo({
    task: req.body.task,
    dueDate: req.body.dueDate,
    workTime: req.body.workTime || 25 * 60,
    breakTime: req.body.breakTime || 5 * 60,
    currentTime: req.body.currentTime || 25 * 60,
    isBreak: req.body.isBreak || false
  });

  try {
    const newTodo = await todo.save();
    res.status(201).json(newTodo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a todo
router.patch('/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (req.body.task != null) {
      todo.task = req.body.task;
    }
    if (req.body.completed != null) {
      todo.completed = req.body.completed;
    }
    if (req.body.dueDate != null) {
      todo.dueDate = req.body.dueDate;
    }
    const updatedTodo = await todo.save();
    res.json(updatedTodo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a todo
router.delete('/:id', async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ message: 'Todo deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update timer
router.patch('/:id/timer', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (req.body.workTime != null) {
      todo.workTime = req.body.workTime;
    }
    if (req.body.breakTime != null) {
      todo.breakTime = req.body.breakTime;
    }
    if (req.body.currentTime != null) {
      todo.currentTime = req.body.currentTime;
    }
    if (req.body.isBreak != null) {
      todo.isBreak = req.body.isBreak;
    }
    if (req.body.pomodorosCompleted != null) {
      todo.pomodorosCompleted = req.body.pomodorosCompleted;
    }
    const updatedTodo = await todo.save();
    res.json(updatedTodo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;