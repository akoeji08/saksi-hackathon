/* ============================================================
   SAKSI — site interactions
   nav · scroll story · tabs · pipeline · reveal
   ============================================================ */
(function () {
  "use strict";

  /* ---------------------------------------------------------
     NAV
     --------------------------------------------------------- */
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  const navWrap = document.querySelector(".nav-wrap");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    navLinks.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const onScrollNav = () => {
    if (!navWrap) return;
    navWrap.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  window.addEventListener("scroll", onScrollNav, { passive: true });
  onScrollNav();

  /* ---------------------------------------------------------
     SCROLL STORY 01—04
     --------------------------------------------------------- */
  const story = document.getElementById("pengalaman");
  const track = document.getElementById("storyTrack");
  const bar = document.getElementById("storyBar");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isNarrow = () => window.matchMedia("(max-width: 860px)").matches;

  let storyMax = 0;

  function measureStory() {
    if (!track) return;
    storyMax = Math.max(0, track.scrollWidth - window.innerWidth);
  }

  function updateStory() {
    if (!story || !track || !bar) return;
    if (reduceMotion || isNarrow()) {
      track.style.transform = "";
      bar.style.width = "0%";
      return;
    }

    const rect = story.getBoundingClientRect();
    const vh = window.innerHeight;
    const total = story.offsetHeight - vh;
    const travelled = -rect.top;
    const p = total > 0 ? Math.max(0, Math.min(1, travelled / total)) : 0;

    track.style.transform = `translate3d(${-p * storyMax}px, 0, 0)`;
    bar.style.width = (p * 100).toFixed(2) + "%";
  }

  let rafPending = false;
  function onStoryScroll() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      updateStory();
      rafPending = false;
    });
  }

  if (story && track) {
    measureStory();
    updateStory();
    window.addEventListener("scroll", onStoryScroll, { passive: true });
    window.addEventListener("resize", () => {
      measureStory();
      updateStory();
    });
  }

  /* ---------------------------------------------------------
     TABS — skenario
     --------------------------------------------------------- */
  const tabs = Array.from(document.querySelectorAll(".tab"));
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const id = tab.dataset.tab;
      tabs.forEach((t) => {
        const on = t === tab;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", String(on));
      });
      document.querySelectorAll(".tab-panel").forEach((p) => {
        p.classList.toggle("is-active", p.id === id);
      });
    });
  });

  /* ---------------------------------------------------------
     PIPELINE
     --------------------------------------------------------- */
  const PIPE = [
    {
      n: "01", name: "User Resolver", tag: "identitas",
      what: "Membaca identitas pemanggil dari berkas lokal, lalu memuat profil, clearance, dan grupnya. Tidak ada satu byte pun yang diambil dari teks pertanyaan.",
      in: "BRAIN_USER · current-user.json",
      out: "profil user + clearance + groups",
      fail: "user tidak dikenal → berhenti tanpa menyebut data apa pun",
    },
    {
      n: "02", name: "Permission Gate", tag: "gate", gate: true,
      what: "Setiap dokumen dan pesan chat dievaluasi terhadap ACL pemanggil sebelum menyentuh retrieval. Yang gagal dibuang di sini — tidak pernah menjadi kandidat.",
      in: "profil user + seluruh kandidat",
      out: "subset yang lolos ACL",
      fail: "0 lolos → refusal equivalence, retrieval dilewati total",
    },
    {
      n: "03", name: "Retrieval", tag: "baca",
      what: "Hanya subset yang lolos yang dicari. Karena gerbang sudah berjalan lebih dulu, dokumen terlarang tidak pernah masuk ke konteks model.",
      in: "query + subset terizinkan",
      out: "kandidat dokumen",
      fail: "0 kandidat → jawaban menjadi penolakan",
    },
    {
      n: "04", name: "Scoring v2", tag: "skor",
      what: "Kandidat diberi skor memakai kata kunci kritis dan kecocokan prefiks, sehingga entri spesifik (misalnya Amoksisilin 500mg) mengalahkan entri umum.",
      in: "kandidat dokumen",
      out: "skor + urutan",
      fail: "skor di bawah ambang → kandidat dibuang",
    },
    {
      n: "05", name: "Quality Gate", tag: "gate", gate: true,
      what: "Menentukan apakah bukti cukup kuat untuk menjawab. Ini titik di mana SAKSI memilih diam daripada menebak.",
      in: "kandidat berskor",
      out: "TERVERIFIKASI atau BUKTI_BELUM_CUKUP",
      fail: "bukti kurang → refusal, bukan jawaban setengah",
    },
    {
      n: "06", name: "Conflict Detector", tag: "periksa",
      what: "Mendeteksi sumber yang saling bertentangan, lalu memilih berdasarkan kebaruan dan menandai yang lama sebagai superseded — beserta alasannya.",
      in: "sumber terpilih",
      out: "status KONFLIK + sumber pemenang + alasan",
      fail: "konflik tak terputuskan → ditandai, tidak dirata-ratakan",
    },
    {
      n: "07", name: "Injection Sanitizer", tag: "periksa",
      what: "Memindai instruksi tertanam di dalam dokumen, membuangnya, dan memberi tahu pengguna bahwa ada upaya penyisipan. Dokumen yang sah tetap dipakai.",
      in: "isi dokumen",
      out: "konten bersih + flag injection_detected",
      fail: "instruksi dibuang, pengguna diberi peringatan eksplisit",
    },
    {
      n: "08", name: "PII Masking", tag: "samar",
      what: "Menyamarkan nama, NIK, nomor rekam medis, dan nomor telepon sebelum teks keluar — termasuk pada query yang akan ditulis ke audit.",
      in: "teks jawaban + query",
      out: "teks dengan penanda [MASKED-*]",
      fail: "pola tak dikenali → disamarkan konservatif",
    },
    {
      n: "09", name: "Answer Composer", tag: "susun",
      what: "Menyusun jawaban akhir beserta kartu bukti dan penanda Dijawab untuk. Tanpa sumber yang lolos, tidak ada jawaban yang disusun.",
      in: "status + sumber + teks bersih",
      out: "jawaban + kartu bukti + identitas penanya",
      fail: "tanpa sumber → tidak menyusun jawaban sama sekali",
    },
    {
      n: "10", name: "Audit Ledger", tag: "gate", gate: true,
      what: "Menulis satu baris audit: waktu, ID, query tersamar, keputusan, dan daftar ID sumber. Isi jawaban tidak pernah disimpan.",
      in: "query, user, keputusan, IDs",
      out: "satu baris audit.jsonl (metadata saja)",
      fail: "audit gagal ditulis → jawaban tidak dikembalikan",
    },
  ];

  const pipeList = document.getElementById("pipeList");
  const pdIdx = document.getElementById("pdIdx");
  const pdTitle = document.getElementById("pdTitle");
  const pdWhat = document.getElementById("pdWhat");
  const pdIn = document.getElementById("pdIn");
  const pdOut = document.getElementById("pdOut");
  const pdFail = document.getElementById("pdFail");

  function renderPipe(i) {
    const s = PIPE[i];
    if (!s) return;
    pdIdx.textContent = s.n;
    pdTitle.textContent = s.name;
    pdWhat.textContent = s.what;
    pdIn.textContent = s.in;
    pdOut.textContent = s.out;
    pdFail.textContent = s.fail;

    Array.from(pipeList.children).forEach((li, k) => {
      li.classList.toggle("is-active", k === i);
    });
  }

  if (pipeList) {
    pipeList.innerHTML = PIPE.map(
      (s, i) => `
      <li>
        <button class="pipe-item${s.gate ? " is-gate" : ""}${i === 0 ? " is-active" : ""}"
                type="button" data-i="${i}">
          <span class="pi-n">${s.n}</span>
          <span class="pi-name">${s.name}</span>
          <span class="pi-tag">${s.tag}</span>
        </button>
      </li>`
    ).join("");

    pipeList.addEventListener("click", (e) => {
      const btn = e.target.closest(".pipe-item");
      if (!btn) return;
      renderPipe(Number(btn.dataset.i));
    });

    renderPipe(0);
  }

  /* ---------------------------------------------------------
     SCROLL REVEAL (subtle, safe)
     --------------------------------------------------------- */
  if (!reduceMotion && "IntersectionObserver" in window) {
    const targets = document.querySelectorAll(
      ".sec-head, .problem, .saksi, .bound, .metric, .step, .status-card, .critical, .honest"
    );
    targets.forEach((t) => {
      t.style.opacity = "0";
      t.style.transform = "translateY(14px)";
      t.style.transition = "opacity .55s cubic-bezier(.2,.8,.3,1), transform .55s cubic-bezier(.2,.8,.3,1)";
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.style.opacity = "1";
          entry.target.style.transform = "none";
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    targets.forEach((t) => io.observe(t));
  }
})();
