const mongoose = require("mongoose");

// Define the schema for blacklisted tokens
const blacklistedTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create and export the BlacklistedToken model
module.exports = mongoose.model("BlacklistedToken", blacklistedTokenSchema);