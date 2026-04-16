// models/Workout.js - Mongoose schema for our workout data
// This defines what a workout "looks like" in the database

const mongoose = require('mongoose');

// Schema = blueprint for each workout document
const workoutSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,   // can't be empty
    trim: true        // removes extra spaces
  },
  exercise: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: Number,
    required: true,
    min: 1  // at least 1 minute
  },
  createdAt: {
    type: Date,
    default: Date.now  // automatically saves current date/time
  }
});

// Create and export the model
const Workout = mongoose.model('Workout', workoutSchema);

module.exports = Workout;