const express = require('express');
const router = express.Router();
const requestBarangController = require('../controllers/requestBarangController');
const authMiddleware = require('../middleware/auth');
const validateProfile = require('../middleware/profileValidation');
const adminMiddleware = require('../middleware/adminMiddleware');

// Pelanggan membuat request barang
router.post('/', authMiddleware, validateProfile, requestBarangController.createRequestBarang);

// Lihat semua request (admin semua, pelanggan hanya milik sendiri)
router.get('/', authMiddleware, requestBarangController.getAllRequestBarang);

// Admin lihat statistik request
router.get('/statistik', authMiddleware, adminMiddleware, requestBarangController.getStatistikRequest);

// Lihat request berdasarkan ID
router.get('/:id', authMiddleware, validateProfile, requestBarangController.getRequestBarangById);

// Update request (pelanggan hanya yang pending, admin semua)
router.put('/:id', authMiddleware, validateProfile, requestBarangController.updateRequestBarang);

// Admin update status request
router.patch('/:id/status', authMiddleware, requestBarangController.updateStatusRequest);

// Hapus request
router.delete('/:id', authMiddleware, validateProfile, requestBarangController.deleteRequestBarang);

module.exports = router;