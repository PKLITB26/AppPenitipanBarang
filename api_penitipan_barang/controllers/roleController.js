const db = require('../config/database');

exports.createRole = async (req, res) => {
  try {
    const { nama } = req.body;
    
    const [result] = await db.query('INSERT INTO role (nama) VALUES (?)', [nama]);
    
    res.status(201).json({ message: 'Role berhasil dibuat', roleId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.getAllRole = async (req, res) => {
  try {
    const [roles] = await db.query('SELECT * FROM role');
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [role] = await db.query('SELECT * FROM role WHERE id = ?', [id]);
    
    if (role.length === 0) {
      return res.status(404).json({ message: 'Role tidak ditemukan' });
    }
    
    res.json(role[0]);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama } = req.body;
    
    await db.query('UPDATE role SET nama = ? WHERE id = ?', [nama, id]);
    
    res.json({ message: 'Role berhasil diupdate' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.query('DELETE FROM role WHERE id = ?', [id]);
    
    res.json({ message: 'Role berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};
