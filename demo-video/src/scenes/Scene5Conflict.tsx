import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { COLORS, FONT_FAMILY, MONO_FAMILY } from "../utils";
import { SceneLabel, QueryBubble, ResponsePanel, DijawabFooter } from "../components/ChatBubble";

export const Scene5Conflict: React.FC = () => {
  const frame = useCurrentFrame();

  // Highlight for old source
  const oldHighlight = interpolate(frame, [160, 200, 260, 300], [0, 1, 1, 0.3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Highlight for new source
  const newHighlight = interpolate(frame, [280, 320, 380, 420], [0, 1, 1, 0.3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Decision highlight
  const decisionScale = spring({ frame, fps: 30, delay: 450, config: { damping: 15, stiffness: 100 } });
  const decisionOpacity = interpolate(decisionScale, [0, 1], [0, 1]);

  // Exit (adjusted for 1080-frame duration)
  const exitOpacity = interpolate(frame, [1040, 1080], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: exitOpacity }}>
      <SceneLabel label="Demo 3: Konflik Temporal" number="05" />

      {/* Title */}
      <div style={{ position: "absolute", top: 80, left: 0, right: 0, textAlign: "center" }}>
        <h2
          style={{
            color: COLORS.white,
            fontSize: 36,
            fontWeight: 700,
            fontFamily: FONT_FAMILY,
            margin: 0,
          }}
        >
          Deteksi konflik antar sumber
        </h2>
        <p style={{ color: COLORS.gray, fontSize: 18, fontFamily: FONT_FAMILY, marginTop: 8 }}>
          Engine menalar, bukan sekadar menjawab
        </p>
      </div>

      {/* Chat area */}
      <div style={{ position: "absolute", top: 180, left: 80, right: 80 }}>
        <QueryBubble text="Jam berapa poli buka?" startFrame={20} />

        <ResponsePanel startFrame={80} variant="conflict">
          {/* Conflict detected banner */}
          <div
            style={{
              background: "rgba(250, 204, 21, 0.1)",
              border: `1px solid ${COLORS.yellow}`,
              borderRadius: 8,
              padding: "10px 16px",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                color: COLORS.yellow,
                fontSize: 20,
                fontWeight: 600,
                fontFamily: FONT_FAMILY,
              }}
            >
              Ditemukan dua sumber dengan informasi berbeda.
            </div>
          </div>

          {/* Old source */}
          <div
            style={{
              background: `rgba(239, 68, 68, ${0.08 + oldHighlight * 0.15})`,
              border: `1px solid ${COLORS.red}`,
              borderRadius: 8,
              padding: "12px 16px",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  color: COLORS.red,
                  fontSize: 18,
                  fontWeight: 600,
                  fontFamily: FONT_FAMILY,
                }}
              >
                Sumber lama:
              </span>
              <span
                style={{
                  background: COLORS.red,
                  color: COLORS.white,
                  padding: "2px 8px",
                  borderRadius: 4,
                  fontSize: 16,
                  fontFamily: MONO_FAMILY,
                  fontWeight: 600,
                }}
              >
                DOC-001
              </span>
              <span style={{ color: COLORS.grayDark, fontSize: 15, fontFamily: MONO_FAMILY }}>
                2024-06-01
              </span>
              <span
                style={{
                  background: "rgba(239, 68, 68, 0.2)",
                  color: COLORS.red,
                  padding: "2px 8px",
                  borderRadius: 4,
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                outdated
              </span>
            </div>
            <p
              style={{
                color: COLORS.gray,
                fontSize: 20,
                fontFamily: FONT_FAMILY,
                margin: 0,
              }}
            >
              Poli pagi 08:00–14:00 WITA
            </p>
          </div>

          {/* New source */}
          <div
            style={{
              background: `rgba(34, 197, 94, ${0.08 + newHighlight * 0.15})`,
              border: `1px solid ${COLORS.green}`,
              borderRadius: 8,
              padding: "12px 16px",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  color: COLORS.green,
                  fontSize: 18,
                  fontWeight: 600,
                  fontFamily: FONT_FAMILY,
                }}
              >
                Sumber baru:
              </span>
              <span
                style={{
                  background: COLORS.green,
                  color: COLORS.white,
                  padding: "2px 8px",
                  borderRadius: 4,
                  fontSize: 16,
                  fontFamily: MONO_FAMILY,
                  fontWeight: 600,
                }}
              >
                CHAT-001
              </span>
              <span style={{ color: COLORS.grayDark, fontSize: 15, fontFamily: MONO_FAMILY }}>
                2026-10-10
              </span>
              <span
                style={{
                  background: "rgba(34, 197, 94, 0.2)",
                  color: COLORS.green,
                  padding: "2px 8px",
                  borderRadius: 4,
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                aktif
              </span>
            </div>
            <p
              style={{
                color: COLORS.white,
                fontSize: 20,
                fontFamily: FONT_FAMILY,
                margin: 0,
              }}
            >
              Jam buka poli pagi diubah dari 08:00 WITA menjadi 07:30 WITA
            </p>
          </div>

          {/* Decision */}
          <div
            style={{
              opacity: decisionOpacity,
              background: "rgba(0, 212, 255, 0.08)",
              border: `1px solid ${COLORS.accent}`,
              borderRadius: 8,
              padding: "12px 16px",
              marginBottom: 12,
            }}
          >
            <p
              style={{
                color: COLORS.accent,
                fontSize: 20,
                fontFamily: FONT_FAMILY,
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              Saya memprioritaskan{" "}
              <span style={{ fontWeight: 700 }}>CHAT-001</span> karena sumber terbaru dan
              DOC-001 sudah <span style={{ fontWeight: 700 }}>superseded</span>.
            </p>
          </div>

          <DijawabFooter userId="STF-005" startFrame={520} />
        </ResponsePanel>
      </div>

      {/* Bottom annotation */}
      <div
        style={{
          position: "absolute",
          bottom: 50,
          left: "50%",
          transform: "translateX(-50%)",
          opacity: interpolate(frame, [580, 630], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <p
          style={{
            color: COLORS.gray,
            fontSize: 18,
            fontFamily: FONT_FAMILY,
            margin: 0,
            textAlign: "center",
          }}
        >
          Bukan sekadar jawaban —{" "}
          <span style={{ color: COLORS.accent, fontWeight: 600 }}>
            penalaran yang bisa diaudit
          </span>
        </p>
      </div>
    </AbsoluteFill>
  );
};
