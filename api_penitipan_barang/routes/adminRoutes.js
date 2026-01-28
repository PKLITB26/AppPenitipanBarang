const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');
const adminMiddleware = require('../middleware/adminMiddleware');

// Admin create pemasok profile
router.post('/pemasok', auth, adminMiddleware, async (req, res) => {
  try {
    const { user_id, nama, jenis_kelamin, alamat, tgl_lahir, status = 'aktif' } = req.body;

    // Validate required fields
    if (!user_id || !nama || !jenis_kelamin || !alamat || !tgl_lahir) {
      return res.status(400).json({ 
        message: 'Semua field harus diisi' 
      });
    }

    // Check if user exists and is pemasok
    const [userCheck] = await db.execute(
      'SELECT id, role FROM user WHERE id = ? AND role = ?',
      [user_id, 'pemasok']
    );

    if (userCheck.length === 0) {
      return res.status(404).json({ 
        message: 'User pemasok tidak ditemukan' 
      });
    }

    // Check if profile already exists
    const [existingProfile] = await db.execute(
      'SELECT id FROM penitip WHERE user_id = ?',
      [user_id]
    );

    if (existingProfile.length > 0) {
      return res.status(400).json({ 
        message: 'Profil pemasok sudah ada untuk user ini' 
      });
    }

    // Create pemasok profile
    const [result] = await db.execute(
      'INSERT INTO penitip (user_id, nama, jenis_kelamin, alamat, tgl_lahir, status) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, nama, jenis_kelamin, alamat, tgl_lahir, status]
    );

    res.status(201).json({
      message: 'Profil pemasok berhasil dibuat',
      pemasokId: result.insertId
    });

  } catch (error) {
    console.error('Error creating pemasok profile:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan server' 
    });
  }
});

// Admin create pelanggan profile
router.post('/pelanggan', auth, adminMiddleware, async (req, res) => {
  try {
    const { user_id, warung_id, nama, tgl_lahir, jenis_kelamin, alamat, status = 'aktif' } = req.body;

    // Validate required fields
    if (!user_id || !warung_id || !nama || !tgl_lahir || !jenis_kelamin || !alamat) {
      return res.status(400).json({ 
        message: 'Semua field harus diisi' 
      });
    }

    // Check if user exists and is pelanggan
    const [userCheck] = await db.execute(
      'SELECT id, role FROM user WHERE id = ? AND role = ?',
      [user_id, 'pelanggan']
    );

    if (userCheck.length === 0) {
      return res.status(404).json({ 
        message: 'User pelanggan tidak ditemukan' 
      });
    }

    // Check if warung exists
    const [warungCheck] = await db.execute(
      'SELECT id FROM toko WHERE id = ?',
      [warung_id]
    );

    if (warungCheck.length === 0) {
      return res.status(404).json({ 
        message: 'Warung tidak ditemukan' 
      });
    }

    // Check if profile already exists
    const [existingProfile] = await db.execute(
      'SELECT id FROM pelanggan WHERE user_id = ?',
      [user_id]
    );

    if (existingProfile.length > 0) {
      return res.status(400).json({ 
        message: 'Profil pelanggan sudah ada untuk user ini' 
      });
    }

    // Create pelanggan profile
    const [result] = await db.execute(
      'INSERT INTO pelanggan (user_id, warung_id, nama, tgl_lahir, jenis_kelamin, alamat, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_id, warung_id, nama, tgl_lahir, jenis_kelamin, alamat, status]
    );

    res.status(201).json({
      message: 'Profil pelanggan berhasil dibuat',
      pelangganId: result.insertId
    });

  } catch (error) {
    console.error('Error creating pelanggan profile:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan server' 
    });
  }
});

// Download report endpoints
router.get('/laporan/download/:type', auth, adminMiddleware, async (req, res) => {
  try {
    const { type } = req.params;
    const { period = 'all' } = req.query;
    
    let reportData = {};
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Get data based on report type
    switch (type) {
      case 'users':
        const [users] = await db.execute('SELECT * FROM user ORDER BY created_at DESC');
        const [pemasok] = await db.execute('SELECT p.*, u.no_telpon FROM penitip p JOIN user u ON p.user_id = u.id');
        const [pelanggan] = await db.execute('SELECT p.*, u.no_telpon FROM pelanggan p JOIN user u ON p.user_id = u.id');
        
        reportData = {
          title: 'Laporan Data Pengguna',
          date: currentDate,
          summary: {
            totalUsers: users.length,
            totalPemasok: pemasok.length,
            totalPelanggan: pelanggan.length
          },
          data: { users, pemasok, pelanggan }
        };
        break;
        
      case 'barang':
        const [barang] = await db.execute('SELECT * FROM barang ORDER BY created_at DESC');
        const [penitipan] = await db.execute(`
          SELECT p.*, b.nama_barang, pt.nama as penitip_nama 
          FROM penitipan p 
          JOIN barang b ON p.barang_id = b.id 
          JOIN penitip pt ON p.penitip_id = pt.id
        `);
        
        reportData = {
          title: 'Laporan Data Barang & Penitipan',
          date: currentDate,
          summary: {
            totalBarang: barang.length,
            totalPenitipan: penitipan.length
          },
          data: { barang, penitipan }
        };
        break;
        
      case 'transaksi':
        const [transaksi] = await db.execute('SELECT * FROM transaksi ORDER BY tgl_transaksi DESC');
        const totalNominal = transaksi.reduce((sum, t) => sum + (t.nominal || 0), 0);
        
        reportData = {
          title: 'Laporan Transaksi',
          date: currentDate,
          summary: {
            totalTransaksi: transaksi.length,
            totalNominal: totalNominal,
            transaksiLunas: transaksi.filter(t => t.status === 'paid').length,
            transaksiBelumLunas: transaksi.filter(t => t.status === 'unpaid').length
          },
          data: { transaksi }
        };
        break;
        
      case 'request':
        const [requests] = await db.execute(`
          SELECT r.*, p.nama as pelanggan_nama, u.no_telpon 
          FROM request_barang r 
          JOIN pelanggan p ON r.pelanggan_id = p.id 
          JOIN user u ON p.user_id = u.id 
          ORDER BY r.created_at DESC
        `);
        
        reportData = {
          title: 'Laporan Request Barang',
          date: currentDate,
          summary: {
            totalRequest: requests.length,
            pending: requests.filter(r => r.status === 'pending').length,
            disetujui: requests.filter(r => r.status === 'disetujui').length,
            ditolak: requests.filter(r => r.status === 'ditolak').length
          },
          data: { requests }
        };
        break;
        
      default:
        return res.status(400).json({ message: 'Tipe laporan tidak valid' });
    }
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="laporan_${type}_${currentDate}.json"`);
    
    res.json(reportData);
    
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Gagal membuat laporan' });
  }
});

module.exports = router;