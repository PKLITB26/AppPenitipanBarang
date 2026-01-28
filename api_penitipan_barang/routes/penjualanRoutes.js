const express = require('express');
const router = express.Router();
const penjualanController = require('../controllers/penjualanController');
const authMiddleware = require('../middleware/auth');
const validateProfile = require('../middleware/profileValidation');
const { pelangganMiddleware, validateWarungAccess } = require('../middleware/pelangganMiddleware');

router.post('/', authMiddleware, validateProfile, penjualanController.createPenjualan);
router.get('/', authMiddleware, validateProfile, penjualanController.getAllPenjualan);
router.get('/:id', authMiddleware, validateProfile, penjualanController.getPenjualanById);
// Pelanggan bisa lihat penjualan di warung mereka
router.get('/warung/:warungId', authMiddleware, validateProfile, pelangganMiddleware, validateWarungAccess, penjualanController.getPenjualanByWarung);
router.put('/:id', authMiddleware, validateProfile, penjualanController.updatePenjualan);
router.delete('/:id', authMiddleware, validateProfile, penjualanController.deletePenjualan);

module.exports = router;