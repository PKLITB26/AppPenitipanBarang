const db = require('../config/database');

const validateProfile = async (req, res, next) => {
  try {
    const userId = req.userId;
    const role = req.userRole;

    // Admin tidak perlu validasi profil tambahan
    if (role === 'admin') {
      return next();
    }

    let profileExists = false;
    let profileTable = '';

    // Cek profil berdasarkan role
    if (role === 'pemasok') {
      profileTable = 'penitip';
      const [penitip] = await db.query('SELECT id FROM penitip WHERE user_id = ?', [userId]);
      profileExists = penitip.length > 0;
    } else if (role === 'pelanggan') {
      profileTable = 'pelanggan';
      const [pelanggan] = await db.query('SELECT id FROM pelanggan WHERE user_id = ?', [userId]);
      profileExists = pelanggan.length > 0;
    }

    if (!profileExists) {
      return res.status(403).json({
        success: false,
        message: `Anda harus melengkapi profil ${profileTable} terlebih dahulu sebelum mengakses menu ini`,
        requireProfile: profileTable
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error validating profile',
      error: error.message
    });
  }
};

module.exports = validateProfile;