# 👁️ ICU (I-See-U)

**ICU** adalah aplikasi berbasis web cerdas yang memungkinkan deteksi objek secara *real-time* langsung di browser Anda. Aplikasi ini menggabungkan kekuatan dua model *Computer Vision* (TensorFlow.js) untuk memantau dan mengenali berbagai macam objek secara bersamaan, tanpa perlu mengirim aliran video ke server (100% Client-Side Processing).

---

## 🚀 Fitur Utama

### 📦 Deteksi Objek Ganda (Dual-Model Inference)
Aplikasi ini menjalankan dua model secara paralel untuk cakupan deteksi yang luas namun tetap spesifik:
1. **Custom YOLOv8 Model**: Dilatih khusus menggunakan dataset spesifik untuk mengenali objek kustom pilihan Anda (seperti `laptop` dan `bottle-cup`) dengan akurasi yang lebih tinggi dan presisi batas yang tajam.
2. **COCO-SSD Model**: Model umum ringan yang mengenali 80 kategori objek dasar (orang, ponsel pintar, mobil, dsb).

### ⚖️ Smart Overlap Filter (IoU)
Sistem cerdas **Intersection over Union (IoU)** bekerja sebagai "wasit" ketika kedua model mendeteksi objek di area kotak yang sama. Sistem akan mengevaluasi *confidence score* (persentase keyakinan) dari masing-masing tebakan dan membuang tebakan yang lebih lemah, memastikan tidak ada dua kotak yang tumpang tindih untuk satu benda yang sama.

### 🎯 3-Second Smart Popup (Lock-on)
Aplikasi melacak benda apa yang paling dominan di layar (memiliki persentase paling tinggi). Jika suatu benda berhasil mempertahankan posisi tertingginya selama **3 detik berturut-turut**, sistem akan memunculkan notifikasi/popup konfirmasi elegan yang menyatakan kejelasan benda tersebut.

### 🛠️ UI/UX Modern & Component-Based
- **Modular React Architecture**: Menggunakan pendekatan *Functional Components* dan *Custom Hooks*.
- **Real-time Canvas Overlay**: *Bounding box* yang bersih tergambar langsung mengikuti pergerakan benda.
- **Tailwind CSS**: Antarmuka mode gelap (Dark Mode) yang memanjakan mata bergaya *glassmorphism*.

---

## 🏗️ Struktur Direktori & Penjelasan Kode

Proyek ini telah direfaktor menggunakan arsitektur modern perpaduan antara **MVC (Model-View-Controller)** untuk pemrosesan AI dan **React Component-Based** untuk antarmuka pengguna. Berikut adalah rincian lengkap setiap folder dan file:

### 📂 Root Directory
- **`App.tsx`**: Wadah utama (Container) aplikasi. File ini tidak memiliki logika state yang panjang; ia hanya bertugas menyusun layout halaman menggunakan komponen-komponen visual dari folder `components/`.
- **`types.ts`**: Mendefinisikan kontrak TypeScript (Interfaces) seperti bentuk data objek `Prediction`.
- **`vite.config.ts`**: Konfigurasi bundler Vite. Sudah termasuk plugin *basicSsl* untuk memaksa penggunaan protokol HTTPS di local server (syarat wajib untuk mengakses Webcam).
- **`Importent-Documentation.MD`**: Catatan arsitektur dan peringatan modifikasi threshold model.
- **`Update-Dataset.MD`**: Panduan *step-by-step* untuk mengupdate model YOLOv8 kustom Anda dari Google Colab.

### 📂 `public/model/`
Direktori ini berisi *weights* (otak) dari model YOLOv8 Kustom Anda yang telah dikonversi ke format TFJS (TensorFlow.js).
- `model.json`: Struktur lapisan/grafik *neural network*.
- `group1-shard*.bin`: Pecahan bobot angka biner (weights).
- `metadata.yaml`: Daftar nama class objek yang dilatih (contoh: `laptop`, `bottle-cup`).

### 📂 `src/hooks/`
- **`useWebcamClassifier.ts`**: Jantung aplikasi React. *Custom hook* ini mengisolasi seluruh logika yang berat seperti: inisialisasi AI, siklus hidup React (`useEffect`), mengontrol tombol hidup/mati Webcam, mencatat objek dominan, hingga melacak waktu (timer) 3 detik untuk memunculkan `popupMessage`.

### 📂 `src/components/` (User Interface)
Setiap file di sini adalah fungsi UI spesifik:
- **`Header.tsx`**: Menampilkan judul ICU dan memantau apakah model AI sudah selesai di-load.
- **`WebcamScanner.tsx`**: Mengurus tag HTML `<video>` dan `<canvas>` yang berlapis, beserta tata letak tombol kontrol kamera.
- **`PredictionList.tsx`**: Menerima array objek terdeteksi dan menggambarnya menjadi daftar (list) bar progres animasi di layar sisi kanan.

### 📂 `src/mvc/` (AI Processing Logic)
Memisahkan kerja berat kecerdasan buatan dari siklus UI React:
- **`model.ts` (Model)**: Bertanggung jawab memuat `tf.GraphModel` (YOLO) dan `cocoSsd.ObjectDetection`. File ini menangani perhitungan Tensor, normalisasi piksel (0-255), algoritma IoU, penyaringan *overlapping bounding box*, hingga penerapan ambang batas *confidence* (contoh: > 65%).
- **`view.ts` (View)**: Murni berinteraksi dengan DOM Canvas (`ctx.fillRect`, `ctx.strokeRect`) untuk menggambar kotak-kotak penanda di layar dengan rapi menyesuaikan posisi wajah/benda.
- **`controller.ts` (Controller)**: Menjalankan "Engine Loop" menggunakan `requestAnimationFrame`. Menghubungkan aliran *frame* dari `video`, mempassing-nya ke `model` untuk dideteksi, dan memberikan hasilnya ke `view` untuk digambar, dengan jeda interval (throttling) demi menjaga kestabilan *frame rate* (FPS).

---

## 📦 Panduan Instalasi (Development)

### Prasyarat
- Node.js $\ge$ 20.x
- Browser modern (Chrome/Edge/Firefox) dengan izin akses kamera.

### Cara Menjalankan
```bash
# 1. Install dependensi
npm install

# 2. Jalankan server development
npm run dev
```

### 🌐 Mengakses Aplikasi
Buka browser dan akses URL lokal Anda, biasanya: **`https://localhost:5173`**

> [!IMPORTANT]
> **WAJIB HTTPS:** Browser memblokir akses kamera (`getUserMedia`) pada koneksi HTTP biasa. Aplikasi ini akan memperingatkan browser Anda dengan SSL lokal buatan, cukup klik "Advanced" dan "Proceed to localhost".

---

## 🔒 Privasi & Keamanan
Aplikasi ICU sepenuhnya aman:
1. **Local Processing**: Seluruh proses AI (pemotongan piksel, matriks matematika) terjadi 100% pada *hardware* browser (GPU/CPU lokal) Anda sendiri.
2. **Tanpa Cloud Upload**: Tidak ada bingkai video gambar ruangan atau wajah Anda yang dikirim melalui internet.

## 📄 Lisensi
Distributed under the MIT License.