import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { COLORS, FONT_FAMILY, MONO_FAMILY } from "../utils";
import { SceneLabel } from "../components/ChatBubble";

/**
 * Scene 2 — Gerbang Izin
 *
 * Pertanyaan identik, dua identitas. Angka gate diambil langsung dari engine:
 *   STF-005 (perawat)          -> 21 diblokir / 42 dipindai / 0 lolos -> refusal
 *   STF-001 (kepala puskesmas) ->  1 diblokir / 42 dipindai / 5 lolos -> jawaban + 3 bukti
 */

const COL_W = 828;

const Identity: React.FC<{
  id: string;
  name: string;
  role: string;
  clearance: string;
  clearanceColor: string;
  delay: number;
  dim?: number;
}> = ({ id, name, role, clearance, clearanceColor, delay, dim = 0 }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [delay, delay + 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        opacity: o * (1 - dim * 0.55),
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 18px",
        borderRadius: 10,
        background: "rgba(15, 43, 70, 0.6)",
        border: `1px solid ${COLORS.panelLight}`,
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 9,
          background: "rgba(0, 212, 255, 0.12)",
          border: "1px solid rgba(0, 212, 255, 0.32)",
          color: COLORS.accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: MONO_FAMILY,
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        {id}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: COLORS.white, fontSize: 18, fontWeight: 600 }}>{name}</div>
        <div style={{ color: COLORS.gray, fontSize: 14, marginTop: 2 }}>{role}</div>
      </div>
      <div
        style={{
          fontFamily: MONO_FAMILY,
          fontSize: 11,
          letterSpacing: "0.06em",
          color: clearanceColor,
          border: `1px solid ${clearanceColor}55`,
          background: `${clearanceColor}18`,
          padding: "3px 9px",
          borderRadius: 5,
          whiteSpace: "nowrap",
        }}
      >
        {clearance}
      </div>
    </div>
  );
};

const GateRow: React.FC<{
  blocked: number;
  scanned: number;
  allowed: number;
  delay: number;
  danger: boolean;
}> = ({ blocked, scanned, allowed, delay, danger }) => {
  const frame = useCurrentFrame();
  const cells = [
    { v: blocked, l: "diblokir", c: danger ? COLORS.red : COLORS.yellow },
    { v: scanned, l: "dipindai", c: COLORS.gray },
    { v: allowed, l: "lolos ACL", c: danger ? COLORS.grayDark : COLORS.accent },
  ];
  return (
    <div style={{ display: "flex", gap: 8, opacity: interpolate(frame, [delay, delay + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
      {cells.map((c, i) => {
        const pop = spring({ frame, fps: 30, delay: delay + i * 6, config: { damping: 14, stiffness: 120 } });
        return (
          <div
            key={i}
            style={{
              flex: 1,
              textAlign: "center",
              padding: "10px 6px",
              borderRadius: 8,
              background: "rgba(5, 11, 20, 0.55)",
              border: `1px solid ${COLORS.panelLight}`,
            }}
          >
            <div
              style={{
                color: c.c,
                fontFamily: MONO_FAMILY,
                fontSize: 30,
                fontWeight: 600,
                lineHeight: 1.15,
                transform: `scale(${interpolate(pop, [0, 1], [0.75, 1])})`,
              }}
            >
              {c.v}
            </div>
            <div
              style={{
                color: COLORS.grayDark,
                fontSize: 11,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginTop: 3,
              }}
            >
              {c.l}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const Scene2Gate: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();
  // Animasi ditulis untuk 1140 frame; skala ini membuatnya meregang mulus
  // bila durasi audio berubah, tanpa menyunting tiap timing.
  const frame = useCurrentFrame() * (1140 / durationInFrames);

  const exitOpacity = interpolate(frame, [1100, 1140], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const titleIn = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const queryIn = spring({ frame, fps, delay: 25, config: { damping: 200 } });

  // kiri selesai lebih dulu, kanan menyusul
  const leftPanel = spring({ frame, fps, delay: 190, config: { damping: 200 } });
  const rightPanel = spring({ frame, fps, delay: 560, config: { damping: 200 } });

  // angka gate kiri muncul setelah "pemindaian"
  const leftGate = 150;
  const rightGate = 520;

  const verdict = spring({ frame, fps, delay: 900, config: { damping: 16, stiffness: 110 } });

  const dim = interpolate(frame, [560, 620], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: exitOpacity, fontFamily: FONT_FAMILY }}>
      <SceneLabel label="Demo 1: Gerbang Izin" number="02" />

      {/* Title */}
      <div style={{ position: "absolute", top: 72, left: 0, right: 0, textAlign: "center", opacity: titleIn }}>
        <h2 style={{ color: COLORS.white, fontSize: 44, fontWeight: 700, margin: 0, letterSpacing: "-1px" }}>
          Izin diperiksa <span style={{ color: COLORS.accent }}>sebelum</span> retrieval
        </h2>
        <p style={{ color: COLORS.gray, fontSize: 18, marginTop: 8 }}>
          Dokumen terlarang tidak pernah masuk konteks model.
        </p>
      </div>

      {/* Query bersama */}
      <div
        style={{
          position: "absolute",
          top: 178,
          left: "50%",
          transform: `translateX(-50%) translateY(${interpolate(queryIn, [0, 1], [14, 0])}px)`,
          opacity: queryIn,
          padding: "12px 26px",
          borderRadius: 10,
          background: "rgba(0, 212, 255, 0.09)",
          border: "1px solid rgba(0, 212, 255, 0.3)",
          fontFamily: MONO_FAMILY,
          fontSize: 21,
          color: COLORS.white,
        }}
      >
        <span style={{ color: COLORS.accent }}>/saksi</span> Apa itu Proyek Cakalang?
      </div>

      {/* ================= KOLOM KIRI ================= */}
      <div
        style={{
          position: "absolute",
          top: 258,
          left: 80,
          width: COL_W,
          opacity: leftPanel,
          transform: `translateY(${interpolate(leftPanel, [0, 1], [18, 0])}px)`,
        }}
      >
        <Identity
          id="STF-005"
          name="Ns. Dewi Lestari"
          role="Perawat Ahli"
          clearance="internal"
          clearanceColor={COLORS.accent}
          delay={100}
          dim={dim}
        />

        <div style={{ marginTop: 12 }}>
          <GateRow blocked={21} scanned={42} allowed={0} delay={leftGate} danger />
        </div>

        <div
          style={{
            marginTop: 12,
            padding: "20px 22px",
            borderRadius: 10,
            background: "rgba(15, 43, 70, 0.5)",
            border: `1px solid ${COLORS.panelLight}`,
            opacity: interpolate(frame, [250, 290], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          <div
            style={{
              display: "inline-block",
              fontFamily: MONO_FAMILY,
              fontSize: 11,
              letterSpacing: "0.1em",
              color: COLORS.yellow,
              background: "rgba(250, 204, 21, 0.1)",
              border: "1px solid rgba(250, 204, 21, 0.28)",
              padding: "3px 9px",
              borderRadius: 4,
              marginBottom: 14,
            }}
          >
            BUKTI BELUM CUKUP
          </div>
          <p style={{ color: COLORS.gray, fontSize: 20, lineHeight: 1.6, margin: 0 }}>
            Saya tidak menemukan informasi yang dapat saya akses untuk pertanyaan itu.
            Silakan hubungi pemilik topik terkait.
          </p>
          <p style={{ color: COLORS.grayDark, fontSize: 15, margin: "14px 0 0 0", fontStyle: "italic" }}>
            Tidak menyebut “Cakalang”. Tidak menyiratkan proyek itu ada.
          </p>
        </div>
      </div>

      {/* ================= KOLOM KANAN ================= */}
      <div
        style={{
          position: "absolute",
          top: 258,
          left: 1012,
          width: COL_W,
          opacity: rightPanel,
          transform: `translateY(${interpolate(rightPanel, [0, 1], [18, 0])}px)`,
        }}
      >
        <Identity
          id="STF-001"
          name="dr. Fatimah Rahmawati"
          role="Kepala Puskesmas"
          clearance="top_secret_medical"
          clearanceColor={COLORS.red}
          delay={470}
        />

        <div style={{ marginTop: 12 }}>
          <GateRow blocked={1} scanned={42} allowed={5} delay={rightGate} danger={false} />
        </div>

        <div
          style={{
            marginTop: 12,
            padding: "20px 22px",
            borderRadius: 10,
            background: "rgba(15, 43, 70, 0.5)",
            border: `1px solid ${COLORS.panelLight}`,
            opacity: interpolate(frame, [620, 660], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          <div
            style={{
              display: "inline-block",
              fontFamily: MONO_FAMILY,
              fontSize: 11,
              letterSpacing: "0.1em",
              color: COLORS.accent,
              background: "rgba(0, 212, 255, 0.1)",
              border: "1px solid rgba(0, 212, 255, 0.28)",
              padding: "3px 9px",
              borderRadius: 4,
              marginBottom: 14,
            }}
          >
            TERVERIFIKASI
          </div>
          <p style={{ color: COLORS.white, fontSize: 18, lineHeight: 1.6, margin: 0 }}>
            Investigasi KLB Hepatitis A di Kelurahan Biringkanaya. Kasus suspek 3, konfirmasi
            lab 2 positif. Sumber diduga air sumur bor dekat warung makan RT 04.
          </p>

          <div
            style={{
              marginTop: 16,
              paddingTop: 14,
              borderTop: `1px solid ${COLORS.panelLight}`,
            }}
          >
            <div
              style={{
                color: COLORS.grayDark,
                fontFamily: MONO_FAMILY,
                fontSize: 10,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Sumber
            </div>
            {[
              { id: "DOC-010", title: "Laporan Investigasi KLB Hepatitis A", date: "2026-10-21" },
              { id: "CHAT-003", title: "Proyek Cakalang — Update", date: "2026-10-14" },
              { id: "CHAT-021", title: "Proyek Cakalang: hasil lab", date: "2026-10-21" },
            ].map((s, i) => {
              const o = interpolate(frame, [700 + i * 16, 726 + i * 16], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              return (
                <div
                  key={s.id}
                  style={{
                    opacity: o,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "7px 10px",
                    marginBottom: 5,
                    borderRadius: 6,
                    background: "rgba(255, 255, 255, 0.03)",
                    border: `1px solid ${COLORS.panelLight}`,
                  }}
                >
                  <span style={{ color: COLORS.accent, fontFamily: MONO_FAMILY, fontSize: 12 }}>{s.id}</span>
                  <span style={{ color: COLORS.gray, fontSize: 13, flex: 1 }}>{s.title}</span>
                  <span style={{ color: COLORS.grayDark, fontFamily: MONO_FAMILY, fontSize: 11 }}>{s.date}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= VERDICT ================= */}
      <div
        style={{
          position: "absolute",
          bottom: 52,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: verdict,
          transform: `scale(${interpolate(verdict, [0, 1], [0.94, 1])})`,
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "14px 40px",
            borderRadius: 12,
            background: "linear-gradient(135deg, rgba(0,212,255,0.16), rgba(0,212,255,0.05))",
            border: "1px solid rgba(0, 212, 255, 0.4)",
          }}
        >
          <span style={{ color: COLORS.white, fontSize: 28, fontWeight: 700 }}>
            Pertanyaan identik.{" "}
            <span style={{ color: COLORS.accent }}>Hasil berbeda.</span>
          </span>
        </div>
        <p style={{ color: COLORS.grayDark, fontSize: 16, marginTop: 10 }}>
          Bukan karena model menolak menjawab — tapi karena izin diperiksa lebih dulu.
        </p>
      </div>
    </AbsoluteFill>
  );
};
