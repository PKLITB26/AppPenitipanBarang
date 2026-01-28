const express = require('express');
const router = express.Router();
const warungController = require('../controllers/warungController');
const authMiddleware = require('../middleware/auth');

// Get all pelanggan (warung owners)
router.get('/', authMiddleware, warungController.getAllWarung);

// Get specific pelanggan/warung by ID
router.get('/:id', authMiddleware, warungController.getWarungById);

// Get pelanggan by pelanggan ID
router.get('/pelanggan/:pelangganId', authMiddleware, warungController.getWarungByPelanggan);

// Update pelanggan location for tracking
router.patch('/:id/location', authMiddleware, warungController.updateWarungLocation);

module.exports = router;