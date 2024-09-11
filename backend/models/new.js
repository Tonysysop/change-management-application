

const bcrypt = require('bcrypt');

const userPassword = 'Access@007';
const saltRounds = 10; // Replace with actual salting rounds used for registration

bcrypt.hash(userPassword, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    return;
  }

  console.log('Hashed user password:', hash);
  // Compare the manually generated hash with the stored hash in the database
});





// // models/User.js
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const userSchema = new mongoose.Schema({
//   username: { type: String, required: true, unique: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   resetPasswordToken: { type: String }, // Field to store the reset token
//   resetPasswordExpires: { type: Date } // Field to store the expiration time of the token
// });

// // Hash password before saving
// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// // Method to compare passwords
// userSchema.methods.comparePassword = function (password) {
//   return bcrypt.compare(password, this.password);
// };

// const User = mongoose.model('User', userSchema);
// module.exports = User;
