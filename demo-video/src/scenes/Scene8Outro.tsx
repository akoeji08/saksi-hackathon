import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { COLORS, FONT_FAMILY } from "../utils";

export const Scene8Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title
  const titleScale = spring({ frame, fps, delay: 10, config: { damping: 200 } });
  const titleOpacity = interpolate(titleScale, [0, 1], [0, 1]);

  // SAKSI letters explanation
  const letters = [
    { letter: "S", word: "Sumber", desc: "Evidence card untuk setiap jawaban", delay: 60 },
    { letter: "A", word: "Akses", desc: "Deny-by-default ACL sebelum retrieval", delay: 90 },
    { letter: "K", word: "Konfirmasi", desc: "Read-only; tidak ada eksekusi tanpa approval", delay: 120 },
    { letter: "S", word: "Sadar Batas", desc: "Refusal equivalence + 'saya tidak tahu'", delay: 150 },
    { letter: "I", word: "Integritas Jejak", desc: "Audit metadata-only, PII masked", delay: 180 },
  ];

  // Test results
  const resultsOpacity = interpolate(frame, [240, 280], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Zero failures badge
  const badgeScale = spring({ frame, fps, delay: 300, config: { damping: 12, stiffness: 100 } });
  const badgeOpacity = interpolate(badgeScale, [0, 1], [0, 1]);

  // Tagline
  const taglineOpacity = interpolate(frame, [350, 390], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Final fade (adjusted for 1110-frame duration)
  const finalFade = interpolate(frame, [1070, 1110], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: finalFade,
      }}
    >
      {/* Title */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `scale(${titleScale})`,
          textAlign: "center",
          marginBottom: 40,
        }}
      >
        <h2
          style={{
            color: COLORS.white,
            fontSize: 40,
            fontWeight: 700,
            fontFamily: FONT_FAMILY,
            margin: 0,
          }}
        >
          Responsible AI Summary
        </h2>
      </div>

      {/* SAKSI letters */}
      <div
        style={{
          display: "flex",
          gap: 24,
          marginBottom: 40,
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: 1400,
        }}
      >
        {letters.map((item, i) => {
          const letterOpacity = interpolate(frame, [item.delay, item.delay + 20], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const letterY = interpolate(frame, [item.delay, item.delay + 20], [20, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <div
              key={i}
              style={{
                opacity: letterOpacity,
                transform: `translateY(${letterY}px)`,
                background: COLORS.panel,
                border: `1px solid ${COLORS.panelLight}`,
                borderRadius: 12,
                padding: "16px 20px",
                textAlign: "center",
                minWidth: 240,
              }}
            >
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 800,
                  fontFamily: FONT_FAMILY,
                  background: `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.accentDim} 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  marginBottom: 4,
                }}
              >
                {item.letter}
              </div>
              <div
                style={{
                  color: COLORS.white,
                  fontSize: 20,
                  fontWeight: 700,
                  fontFamily: FONT_FAMILY,
                  marginBottom: 4,
                }}
              >
                {item.word}
              </div>
              <div
                style={{
                  color: COLORS.gray,
                  fontSize: 14,
                  fontFamily: FONT_FAMILY,
                  lineHeight: 1.4,
                }}
              >
                {item.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* Test results */}
      <div
        style={{
          opacity: resultsOpacity,
          display: "flex",
          gap: 48,
          marginBottom: 30,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ color: COLORS.green, fontSize: 36, fontWeight: 800, fontFamily: FONT_FAMILY }}>
            13/13
          </div>
          <div style={{ color: COLORS.gray, fontSize: 16, fontFamily: FONT_FAMILY }}>Test Lulus</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: COLORS.green, fontSize: 36, fontWeight: 800, fontFamily: FONT_FAMILY }}>
            100%
          </div>
          <div style={{ color: COLORS.gray, fontSize: 16, fontFamily: FONT_FAMILY }}>Pass Rate</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: COLORS.red, fontSize: 36, fontWeight: 800, fontFamily: FONT_FAMILY }}>
            0
          </div>
          <div style={{ color: COLORS.gray, fontSize: 16, fontFamily: FONT_FAMILY }}>Critical Failure</div>
        </div>
      </div>

      {/* Zero badge */}
      <div
        style={{
          opacity: badgeOpacity,
          transform: `scale(${badgeScale})`,
          marginBottom: 30,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 12,
          }}
        >
          {["0 kebocoran", "0 eksekusi tanpa approval", "0 klaim terlarang"].map((item, i) => (
            <div
              key={i}
              style={{
                background: "rgba(34, 197, 94, 0.1)",
                border: `1px solid ${COLORS.green}`,
                borderRadius: 8,
                padding: "8px 16px",
                color: COLORS.green,
                fontSize: 16,
                fontWeight: 600,
                fontFamily: FONT_FAMILY,
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Tagline */}
      <div
        style={{
          opacity: taglineOpacity,
          textAlign: "center",
        }}
      >
        <p
          style={{
            color: COLORS.accent,
            fontSize: 32,
            fontFamily: FONT_FAMILY,
            fontWeight: 700,
            margin: 0,
          }}
        >
          "Setiap jawaban punya lima saksi."
        </p>
        <p
          style={{
            color: COLORS.gray,
            fontSize: 18,
            fontFamily: FONT_FAMILY,
            marginTop: 12,
          }}
        >
          SAKSI — Evidence-to-Decision Engine
        </p>
        <p
          style={{
            color: COLORS.grayDark,
            fontSize: 16,
            fontFamily: FONT_FAMILY,
            marginTop: 8,
          }}
        >
          Tencent Cloud Hackathon Indonesia 2026 · Challenge A: The Workplace Brain
        </p>
      </div>
    </AbsoluteFill>
  );
};
