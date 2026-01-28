const db = require('../config/database');

// Middleware untuk memastikan pelanggan hanya akses data warung mereka
const pelangganMiddleware = async (req, res, next) => {
  try {
    if (req.userRole !== 'pelanggan') {
      return next(); // Bukan pelanggan, lanjut ke middleware lain
    }

    // Ambil data pelanggan berdasarkan user_id
    const [pelanggan] = await db.query('SELECT warung_id FROM pelanggan WHERE user_id = ?', [req.userId]);
    
    if (pelanggan.length === 0) {
      return res.status(403).json({ message: 'Profil pelanggan tidak ditemukan' });
    }

    // Simpan warung_id pelanggan untuk validasi akses
    req.pelangganWarungId = pelanggan[0].warung_id;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

// Middleware untuk validasi akses warung
const validateWarungAccess = (req, res, next) => {
  if (req.userRole === 'pelanggan') {
    const warungId = req.params.warungId || req.params.id;
    
    if (parseInt(warungId) !== req.pelangganWarungId) {
      return res.status(403).json({ message: 'Akses ditolak. Anda hanya bisa mengakses data warung Anda.' });
    }
  }
  next();
};

module.exports = { pelangganMiddleware, validateWarungAccess };