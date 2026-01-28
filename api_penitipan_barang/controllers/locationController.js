const db = require('../config/database');

// Admin mendapatkan semua lokasi pelanggan dan penitip
exports.getAllLocations = async (req, res) => {
  try {
    console.log('Getting all locations for user:', req.userId, 'role:', req.userRole);
    
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Hanya admin yang bisa mengakses data lokasi' });
    }

    // Ambil data pelanggan dengan koordinat
    const [pelangganData] = await db.query(`
      SELECT 
        p.id,
        p.nama,
        p.alamat,
        'pelanggan' as type,
        'Warung' as toko_nama,
        p.latitude,
        p.longitude as longtitude,
        u.no_telpon
      FROM pelanggan p
      JOIN user u ON p.user_id = u.id
      WHERE p.status = 'aktif'
    `);

    // Ambil data penitip dengan koordinat
    const [penitipData] = await db.query(`
      SELECT 
        p.id,
        p.nama,
        p.alamat,
        'pemasok' as type,
        NULL as toko_nama,
        p.latitude,
        p.longitude as longtitude,
        u.no_telpon
      FROM penitip p
      JOIN user u ON p.user_id = u.id
      WHERE p.status = 'aktif'
    `);

    // Gabungkan data
    const allLocations = [...pelangganData, ...penitipData];
    
    console.log('Found locations:', allLocations.length);
    res.json(allLocations);
  } catch (error) {
    console.error('Error in getAllLocations:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data lokasi', error: error.message });
  }
};

// Admin mendapatkan statistik lokasi
exports.getLocationStats = async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Hanya admin yang bisa mengakses statistik lokasi' });
    }

    const [stats] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM pelanggan WHERE status = 'aktif') as total_pelanggan,
        (SELECT COUNT(*) FROM penitip WHERE status = 'aktif') as total_pemasok,
        (SELECT COUNT(*) FROM pelanggan WHERE latitude IS NOT NULL AND longitude IS NOT NULL) as pelanggan_dengan_koordinat,
        (SELECT COUNT(*) FROM penitip WHERE latitude IS NOT NULL AND longitude IS NOT NULL) as pemasok_dengan_koordinat,
        (SELECT COUNT(*) FROM transaksi) as total_transaksi
    `);

    res.json({
      ...stats[0],
      // Alias untuk kompatibilitas
      totalPemasok: stats[0].total_pemasok,
      totalPelanggan: stats[0].total_pelanggan,
      totalTransaksi: stats[0].total_transaksi
    });
  } catch (error) {
    console.error('Error in getLocationStats:', error);
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

// Update koordinat pelanggan atau penitip
exports.updateTokoCoordinates = async (req, res) => {
  try {
    const { tokoId } = req.params;
    const { latitude, longitude } = req.body;

    // Validasi koordinat
    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude dan longitude harus diisi' });
    }

    if (req.userRole === 'pelanggan') {
      // Pelanggan hanya bisa update koordinat sendiri
      const [pelanggan] = await db.query('SELECT id FROM pelanggan WHERE user_id = ?', [req.userId]);
      if (pelanggan.length === 0 || pelanggan[0].id != tokoId) {
        return res.status(403).json({ message: 'Akses ditolak' });
      }
      
      await db.query(
        'UPDATE pelanggan SET latitude = ?, longitude = ? WHERE id = ?',
        [latitude, longitude, tokoId]
      );
    } else if (req.userRole === 'pemasok') {
      // Pemasok hanya bisa update koordinat sendiri
      const [penitip] = await db.query('SELECT id FROM penitip WHERE user_id = ?', [req.userId]);
      if (penitip.length === 0 || penitip[0].id != tokoId) {
        return res.status(403).json({ message: 'Akses ditolak' });
      }
      
      await db.query(
        'UPDATE penitip SET latitude = ?, longitude = ? WHERE id = ?',
        [latitude, longitude, tokoId]
      );
    } else if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Akses ditolak' });
    } else {
      // Admin bisa update koordinat siapa saja
      // Cek apakah ID adalah pelanggan atau penitip
      const [pelanggan] = await db.query('SELECT id FROM pelanggan WHERE id = ?', [tokoId]);
      if (pelanggan.length > 0) {
        await db.query(
          'UPDATE pelanggan SET latitude = ?, longitude = ? WHERE id = ?',
          [latitude, longitude, tokoId]
        );
      } else {
        await db.query(
          'UPDATE penitip SET latitude = ?, longitude = ? WHERE id = ?',
          [latitude, longitude, tokoId]
        );
      }
    }

    res.json({ message: 'Koordinat berhasil diupdate' });
  } catch (error) {
    console.error('Error updating coordinates:', error);
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};