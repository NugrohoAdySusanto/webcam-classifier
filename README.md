# 👁️ AI Vision Classifier

**AI Vision Classifier** adalah aplikasi berbasis web yang memungkinkan deteksi objek dan ekspresi wajah secara *real-time* langsung di browser. Aplikasi ini mengimplementasikan teknologi *Computer Vision* menggunakan TensorFlow.js, memberikan pengalaman deteksi instan tanpa perlu mengirim data video ke server (100% Client-Side Processing).

---

## 🚀 Fitur Utama

### 📦 Deteksi Objek (Object Detection)
Menggunakan model **COCO-SSD** (Common Objects in Context - Single Shot MultiBox Detector) untuk mengenali hingga 90 kategori objek umum (contoh: orang, laptop, kursi, ponsel, dll).

### 😊 Deteksi Emosi (Emotion Recognition)
Menggunakan **face-api.js** untuk mendeteksi wajah dan mengklasifikasikan ekspresi emosi menjadi 7 kategori:
- Happy, Sad, Angry, Surprised, Fearful, Disgusted, Neutral.

### 🎯 Stable Detection (Lock-on)
Fitur cerdas untuk menghindari *flickering* prediksi. Sistem akan melakukan "locking" jika satu objek atau emosi terdeteksi secara konsisten selama **≥ 3 detik**, kemudian menampilkan modal hasil scan yang stabil.

### 🛠️ UI/UX Modern
- **Real-time Canvas Overlay**: Bounding box dan label kepercayaan (%) digambar tepat di atas aliran video.
- **Mode Switching**: Perpindahan instan antara mode Objek dan Emosi.
- **Dark Theme**: Interface elegan menggunakan Tailwind CSS.
- **Responsive Design**: Optimal untuk berbagai ukuran layar.

---

## 🏗️ Arsitektur Sistem

Aplikasi ini mengadopsi pola desain **MVC (Model-View-Controller)** untuk memisahkan logika AI, rendering, dan manajemen state.

### Komponen MVC
| Komponen | File | Tanggung Jawab |
|-----------|------|----------------|
| **Model** | `src/mvc/model.ts` | Inisialisasi TensorFlow.js, memuat model COCO-SSD & face-api dari CDN, serta menjalankan fungsi inferensi AI. |
| **View** | `src/mvc/view.ts` | Manipulasi DOM Canvas, menggambar bounding box, dan menampilkan teks label prediksi. |
| **Controller** | `src/mvc/controller.ts` | Mengelola loop deteksi (`requestAnimationFrame`), throttling frame (100ms), manajemen mode, dan logika stable detection. |

### Alur Kerja Data (Data Flow)
`Webcam Stream` $\rightarrow$ `Controller` $\rightarrow$ `Model (Inference)` $\rightarrow$ `Controller (Stable Check)` $\rightarrow$ `View (Render Overlay)` $\rightarrow$ `UI (State Update)`

> [!WARNING]
> **Peringatan Struktur:** Terdapat file `controller.ts`, `model.ts`, dan `view.ts` di root folder `src/`. File-file tersebut adalah versi *legacy*. Implementasi terbaru yang aktif berada di dalam folder `src/mvc/`.

---

## 🛠️ Tech Stack

### Core
- **React 18**: UI Library.
- **TypeScript**: Type-safe development.
- **Vite**: Build tool & dev server ultra-cepat.

### AI & ML
- **TensorFlow.js**: ML runtime untuk browser.
- **COCO-SSD**: Model deteksi objek.
- **face-api.js**: Model deteksi wajah dan ekspresi.

### Styling & Icons
- **Tailwind CSS**: Utility-first CSS framework.
- **Lucide React**: Set ikon minimalis.

---

## 📦 Panduan Instalasi & Penggunaan

### Prasyarat
- Node.js $\ge$ 20.x
- Docker & Docker Compose (Opsional)
- Browser modern (Chrome/Edge/Firefox) dengan izin akses kamera.

### Opsi 1: Menggunakan Docker (Sangat Direkomendasikan)
Cara tercepat untuk menjalankan aplikasi tanpa konfigurasi lokal:

```bash
# Masuk ke direktori project
cd projects/webcam-classifier

# Build dan jalankan container
docker compose up -d --build
```

### Opsi 2: Instalasi Manual (Development)

```bash
# Install dependensi
npm install

# Jalankan server development
npm run dev
```

### 🌐 Mengakses Aplikasi
Buka browser dan akses: **`https://localhost:5173`**

> [!IMPORTANT]
> **WAJIB HTTPS:** Browser memblokir akses kamera (`getUserMedia`) pada koneksi HTTP biasa. Aplikasi ini sudah menyertakan `@vitejs/plugin-basic-ssl` untuk menyediakan sertifikat SSL lokal secara otomatis.

---

## ⚙️ Konfigurasi Teknis

### Pengaturan Server (`vite.config.ts`)
Sertifikat SSL diaktifkan melalui plugin `basicSsl()` dan host diatur ke `0.0.0.0` agar dapat diakses dari luar container Docker.

### Manajemen Memori & Performa
- **Throttling**: Controller membatasi deteksi setiap 100ms untuk mencegah *memory leak* dan menjaga performa CPU/GPU.
- **Model Loading**: Model dimuat secara asinkron dari CDN jsdelivr untuk memperkecil ukuran bundle awal.

---

## 🔒 Privasi & Keamanan
Aplikasi ini menjunjung tinggi privasi pengguna:
1. **Local Processing**: Seluruh proses deteksi gambar dilakukan di dalam browser pengguna.
2. **No Data Upload**: Tidak ada frame video atau data gambar yang dikirim ke server mana pun.
3. **Transparent Access**: Izin kamera diminta secara eksplisit oleh browser.

## 📄 Lisensi
Distributed under the MIT License.