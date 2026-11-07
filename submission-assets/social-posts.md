# Postingan Media Sosial — teks siap tempel

Field form: **Social Media Post Link** — "Publish the project on social media platforms
such as YouTube, X, Threads or others with the hashtags **#WorkBuddy** and
**#TencentCloudHackathon**, and submit the post link."

Yang dinilai bukan panjang postingannya, tapi apakah postingan itu **ada, publik, dan
memuat kedua hashtag**. Jadi ambil jalur terpendek yang tetap terlihat serius.

---

## Ringkasan keputusan

| Platform | Status | Yang di-submit ke form |
|:---|:---|:---|
| **X** | Perlu 1 menit | `https://x.com/<akun>/status/<id>` — **rekomendasi** |
| **Threads** | Perlu 1 menit | `https://www.threads.net/@<akun>/post/<id>` |
| **YouTube** | Sudah tayang | `https://youtu.be/hDWy8_bPozI` — cukup tambah 2 hashtag di deskripsi |

**Rekomendasi:** posting di **X**, lalu submit link postingan itu. Postingan X lebih
meyakinkan sebagai "social media post" dibanding link video YouTube — dan form hanya
menerima satu link.

Kalau ingin aman ganda: perbarui juga deskripsi YouTube (Opsi D), tapi yang ditempel ke
field tetap link X. Link YouTube sudah tercatat di field Demo Video.

---

## Aturan wajib (jangan dilewat)

1. **Kedua hashtag harus ada, ditulis persis:** `#WorkBuddy` dan `#TencentCloudHackathon`.
   Bukan `#workbuddy`, bukan `#TencentCloud`.
2. **Akun harus publik.** Kalau akun X di-protect, juri tidak bisa membuka link-nya.
3. **Jangan pakai link file lokal atau `file://`.** Yang ditempel harus URL yang bisa
   dibuka orang lain: `youtu.be/…` atau `saksi-demo.apps.workbuddy.host/…`.
4. **Jangan mengklaim data nyata.** Dataset fiktif — sebut "data sintetis" kalau
   menyebutnya sama sekali.
5. Setelah posting, **buka link-nya di jendela incognito** sebelum menempel ke form.

---

## Opsi A — X (rekomendasi, satu postingan)

```
Satu pertanyaan. Dua pengguna. Dua jawaban berbeda.

STF-005 → 21 diblokir / 42 dipindai / 0 lolos
STF-001 → 1 diblokir / 42 dipindai / 5 lolos

SAKSI: workplace brain yang periksa izin sebelum menjawab.

youtu.be/hDWy8_bPozI
#WorkBuddy #TencentCloudHackathon
```

**Kenapa ini yang dipilih:** angka 21/42/0 vs 1/42/5 adalah satu-satunya hal di proyek ini
yang bikin orang berhenti scroll — dua baris, kontrasnya langsung kelihatan, dan bisa
dibuktikan sendiri lewat demo. Arsitektur tidak perlu dijelaskan di media sosial.

**Versi Inggris** (kalau ingin menjangkau juri regional/global):

```
Same question. Two users. Two different answers.

STF-005 → 21 blocked / 42 scanned / 0 passed
STF-001 → 1 blocked / 42 scanned / 5 passed

SAKSI: a workplace brain that checks permission before it answers.

youtu.be/hDWy8_bPozI
#WorkBuddy #TencentCloudHackathon
```

**Cara posting:** buka `https://x.com/compose/post`, tempel, kirim. Lalu klik postingannya
→ salin URL dari address bar (`https://x.com/<akun>/status/<angka>`). Itu yang di-submit.

---

## Opsi B — Threads

```
Kebocoran di puskesmas bukan bug, tapi insiden.

SAKSI: workplace brain untuk Puskesmas Tamalanrea Jaya. Sebelum menjawab, dia periksa izin. Tiap klaim ditempeli sumber. Kalau akses ditolak, kalimatnya sama persis seperti kalau datanya tidak ada — membedakan keduanya sudah cukup untuk membocorkan.

Pertanyaan identik, dua pengguna:
STF-005 → 21 diblokir / 42 dipindai / 0 lolos
STF-001 → 1 diblokir / 42 dipindai / 5 lolos

Demo: youtu.be/hDWy8_bPozI
#WorkBuddy #TencentCloudHackathon
```

Batas Threads **500 karakter** per postingan. Teks di atas 486 karakter — masih di bawah
batas, tapi jangan ditambahi lagi.

---

## Opsi C — LinkedIn (paling "korporat", sekalian untuk portofolio)

```
Satu pertanyaan. Dua petugas. Dua jawaban berbeda — dan itu memang tujuannya.

Saya membuat SAKSI untuk Tencent Cloud AI CAN DO IT Hackathon Indonesia 2026, Challenge A: The Workplace Brain.

Masalahnya nyata: di puskesmas, informasi tersebar di 20 dokumen, 22 percakapan, dan 15 daftar obat. Asisten AI biasa akan menjawab semuanya untuk semua orang. Itu bukan fitur, itu insiden menunggu waktu.

SAKSI memeriksa izin sebelum menjawab, menempelkan sumber pada setiap klaim, dan menolak dengan kalimat yang identik baik data itu tidak ada maupun aksesnya ditolak — karena membedakan keduanya sudah cukup untuk membocorkan keberadaan data.

Hasilnya bisa diaudit dari luar, dari engine yang sama:
STF-005 → 21 diblokir / 42 dipindai / 0 lolos
STF-001 → 1 diblokir / 42 dipindai / 5 lolos

Demo 5 menit: https://youtu.be/hDWy8_bPozI
Coba langsung: https://saksi-demo.apps.workbuddy.host/?sharecode=WGMP2W2QLO
Kode sumber: https://github.com/akoeji08/saksi-hackathon

#WorkBuddy #TencentCloudHackathon
```

---

## Opsi D — YouTube (paling cepat: 2 menit, tanpa akun baru)

Video sudah tayang, jadi tidak perlu upload apa pun. Cukup sisipkan hashtag di deskripsi.

1. Buka `https://studio.youtube.com` → video SAKSI → **Details**
2. Di akhir deskripsi, tambahkan satu baris:

   ```
   #WorkBuddy #TencentCloudHackathon
   ```

3. **Save**. Tunggu ±1 menit sampai YouTube memproses.
4. Buka `https://youtu.be/hDWy8_bPozI` di incognito → pastikan kedua hashtag terlihat
   (YouTube menampilkan maksimal 3 hashtag di atas judul).
5. Submit `https://youtu.be/hDWy8_bPozI` sebagai Social Media Post Link.

Ini sah menurut bunyi field-nya ("such as YouTube, X, Threads or others"), tapi paling
lemah secara kesan — tidak ada teks yang menjelaskan proyeknya. Pakai ini hanya kalau
tidak mau membuat postingan baru.

---

## Checklist sebelum menempel link ke form

- [ ] Postingan sudah **terkirim**, bukan tersimpan sebagai draft
- [ ] `#WorkBuddy` ada
- [ ] `#TencentCloudHackathon` ada (ejaan lengkap, tanpa spasi)
- [ ] Link video atau demo ikut di dalam postingan
- [ ] Akun publik — cek di incognito, bukan di browser yang sudah login
- [ ] URL postingan tersalin utuh (`https://x.com/.../status/123...`)
- [ ] Tidak ada klaim data nyata di dalam teks
