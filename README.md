# WAD Task Manager - Frontend

Repositori ini berisi antarmuka pengguna (*Frontend*) untuk WAD Task Manager, dibangun menggunakan React.js dan Vite.

## 🚀 Teknologi yang Digunakan
- **React.js (Vite)**: Pustaka frontend untuk membangun *Single Page Application* (SPA).
- **React Router v6**: Menangani *client-side routing* dan *Protected Routes*.
- **Axios**: Klien HTTP dengan *interceptor* kustom untuk menangani token (menyisipkan *Access Token* dan me-refresh token secara otomatis jika terjadi Error 401).
- **Socket.IO Client**: Mendengarkan (*listen*) event WebSocket untuk menampilkan *live update*.
- **CSS Asli (*Vanilla*)**: *Styling* dibangun dari nol dengan menggunakan *Utility Classes* tanpa *framework* eksternal seperti Tailwind atau Bootstrap.

## 🏗️ Arsitektur Proyek
Struktur Frontend dibuat sangat modular:
- **`pages/`**: Komponen wadah (*Container*) untuk rute spesifik (contoh: `Dashboard`, `ProjectDetailPage`).
- **`components/`**: Komponen presentasional yang bodoh dan dapat digunakan ulang (contoh: `TaskCard`, `Navbar`, `TaskForm`).
- **`hooks/`**: *Custom Hooks* (`useTasks`, `useRealTimeProjectTasks`) memisahkan logika pengambilan *state* dan *event listener* dari komponen UI.
- **`services/`**: Pembungkus (*wrapper*) Axios. Komponen tidak memanggil Axios secara langsung, melainkan memanggil layanan (contoh: `projectService.getAll()`).
- **`contexts/`**: Mengelola status aplikasi secara global, termasuk `AuthContext` (Sesi), `NotifContext` (Sistem Toast), dan `SocketContext`.

## ✨ Fitur Utama
1. **Autentikasi & Otorisasi**: Login, Register, sistem *Refresh Token*, dan *Role-Based Access Control* (User vs Admin).
2. **Manajemen Project**: Membuat *Project* dan mengundang anggota tim lainnya berdasarkan Email.
3. **Task Board**: Melihat, menambah, mengubah, dan menghapus *Task* dalam *Project*.
4. **Kolaborasi Real-Time**: 
   - Anda dapat bekerja bersama anggota tim lainnya dalam satu *Project*.
   - Saat kolega Anda membuat/mengubah *Task*, layar Anda akan otomatis ter-update dan memunculkan *Toast* tanpa perlu *Refresh*.

## 📦 Panduan Instalasi
1. Lakukan *Clone* repositori ini, kemudian masuk ke dalam direktori.
2. Instal semua dependensi:
   ```bash
   npm install
   ```
3. Konfigurasikan file lingkungan (buat file `.env` di direktori akar):
   ```env
   VITE_API_URL=http://localhost:5001/api/v1
   ```
4. Jalankan aplikasi dalam mode pengembangan:
   ```bash
   npm run dev
   ```

Aplikasi dapat diakses melalui `http://localhost:5173` (atau *port* yang diberikan Vite).

---
Dikembangkan untuk UAS Web Application Development.
