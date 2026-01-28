const express = require('express');
const router = express.Router();
const ownerWarungController = require('../controllers/ownerWarungController');
const authMiddleware = require('../middleware/auth');

router.get('/:ownerId', authMiddleware, ownerWarungController.getWarungByOwner);

module.exports = router;