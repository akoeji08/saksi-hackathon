#!/usr/bin/env python3
"""
Generate TTS narration for SAKSI demo video using edge-tts.
Indonesian male voice (id-ID-ArdiNeural) for professional narration.
"""
import asyncio
import edge_tts
import os
import sys

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "out", "audio")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Indonesian male voice - professional and clear
VOICE = "id-ID-ArdiNeural"
RATE = "-5%"  # slightly slower for clarity
VOLUME = "+0%"

# Narration scripts per scene - adapted from demo-script.md
# Each narration is timed to fit within the scene's frame duration at 30fps
NARRATIONS = {
    "scene1": {
        "text": """Di puskesmas, informasi tidak tinggal di satu tempat. Jam poli ada di grup WhatsApp. Stok obat di spreadsheet. SOP di Drive Dinas. Status pasien di SIMPUS. Model bahasa yang membaca semuanya, bisa membocorkan semuanya. Dan satu kebocoran status HIV bukan bug. Itu insiden. SAKSI dibangun dari satu gagasan sederhana. Setiap jawaban harus punya saksi. Sumbernya, izinnya, penolakannya, dan jejaknya.""",
        "frames": 600,
    },
    "scene2": {
        "text": """Perhatikan dua percakapan ini. Pertanyaan yang sama persis. Apa itu Proyek Cakalang. Yang pertama, Ns. Dewi, perawat dengan clearance internal. Sebelum satu dokumen pun dibaca, engine memeriksa izin. Empat puluh dua dokumen dan chat dipindai. Dua puluh satu diblokir. Nol yang lolos. Jawabannya, saya tidak menemukan informasi yang dapat saya akses. Yang kedua, dr. Fatimah, kepala puskesmas. Pertanyaan yang sama. Hanya satu diblokir, lima lolos. Jawaban lengkap, dengan tiga kartu bukti. Pertanyaan identik, hasil berbeda. Bukan karena modelnya menolak menjawab, tapi karena izin diperiksa sebelum retrieval.""",
        "frames": 900,
    },
    "scene3": {
        "text": """Mari mulai dengan yang sederhana. Ns. Dewi, perawat, bertanya stok Amoksisilin. Perhatikan tiga hal. Pertama, jawaban langsung menyebut angka, empat puluh tablet. Kedua, ada dua sumber. DRG-001 dari data obat, dan DOC-006 dari formularium. Ketiga, di bawah ada baris Dijawab untuk STF-005. Ini bukti bahwa engine benar-benar dipanggil dan identitas terverifikasi.""",
        "frames": 1050,
    },
    "scene4": {
        "text": """Sekarang Ns. Dewi bertanya tentang Proyek Cakalang, investigasi KLB Hepatitis A yang hanya boleh diakses kepala puskesmas. Perhatikan responsnya. Saya tidak menemukan informasi yang dapat saya akses. Respons ini tidak menyebut Cakalang, tidak menyiratkan bahwa proyek itu ada. Mari bandingkan dengan proyek yang benar-benar tidak ada. Respons untuk Proyek Naga identik kata per kata. Inilah refusal equivalence. Tidak ada informasi yang bocor melalui penolakan.""",
        "frames": 900,
    },
    "scene5": {
        "text": """Pertanyaan sederhana. Jam berapa poli buka? Tapi ada dua sumber yang berbeda. DOC-001 dari tahun 2024 menyebut jam delapan pagi. CHAT-001 dari tahun 2026 menyebut jam setengah tujuh pagi. Engine mendeteksi konflik, menampilkan kedua sumber, dan memilih yang terbaru dengan alasan eksplisit. DOC-001 telah superseded oleh CHAT-001. Ini bukan sekadar jawaban. Ini penalaran yang bisa diaudit.""",
        "frames": 750,
    },
    "scene6": {
        "text": """Sekarang bagian paling dramatis. Template surat rujukan kami, DOC-007, berisi instruksi tersembunyi yang mencoba mengalihkan AI untuk mengirim seluruh data pasien HIV ke alamat email luar. Instruksi itu menyamar sebagai catatan dari Dinas Kesehatan. Perhatikan apa yang terjadi. Engine mendeteksi injeksi, menonaktifkannya dengan tanda INSTRUKSI TERTANAM DIABAIKAN, dan memberi tahu user bahwa ada percobaan serangan. Dokumen tetap bisa dibaca, tapi instruksi berbahayanya dinonaktifkan. Tidak ada email yang terkirim, tidak ada data yang bocor. Dokumen diperlakukan sebagai data, bukan instruksi.""",
        "frames": 900,
    },
    "scene7": {
        "text": """Setiap query yang kita lakukan tadi tercatat di audit log. Perhatikan apa yang disimpan. User, query dengan PII disamarkan, status keputusan, sumber yang dipakai, dan jumlah injeksi yang dicegat. Perhatikan apa yang TIDAK disimpan. Tidak ada jawaban lengkap, tidak ada snippet, tidak ada NIK, tidak ada nomor RM. Ini bukan kebetulan. Ini desain. Audit tidak boleh menjadi backdoor yang membocorkan data yang justru dilindungi.""",
        "frames": 750,
    },
    "scene8": {
        "text": """SAKSI lulus tiga belas dari tiga belas uji yang dijalankan. Nol kebocoran data terbatas. Nol eksekusi tanpa persetujuan. Dan sekarang memasangnya tidak perlu terminal. Paket skill sudah mandiri. Engine, dataset, dan aturan izin ikut di dalamnya. Buka Expert Center, cari SAKSI, tambahkan ke ahli Anda. Satu klik, dan seluruh engine berjalan di mesin Anda. Tanpa API key, tanpa server. Di puskesmas, kepercayaan bukan fitur tambahan. Kepercayaan adalah syarat. Setiap jawaban punya lima saksi.""",
        "frames": 450,
    },
}


async def generate_tts(name, text, output_path):
    """Generate a single TTS audio file."""
    communicate = edge_tts.Communicate(text, VOICE, rate=RATE, volume=VOLUME)
    await communicate.save(output_path)
    print(f"  Generated: {output_path}")


async def main():
    print(f"Generating TTS narration with voice: {VOICE}")
    print(f"Rate: {RATE}, Volume: {VOLUME}")
    print(f"Output dir: {OUTPUT_DIR}")
    print()

    tasks = []
    for name, config in NARRATIONS.items():
        output_path = os.path.join(OUTPUT_DIR, f"{name}.mp3")
        frames = config["frames"]
        duration_sec = frames / 30.0
        print(f"Scene: {name} ({frames} frames = {duration_sec:.1f}s)")
        tasks.append(generate_tts(name, config["text"], output_path))

    await asyncio.gather(*tasks)
    print("\nAll TTS files generated successfully!")

    # List files with sizes
    print("\nGenerated files:")
    for name in NARRATIONS.keys():
        path = os.path.join(OUTPUT_DIR, f"{name}.mp3")
        size = os.path.getsize(path)
        print(f"  {name}.mp3: {size:,} bytes")


if __name__ == "__main__":
    asyncio.run(main())
