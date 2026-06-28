# Panduan Penting (Important Documentation) - ICU Project

Dokumen ini berisi hal-hal penting yang harus diperhatikan oleh developer yang memelihara (maintain) proyek ICU (I-See-U).

## 1. Arsitektur Proyek (Component-Based + MVC)

Meskipun logika pemrosesan AI (Tensorflow) dibentuk menggunakan pola MVC klasik (Model-View-Controller) yang ada di folder `src/mvc/`, lapisan antarmuka (User Interface) aplikasi ini telah direfaktor menjadi murni **React Component-Based**.

- **`App.tsx`**: Hanya bertindak sebagai wadah kosong (container).
- **`src/hooks/useWebcamClassifier.ts`**: Menjembatani antara UI dan MVC. Hook ini mengurus inisialisasi AIModel, mengontrol kamera, dan memberikan state ke UI.
- **`src/components/*`**: Kumpulan komponen visual (Header, WebcamScanner, PredictionList) yang masing-masing hanya melakukan SATU tugas spesifik.

Jika Anda ingin mengubah tampilan tabel deteksi, Anda HANYA perlu masuk ke `PredictionList.tsx` tanpa takut merusak fitur kamera atau memori model AI. Inilah keunggulan dari arsitektur modular.

## 2. Kinerja (Performance) Dua Model

Aplikasi ini menjalankan **DUA** model AI secara paralel setiap milidetiknya:
1. `YOLOv8` (Model Kustom untuk akurasi objek spesifik Anda).
2. `COCO-SSD` (Model Umum ringan untuk 80 jenis objek dasar).

> [!WARNING]
> Karena beban kerjanya ganda, frame rate (FPS) pada perangkat yang kurang bertenaga mungkin akan menurun atau terasa *laggy*. 
> Jika terjadi masalah performa kritis, pertimbangkan untuk mengubah interval pendeteksian di `src/mvc/controller.ts` (variabel `FRAME_INTERVAL` diatur ke angka yang lebih tinggi dari 100ms).

## 3. Ambang Batas Akurasi (Confidence Threshold)

Saat ini, threshold (batas persentase minimum) agar objek dimunculkan di layar diatur pada `0.5` (50%) di dalam fungsi `detectObject` (file `src/mvc/model.ts`).

> [!TIP]
> Model *custom* seringkali memiliki rasa "percaya diri" (confidence score) yang lebih rendah dibandingkan model publik yang sudah dilatih miliaran kali. Jika Anda merasa YOLOv8 Anda sering gagal mendeteksi benda padahal bendanya sudah jelas di depan kamera, turunkan angka `0.5` tersebut menjadi `0.25` atau `0.30` pada baris `if (maxScore > 0.5)`.

## 4. Sistem "Pembuang Deteksi Ganda" (Overlap Filter)

Agar kotak COCO-SSD tidak bertumpuk dengan kotak YOLOv8 (misal: dua-duanya mendeteksi laptop), kita memfilter output COCO-SSD secara manual di dalam `src/mvc/model.ts`.
Setiap kali Anda menambah benda baru ke dalam YOLOv8, PASTIKAN benda tersebut masuk ke daftar hitam (blacklist) filter COCO-SSD agar deteksinya tidak tumpang tindih. (Baca `Update-Dataset.MD` untuk info lebih lanjut).
