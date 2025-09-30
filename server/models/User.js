import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  score: { type: Number, default: 0 }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
