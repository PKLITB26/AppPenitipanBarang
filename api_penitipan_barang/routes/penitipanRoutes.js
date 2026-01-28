const express = require('express');
const router = express.Router();
const penitipanController = require('../controllers/penitipanController');
const authMiddleware = require('../middleware/auth');
const validateProfile = require('../middleware/profileValidation');
const { pelangganMiddleware, validateWarungAccess } = require('../middleware/pelangganMiddleware');
const { pemasokMiddleware, validatePenitipanAccess } = require('../middleware/pemasokMiddleware');

// Admin can access all endpoints without profile validation
router.post('/', authMiddleware, (req, res, next) => {
  if (req.userRole === 'admin') {
    return next();
  }
  validateProfile(req, res, next);
}, penitipanController.createPenitipan);

router.get('/', authMiddleware, (req, res, next) => {
  if (req.userRole === 'admin') {
    return next();
  }
  validateProfile(req, res, next);
}, penitipanController.getAllPenitipan);

router.get('/:id', authMiddleware, (req, res, next) => {
  if (req.userRole === 'admin') {
    return next();
  }
  validateProfile(req, res, next);
}, penitipanController.getPenitipanById);

// Pemasok bisa lihat penitipan sendiri
router.get('/penitip/:penitipId', authMiddleware, validateProfile, pemasokMiddleware, validatePenitipanAccess, penitipanController.getPenitipanByPenitip);
// Pelanggan bisa lihat penitipan di warung mereka
router.get('/warung/:warungId', authMiddleware, validateProfile, pelangganMiddleware, validateWarungAccess, penitipanController.getPenitipanByWarung);

router.put('/:id', authMiddleware, (req, res, next) => {
  if (req.userRole === 'admin') {
    return next();
  }
  validateProfile(req, res, next);
}, penitipanController.updatePenitipan);

router.delete('/:id', authMiddleware, (req, res, next) => {
  if (req.userRole === 'admin') {
    return next();
  }
  validateProfile(req, res, next);
}, penitipanController.deletePenitipan);

module.exports = router;