const mongoose = require("mongoose");

const passwordResetTokenSchema = new mongoose.Schema({
  email: { type: String, required: true },
  code: { type: String, required: true },
  expires: { type: Date, required: true }
});

module.exports = mongoose.model("PasswordResetToken", passwordResetTokenSchema);