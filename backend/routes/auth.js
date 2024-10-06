const express = require('express');
const User = require('../models/Users');
const router = express.Router();
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const config = require('../config.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


dotenv.config();

const OAuth2 = google.auth.OAuth2;

const OAuth2_client = new OAuth2(
  config.clientId,
  config.clientSecret,
  'https://developers.google.com/oauthplayground' // Redirect URL
);
OAuth2_client.setCredentials({ refresh_token: config.refreshToken });

// Function to get access token
const getAccessToken = async () => {
  try {
    const { token } = await OAuth2_client.getAccessToken();
    return token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw new Error('Error getting access token');
  }
};

// Function to generate a numeric verification code
const generateNumericCode = (length) => {
  return crypto.randomInt(0, Math.pow(10, length)).toString().padStart(length, '0');
};

// Function to send verification code email
const sendVerificationCode = async (email, code) => {
  try {
    const accessToken = await getAccessToken();
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: config.user,
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        refreshToken: config.refreshToken,
        accessToken: accessToken,
      },
    });

    let htmlContent = fs.readFileSync(path.join(__dirname, '../templates/verificationCodeEmail.html'), 'utf8');
    const htmlWithCode = htmlContent.replace('{{verificationCode}}', code);

    const mailOptions = {
      from: `IBEDC Change Management System <${config.user}>`,
      to: email,
      subject: 'Password Reset',
      html: htmlWithCode,
      attachments: [{
        filename: 'logo.png',
        path: path.join(__dirname, '../templates/images/logo.png'),
        cid: 'logo',
      },
      {
        filename: 'footer.png',
        path: path.join(__dirname, '../templates/images/footer-i.png'),
        cid: 'footer',
      }
      ],
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Error sending email');
  }
};

// Signup (Register a new user)
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullname } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }



    // Create a new user
    const newUser = new User({
      email,
      password,
      fullname,
    });

    // Save the user in the database
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
  console.error('Error during user registration:', error); // Log the error
  res.status(500).json({ error: error.message });
}
});


// Login (Authenticate user)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

     // Log the user and the password provided
    console.log('User found:', user);
    console.log('Password provided:', password);


    // Check if the password is correct
    const isMatch = await user.comparePassword(password);
    console.log('Password match:', isMatch);


    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

   // Create a JWT token
    const token = jwt.sign(
      { userId: user._id, fullname: user.fullname, email: user.email }, // Include fullname in token payload
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token valid for 1 hour
    );

    // Send back the token and user details, including fullname
    res.status(200).json({ token, user: { fullname: user.fullname, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});







router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const verificationCode = generateNumericCode(6); // Generate a 6-digit numeric code
    user.verificationCode = verificationCode;
    user.verificationCodeExpires = Date.now() + 15 * 60 * 1000; // Code valid for 15 minutes

    await user.save();
    await sendVerificationCode(email, verificationCode); // Ensure this function handles email sending

    res.status(200).json({ message: 'Verification code sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error, please try again later.' });
  }
});


// Verify Code (Step 2: Verify the Code)
router.post('/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({
      email,
      verificationCode: code,
      verificationCodeExpires: { $gt: Date.now() }, // Check if code is still valid
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    res.status(200).json({ message: 'Code verified, proceed with password reset' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Reset Password (Step 3: Reset the Password)
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, password, confirmpassword } = req.body;

    // Validate password and confirmPassword
    if (!password || !confirmpassword || password !== confirmpassword) {
      return res.status(401).json({ message: 'Passwords do not match' });
    }

    const user = await User.findOne({
      email,
      verificationCode: code,
      verificationCodeExpires: { $gt: Date.now() }, // Check if code is still valid
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }


    // Discard the verification code after successful password reset
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;

    user.password = password;

    await user.save();
    res.status(200).json({ message: 'Password has been reset' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
