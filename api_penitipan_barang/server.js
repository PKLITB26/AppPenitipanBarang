const express = require('express');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const penitipRoutes = require('./routes/penitipRoutes');
const ownerWarungRoutes = require('./routes/ownerWarungRoutes');
const warungRoutes = require('./routes/warungRoutes');
const barangRoutes = require('./routes/barangRoutes');
const pelangganRoutes = require('./routes/pelangganRoutes');
const penitipanRoutes = require('./routes/penitipanRoutes');
const penjualanRoutes = require('./routes/penjualanRoutes');
const transaksiRoutes = require('./routes/transaksiRoutes');
const requestBarangRoutes = require('./routes/requestBarangRoutes');
const profileRoutes = require('./routes/profile');
const adminRoutes = require('./routes/adminRoutes');
const locationRoutes = require('./routes/locationRoutes');
const mapTrackingRoutes = require('./routes/mapTrackingRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', userRoutes);
app.use('/api/penitip', penitipRoutes);
app.use('/api/owner-warung', ownerWarungRoutes);
app.use('/api/warung', warungRoutes);
app.use('/api/barang', barangRoutes);
app.use('/api/pelanggan', pelangganRoutes);
app.use('/api/penitipan', penitipanRoutes);
app.use('/api/penjualan', penjualanRoutes);
app.use('/api/transaksi', transaksiRoutes);
app.use('/api/request-barang', requestBarangRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/map', mapTrackingRoutes);

app.get('/', (req, res) => {
  res.json({ 
    message: 'API Catip - Catat Titipan',
    version: '1.0.0',
    description: 'Backend API untuk aplikasi manajemen penitipan barang'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server berjalan di port ${PORT}`);
});
