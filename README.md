# Catip - Catat Titipan

Aplikasi mobile untuk mengelola penitipan barang di warung-warung dengan sistem role-based access control.

## 🚀 Fitur Utama

### Admin Dashboard
- Kelola user (pemasok & pelanggan)
- Kelola warung dan barang
- Monitor semua request barang (penerimaan)
- Laporan dan statistik
- Approve/reject request barang dari pelanggan

### Pemasok Dashboard
- Buat profil penitip
- Kelola penitipan barang
- Monitor status penitipan
- Lihat riwayat penitipan

### Pelanggan Dashboard
- Buat profil pelanggan
- Kelola warung
- Catat penjualan barang titipan
- Request barang baru ke admin
- Lihat status request barang
- Laporan penjualan

## 🛠️ Teknologi

### Backend
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT + bcrypt
- **Port**: 3000

### Frontend
- **Framework**: React Native + Expo
- **Navigation**: Expo Router
- **State Management**: React Context
- **Storage**: AsyncStorage

## 📦 Instalasi

### Prerequisites
- Node.js (v16 atau lebih baru)
- MySQL Server
- Expo CLI (`npm install -g @expo/cli`)

### Setup Database
1. Buat database MySQL dengan nama `penitipan_barang`
2. Import schema database (jika ada file SQL)
3. Update konfigurasi di `api_penitipan_barang/.env`

### Setup Backend
```bash
cd api_penitipan_barang
npm install
npm start
```

### Setup Frontend
```bash
cd rn_penitipan_barang
npm install
npm start
```

### Quick Start (Windows)
Jalankan file `start-both.bat` untuk memulai backend dan frontend sekaligus.

## 🔧 Konfigurasi

### Backend (.env)
```env
PORT=3000
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=
DB_NAME=penitipan_barang
JWT_SECRET=your_jwt_secret_key_here
```

### Frontend (API Base URL)
Update `API_BASE_URL` di `services/api.ts` jika backend berjalan di port/host berbeda.

## 👥 Sistem Role

### Admin
- **Login**: Dibuat manual di database
- **Akses**: Semua fitur sistem
- **Fungsi**: Mengelola user, warung, barang, dan monitoring

### Pemasok
- **Login**: Dibuat oleh admin
- **Akses**: Dashboard pemasok setelah buat profil penitip
- **Fungsi**: Mengelola penitipan barang

### Pelanggan
- **Login**: Dibuat oleh admin
- **Akses**: Dashboard pelanggan setelah buat profil pelanggan
- **Fungsi**: Mengelola warung dan penjualan

## 🔐 Authentication Flow

1. **Login**: User login dengan nomor telepon & password
2. **Role Check**: Sistem cek role user (admin/pemasok/pelanggan)
3. **Profile Check**: Pemasok & pelanggan harus buat profil lengkap
4. **Dashboard**: Redirect ke dashboard sesuai role

## 📱 Struktur Aplikasi

```
app_penitipan_barang/
├── api_penitipan_barang/          # Backend API
│   ├── config/                    # Database config
│   ├── controllers/               # Business logic
│   ├── middleware/                # Auth & validation
│   ├── routes/                    # API endpoints
│   └── server.js                  # Main server file
├── rn_penitipan_barang/          # React Native App
│   ├── app/                       # Screens (Expo Router)
│   ├── components/                # Reusable components
│   ├── contexts/                  # React Context
│   ├── services/                  # API service layer
│   └── constants/                 # App constants
└── start-both.bat                # Quick start script
```

## 🔄 API Endpoints

### Authentication
- `POST /api/users/login` - User login

### Profile Management
- `GET /api/profile/profile-status` - Check profile completion

### Admin Only
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Pemasok (Penitip)
- `POST /api/penitip` - Create penitip profile
- `GET /api/penitip/user/:userId` - Get penitip by user ID
- `GET /api/penitipan/penitip/:penitipId` - Get penitipan by penitip

### Pelanggan
- `POST /api/pelanggan` - Create pelanggan profile
- `GET /api/pelanggan/user/:userId` - Get pelanggan by user ID

### Data Management
- `GET /api/warung` - Get all warung
- `GET /api/barang` - Get all barang
- `GET /api/request-barang` - Get all request barang (penerimaan)
- `POST /api/request-barang` - Create new request barang
- `PATCH /api/request-barang/:id/status` - Update request status

## 🚧 Status Pengembangan

### ✅ Selesai
- [x] Backend API lengkap
- [x] Authentication system
- [x] Role-based access control
- [x] Frontend API service layer
- [x] Role-based dashboard
- [x] Login screen dengan validasi

### 🔄 Dalam Pengembangan
- [ ] Form create profile (penitip & pelanggan)
- [ ] CRUD screens untuk semua entitas
- [ ] Form validation yang robust
- [ ] Error handling yang comprehensive

### 📋 Rencana
- [ ] Push notifications
- [ ] Offline support dengan caching
- [ ] Export laporan ke PDF/Excel
- [ ] Dark mode support
- [ ] Unit testing

## 🐛 Troubleshooting

### Backend tidak bisa connect ke database
1. Pastikan MySQL server berjalan
2. Check konfigurasi di `.env`
3. Pastikan database `penitipan_barang` sudah dibuat

### Frontend tidak bisa connect ke backend
1. Pastikan backend berjalan di port 3000
2. Check `API_BASE_URL` di `services/api.ts`
3. Untuk testing di device fisik, ganti `localhost` dengan IP komputer

### Error saat login
1. Pastikan user sudah dibuat di database
2. Check format nomor telepon (tanpa spasi/karakter khusus)
3. Pastikan JWT_SECRET sudah diset di backend

## 📞 Support

Untuk bantuan teknis atau bug report, silakan buat issue di repository ini atau hubungi tim development.

## 📄 License

Private project - All rights reserved.