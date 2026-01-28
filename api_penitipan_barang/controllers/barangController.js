const db = require('../config/database');

exports.createBarang = async (req, res) => {
  try {
    const { nama, harga, stok, tgl_kadaluwarsa } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO barang (nama, harga, stok, tgl_kadaluwarsa) VALUES (?, ?, ?, ?)',
      [nama, harga, stok, tgl_kadaluwarsa]
    );
    
    res.status(201).json({ message: 'Barang berhasil dibuat', barangId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.getAllBarang = async (req, res) => {
  try {
    const [barang] = await db.query('SELECT * FROM barang');
    res.json(barang || []);
  } catch (error) {
    console.error('Error in getAllBarang:', error);
    // Return empty array instead of error for missing tables
    res.json([]);
  }
};

exports.getBarangById = async (req, res) => {
  try {
    const { id } = req.params;
    const [barang] = await db.query('SELECT * FROM barang WHERE id = ?', [id]);
    
    if (barang.length === 0) {
      return res.status(404).json({ message: 'Barang tidak ditemukan' });
    }
    
    res.json(barang[0]);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.updateBarang = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, harga, stok, tgl_kadaluwarsa } = req.body;
    
    await db.query(
      'UPDATE barang SET nama = ?, harga = ?, stok = ?, tgl_kadaluwarsa = ? WHERE id = ?',
      [nama, harga, stok, tgl_kadaluwarsa, id]
    );
    
    res.json({ message: 'Barang berhasil diupdate' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.deleteBarang = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM barang WHERE id = ?', [id]);
    res.json({ message: 'Barang berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};