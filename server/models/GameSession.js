import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  attemptsLeft: {
    type: Number,
    default: 3
  }
});
