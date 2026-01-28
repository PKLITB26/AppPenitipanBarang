const db = require('./config/database');

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test database connection
    const [result] = await db.query('SELECT 1 as test');
    console.log('✅ Database connected:', result);
    
    // Check if database exists
    const [databases] = await db.query('SHOW DATABASES LIKE "penitipan_barang"');
    if (databases.length === 0) {
      console.log('❌ Database "penitipan_barang" not found!');
      return;
    }
    console.log('✅ Database "penitipan_barang" exists');
    
    // Check tables
    const [tables] = await db.query('SHOW TABLES');
    console.log('📋 Tables in database:', tables.map(t => Object.values(t)[0]));
    
    // Check user table structure
    const [userTable] = await db.query('DESCRIBE user');
    console.log('👤 User table structure:', userTable);
    
    // Check if admin user exists
    const [users] = await db.query('SELECT id, role, no_telpon FROM user WHERE role = "admin"');
    console.log('👑 Admin users:', users);
    
    if (users.length === 0) {
      console.log('⚠️ No admin user found! Creating default admin...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await db.query('INSERT INTO user (no_telpon, password, role) VALUES (?, ?, ?)', 
        ['08123456789', hashedPassword, 'admin']);
      console.log('✅ Default admin created: 08123456789 / admin123');
    }
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  } finally {
    process.exit(0);
  }
}

testConnection();