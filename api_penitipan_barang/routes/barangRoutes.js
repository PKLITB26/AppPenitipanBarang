const express = require('express');
const router = express.Router();
const barangController = require('../controllers/barangController');
const authMiddleware = require('../middleware/auth');
const validateProfile = require('../middleware/profileValidation');

router.post('/', authMiddleware, validateProfile, barangController.createBarang);
router.get('/', authMiddleware, validateProfile, barangController.getAllBarang);
router.get('/:id', authMiddleware, validateProfile, barangController.getBarangById);
router.put('/:id', authMiddleware, validateProfile, barangController.updateBarang);
router.delete('/:id', authMiddleware, validateProfile, barangController.deleteBarang);

module.exports = router;