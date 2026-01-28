const express = require('express');
const router = express.Router();
const pelangganController = require('../controllers/pelangganController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/adminMiddleware');

router.post('/', authMiddleware, adminMiddleware, pelangganController.createPelanggan);
router.get('/', authMiddleware, pelangganController.getAllPelanggan);
router.get('/dashboard', authMiddleware, pelangganController.getDashboardPelanggan);
router.get('/user/:userId', authMiddleware, pelangganController.getPelangganByUserId);
router.put('/:id', authMiddleware, pelangganController.updatePelanggan);
router.patch('/:id/toggle-status', authMiddleware, adminMiddleware, pelangganController.togglePelangganStatus);
router.delete('/:id', authMiddleware, pelangganController.deletePelanggan);

module.exports = router;