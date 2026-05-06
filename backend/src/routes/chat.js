const express = require('express');
const router = express.Router();
const optionalAuth = require('../middleware/optionalAuth');
const chatController = require('../controllers/chatController');

// Allow optional authentication for chat
router.post('/', optionalAuth, chatController.chat);

module.exports = router;
