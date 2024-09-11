const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  device: String,
  location: String,
  loginTime: Date,
  sessionId: String,
  ipAddress: String,
});

module.exports = mongoose.model("Session", sessionSchema);

