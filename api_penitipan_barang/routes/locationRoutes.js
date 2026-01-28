const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const auth = require('../middleware/auth');
const adminMiddleware = require('../middleware/adminMiddleware');

// Admin routes
router.get('/', auth, locationController.getAllLocations);
router.get('/stats', auth, locationController.getLocationStats);

// Update toko coordinates (admin or pelanggan owner)
router.patch('/toko/:tokoId/coordinates', auth, locationController.updateTokoCoordinates);

module.exports = router;