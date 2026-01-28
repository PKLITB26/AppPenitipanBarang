const db = require('../config/database');

// Middleware untuk pemasok - hanya bisa akses data penitipan sendiri
const pemasokMiddleware = async (req, res, next) => {
  try {
    if (req.userRole !== 'pemasok') {
      return next(); // Bukan pemasok, lanjut ke middleware lain
    }

    // Ambil data penitip berdasarkan user_id
    const [penitip] = await db.query('SELECT id FROM penitip WHERE user_id = ?', [req.userId]);
    
    if (penitip.length === 0) {
      return res.status(403).json({ message: 'Profil penitip tidak ditemukan' });
    }

    // Simpan penitip_id untuk validasi akses
    req.pemasokPenitipId = penitip[0].id;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

// Middleware untuk validasi akses penitipan pemasok
const validatePenitipanAccess = (req, res, next) => {
  if (req.userRole === 'pemasok') {
    const penitipId = req.params.penitipId;
    
    if (parseInt(penitipId) !== req.pemasokPenitipId) {
      return res.status(403).json({ message: 'Akses ditolak. Anda hanya bisa mengakses penitipan sendiri.' });
    }
  }
  next();
};

module.exports = { pemasokMiddleware, validatePenitipanAccess };