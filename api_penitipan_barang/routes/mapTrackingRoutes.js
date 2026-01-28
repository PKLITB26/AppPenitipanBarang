const express = require('express');
const router = express.Router();
const mapTrackingController = require('../controllers/mapTrackingController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/adminMiddleware');

// Get all locations for map (admin only)
router.get('/locations', authMiddleware, adminMiddleware, mapTrackingController.getAllLocations);

// Get specific location
router.get('/locations/:id', authMiddleware, mapTrackingController.getLocationById);

// Get location with detailed info
router.get('/locations/:id/details', authMiddleware, mapTrackingController.getLocationWithDetails);

// Update location (pelanggan can update their own, admin can update any)
router.patch('/locations/:id', authMiddleware, mapTrackingController.updateLocation);

module.exports = router;