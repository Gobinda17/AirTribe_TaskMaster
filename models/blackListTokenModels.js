// I'm importing Mongoose to create my MongoDB schema and model for blacklisted tokens
const mongoose = require("mongoose");

// I'm defining the blacklisted token schema to store invalidated JWT tokens
const blacklistedTokenSchema = new mongoose.Schema({
  // I'm storing the actual JWT token string that has been invalidated
  token: { type: String, required: true },
  // I'm storing when the token expires so it can be automatically cleaned up
  expiresAt: { type: Date, required: true },
});

// I'm creating a TTL (Time To Live) index to automatically delete expired tokens from database
// This prevents the blacklist from growing indefinitely with expired tokens
blacklistedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// I'm exporting the BlacklistedToken model for managing invalidated tokens during logout
module.exports = mongoose.model("BlacklistedTokens", blacklistedTokenSchema, "BlacklistedTokens");