// routes/form.js
const express = require('express');
const authenticate = require('../middleware/auth'); // Import authenticate directly
const Form = require('../models/formModel');
const router = express.Router();

// GET /api/forms - Get forms for authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.userId; // Extracted from the token in the authenticate middleware
    const forms = await Form.find({ userId });
    res.status(200).json(forms);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching forms' });
  }
});

module.exports = router;