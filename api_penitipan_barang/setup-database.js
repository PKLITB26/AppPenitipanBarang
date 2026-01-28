const mysql = require('mysql2/promise');
require('dotenv').config();

const createTables = async () => {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('Connected to database');

    // Create tables if they don't exist
    const tables = [
      // User table
      `CREATE TABLE IF NOT EXISTS user (
        id INT AUTO_INCREMENT PRIMARY KEY,
        no_telpon VARCHAR(15) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'pemasok', 'pelanggan') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Penitip table
      `CREATE TABLE IF NOT EXISTS penitip (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        nama VARCHAR(100) NOT NULL,
        alamat TEXT,
        status ENUM('aktif', 'nonaktif') DEFAULT 'aktif',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
      )`,

      // Pelanggan table
      `CREATE TABLE IF NOT EXISTS pelanggan (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        nama VARCHAR(100) NOT NULL,
        alamat TEXT,
        warung_id INT NULL,
        status ENUM('aktif', 'nonaktif') DEFAULT 'aktif',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
      )`,

      // Warung table
      `CREATE TABLE IF NOT EXISTS warung (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama_warung VARCHAR(100) NOT NULL,
        alamat TEXT,
        pelanggan_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Toko table (alias for warung with coordinates)
      `CREATE TABLE IF NOT EXISTS toko (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama VARCHAR(100) NOT NULL,
        alamat TEXT,
        latitude DECIMAL(10, 8) NULL,
        longtitude DECIMAL(11, 8) NULL,
        pelanggan_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Barang table
      `CREATE TABLE IF NOT EXISTS barang (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama_barang VARCHAR(100) NOT NULL,
        kategori VARCHAR(50),
        harga DECIMAL(10,2) DEFAULT 0,
        stok INT DEFAULT 0,
        kode_barang VARCHAR(50) UNIQUE,
        status ENUM('aktif', 'nonaktif') DEFAULT 'aktif',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Penitipan table
      `CREATE TABLE IF NOT EXISTS penitipan (
        id INT AUTO_INCREMENT PRIMARY KEY,
        kode_penitipan VARCHAR(50) UNIQUE,
        penitip_id INT NOT NULL,
        warung_id INT NOT NULL,
        barang_id INT NOT NULL,
        jumlah INT NOT NULL,
        harga_satuan DECIMAL(10,2) DEFAULT 0,
        total_harga DECIMAL(10,2) DEFAULT 0,
        tanggal_penitipan DATE DEFAULT (CURRENT_DATE),
        tanggal_kadaluarsa DATE,
        status ENUM('aktif', 'terjual', 'kadaluarsa', 'dikembalikan') DEFAULT 'aktif',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (penitip_id) REFERENCES penitip(id) ON DELETE CASCADE,
        FOREIGN KEY (warung_id) REFERENCES warung(id) ON DELETE CASCADE,
        FOREIGN KEY (barang_id) REFERENCES barang(id) ON DELETE CASCADE
      )`,

      // Transaksi table
      `CREATE TABLE IF NOT EXISTS transaksi (
        id INT AUTO_INCREMENT PRIMARY KEY,
        penitipan_id INT NOT NULL,
        jumlah_terjual INT NOT NULL,
        harga_jual DECIMAL(10,2) NOT NULL,
        total_harga DECIMAL(10,2) NOT NULL,
        tanggal_transaksi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (penitipan_id) REFERENCES penitipan(id) ON DELETE CASCADE
      )`,

      // Request barang table
      `CREATE TABLE IF NOT EXISTS request_barang (
        id INT AUTO_INCREMENT PRIMARY KEY,
        pelanggan_id INT NOT NULL,
        nama_barang VARCHAR(100) NOT NULL,
        deskripsi TEXT,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (pelanggan_id) REFERENCES pelanggan(id) ON DELETE CASCADE
      )`
    ];

    // Execute each table creation
    for (const tableSQL of tables) {
      await connection.execute(tableSQL);
      console.log('Table created/verified');
    }

    // Insert default admin if not exists
    const [adminExists] = await connection.execute(
      'SELECT id FROM user WHERE role = "admin" LIMIT 1'
    );

    if (adminExists.length === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await connection.execute(
        'INSERT INTO user (no_telpon, password, role) VALUES (?, ?, ?)',
        ['08123456789', hashedPassword, 'admin']
      );
      
      console.log('Default admin created:');
      console.log('Phone: 08123456789');
      console.log('Password: admin123');
    }

    console.log('Database setup completed successfully!');

  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// Run the setup
createTables();