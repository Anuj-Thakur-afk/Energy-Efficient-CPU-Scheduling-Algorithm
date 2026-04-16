// server.js - Main backend file for Sports & Fitness Tracker
// This handles all our API routes and connects to MongoDB

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const Workout = require('./models/Workout');

const app = express();
const PORT = 3000;

// Middleware - these run before every request
app.use(cors()); // allows our frontend (different port) to talk to this server
app.use(express.json()); // lets us read JSON from request body
app.use(express.static('.')); // serve our frontend files from same folder

// Connect to MongoDB (make sure MongoDB is running locally!)
mongoose.connect('mongodb://localhost:27017/fitnessTracker')
  .then(() => {
    console.log('✅ Connected to MongoDB!');
  })
  .catch((err) => {
    console.log('❌ MongoDB connection error:', err.message);
  });

// ---- ROUTES ----

// GET all workouts - fetch everything from database
app.get('/api/workouts', async (req, res) => {
  try {
    // newest first using sort(-1)
    const workouts = await Workout.find().sort({ createdAt: -1 });
    res.json(workouts);
  } catch (err) {
    console.log('Error fetching workouts:', err.message);
    res.status(500).json({ error: 'Could not fetch workouts' });
  }
});

// POST - add a new workout
app.post('/api/workouts', async (req, res) => {
  try {
    const { name, exercise, duration } = req.body;

    // simple check - don't save empty stuff
    if (!name || !exercise || !duration) {
      return res.status(400).json({ error: 'Please fill all fields' });
    }

    const newWorkout = new Workout({ name, exercise, duration });
    const saved = await newWorkout.save();
    res.status(201).json(saved);
  } catch (err) {
    console.log('Error saving workout:', err.message);
    res.status(500).json({ error: 'Could not save workout' });
  }
});

// DELETE - remove a workout by its ID
app.delete('/api/workouts/:id', async (req, res) => {
  try {
    const deleted = await Workout.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Workout not found' });
    }
    res.json({ message: 'Workout deleted!' });
  } catch (err) {
    console.log('Error deleting workout:', err.message);
    res.status(500).json({ error: 'Could not delete workout' });
  }
});

// start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});