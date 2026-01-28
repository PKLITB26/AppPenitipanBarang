const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, roleController.createRole);
router.get('/', authMiddleware, roleController.getAllRole);
router.get('/:id', authMiddleware, roleController.getRoleById);
router.put('/:id', authMiddleware, roleController.updateRole);
router.delete('/:id', authMiddleware, roleController.deleteRole);

module.exports = router;
