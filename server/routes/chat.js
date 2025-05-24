const express = require('express');
const router = express.Router();
const { getDisasterContext } = require('../utils/langchain');

router.post('/', async (req, res) => {
  try {
    const { message, context } = req.body;
    const response = await getDisasterContext(message, context);
    res.json({ reply: response });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Error processing your request' });
  }
});

module.exports = router;
