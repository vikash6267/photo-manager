// Import the Mongoose library
const mongoose = require("mongoose");

// Define the user schema using the Mongoose Schema constructor
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    contactNumber: {
      type: Number,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    accountType: {
      type: String,
      enum: ["User", "Admin"],
      default: "User",
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    token: {
      type: String,
    },

    failedAttempts: {
      type: Number,
      default: 0,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    blockUntil: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Export the Mongoose model for the user schema, using the name "user"
module.exports = mongoose.model("User", userSchema);
