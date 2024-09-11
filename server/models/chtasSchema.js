const mongoose = require('mongoose');

// Define the chat schema
const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      }
    ],
    messages: [
      {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      }
    ],
  },
  { timestamps: true }
);

// Export the Mongoose model for the chat schema
module.exports = mongoose.model('Chat', chatSchema);
