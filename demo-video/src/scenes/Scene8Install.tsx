import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { COLORS, FONT_FAMILY, MONO_FAMILY } from "../utils";

/**
 * Scene 8 — Pasang & Penutup
 *
 * Perubahan terbesar dari versi sebelumnya: onboarding tidak lagi lewat terminal.
 * Paket skill kini mandiri (engine + data + aturan izin ikut di dalamnya), jadi
 * memasangnya cukup satu klik dari Expert Center.
 */
export const Scene8Install: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();
  // Animasi ditulis untuk 1110 frame; skala ini membuatnya meregang mulus
  // bila durasi audio berubah, tanpa menyunting tiap timing.
  const frame = useCurrentFrame() * (1110 / durationInFrames);

  const exitOpacity = interpolate(frame, [1070, 1110], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ---------- Part 1: hasil uji (0–250) ----------
  const resultsIn = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const resultsOut = interpolate(frame, [240, 285], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const metrics = [
    { v: "13", l: "uji lulus", c: COLORS.accent },
    { v: "0", l: "gagal", c: COLORS.red },
    { v: "0", l: "kebocoran", c: COLORS.green },
    { v: "0", l: "eksekusi tanpa izin", c: COLORS.green },
  ];

  // ---------- Part 2: expert card (280–760) ----------
  const cardIn = spring({ frame, fps, delay: 290, config: { damping: 18, stiffness: 90 } });
  const cardOut = interpolate(frame, [720, 770], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const press = spring({ frame, fps, delay: 545, config: { damping: 12, stiffness: 200 } });
  const installed = spring({ frame, fps, delay: 590, config: { damping: 14, stiffness: 110 } });

  // ---------- Part 3: klaim (780–880) ----------
  const chipsIn = interpolate(frame, [770, 810], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ---------- Part 4: penutup (880–1110) ----------
  const closeIn = spring({ frame, fps, delay: 890, config: { damping: 20, stiffness: 80 } });
  const closeOpacity = interpolate(closeIn, [0, 1], [0, 1]);
  const closeScale = interpolate(closeIn, [0, 1], [0.96, 1]);

  return (
    <AbsoluteFill style={{ opacity: exitOpacity, fontFamily: FONT_FAMILY }}>
      {/* ================= PART 1: HASIL UJI ================= */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: resultsIn * resultsOut,
        }}
      >
        <p
          style={{
            color: COLORS.gray,
            fontFamily: MONO_FAMILY,
            fontSize: 15,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            margin: "0 0 20px 0",
          }}
        >
          Hasil uji
        </p>
        <h2 style={{ color: COLORS.white, fontSize: 56, fontWeight: 700, margin: "0 0 48px 0", letterSpacing: "-1.5px" }}>
          13 lulus. <span style={{ color: COLORS.red }}>0 gagal.</span>
        </h2>
        <div style={{ display: "flex", gap: 22 }}>
          {metrics.map((m, i) => {
            const o = interpolate(frame, [40 + i * 14, 66 + i * 14], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const y = interpolate(frame, [40 + i * 14, 76 + i * 14], [16, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <div
                key={i}
                style={{
                  opacity: o,
                  transform: `translateY(${y}px)`,
                  width: 210,
                  padding: "24px 16px",
                  borderRadius: 12,
                  background: "rgba(15, 43, 70, 0.5)",
                  border: `1px solid ${COLORS.panelLight}`,
                  textAlign: "center",
                }}
              >
                <div style={{ color: m.c, fontSize: 52, fontWeight: 800, lineHeight: 1.05 }}>{m.v}</div>
                <div style={{ color: COLORS.gray, fontSize: 14, marginTop: 8 }}>{m.l}</div>
              </div>
            );
          })}
        </div>
        <p style={{ color: COLORS.grayDark, fontSize: 16, marginTop: 40, maxWidth: 900, textAlign: "center", lineHeight: 1.6 }}>
          Seven kasus backlog ditandai <span style={{ color: COLORS.yellow }}>belum diuji</span> — bukan diklaim lulus.
        </p>
      </div>

      {/* ================= PART 2: EXPERT CARD ================= */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 64,
          opacity: cardIn * cardOut,
          transform: `scale(${interpolate(cardIn, [0, 1], [0.97, 1])})`,
        }}
      >
        {/* kiri: penjelasan */}
        <div style={{ width: 620 }}>
          <p
            style={{
              color: COLORS.accent,
              fontFamily: MONO_FAMILY,
              fontSize: 14,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              margin: "0 0 18px 0",
            }}
          >
            Cara memasang
          </p>
          <h2 style={{ color: COLORS.white, fontSize: 50, fontWeight: 700, margin: "0 0 22px 0", letterSpacing: "-1.4px", lineHeight: 1.15 }}>
            Satu klik.
            <br />
            <span style={{ color: COLORS.accent }}>Tanpa terminal.</span>
          </h2>
          <p style={{ color: COLORS.gray, fontSize: 21, lineHeight: 1.7, margin: "0 0 30px 0" }}>
            Paket skill kini mandiri — engine, dataset, dan aturan izin ikut di dalamnya.
            Tidak ada path absolut yang harus disunting.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, opacity: chipsIn }}>
            {[
              { icon: "✓", text: "Tanpa clone repo" },
              { icon: "✓", text: "Tanpa API key" },
              { icon: "✓", text: "Tanpa server" },
            ].map((c, i) => {
              const o = interpolate(frame, [800 + i * 14, 826 + i * 14], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, opacity: o }}>
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 7,
                      background: "rgba(34, 197, 94, 0.14)",
                      border: "1px solid rgba(34, 197, 94, 0.4)",
                      color: COLORS.green,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                  >
                    {c.icon}
                  </span>
                  <span style={{ color: COLORS.white, fontSize: 19 }}>{c.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* kanan: kartu expert */}
        <div
          style={{
            width: 520,
            padding: "28px 30px",
            borderRadius: 16,
            background: "linear-gradient(170deg, #101a2a, #0a1220)",
            border: `1px solid ${COLORS.panelLight}`,
            boxShadow: "0 30px 80px rgba(0, 0, 0, 0.55)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <svg width="58" height="58" viewBox="0 0 24 24" fill="none">
              <rect x="0" y="0" width="24" height="24" rx="5" fill="#0a1522" />
              <path
                d="M12 4.2 6.4 6.6v4.6c0 3.4 2.4 6.1 5.6 7.1 3.2-1 5.6-3.7 5.6-7.1V6.6L12 4.2Z"
                stroke={COLORS.accent}
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
              <path d="m9.7 11.6 1.6 1.6 3-3.2" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <div style={{ color: COLORS.white, fontSize: 24, fontWeight: 700, letterSpacing: "-0.4px" }}>
                SAKSI
              </div>
              <div style={{ color: COLORS.gray, fontSize: 13, marginTop: 2 }}>
                Evidence-to-Decision Engine
              </div>
            </div>
          </div>

          <p style={{ color: COLORS.gray, fontSize: 14, lineHeight: 1.65, margin: "0 0 18px 0" }}>
            Workplace brain berizin, bersumber, dan berjejak audit untuk Puskesmas
            Tamalanrea Jaya. Menolak saat Anda tidak berhak — dan mencatat setiap pertanyaan
            tanpa menyimpan isinya.
          </p>

          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 22 }}>
            {["Akses & Izin", "Bukti & Sitasi", "Audit & Privasi"].map((t) => (
              <span
                key={t}
                style={{
                  fontSize: 11,
                  color: COLORS.gray,
                  border: `1px solid ${COLORS.panelLight}`,
                  background: "rgba(255,255,255,0.03)",
                  padding: "4px 10px",
                  borderRadius: 5,
                }}
              >
                {t}
              </span>
            ))}
          </div>

          {/* tombol */}
          <div
            style={{
              position: "relative",
              height: 56,
              borderRadius: 10,
              background:
                installed > 0.4
                  ? "linear-gradient(135deg, #16a34a, #22c55e)"
                  : "linear-gradient(135deg, #00d4ff, #0099cc)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${interpolate(press, [0, 0.5, 1], [1, 0.96, 1])})`,
              boxShadow:
                installed > 0.4
                  ? "0 8px 28px rgba(34,197,94,0.35)"
                  : "0 8px 28px rgba(0,212,255,0.3)",
            }}
          >
            <span style={{ color: installed > 0.4 ? "#04140a" : COLORS.bg, fontSize: 17, fontWeight: 700 }}>
              {installed > 0.4 ? "✓  Ditambahkan ke Ahli Saya" : "Tambahkan ke Ahli Saya"}
            </span>
            {installed <= 0.4 && (
              <span
                style={{
                  position: "absolute",
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  border: "2px solid rgba(5, 11, 20, 0.55)",
                  opacity: interpolate(frame, [520, 560, 600], [0, 0.9, 0], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                  transform: `scale(${interpolate(frame, [520, 600], [0.4, 1.6], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  })})`,
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* ================= PART 4: PENUTUP ================= */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: closeOpacity,
          transform: `scale(${closeScale})`,
        }}
      >
        <h1
          style={{
            color: COLORS.white,
            fontSize: 68,
            fontWeight: 700,
            margin: "0 0 26px 0",
            letterSpacing: "-2px",
            textAlign: "center",
            lineHeight: 1.15,
          }}
        >
          Setiap jawaban punya
          <br />
          <span style={{ color: COLORS.accent }}>lima saksi.</span>
        </h1>

        <p style={{ color: COLORS.gray, fontSize: 21, margin: "0 0 44px 0", textAlign: "center", maxWidth: 860, lineHeight: 1.6 }}>
          Di puskesmas, kepercayaan bukan fitur tambahan. Kepercayaan adalah syarat.
        </p>

        <div style={{ display: "flex", gap: 14 }}>
          {[
            { k: "Live demo", v: "saksi-demo.apps.workbuddy.host" },
            { k: "Kode", v: "github.com/akoeji08/saksi-hackathon" },
          ].map((l) => (
            <div
              key={l.k}
              style={{
                padding: "12px 22px",
                borderRadius: 9,
                background: "rgba(15, 43, 70, 0.55)",
                border: `1px solid ${COLORS.panelLight}`,
              }}
            >
              <div
                style={{
                  color: COLORS.grayDark,
                  fontFamily: MONO_FAMILY,
                  fontSize: 10,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                {l.k}
              </div>
              <div style={{ color: COLORS.accent, fontFamily: MONO_FAMILY, fontSize: 15 }}>{l.v}</div>
            </div>
          ))}
        </div>

        <p
          style={{
            color: COLORS.grayDark,
            fontFamily: MONO_FAMILY,
            fontSize: 13,
            letterSpacing: "0.16em",
            marginTop: 46,
            textTransform: "uppercase",
          }}
        >
          Tencent Cloud Hackathon Indonesia 2026 · Challenge A
        </p>
      </div>
    </AbsoluteFill>
  );
};
