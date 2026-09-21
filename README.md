# Personal Finance & Expense Tracker App

Aplikasi pencatat keuangan pribadi untuk submission kelas **Belajar Front-End Web Pemula — Dicoding**.

## Identitas

- **Nama:** Dwirizki Adithya Putra
- **Username Dicoding:** dwi_rzkio0c8

## Fitur

- Greeting pengguna sesuai identitas submission.
- Tambah transaksi pemasukan dan pengeluaran.
- Validasi judul dan nominal transaksi.
- Edit transaksi melalui form yang sama.
- Hapus transaksi.
- Ubah tipe transaksi dari pemasukan ↔ pengeluaran.
- Penyimpanan persisten menggunakan `localStorage`.
- Pencarian transaksi secara real-time berdasarkan judul.
- Dashboard dinamis untuk saldo, pemasukan, dan pengeluaran.
- Custom Event `transaction:updated` untuk memperbarui tampilan setelah data berubah.
- Pembuatan kartu transaksi menggunakan `document.createElement()`.
- Responsive layout dengan tema Cream & Blue.
- Tanpa library/framework JavaScript eksternal.

## Struktur

```text
expense-tracker-starter-project/
├── index.html
├── main.js
├── style.css
├── README.md
└── submission-rubric.md
```

## Cara Menjalankan

### VS Code + Live Server

1. Ekstrak ZIP.
2. Buka folder proyek di VS Code.
3. Buka `index.html`.
4. Jalankan menggunakan **Live Server**.
5. Uji tambah, edit, hapus, ubah tipe, pencarian, dan refresh halaman.

### Browser langsung

`index.html` juga dapat dibuka langsung di browser karena aplikasi menggunakan HTML, CSS, dan Vanilla JavaScript tanpa proses build.

## Penyimpanan Data

Transaksi disimpan pada browser menggunakan:

```javascript
localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
```

dan dimuat kembali menggunakan:

```javascript
JSON.parse(localStorage.getItem(STORAGE_KEY));
```

Data tetap tersedia setelah halaman di-refresh selama storage browser belum dihapus.

## Catatan Submission

Jangan mengubah nilai atribut `data-testid` dan `id` yang sudah disediakan pada `index.html`. Kartu transaksi dinamis juga mempertahankan `data-testid` yang dipersyaratkan oleh rubrik.

Seluruh logika aplikasi berada di `main.js`, sedangkan tampilan portofolio dikustomisasi di `style.css`.
