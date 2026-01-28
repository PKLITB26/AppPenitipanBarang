const db = require('../config/database');

exports.createPenjualan = async (req, res) => {
  try {
    const { penitipan_id, jumlah_penjualan } = req.body;
    
    // Check if penitipan exists and has enough stock
    const [penitipan] = await db.query('SELECT stok FROM penitipan WHERE id = ?', [penitipan_id]);
    if (penitipan.length === 0) {
      return res.status(404).json({ message: 'Penitipan tidak ditemukan' });
    }
    
    if (penitipan[0].stok < jumlah_penjualan) {
      return res.status(400).json({ message: 'Stok tidak mencukupi' });
    }
    
    // Create penjualan record
    const [result] = await db.query(
      'INSERT INTO penjualan (penitipan_id, jumlah_penjualan) VALUES (?, ?)',
      [penitipan_id, jumlah_penjualan]
    );
    
    // Update penitipan stock
    const newStok = penitipan[0].stok - jumlah_penjualan;
    await db.query('UPDATE penitipan SET stok = ? WHERE id = ?', [newStok, penitipan_id]);
    
    res.status(201).json({ message: 'Penjualan berhasil dicatat', penjualanId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.getAllPenjualan = async (req, res) => {
  try {
    const [penjualan] = await db.query(`
      SELECT pj.*, p.penitip_id, p.warung_id, p.barang_id, 
             pt.nama as penitip_nama, w.nama as warung_nama, b.nama as barang_nama
      FROM penjualan pj
      JOIN penitipan p ON pj.penitipan_id = p.id
      JOIN penitip pt ON p.penitip_id = pt.id
      JOIN warung w ON p.warung_id = w.id
      JOIN barang b ON p.barang_id = b.id
    `);
    res.json(penjualan);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.getPenjualanById = async (req, res) => {
  try {
    const { id } = req.params;
    const [penjualan] = await db.query(`
      SELECT pj.*, p.penitip_id, p.warung_id, p.barang_id, 
             pt.nama as penitip_nama, w.nama as warung_nama, b.nama as barang_nama
      FROM penjualan pj
      JOIN penitipan p ON pj.penitipan_id = p.id
      JOIN penitip pt ON p.penitip_id = pt.id
      JOIN warung w ON p.warung_id = w.id
      JOIN barang b ON p.barang_id = b.id
      WHERE pj.id = ?
    `, [id]);
    
    if (penjualan.length === 0) {
      return res.status(404).json({ message: 'Penjualan tidak ditemukan' });
    }
    
    res.json(penjualan[0]);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.getPenjualanByWarung = async (req, res) => {
  try {
    const { warungId } = req.params;
    const [penjualan] = await db.query(`
      SELECT pj.*, p.penitip_id, p.barang_id, 
             pt.nama as penitip_nama, b.nama as barang_nama
      FROM penjualan pj
      JOIN penitipan p ON pj.penitipan_id = p.id
      JOIN penitip pt ON p.penitip_id = pt.id
      JOIN barang b ON p.barang_id = b.id
      WHERE p.warung_id = ?
    `, [warungId]);
    
    res.json(penjualan);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.updatePenjualan = async (req, res) => {
  try {
    const { id } = req.params;
    const { jumlah_penjualan } = req.body;
    
    await db.query(
      'UPDATE penjualan SET jumlah_penjualan = ? WHERE id = ?',
      [jumlah_penjualan, id]
    );
    
    res.json({ message: 'Penjualan berhasil diupdate' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.deletePenjualan = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM penjualan WHERE id = ?', [id]);
    res.json({ message: 'Penjualan berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};