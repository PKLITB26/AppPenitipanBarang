const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Admin creates user (pemasok atau pelanggan)
exports.createUser = async (req, res) => {
  try {
    const { no_telpon, password, role } = req.body;
    
    // Validasi role yang diizinkan untuk dibuat admin
    if (!['pemasok', 'pelanggan'].includes(role)) {
      return res.status(400).json({ message: 'Role harus pemasok atau pelanggan' });
    }
    
    const [existing] = await db.query('SELECT id FROM user WHERE no_telpon = ?', [no_telpon]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Nomor telepon sudah terdaftar' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query('INSERT INTO user (no_telpon, password, role) VALUES (?, ?, ?)', [no_telpon, hashedPassword, role]);
    
    res.status(201).json({ message: 'User berhasil dibuat', userId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { no_telpon, password } = req.body;
    
    const [users] = await db.query('SELECT * FROM user WHERE no_telpon = ?', [no_telpon]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Nomor telepon atau password salah' });
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Nomor telepon atau password salah' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    
    res.json({ message: 'Login berhasil', token, userId: user.id, role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, no_telpon, role FROM user WHERE role != "admin"');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { no_telpon, role, password } = req.body;
    
    // Validasi role yang diizinkan untuk diupdate admin
    if (role && !['pemasok', 'pelanggan'].includes(role)) {
      return res.status(400).json({ message: 'Role harus pemasok atau pelanggan' });
    }
    
    let query = 'UPDATE user SET no_telpon = ?, role = ?';
    let params = [no_telpon, role];
    
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', password = ?';
      params.push(hashedPassword);
    }
    
    query += ' WHERE id = ? AND role != "admin"'; // Tidak bisa update admin
    params.push(id);
    
    await db.query(query, params);
    
    res.json({ message: 'User berhasil diupdate' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    // Tidak bisa hapus admin
    await db.query('DELETE FROM user WHERE id = ? AND role != "admin"', [id]);
    res.json({ message: 'User berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

// Reset password - hanya untuk demo, password direset ke default
exports.resetPassword = async (req, res) => {
  try {
    const { no_telpon } = req.body;
    
    // Cek apakah user ada
    const [users] = await db.query('SELECT id, role FROM user WHERE no_telpon = ?', [no_telpon]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'Nomor telepon tidak ditemukan' });
    }

    // Password default untuk reset (dalam implementasi nyata, kirim via SMS/email)
    const defaultPassword = '123456';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
    await db.query('UPDATE user SET password = ? WHERE no_telpon = ?', [hashedPassword, no_telpon]);
    
    res.json({ 
      message: 'Password berhasil direset', 
      newPassword: defaultPassword,
      note: 'Silakan login dengan password baru dan segera ganti password Anda'
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};
