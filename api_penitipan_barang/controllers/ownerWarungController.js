const db = require('../config/database');

exports.getWarungByOwner = async (req, res) => {
  try {
    const { ownerId } = req.params;
    const [warung] = await db.query('SELECT * FROM warung WHERE pelanggan_id = ?', [ownerId]);
    res.json(warung);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};