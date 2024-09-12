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


    // Function to convert an image file to a Base64-encoded data URL
function getBase64Image(filePath) {
  const image = fs.readFileSync(filePath);
  return `data:image/${path.extname(filePath).slice(1)};base64,${image.toString('base64')}`;
}

    // Load the HTML file content
    const htmlContent = fs.readFileSync(path.join(__dirname, '../templates/verificationCodeEmail.html'), 'utf8');

    // Directory where images are located
    const imagesDir = path.join(__dirname, '../templates/images');





    // Replace placeholders in the HTML content with dynamic values (e.g., the verification code)
    const htmlWithCode = htmlContent.replace('{{verificationCode}}', code);

    const mailOptions = {
      from: `IBEDC Change Management System <${config.user}>`,
      to: email,
      subject: 'Verification Code',
      html: htmlWithCode, // use HTML content with the verification code
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Error sending email');
  }
};

// Forgot Password (Step 1: Request a Verification Code)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const verificationCode = generateNumericCode(6); // Generate a 6-digit numeric code
    user.verificationCode = verificationCode;
    user.verificationCodeExpires = Date.now() + 15 * 60 * 1000; // Code valid for 15 minutes

    await user.save();
    await sendVerificationCode(email, verificationCode);

    res.status(200).json({ message: 'Verification code sent' });
  } catch (error) {
    res.status(400).json({ error: error.message });
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
    const { email, code, newPassword } = req.body;

    const user = await User.findOne({
      email,
      verificationCode: code,
      verificationCodeExpires: { $gt: Date.now() }, // Check if code is still valid
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    // Hash the new password before saving it
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;

    // Discard the verification code after successful password reset
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;

    await user.save();
    res.status(200).json({ message: 'Password has been reset' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;






























































// // routes/auth.js
// const express = require('express');
// const jwt = require('jsonwebtoken');
// const User = require('../models/Users');
// const router = express.Router();
// const dotenv = require('dotenv');
// const nodemailer = require('nodemailer');
// const crypto = require('crypto');
// const fs = require('fs');
// const path = require('path');
// const { google } = require('googleapis');
// const config = require('../config.js');

// dotenv.config();

// const OAuth2 = google.auth.OAuth2;

// const OAuth2_client = new OAuth2(
//   config.clientId,
//   config.clientSecret,
//   'https://developers.google.com/oauthplayground' // Redirect URL
// );
// OAuth2_client.setCredentials({ refresh_token: config.refreshToken });

// // Function to get access token
// const getAccessToken = async () => {
//   try {
//     const { token } = await OAuth2_client.getAccessToken();
//     return token;
//   } catch (error) {
//     console.error('Error getting access token:', error);
//     throw new Error('Error getting access token');
//   }
// };

// // Function to send reset email
// const sendResetEmail = async (email, token) => {
//   try {
//     const accessToken = await getAccessToken();
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         type: 'OAuth2',
//         user: config.user,
//         clientId: config.clientId,
//         clientSecret: config.clientSecret,
//         refreshToken: config.refreshToken,
//         accessToken: accessToken,
//       },
//     });

//     // Load the HTML file content
//     const htmlContent = fs.readFileSync(path.join(__dirname, '../templates/resetPasswordEmail.html'), 'utf8');

//     // Replace placeholders in the HTML content with dynamic values (e.g., the reset link)
//     const htmlWithToken = htmlContent.replace('{{resetLink}}', `${process.env.FRONTEND_URL}/ResetPassword/${token}`);

//     const mailOptions = {
//       from: `IBEDC Change Management System <${config.user}>`,
//       to: email,
//       subject: 'Password Reset',
//       html: htmlWithToken, // use html content
//     };

//     await transporter.sendMail(mailOptions);
//   } catch (error) {
//     console.error('Error sending email:', error);
//     throw new Error('Error sending email');
//   }
// };

// // Forgot Password
// router.post('/forgot-password', async (req, res) => {
//   try {
//     const { email } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     const token = crypto.randomBytes(20).toString('hex');
//     user.resetPasswordToken = token;
//     user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

//     await user.save();
//     await sendResetEmail(email, token);

//     res.status(200).json({ message: 'Password reset email sent' });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// // Reset Password
// router.post('/reset-password/:token', async (req, res) => {
//   try {
//     const { token } = req.params;
//     const { password } = req.body;

//     const user = await User.findOne({
//       resetPasswordToken: token,
//       resetPasswordExpires: { $gt: Date.now() }, // Check if token is still valid
//     });

//     if (!user) {
//       return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
//     }

//     user.password = password;
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpires = undefined;

//     await user.save();
//     res.status(200).json({ message: 'Password has been reset' });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// module.exports = router;
