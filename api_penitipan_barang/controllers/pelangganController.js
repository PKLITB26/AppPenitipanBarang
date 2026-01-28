const db = require('../config/database');

exports.createPelanggan = async (req, res) => {
  try {
    const { user_id, nama, tgl_lahir, jenis_kelamin, alamat, latitude, longitude } = req.body;
    
    // Validasi bahwa user_id adalah pelanggan
    const [user] = await db.query('SELECT role FROM user WHERE id = ?', [user_id]);
    if (user.length === 0 || user[0].role !== 'pelanggan') {
      return res.status(400).json({ message: 'User harus memiliki role pelanggan' });
    }
    
    const [existing] = await db.query('SELECT id FROM pelanggan WHERE user_id = ?', [user_id]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'User sudah memiliki profil pelanggan' });
    }

    const [result] = await db.query(
      'INSERT INTO pelanggan (user_id, nama, tgl_lahir, jenis_kelamin, alamat, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_id, nama, tgl_lahir, jenis_kelamin, alamat, latitude || null, longitude || null]
    );
    
    res.status(201).json({ message: 'Profil pelanggan berhasil dibuat', pelangganId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.getAllPelanggan = async (req, res) => {
  try {
    // Admin bisa lihat semua, pelanggan hanya lihat diri sendiri
    if (req.userRole === 'pelanggan') {
      const [pelanggan] = await db.query(`
        SELECT p.*, u.no_telpon 
        FROM pelanggan p 
        JOIN user u ON p.user_id = u.id 
        WHERE p.user_id = ?
      `, [req.userId]);
      return res.json(pelanggan);
    }
    
    // Admin mendapatkan semua pelanggan dengan data user
    const [pelanggan] = await db.query(`
      SELECT p.*, u.no_telpon 
      FROM pelanggan p 
      JOIN user u ON p.user_id = u.id
      ORDER BY p.id DESC
    `);
    res.json(pelanggan);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.getPelangganByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Pelanggan hanya bisa lihat profil sendiri
    if (req.userRole === 'pelanggan' && parseInt(userId) !== req.userId) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }
    
    const [pelanggan] = await db.query(`
      SELECT p.*, u.no_telpon 
      FROM pelanggan p 
      JOIN user u ON p.user_id = u.id 
      WHERE p.user_id = ?
    `, [userId]);
    
    if (pelanggan.length === 0) {
      return res.status(404).json({ message: 'Profil pelanggan tidak ditemukan' });
    }
    
    res.json(pelanggan[0]);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.updatePelanggan = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, tgl_lahir, jenis_kelamin, alamat, status, latitude, longitude } = req.body;
    
    // Pelanggan hanya bisa update profil sendiri
    if (req.userRole === 'pelanggan') {
      const [pelanggan] = await db.query('SELECT user_id FROM pelanggan WHERE id = ?', [id]);
      if (pelanggan.length === 0 || pelanggan[0].user_id !== req.userId) {
        return res.status(403).json({ message: 'Akses ditolak' });
      }
    }
    
    await db.query(
      'UPDATE pelanggan SET nama = ?, tgl_lahir = ?, jenis_kelamin = ?, alamat = ?, status = ?, latitude = ?, longitude = ? WHERE id = ?',
      [nama, tgl_lahir, jenis_kelamin, alamat, status, latitude, longitude, id]
    );
    
    res.json({ message: 'Profil pelanggan berhasil diupdate' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.togglePelangganStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Hanya admin yang bisa toggle status
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Akses ditolak. Hanya admin yang bisa mengubah status.' });
    }
    
    await db.query('UPDATE pelanggan SET status = ? WHERE id = ?', [status, id]);
    
    res.json({ message: `Status pelanggan berhasil diubah menjadi ${status}` });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.deletePelanggan = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Hanya admin yang bisa hapus pelanggan
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Akses ditolak. Hanya admin yang bisa menghapus pelanggan.' });
    }
    
    await db.query('DELETE FROM pelanggan WHERE id = ?', [id]);
    
    res.json({ message: 'Profil pelanggan berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

// Endpoint khusus untuk pelanggan lihat dashboard
exports.getDashboardPelanggan = async (req, res) => {
  try {
    if (req.userRole !== 'pelanggan') {
      return res.status(403).json({ message: 'Endpoint khusus pelanggan' });
    }

    // Ambil data pelanggan
    const [pelanggan] = await db.query('SELECT * FROM pelanggan WHERE user_id = ?', [req.userId]);
    if (pelanggan.length === 0) {
      return res.status(404).json({ message: 'Profil pelanggan tidak ditemukan' });
    }

    const pelangganId = pelanggan[0].id;

    // Ambil penitipan aktif untuk pelanggan ini (jika ada tabel penitipan)
    let penitipan = [];
    try {
      const [penitipanResult] = await db.query(`
        SELECT p.*, pt.nama as penitip_nama, b.nama as barang_nama, b.harga
        FROM penitipan p 
        JOIN penitip pt ON p.penitip_id = pt.id 
        JOIN barang b ON p.barang_id = b.id
        WHERE p.pelanggan_id = ? AND p.status != 'selesai'
      `, [pelangganId]);
      penitipan = penitipanResult;
    } catch (error) {
      // Tabel penitipan mungkin belum ada
      penitipan = [];
    }

    // Ambil penjualan hari ini (jika ada tabel penjualan)
    let penjualanHariIni = { total_penjualan: 0, total_barang_terjual: 0 };
    try {
      const [penjualanResult] = await db.query(`
        SELECT COUNT(*) as total_penjualan, SUM(pj.jumlah_penjualan) as total_barang_terjual
        FROM penjualan pj
        JOIN penitipan p ON pj.penitipan_id = p.id
        WHERE p.pelanggan_id = ? AND DATE(pj.created_at) = CURDATE()
      `, [pelangganId]);
      penjualanHariIni = penjualanResult[0];
    } catch (error) {
      // Tabel penjualan/penitipan mungkin belum ada
    }

    // Ambil request barang pelanggan
    const [requestBarang] = await db.query(`
      SELECT * FROM request_barang 
      WHERE pelanggan_id = ? 
      ORDER BY created_at DESC 
      LIMIT 5
    `, [pelangganId]);

    // Statistik request barang pelanggan
    const [statsRequest] = await db.query(`
      SELECT 
        COUNT(*) as total_request,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'disetujui' THEN 1 ELSE 0 END) as disetujui,
        SUM(CASE WHEN status = 'ditolak' THEN 1 ELSE 0 END) as ditolak,
        SUM(CASE WHEN status = 'selesai' THEN 1 ELSE 0 END) as selesai
      FROM request_barang 
      WHERE pelanggan_id = ?
    `, [pelangganId]);

    res.json({
      pelanggan: pelanggan[0],
      penitipan_aktif: penitipan,
      penjualan_hari_ini: penjualanHariIni,
      request_barang: {
        list: requestBarang,
        statistik: statsRequest[0]
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};