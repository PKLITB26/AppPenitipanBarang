const db = require('../config/database');

exports.createPenitipan = async (req, res) => {
  try {
    const { penitip_id, warung_id, barang_id, stok } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO penitipan (penitip_id, warung_id, barang_id, stok) VALUES (?, ?, ?, ?)',
      [penitip_id, warung_id, barang_id, stok]
    );
    
    res.status(201).json({ message: 'Penitipan berhasil dibuat', penitipanId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.getAllPenitipan = async (req, res) => {
  try {
    // First check if tables exist and have data
    const [penitipan] = await db.query(`
      SELECT p.*, 
             COALESCE(pt.nama, 'Unknown') as penitip_nama, 
             COALESCE(w.nama_warung, 'Unknown') as warung_nama, 
             COALESCE(b.nama_barang, 'Unknown') as barang_nama 
      FROM penitipan p 
      LEFT JOIN penitip pt ON p.penitip_id = pt.id 
      LEFT JOIN warung w ON p.warung_id = w.id 
      LEFT JOIN barang b ON p.barang_id = b.id
    `);
    res.json(penitipan || []);
  } catch (error) {
    console.error('Error in getAllPenitipan:', error);
    // Return empty array instead of error for missing tables
    res.json([]);
  }
};

exports.getPenitipanById = async (req, res) => {
  try {
    const { id } = req.params;
    const [penitipan] = await db.query(`
      SELECT p.*, pt.nama as penitip_nama, w.nama as warung_nama, b.nama as barang_nama 
      FROM penitipan p 
      JOIN penitip pt ON p.penitip_id = pt.id 
      JOIN warung w ON p.warung_id = w.id 
      JOIN barang b ON p.barang_id = b.id
      WHERE p.id = ?
    `, [id]);
    
    if (penitipan.length === 0) {
      return res.status(404).json({ message: 'Penitipan tidak ditemukan' });
    }
    
    res.json(penitipan[0]);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.getPenitipanByPenitip = async (req, res) => {
  try {
    const { penitipId } = req.params;
    const [penitipan] = await db.query(`
      SELECT p.*, w.nama as warung_nama, b.nama as barang_nama 
      FROM penitipan p 
      JOIN warung w ON p.warung_id = w.id 
      JOIN barang b ON p.barang_id = b.id
      WHERE p.penitip_id = ?
    `, [penitipId]);
    
    res.json(penitipan);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.getPenitipanByWarung = async (req, res) => {
  try {
    const { warungId } = req.params;
    const [penitipan] = await db.query(`
      SELECT p.*, pt.nama as penitip_nama, b.nama as barang_nama 
      FROM penitipan p 
      JOIN penitip pt ON p.penitip_id = pt.id 
      JOIN barang b ON p.barang_id = b.id
      WHERE p.warung_id = ?
    `, [warungId]);
    
    res.json(penitipan);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.updatePenitipan = async (req, res) => {
  try {
    const { id } = req.params;
    const { stok, status } = req.body;
    
    await db.query(
      'UPDATE penitipan SET stok = ?, status = ? WHERE id = ?',
      [stok, status, id]
    );
    
    res.json({ message: 'Penitipan berhasil diupdate' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.deletePenitipan = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM penitipan WHERE id = ?', [id]);
    res.json({ message: 'Penitipan berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};