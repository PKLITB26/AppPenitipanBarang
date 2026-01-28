const db = require('../config/database');

// Get all pelanggan (warung owners) with location data
exports.getAllWarung = async (req, res) => {
  try {
    const [pelanggan] = await db.query(`
      SELECT p.*, u.no_telpon 
      FROM pelanggan p 
      JOIN user u ON p.user_id = u.id 
      WHERE p.status = 'aktif'
      ORDER BY p.id DESC
    `);
    res.json(pelanggan || []);
  } catch (error) {
    console.error('Error in getAllWarung:', error);
    res.json([]);
  }
};

// Get pelanggan by ID (for warung detail)
exports.getWarungById = async (req, res) => {
  try {
    const { id } = req.params;
    const [pelanggan] = await db.query(`
      SELECT p.*, u.no_telpon 
      FROM pelanggan p 
      JOIN user u ON p.user_id = u.id 
      WHERE p.id = ?
    `, [id]);
    
    if (pelanggan.length === 0) {
      return res.status(404).json({ message: 'Pelanggan tidak ditemukan' });
    }
    
    res.json(pelanggan[0]);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

// Update pelanggan location for tracking
exports.updateWarungLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { latitude, longitude } = req.body;
    
    await db.query(
      'UPDATE pelanggan SET latitude = ?, longitude = ? WHERE id = ?',
      [latitude, longitude, id]
    );
    
    res.json({ message: 'Lokasi berhasil diupdate' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

// Get pelanggan by user_id (for current user's warung)
exports.getWarungByPelanggan = async (req, res) => {
  try {
    const { pelangganId } = req.params;
    const [pelanggan] = await db.query(`
      SELECT p.*, u.no_telpon 
      FROM pelanggan p 
      JOIN user u ON p.user_id = u.id 
      WHERE p.id = ?
    `, [pelangganId]);
    
    res.json(pelanggan || []);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};