const db = require('../config/database');

// Pelanggan membuat request barang baru
exports.createRequestBarang = async (req, res) => {
  try {
    if (req.userRole !== 'pelanggan') {
      return res.status(403).json({ message: 'Hanya pelanggan yang bisa request barang' });
    }

    const { nama_barang, deskripsi, jumlah_dibutuhkan, harga_estimasi } = req.body;
    
    // Ambil pelanggan_id dari user_id
    const [pelanggan] = await db.query('SELECT id FROM pelanggan WHERE user_id = ?', [req.userId]);
    if (pelanggan.length === 0) {
      return res.status(404).json({ message: 'Profil pelanggan tidak ditemukan' });
    }

    const [result] = await db.query(
      'INSERT INTO request_barang (pelanggan_id, nama_barang, deskripsi, jumlah_dibutuhkan, harga_estimasi) VALUES (?, ?, ?, ?, ?)',
      [pelanggan[0].id, nama_barang, deskripsi, jumlah_dibutuhkan, harga_estimasi]
    );
    
    res.status(201).json({ message: 'Request barang berhasil dibuat', requestId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

// Admin melihat semua request, pelanggan hanya melihat request sendiri
exports.getAllRequestBarang = async (req, res) => {
  try {
    let query = `
      SELECT rb.*, p.nama as pelanggan_nama, p.nama as warung_nama
      FROM request_barang rb
      JOIN pelanggan p ON rb.pelanggan_id = p.id
    `;
    let params = [];

    if (req.userRole === 'pelanggan') {
      // Pelanggan hanya lihat request sendiri
      const [pelanggan] = await db.query('SELECT id FROM pelanggan WHERE user_id = ?', [req.userId]);
      if (pelanggan.length === 0) {
        return res.status(404).json({ message: 'Profil pelanggan tidak ditemukan' });
      }
      query += ' WHERE rb.pelanggan_id = ?';
      params.push(pelanggan[0].id);
    }

    query += ' ORDER BY rb.created_at DESC';
    
    const [requests] = await db.query(query, params);
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

// Ambil request berdasarkan ID
exports.getRequestBarangById = async (req, res) => {
  try {
    const { id } = req.params;
    
    let query = `
      SELECT rb.*, p.nama as pelanggan_nama, p.nama as warung_nama
      FROM request_barang rb
      JOIN pelanggan p ON rb.pelanggan_id = p.id
      WHERE rb.id = ?
    `;

    const [requests] = await db.query(query, [id]);
    
    if (requests.length === 0) {
      return res.status(404).json({ message: 'Request tidak ditemukan' });
    }

    // Pelanggan hanya bisa lihat request sendiri
    if (req.userRole === 'pelanggan') {
      const [pelanggan] = await db.query('SELECT id FROM pelanggan WHERE user_id = ?', [req.userId]);
      if (pelanggan.length === 0 || requests[0].pelanggan_id !== pelanggan[0].id) {
        return res.status(403).json({ message: 'Akses ditolak' });
      }
    }
    
    res.json(requests[0]);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

// Pelanggan update request sendiri (hanya jika status pending)
exports.updateRequestBarang = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_barang, deskripsi, jumlah_dibutuhkan, harga_estimasi } = req.body;

    // Cek apakah request ada dan statusnya
    const [existing] = await db.query('SELECT * FROM request_barang WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Request tidak ditemukan' });
    }

    // Pelanggan hanya bisa update request sendiri dan yang masih pending
    if (req.userRole === 'pelanggan') {
      const [pelanggan] = await db.query('SELECT id FROM pelanggan WHERE user_id = ?', [req.userId]);
      if (pelanggan.length === 0 || existing[0].pelanggan_id !== pelanggan[0].id) {
        return res.status(403).json({ message: 'Akses ditolak' });
      }
      
      if (existing[0].status !== 'pending') {
        return res.status(400).json({ message: 'Request yang sudah diproses tidak bisa diubah' });
      }
    }
    
    await db.query(
      'UPDATE request_barang SET nama_barang = ?, deskripsi = ?, jumlah_dibutuhkan = ?, harga_estimasi = ? WHERE id = ?',
      [nama_barang, deskripsi, jumlah_dibutuhkan, harga_estimasi, id]
    );
    
    res.json({ message: 'Request barang berhasil diupdate' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

// Admin update status request
exports.updateStatusRequest = async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Hanya admin yang bisa update status request' });
    }

    const { id } = req.params;
    const { status, catatan_admin } = req.body;
    
    await db.query(
      'UPDATE request_barang SET status = ?, catatan_admin = ? WHERE id = ?',
      [status, catatan_admin, id]
    );
    
    res.json({ message: 'Status request berhasil diupdate' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

// Hapus request (pelanggan hanya bisa hapus yang pending)
exports.deleteRequestBarang = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [existing] = await db.query('SELECT * FROM request_barang WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Request tidak ditemukan' });
    }

    // Pelanggan hanya bisa hapus request sendiri yang pending
    if (req.userRole === 'pelanggan') {
      const [pelanggan] = await db.query('SELECT id FROM pelanggan WHERE user_id = ?', [req.userId]);
      if (pelanggan.length === 0 || existing[0].pelanggan_id !== pelanggan[0].id) {
        return res.status(403).json({ message: 'Akses ditolak' });
      }
      
      if (existing[0].status !== 'pending') {
        return res.status(400).json({ message: 'Request yang sudah diproses tidak bisa dihapus' });
      }
    }
    
    await db.query('DELETE FROM request_barang WHERE id = ?', [id]);
    res.json({ message: 'Request barang berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

// Admin lihat statistik request
exports.getStatistikRequest = async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Hanya admin yang bisa lihat statistik' });
    }

    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_request,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'disetujui' THEN 1 ELSE 0 END) as disetujui,
        SUM(CASE WHEN status = 'ditolak' THEN 1 ELSE 0 END) as ditolak,
        SUM(CASE WHEN status = 'selesai' THEN 1 ELSE 0 END) as selesai
      FROM request_barang
    `);

    const [requestTerbaru] = await db.query(`
      SELECT rb.*, p.nama as pelanggan_nama, p.nama as warung_nama
      FROM request_barang rb
      JOIN pelanggan p ON rb.pelanggan_id = p.id
      WHERE rb.status = 'pending'
      ORDER BY rb.created_at DESC
      LIMIT 5
    `);

    res.json({
      statistik: stats[0],
      request_terbaru: requestTerbaru
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};