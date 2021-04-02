/* istanbul ignore file */
import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  tokens: {
    type: Array,
    required: true
  }
})

const User = mongoose.model('User', UserSchema)
module.exports = User