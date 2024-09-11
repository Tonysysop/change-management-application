const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  verificationCode: { type: String }, // Field to store the verification code
  verificationCodeExpires: { type: Date } // Field to store the expiration time of the code
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  console.log('Password provided:', password); // For debugging purposes
  try {
    const match = await bcrypt.compare(password, this.password);
    console.log('Password match:', match);
    return match;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    // Handle errors appropriately, e.g., log an error or return a specific error message
    return false;
  }
};

const User = mongoose.model('User', userSchema);
module.exports = User;