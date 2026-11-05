import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { COLORS, FONT_FAMILY, MONO_FAMILY } from "../utils";

/**
 * Scene 1 — Hook
 *
 * Tiga gerakan:
 *   1. informasi tersebar di empat tempat
 *   2. keempatnya ditarik ke satu model, lalu berubah menjadi peringatan bocor
 *   3. tesis: setiap jawaban punya lima saksi
 */
export const Scene1Hook: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();
  // Animasi ditulis untuk 1050 frame; skala ini membuatnya meregang mulus
  // bila durasi audio berubah, tanpa menyunting tiap timing.
  const frame = useCurrentFrame() * (1050 / durationInFrames);

  const exitOpacity = interpolate(frame, [1010, 1050], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ---------- Phase A: sumber tersebar (0–250) ----------
  const sources = [
    { tag: "WA", name: "Grup WhatsApp", detail: "jam poli, kabar lapangan" },
    { tag: "XL", name: "Spreadsheet", detail: "stok obat, anggaran" },
    { tag: "DR", name: "Drive Dinas", detail: "SOP, edaran, formularium" },
    { tag: "RM", name: "SIMPUS", detail: "status pasien, rekam medis" },
  ];

  const phaseA = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const phaseAOut = interpolate(frame, [250, 300], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ---------- Phase B: ditarik ke satu model (300–560) ----------
  const converge = interpolate(frame, [300, 400], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (t) => t * t * (3 - 2 * t),
  });
  const phaseBIn = interpolate(frame, [290, 330], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const phaseBOut = interpolate(frame, [540, 590], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dangerGlow = interpolate(frame, [400, 470, 520], [0, 1, 0.55], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ---------- Phase C: bukan bug, insiden (560–760) ----------
  const phaseCIn = interpolate(frame, [570, 620], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const phaseCOut = interpolate(frame, [740, 790], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const strike = interpolate(frame, [640, 700], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ---------- Phase D: tesis (780–1050) ----------
  const thesisSpring = spring({ frame, fps, delay: 790, config: { damping: 18, stiffness: 90 } });
  const thesisOpacity = interpolate(thesisSpring, [0, 1], [0, 1]);
  const thesisScale = interpolate(thesisSpring, [0, 1], [0.94, 1]);

  const letters = [
    { letter: "S", word: "Sumber" },
    { letter: "A", word: "Akses" },
    { letter: "K", word: "Konfirmasi" },
    { letter: "S", word: "Sadar Batas" },
    { letter: "I", word: "Integritas" },
  ];

  return (
    <AbsoluteFill style={{ opacity: exitOpacity, fontFamily: FONT_FAMILY }}>
      {/* ================= PHASE A ================= */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: phaseA * phaseAOut,
        }}
      >
        <p
          style={{
            color: COLORS.gray,
            fontSize: 22,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            margin: "0 0 18px 0",
            fontFamily: MONO_FAMILY,
          }}
        >
          Puskesmas Tamalanrea Jaya
        </p>
        <h2
          style={{
            color: COLORS.white,
            fontSize: 58,
            fontWeight: 700,
            margin: "0 0 56px 0",
            letterSpacing: "-1.5px",
            textAlign: "center",
          }}
        >
          Informasi tidak tinggal di satu tempat.
        </h2>

        <div style={{ display: "flex", gap: 22 }}>
          {sources.map((s, i) => {
            const o = interpolate(frame, [30 + i * 14, 60 + i * 14], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const y = interpolate(frame, [30 + i * 14, 70 + i * 14], [18, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <div
                key={i}
                style={{
                  opacity: o,
                  transform: `translateY(${y}px)`,
                  width: 236,
                  padding: "20px 22px",
                  borderRadius: 12,
                  background: "rgba(15, 43, 70, 0.55)",
                  border: `1px solid ${COLORS.panelLight}`,
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 9,
                    background: "rgba(0, 212, 255, 0.12)",
                    border: `1px solid rgba(0, 212, 255, 0.35)`,
                    color: COLORS.accent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: MONO_FAMILY,
                    fontSize: 16,
                    fontWeight: 700,
                    marginBottom: 14,
                  }}
                >
                  {s.tag}
                </div>
                <div style={{ color: COLORS.white, fontSize: 19, fontWeight: 600 }}>{s.name}</div>
                <div style={{ color: COLORS.gray, fontSize: 14, marginTop: 5, lineHeight: 1.45 }}>
                  {s.detail}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= PHASE B ================= */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: phaseBIn * phaseBOut,
        }}
      >
        {/* sumber mengecil ke tengah */}
        {sources.map((s, i) => {
          const startX = (i - 1.5) * 258;
          const x = interpolate(converge, [0, 1], [startX, 0]);
          const y = interpolate(converge, [0, 1], [180, 0]);
          const sc = interpolate(converge, [0, 1], [1, 0.28]);
          const op = interpolate(converge, [0, 0.7, 1], [1, 0.6, 0]);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                transform: `translate(${x}px, ${y}px) scale(${sc})`,
                opacity: op,
                width: 236,
                height: 150,
                borderRadius: 12,
                background: "rgba(15, 43, 70, 0.8)",
                border: `1px solid ${COLORS.panelLight}`,
              }}
            />
          );
        })}

        {/* node model */}
        <div
          style={{
            position: "absolute",
            transform: "translateY(-40px)",
            width: 250,
            height: 250,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(239,68,68,${0.28 * dangerGlow}) 0%, rgba(239,68,68,0) 68%)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            transform: "translateY(-40px)",
            width: 132,
            height: 132,
            borderRadius: 26,
            background: "rgba(15, 43, 70, 0.95)",
            border: `2px solid ${dangerGlow > 0.4 ? COLORS.red : COLORS.accent}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: COLORS.white,
            fontSize: 30,
            fontWeight: 800,
            letterSpacing: "1px",
            boxShadow: `0 0 ${60 * dangerGlow}px rgba(239,68,68,${0.6 * dangerGlow})`,
          }}
        >
          AI
        </div>

        {/* teks hasil */}
        <div
          style={{
            position: "absolute",
            transform: "translateY(150px)",
            textAlign: "center",
            opacity: interpolate(frame, [400, 450], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <p style={{ color: COLORS.gray, fontSize: 26, margin: "0 0 6px 0" }}>
            yang membaca <span style={{ color: COLORS.white, fontWeight: 600 }}>semuanya</span>
          </p>
          <p
            style={{
              color: COLORS.red,
              fontSize: 42,
              fontWeight: 800,
              margin: 0,
              letterSpacing: "-0.5px",
            }}
          >
            bisa membocorkan semuanya.
          </p>
        </div>
      </div>

      {/* ================= PHASE C ================= */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: phaseCIn * phaseCOut,
        }}
      >
        <p
          style={{
            color: COLORS.gray,
            fontSize: 26,
            margin: "0 0 10px 0",
            letterSpacing: "0.04em",
          }}
        >
          Satu kebocoran status HIV
        </p>
        <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
          <span
            style={{
              color: COLORS.grayDark,
              fontSize: 64,
              fontWeight: 700,
              textDecoration: strike > 0.5 ? "line-through" : "none",
              textDecorationThickness: 4,
              opacity: 1 - strike * 0.55,
            }}
          >
            bukan bug.
          </span>
          <span
            style={{
              color: COLORS.red,
              fontSize: 64,
              fontWeight: 800,
              letterSpacing: "-1.5px",
              opacity: strike,
              transform: `translateX(${interpolate(strike, [0, 1], [-24, 0])}px)`,
            }}
          >
            Itu insiden.
          </span>
        </div>
      </div>

      {/* ================= PHASE D ================= */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: thesisOpacity,
          transform: `scale(${thesisScale})`,
        }}
      >
        <p
          style={{
            color: COLORS.accent,
            fontSize: 18,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            margin: "0 0 24px 0",
            fontFamily: MONO_FAMILY,
          }}
        >
          SAKSI
        </p>
        <h1
          style={{
            color: COLORS.white,
            fontSize: 76,
            fontWeight: 700,
            margin: 0,
            letterSpacing: "-2px",
            textAlign: "center",
            lineHeight: 1.15,
          }}
        >
          Setiap jawaban punya
          <br />
          <span style={{ color: COLORS.accent }}>lima saksi.</span>
        </h1>

        <div style={{ display: "flex", gap: 18, marginTop: 54 }}>
          {letters.map((l, i) => {
            const o = interpolate(frame, [860 + i * 16, 890 + i * 16], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const y = interpolate(frame, [860 + i * 16, 900 + i * 16], [16, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <div
                key={i}
                style={{
                  opacity: o,
                  transform: `translateY(${y}px)`,
                  width: 150,
                  padding: "18px 10px 16px",
                  borderRadius: 10,
                  background: "rgba(0, 212, 255, 0.06)",
                  border: `1px solid rgba(0, 212, 255, 0.28)`,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    color: COLORS.accent,
                    fontSize: 40,
                    fontWeight: 800,
                    lineHeight: 1,
                    marginBottom: 10,
                  }}
                >
                  {l.letter}
                </div>
                <div style={{ color: COLORS.gray, fontSize: 14, lineHeight: 1.35 }}>{l.word}</div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
