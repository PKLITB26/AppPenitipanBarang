const db = require('../config/database');

exports.createTransaksi = async (req, res) => {
  try {
    const { tgl_transaksi, catatan } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO transaksi (tgl_transaksi, catatan) VALUES (?, ?)',
      [tgl_transaksi, catatan]
    );
    
    res.status(201).json({ message: 'Transaksi berhasil dibuat', transaksiId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.getAllTransaksi = async (req, res) => {
  try {
    const [transaksi] = await db.query('SELECT * FROM transaksi');
    res.json(transaksi);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.getTransaksiById = async (req, res) => {
  try {
    const { id } = req.params;
    const [transaksi] = await db.query('SELECT * FROM transaksi WHERE id = ?', [id]);
    
    if (transaksi.length === 0) {
      return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    }
    
    res.json(transaksi[0]);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.updateTransaksi = async (req, res) => {
  try {
    const { id } = req.params;
    const { tgl_transaksi, catatan, status } = req.body;
    
    await db.query(
      'UPDATE transaksi SET tgl_transaksi = ?, catatan = ?, status = ? WHERE id = ?',
      [tgl_transaksi, catatan, status, id]
    );
    
    res.json({ message: 'Transaksi berhasil diupdate' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.updateStatusTransaksi = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    await db.query('UPDATE transaksi SET status = ? WHERE id = ?', [status, id]);
    
    res.json({ message: 'Status transaksi berhasil diupdate' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.deleteTransaksi = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM transaksi WHERE id = ?', [id]);
    res.json({ message: 'Transaksi berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};