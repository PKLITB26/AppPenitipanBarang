# API Penitipan Barang

Backend API untuk aplikasi penitipan barang.

## Instalasi

```bash
npm install
```

## Konfigurasi

Edit file `.env` sesuai dengan konfigurasi database Anda.

## Menjalankan Server

```bash
npm start
```

Atau untuk development dengan auto-reload:

```bash
npm run dev
```

## API Endpoints

### User (Admin Only)

- `POST /api/users` - Admin membuat user baru (perlu token)
- `POST /api/users/login` - Login user
- `GET /api/users` - Ambil semua user (perlu token)
- `PUT /api/users/:id` - Update user (perlu token)
- `DELETE /api/users/:id` - Hapus user (perlu token)

### Penitip

- `POST /api/penitip` - Buat profil penitip (perlu token)
- `GET /api/penitip` - Ambil semua penitip (perlu token)
- `GET /api/penitip/user/:userId` - Ambil profil penitip berdasarkan user ID (perlu token)
- `PUT /api/penitip/:id` - Update profil penitip (perlu token)
- `DELETE /api/penitip/:id` - Hapus profil penitip (perlu token)

### Owner Warung / Pelanggan

- `POST /api/owner-warung` - Buat profil pelanggan (perlu token)
- `GET /api/owner-warung` - Ambil semua pelanggan (perlu token)
- `GET /api/owner-warung/user/:userId` - Ambil profil pelanggan berdasarkan user ID (perlu token)
- `PUT /api/owner-warung/:id` - Update profil pelanggan (perlu token)
- `DELETE /api/owner-warung/:id` - Hapus profil pelanggan (perlu token)

### Warung

- `POST /api/warung` - Buat warung baru (perlu token)
- `GET /api/warung` - Ambil semua warung (perlu token)
- `GET /api/warung/:id` - Ambil warung berdasarkan ID (perlu token)
- `PUT /api/warung/:id` - Update warung (perlu token)
- `DELETE /api/warung/:id` - Hapus warung (perlu token)

### Barang

- `POST /api/barang` - Buat barang baru (perlu token)
- `GET /api/barang` - Ambil semua barang (perlu token)
- `GET /api/barang/:id` - Ambil barang berdasarkan ID (perlu token)
- `PUT /api/barang/:id` - Update barang (perlu token)
- `DELETE /api/barang/:id` - Hapus barang (perlu token)

### Pelanggan

- `POST /api/pelanggan` - Buat profil pelanggan (perlu token)
- `GET /api/pelanggan` - Ambil semua pelanggan (perlu token)
- `GET /api/pelanggan/user/:userId` - Ambil profil pelanggan berdasarkan user ID (perlu token)
- `PUT /api/pelanggan/:id` - Update profil pelanggan (perlu token)
- `DELETE /api/pelanggan/:id` - Hapus profil pelanggan (perlu token)

### Penitipan

- `POST /api/penitipan` - Buat penitipan baru (perlu token)
- `GET /api/penitipan` - Ambil semua penitipan (perlu token)
- `GET /api/penitipan/:id` - Ambil penitipan berdasarkan ID (perlu token)
- `GET /api/penitipan/penitip/:penitipId` - Ambil penitipan berdasarkan penitip ID (perlu token)
- `GET /api/penitipan/warung/:warungId` - Ambil penitipan berdasarkan warung ID (perlu token)
- `PUT /api/penitipan/:id` - Update penitipan (perlu token)
- `DELETE /api/penitipan/:id` - Hapus penitipan (perlu token)

### Penjualan

- `POST /api/penjualan` - Catat penjualan baru (perlu token)
- `GET /api/penjualan` - Ambil semua penjualan (perlu token)
- `GET /api/penjualan/:id` - Ambil penjualan berdasarkan ID (perlu token)
- `GET /api/penjualan/warung/:warungId` - Ambil penjualan berdasarkan warung ID (perlu token)
- `PUT /api/penjualan/:id` - Update penjualan (perlu token)
- `DELETE /api/penjualan/:id` - Hapus penjualan (perlu token)

### Transaksi

- `POST /api/transaksi` - Buat transaksi baru (perlu token)
- `GET /api/transaksi` - Ambil semua transaksi (perlu token)
- `GET /api/transaksi/:id` - Ambil transaksi berdasarkan ID (perlu token)
- `PUT /api/transaksi/:id` - Update transaksi (perlu token)
- `PATCH /api/transaksi/:id/status` - Update status transaksi (perlu token)
- `DELETE /api/transaksi/:id` - Hapus transaksi (perlu token)

### Request Barang

- `POST /api/request-barang` - Pelanggan request barang baru (perlu token)
- `GET /api/request-barang` - Ambil request barang (admin semua, pelanggan hanya milik sendiri) (perlu token)
- `GET /api/request-barang/statistik` - Admin lihat statistik request (perlu token)
- `GET /api/request-barang/:id` - Ambil request berdasarkan ID (perlu token)
- `PUT /api/request-barang/:id` - Update request barang (perlu token)
- `PATCH /api/request-barang/:id/status` - Admin update status request (perlu token)
- `DELETE /api/request-barang/:id` - Hapus request barang (perlu token)

### Profile

- `GET /api/profile/profile-status` - Cek status profil user (perlu token)

## Sistem Validasi Profil

**PENTING**: Semua user (kecuali admin) harus melengkapi profil sebelum dapat mengakses menu sesuai hak akses mereka.

### Validasi Berdasarkan Role:
- **Admin**: Tidak perlu validasi profil tambahan
- **Pemasok**: Harus membuat profil penitip di `/api/penitip`
- **Pelanggan**: Harus membuat profil pelanggan di `/api/pelanggan`

### Endpoint yang Memerlukan Profil Lengkap:
- Semua endpoint barang, warung, penitipan, penjualan, transaksi, dan request barang

### Cara Cek Status Profil:
```bash
GET /api/profile/profile-status
Authorization: Bearer <token>
```

Lihat dokumentasi lengkap di [PROFILE_VALIDATION.md](PROFILE_VALIDATION.md)

## Autentikasi

Untuk endpoint yang memerlukan autentikasi, sertakan token JWT di header:

```
Authorization: Bearer <token>
```

## Perubahan dari Sistem Sebelumnya

1. **Tidak ada sistem register** - Admin yang menambahkan user
2. **Login menggunakan nomor telepon** - Bukan email
3. **Role sistem: admin, pemasok, pelanggan** - Disimpan di tabel user
4. **Admin dibuat manual** - Pemasok dan pelanggan dibuat oleh admin
5. **Pemasok = Penitip** - User dengan role pemasok bisa jadi penitip
6. **Pelanggan terikat warung** - Sesuai dengan skema database
7. **Sistem penitipan lengkap** - Dengan tracking barang, penjualan, dan transaksi

## Role dan Akses

### Admin
- Membuat user pemasok dan pelanggan
- Mengelola semua data sistem
- Melihat statistik dan laporan
- Mengelola request barang dari pelanggan

### Pemasok (Penitip)
- Login dengan akun yang dibuat admin
- Membuat profil penitip
- Melihat penitipan sendiri
- Update profil sendiri

### Pelanggan
- Login dengan akun yang dibuat admin
- Membuat profil pelanggan (terikat warung)
- Melihat data warung sendiri
- Request barang ke admin
- Melihat penitipan dan penjualan di warung sendiri
