import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";
import { COLORS, FONT_FAMILY } from "../utils";

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title entrance
  const titleSpring = spring({ frame, fps, delay: 10, config: { damping: 200 } });
  const titleScale = interpolate(titleSpring, [0, 1], [0.8, 1]);
  const titleOpacity = interpolate(titleSpring, [0, 1], [0, 1]);

  // Subtitle
  const subtitleOpacity = interpolate(frame, [60, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Tagline
  const taglineOpacity = interpolate(frame, [120, 160], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Stats row
  const stats = [
    { value: "22", label: "Pegawai" },
    { value: "2", label: "Pustu" },
    { value: "8", label: "Posyandu" },
    { value: "120", label: "Pasien/hari" },
  ];

  // Problem statement
  const problemOpacity = interpolate(frame, [200, 240], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Data sources
  const dataSources = [
    { icon: "WA", label: "WhatsApp" },
    { icon: "GD", label: "Google Drive" },
    { icon: "TB", label: "Task Board" },
    { icon: "RM", label: "SIMPUS" },
  ];

  // Sensitive data warning
  const warningOpacity = interpolate(frame, [330, 380], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Solution reveal
  const solutionScale = spring({ frame, fps, delay: 430, config: { damping: 15, stiffness: 80 } });
  const solutionOpacity = interpolate(solutionScale, [0, 1], [0, 1]);

  // Exit fade
  // Exit fade (adjusted for new 1050-frame duration)
  const exitOpacity = interpolate(frame, [1010, 1050], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: exitOpacity,
      }}
    >
      {/* Logo / Title */}
      <div
        style={{
          transform: `scale(${titleScale})`,
          opacity: titleOpacity,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: 30,
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 16,
            background: `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.accentDim} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 44,
            fontWeight: 800,
            color: COLORS.bg,
            boxShadow: "0 8px 32px rgba(0, 212, 255, 0.4)",
            marginBottom: 24,
            fontFamily: FONT_FAMILY,
          }}
        >
          S
        </div>
        <h1
          style={{
            color: COLORS.white,
            fontSize: 72,
            fontWeight: 800,
            fontFamily: FONT_FAMILY,
            margin: 0,
            letterSpacing: "-2px",
          }}
        >
          SAKSI
        </h1>
        <p
          style={{
            color: COLORS.accent,
            fontSize: 24,
            fontFamily: FONT_FAMILY,
            margin: "8px 0 0 0",
            opacity: subtitleOpacity,
          }}
        >
          Evidence-to-Decision Engine
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "flex",
          gap: 40,
          marginBottom: 40,
          opacity: subtitleOpacity,
        }}
      >
        {stats.map((stat, i) => {
          const statOpacity = interpolate(frame, [70 + i * 15, 90 + i * 15], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={i}
              style={{
                opacity: statOpacity,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  color: COLORS.accent,
                  fontSize: 40,
                  fontWeight: 800,
                  fontFamily: FONT_FAMILY,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  color: COLORS.gray,
                  fontSize: 16,
                  fontFamily: FONT_FAMILY,
                }}
              >
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Problem statement */}
      <div
        style={{
          opacity: problemOpacity,
          textAlign: "center",
          maxWidth: 900,
          marginBottom: 30,
        }}
      >
        <p
          style={{
            color: COLORS.gray,
            fontSize: 22,
            fontFamily: FONT_FAMILY,
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          Informasi tersebar di{" "}
          {dataSources.map((src, i) => (
            <span
              key={i}
              style={{
                color: COLORS.white,
                fontWeight: 600,
              }}
            >
              {src.label}
              {i < dataSources.length - 1 ? ", " : ""}
            </span>
          ))}
          {"\n"}
          <span style={{ color: COLORS.red, fontWeight: 600 }}>
            AI yang bisa baca semuanya — bisa bocorkan semuanya.
          </span>
        </p>
      </div>

      {/* Sensitive data warning */}
      <div
        style={{
          opacity: warningOpacity,
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: 800,
          marginBottom: 30,
        }}
      >
        {["HIV", "TB", "Kesehatan Jiwa", "KLB Hepatitis A"].map((item, i) => {
          const itemOpacity = interpolate(frame, [340 + i * 12, 370 + i * 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={i}
              style={{
                opacity: itemOpacity,
                background: "rgba(239, 68, 68, 0.15)",
                border: `1px solid ${COLORS.red}`,
                color: COLORS.red,
                padding: "8px 20px",
                borderRadius: 8,
                fontSize: 20,
                fontWeight: 600,
                fontFamily: FONT_FAMILY,
              }}
            >
              {item}
            </div>
          );
        })}
      </div>

      {/* Solution statement */}
      <div
        style={{
          opacity: solutionOpacity,
          transform: `scale(${solutionScale})`,
          textAlign: "center",
          maxWidth: 800,
        }}
      >
        <p
          style={{
            color: COLORS.accent,
            fontSize: 28,
            fontFamily: FONT_FAMILY,
            fontWeight: 600,
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          Workplace brain yang bisa membuktikan jawabannya — dan berani menolak.
        </p>
      </div>

      {/* Tagline */}
      <div
        style={{
          opacity: taglineOpacity,
          position: "absolute",
          bottom: 60,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ color: COLORS.grayDark, fontSize: 18, fontFamily: FONT_FAMILY }}>
          Tencent Cloud Hackathon Indonesia 2026
        </span>
      </div>
    </AbsoluteFill>
  );
};
