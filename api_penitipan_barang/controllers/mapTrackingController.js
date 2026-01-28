const db = require('../config/database');

// Get all pelanggan locations for map tracking
exports.getAllLocations = async (req, res) => {
  try {
    const [locations] = await db.query(`
      SELECT 
        p.id,
        p.nama,
        p.alamat,
        p.latitude,
        p.longitude,
        p.status,
        u.no_telpon
      FROM pelanggan p 
      JOIN user u ON p.user_id = u.id 
      WHERE p.latitude IS NOT NULL 
        AND p.longitude IS NOT NULL 
        AND p.status = 'aktif'
      ORDER BY p.nama
    `);
    
    res.json(locations);
  } catch (error) {
    console.error('Error in getAllLocations:', error);
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

// Get specific pelanggan location
exports.getLocationById = async (req, res) => {
  try {
    const { id } = req.params;
    const [location] = await db.query(`
      SELECT 
        p.id,
        p.nama,
        p.alamat,
        p.latitude,
        p.longitude,
        p.status,
        u.no_telpon
      FROM pelanggan p 
      JOIN user u ON p.user_id = u.id 
      WHERE p.id = ?
    `, [id]);
    
    if (location.length === 0) {
      return res.status(404).json({ message: 'Lokasi tidak ditemukan' });
    }
    
    res.json(location[0]);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

// Update pelanggan location
exports.updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { latitude, longitude } = req.body;
    
    // Validate coordinates
    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude dan longitude harus diisi' });
    }
    
    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({ message: 'Latitude harus antara -90 dan 90' });
    }
    
    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({ message: 'Longitude harus antara -180 dan 180' });
    }
    
    // Check if pelanggan exists
    const [existing] = await db.query('SELECT id FROM pelanggan WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Pelanggan tidak ditemukan' });
    }
    
    // Update location
    await db.query(
      'UPDATE pelanggan SET latitude = ?, longitude = ? WHERE id = ?',
      [latitude, longitude, id]
    );
    
    res.json({ message: 'Lokasi berhasil diupdate' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

// Get pelanggan with penitipan data for detailed tracking
exports.getLocationWithDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get pelanggan basic info
    const [pelanggan] = await db.query(`
      SELECT 
        p.id,
        p.nama,
        p.alamat,
        p.latitude,
        p.longitude,
        p.status,
        u.no_telpon
      FROM pelanggan p 
      JOIN user u ON p.user_id = u.id 
      WHERE p.id = ?
    `, [id]);
    
    if (pelanggan.length === 0) {
      return res.status(404).json({ message: 'Pelanggan tidak ditemukan' });
    }
    
    // Get penitipan data if table exists
    let penitipan = [];
    try {
      const [penitipanResult] = await db.query(`
        SELECT 
          p.id,
          p.jumlah,
          p.harga_jual,
          p.status,
          p.tgl_mulai,
          pt.nama as penitip_nama,
          b.nama as barang_nama
        FROM penitipan p
        JOIN penitip pt ON p.penitip_id = pt.id
        JOIN barang b ON p.barang_id = b.id
        WHERE p.pelanggan_id = ? AND p.status = 'aktif'
      `, [id]);
      penitipan = penitipanResult;
    } catch (error) {
      // Penitipan table might not exist yet
      penitipan = [];
    }
    
    // Get request barang
    const [requestBarang] = await db.query(`
      SELECT 
        id,
        nama_barang,
        jumlah_dibutuhkan,
        status,
        created_at
      FROM request_barang 
      WHERE pelanggan_id = ? 
      ORDER BY created_at DESC 
      LIMIT 5
    `, [id]);
    
    res.json({
      pelanggan: pelanggan[0],
      penitipan: penitipan,
      request_barang: requestBarang
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};