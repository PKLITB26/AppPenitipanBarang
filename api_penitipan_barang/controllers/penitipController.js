const db = require('../config/database');

exports.createPenitip = async (req, res) => {
  try {
    const { user_id, nama, jenis_kelamin, alamat, tgl_lahir } = req.body;
    
    // Validasi bahwa user_id adalah pemasok
    const [user] = await db.query('SELECT role FROM user WHERE id = ?', [user_id]);
    if (user.length === 0 || user[0].role !== 'pemasok') {
      return res.status(400).json({ message: 'User harus memiliki role pemasok' });
    }
    
    const [existing] = await db.query('SELECT id FROM penitip WHERE user_id = ?', [user_id]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'User sudah memiliki profil penitip' });
    }

    const [result] = await db.query(
      'INSERT INTO penitip (user_id, nama, jenis_kelamin, alamat, tgl_lahir) VALUES (?, ?, ?, ?, ?)',
      [user_id, nama, jenis_kelamin, alamat, tgl_lahir]
    );
    
    res.status(201).json({ message: 'Profil penitip berhasil dibuat', penitipId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.getAllPenitip = async (req, res) => {
  try {
    // Admin mendapatkan semua penitip dengan data user
    const [penitip] = await db.query(`
      SELECT p.*, u.no_telpon 
      FROM penitip p 
      JOIN user u ON p.user_id = u.id 
      WHERE u.role = 'pemasok'
      ORDER BY p.id DESC
    `);
    res.json(penitip);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.getPenitipByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const [penitip] = await db.query(`
      SELECT p.*, u.no_telpon 
      FROM penitip p 
      JOIN user u ON p.user_id = u.id 
      WHERE p.user_id = ? AND u.role = 'pemasok'
    `, [userId]);
    
    if (penitip.length === 0) {
      return res.status(404).json({ message: 'Profil penitip tidak ditemukan' });
    }
    
    res.json(penitip[0]);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.updatePenitip = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, jenis_kelamin, alamat, tgl_lahir, status } = req.body;
    
    // Pemasok hanya bisa update profil sendiri
    if (req.userRole === 'pemasok') {
      const [penitip] = await db.query('SELECT user_id FROM penitip WHERE id = ?', [id]);
      if (penitip.length === 0 || penitip[0].user_id !== req.userId) {
        return res.status(403).json({ message: 'Akses ditolak' });
      }
    }
    
    await db.query(
      'UPDATE penitip SET nama = ?, jenis_kelamin = ?, alamat = ?, tgl_lahir = ?, status = ? WHERE id = ?',
      [nama, jenis_kelamin, alamat, tgl_lahir, status, id]
    );
    
    res.json({ message: 'Profil penitip berhasil diupdate' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.togglePemasokStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Hanya admin yang bisa toggle status
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Akses ditolak. Hanya admin yang bisa mengubah status.' });
    }
    
    await db.query('UPDATE penitip SET status = ? WHERE id = ?', [status, id]);
    
    res.json({ message: `Status pemasok berhasil diubah menjadi ${status}` });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.deletePenitip = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Hanya admin yang bisa hapus penitip
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Hanya admin yang bisa menghapus penitip' });
    }
    
    await db.query('DELETE FROM penitip WHERE id = ?', [id]);
    
    res.json({ message: 'Profil penitip berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};
