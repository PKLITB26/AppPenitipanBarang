const express = require('express');
const router = express.Router();
const transaksiController = require('../controllers/transaksiController');
const authMiddleware = require('../middleware/auth');
const validateProfile = require('../middleware/profileValidation');

router.post('/', authMiddleware, validateProfile, transaksiController.createTransaksi);
router.get('/', authMiddleware, validateProfile, transaksiController.getAllTransaksi);
router.get('/:id', authMiddleware, validateProfile, transaksiController.getTransaksiById);
router.put('/:id', authMiddleware, validateProfile, transaksiController.updateTransaksi);
router.patch('/:id/status', authMiddleware, validateProfile, transaksiController.updateStatusTransaksi);
router.delete('/:id', authMiddleware, validateProfile, transaksiController.deleteTransaksi);

module.exports = router;