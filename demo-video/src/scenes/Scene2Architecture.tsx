import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { COLORS, FONT_FAMILY, MONO_FAMILY } from "../utils";
import { SceneLabel } from "../components/ChatBubble";

export const Scene2Architecture: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Layer entrance animations
  const layers = [
    { name: "WorkBuddy Desktop", subtitle: "Chat UI — /saksi <query>", y: 120, delay: 20 },
    { name: "Skill Layer", subtitle: "SKILL.md + wrapper + current-user.json", y: 270, delay: 60 },
    { name: "Engine Layer", subtitle: "Permission Gate → Retrieval → Scoring → Answer", y: 420, delay: 100 },
    { name: "Data + Audit Layer", subtitle: "5 JSON files + audit.jsonl", y: 570, delay: 140 },
  ];

  // Trust boundaries
  const boundaries = [
    { label: "B1: Skill dipanggil by name", subLabel: "bukan keputusan LLM", y: 195, delay: 200 },
    { label: "B2: Identity dari file", subLabel: "bukan dari prompt", y: 345, delay: 230 },
    { label: "B3: Filter SEBELUM retrieval", subLabel: "dokumen terlarang tidak masuk konteks LLM", y: 495, delay: 260 },
    { label: "B4: Audit metadata-only", subLabel: "PII disamarkan", y: 645, delay: 290 },
  ];

  // B3 highlight
  const b3Highlight = interpolate(frame, [350, 400, 500, 550], [0, 1, 1, 0.3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Exit fade (adjusted for 1140-frame duration)
  const exitOpacity = interpolate(frame, [1100, 1140], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: exitOpacity }}>
      <SceneLabel label="Overview Arsitektur" number="02" />

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <h2
          style={{
            color: COLORS.white,
            fontSize: 42,
            fontWeight: 700,
            fontFamily: FONT_FAMILY,
            margin: 0,
          }}
        >
          Tiga Lapis, Empat Trust Boundary
        </h2>
      </div>

      {/* Architecture layers */}
      <div
        style={{
          position: "absolute",
          top: 150,
          left: "50%",
          transform: "translateX(-50%)",
          width: 800,
        }}
      >
        {layers.map((layer, i) => {
          const opacity = interpolate(frame, [layer.delay, layer.delay + 25], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const translateY = interpolate(frame, [layer.delay, layer.delay + 25], [20, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <div
              key={i}
              style={{
                opacity,
                transform: `translateY(${translateY}px)`,
                marginBottom: 0,
              }}
            >
              <div
                style={{
                  background: i === 2 ? COLORS.panelLight : COLORS.panel,
                  border: `1px solid ${i === 2 ? COLORS.accent : COLORS.panelLight}`,
                  borderRadius: 10,
                  padding: "16px 28px",
                  textAlign: "center",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    color: COLORS.white,
                    fontSize: 24,
                    fontWeight: 700,
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  {layer.name}
                </div>
                <div
                  style={{
                    color: COLORS.gray,
                    fontSize: 16,
                    fontFamily: MONO_FAMILY,
                    marginTop: 4,
                  }}
                >
                  {layer.subtitle}
                </div>
              </div>
            </div>
          );
        })}

        {/* Trust boundary arrows between layers */}
        {boundaries.map((b, i) => {
          const opacity = interpolate(frame, [b.delay, b.delay + 20], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const isB3 = i === 2;

          return (
            <div
              key={i}
              style={{
                opacity,
                position: "relative",
                height: 50,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Arrow down */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  color: isB3 ? COLORS.accent : COLORS.grayDark,
                  fontSize: 18,
                }}
              >
                ↓
              </div>
              {/* Boundary label */}
              <div
                style={{
                  position: "absolute",
                  top: 18,
                  background: isB3
                    ? `rgba(0, 212, 255, ${0.15 + b3Highlight * 0.25})`
                    : "rgba(148, 163, 184, 0.08)",
                  border: `1px dashed ${isB3 ? COLORS.accent : COLORS.grayDark}`,
                  borderRadius: 6,
                  padding: "4px 16px",
                  color: isB3 ? COLORS.accent : COLORS.gray,
                  fontSize: 16,
                  fontFamily: FONT_FAMILY,
                  fontWeight: isB3 ? 600 : 400,
                  whiteSpace: "nowrap",
                }}
              >
                {b.label}
                <span style={{ color: COLORS.grayDark, marginLeft: 8, fontSize: 14 }}>
                  {b.subLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* B3 highlight callout */}
      <div
        style={{
          opacity: b3Highlight,
          position: "absolute",
          bottom: 80,
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          maxWidth: 700,
        }}
      >
        <div
          style={{
            background: "rgba(0, 212, 255, 0.1)",
            border: `1px solid ${COLORS.accent}`,
            borderRadius: 10,
            padding: "16px 24px",
          }}
        >
          <p
            style={{
              color: COLORS.accent,
              fontSize: 20,
              fontFamily: FONT_FAMILY,
              fontWeight: 600,
              margin: 0,
            }}
          >
            B3 — Dokumen terlarang tidak pernah masuk ke konteks LLM
          </p>
          <p
            style={{
              color: COLORS.gray,
              fontSize: 16,
              fontFamily: FONT_FAMILY,
              margin: "8px 0 0 0",
            }}
          >
            Bukan hanya disembunyikan di UI — benar-benar tidak diambil oleh engine.
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};
