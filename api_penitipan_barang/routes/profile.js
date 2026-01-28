const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');

// Cek status profil user
router.get('/profile-status', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const role = req.userRole;

    let profileComplete = false;
    let profileData = null;
    let requiredProfile = null;

    if (role === 'admin') {
      profileComplete = true;
    } else if (role === 'pemasok') {
      requiredProfile = 'penitip';
      const [penitip] = await db.query('SELECT * FROM penitip WHERE user_id = ?', [userId]);
      if (penitip.length > 0) {
        profileComplete = true;
        profileData = penitip[0];
      }
    } else if (role === 'pelanggan') {
      requiredProfile = 'pelanggan';
      const [pelanggan] = await db.query('SELECT * FROM pelanggan WHERE user_id = ?', [userId]);
      if (pelanggan.length > 0) {
        profileComplete = true;
        profileData = pelanggan[0];
      }
    }

    res.json({
      success: true,
      data: {
        userId,
        role,
        profileComplete,
        requiredProfile,
        profileData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking profile status',
      error: error.message
    });
  }
});

module.exports = router;