# Panduan Mengupdate Custom Dataset Model

Dokumen ini berisi langkah-langkah apabila Anda telah melatih objek baru (misalnya mendeteksi "kucing", "sepatu", dll) di Google Colab menggunakan Roboflow dan Ultralytics YOLO, dan ingin memasukkannya ke dalam proyek ICU ini.

## Langkah 1: Eksport & Timpa File di `/public/model`

Setelah menjalankan kode *training* dan *export* (format tfjs) di Google Colab:
1. Jalankan perintah zip di Colab: `!zip -r train.zip /content/runs/detect/train/weights/best_web_model/`
2. Download file `train.zip` ke komputer Anda.
3. Ekstrak file zip tersebut. Anda akan menemukan file-file seperti `model.json`, `metadata.yaml`, dan kumpulan file `.bin`.
4. Copy **seluruh** file tersebut dan timpa (Replace) file-file lama yang ada di dalam folder `public/model/` di proyek ICU ini.

## Langkah 2: Daftarkan Class Objek Anda (PENTING!)

Buka file **`src/mvc/model.ts`** di proyek ini, dan cari baris paling atas yang mendefinisikan `YOLO_CLASSES`.

Update array tersebut agar urutannya **sama persis** dengan yang tercantum di dalam file `metadata.yaml` yang baru saja Anda download.
Misalnya Anda menambahkan "kucing":
```typescript
const YOLO_CLASSES = [
  "bottle-cup", "laptop", "kucing"
];
```

## Langkah 3: Matikan Deteksi Ganda di COCO-SSD (PENTING!)

Karena proyek ini juga menggunakan model umum (`coco-ssd`), model umum tersebut mungkin juga akan mendeteksi kucing. Ini akan menyebabkan muncul dua kotak (satu dari YOLO Anda, satu dari COCO).

Untuk menanganinya, kita harus melarang model COCO-SSD memunculkan objek tersebut.
Masih di file **`src/mvc/model.ts`**, gulir ke bawah pada fungsi `detectObject`, cari blok kode ini:
```typescript
      // Filter out overlapping general classes that our YOLOv8 custom model handles better
      const filteredCoco = cocoPredictions.filter(
        p => !['laptop', 'bottle', 'cup'].includes(p.class)
      );
```
Tambahkan bahasa inggris (standar COCO) dari objek baru Anda ke dalam array filter tersebut. Misalnya `"cat"`:
```typescript
      const filteredCoco = cocoPredictions.filter(
        p => !['laptop', 'bottle', 'cup', 'cat'].includes(p.class)
      );
```

## Selesai!

Jalankan `npm run dev` dan buka kembali browser Anda. Model custom Anda sekarang berhasil diperbarui tanpa berbenturan dengan model pendeteksi umumnya!
