const mongoose = require("mongoose");

const blacklistedTokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

blacklistedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // auto-delete after expiry

module.exports = mongoose.model("BlacklistedTokens", blacklistedTokenSchema, "BlacklistedTokens");