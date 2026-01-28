const express = require('express');
const router = express.Router();
const penitipController = require('../controllers/penitipController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/adminMiddleware');

router.post('/', authMiddleware, adminMiddleware, penitipController.createPenitip);
router.get('/', authMiddleware, penitipController.getAllPenitip);
router.get('/user/:userId', authMiddleware, penitipController.getPenitipByUserId);
router.put('/:id', authMiddleware, penitipController.updatePenitip);
router.patch('/:id/toggle-status', authMiddleware, adminMiddleware, penitipController.togglePemasokStatus);
router.delete('/:id', authMiddleware, penitipController.deletePenitip);

module.exports = router;
