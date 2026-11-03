import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { COLORS, FONT_FAMILY } from "../utils";
import { SceneLabel, QueryBubble, ResponsePanel, EvidenceCard, DijawabFooter } from "../components/ChatBubble";

export const Scene3Evidence: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Highlight pulses
  const highlight1 = interpolate(frame, [180, 210, 260, 290], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const highlight2 = interpolate(frame, [280, 310, 360, 390], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const highlight3 = interpolate(frame, [380, 410, 460, 490], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Annotation labels
  const annotations = [
    {
      text: "Jawaban langsung dengan angka",
      showAt: 200,
      targetY: 320,
    },
    {
      text: "Sumber tertelusur dengan evidence card",
      showAt: 300,
      targetY: 420,
    },
    {
      text: "Identitas terverifikasi",
      showAt: 400,
      targetY: 560,
    },
  ];

  // Exit
  const exitOpacity = interpolate(frame, [1010, 1050], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: exitOpacity }}>
      <SceneLabel label="Demo 1: Jawaban Berbukti" number="03" />

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
          Setiap jawaban membawa bukti
        </h2>
        <p style={{ color: COLORS.gray, fontSize: 18, fontFamily: FONT_FAMILY, marginTop: 8 }}>
          User: STF-005 (Ns. Dewi, Perawat)
        </p>
      </div>

      {/* Chat area */}
      <div style={{ position: "absolute", top: 180, left: 80, right: 80 }}>
        <QueryBubble text="Berapa stok Amoksisilin 500mg sekarang?" startFrame={20} />

        <ResponsePanel startFrame={100} variant="normal">
          {/* Answer lines */}
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                color: COLORS.white,
                fontSize: 24,
                fontFamily: FONT_FAMILY,
                lineHeight: 1.8,
              }}
            >
              <div
                style={{
                  background: `rgba(239, 68, 68, ${0.1 + highlight1 * 0.3})`,
                  padding: "4px 12px",
                  borderRadius: 6,
                  display: "inline-block",
                  marginBottom: 4,
                }}
              >
                <span style={{ color: COLORS.white, fontWeight: 600 }}>
                  Amoksisilin 500mg: stok 40 tablet
                </span>
                <span
                  style={{
                    color: COLORS.red,
                    fontSize: 18,
                    marginLeft: 12,
                    fontWeight: 600,
                  }}
                >
                  (status: kritis)
                </span>
              </div>
              <div>
                <span style={{ color: COLORS.white, fontWeight: 600 }}>
                  Amoksisilin 250mg: stok 180 tablet
                </span>
                <span
                  style={{
                    color: COLORS.green,
                    fontSize: 18,
                    marginLeft: 12,
                    fontWeight: 600,
                  }}
                >
                  (status: aman)
                </span>
              </div>
            </div>
          </div>

          {/* Sources */}
          <div
            style={{
              background: `rgba(59, 130, 246, ${0.05 + highlight2 * 0.15})`,
              borderRadius: 8,
              padding: "12px 16px",
              marginBottom: 4,
            }}
          >
            <div
              style={{
                color: COLORS.gray,
                fontSize: 18,
                fontFamily: FONT_FAMILY,
                marginBottom: 8,
                fontWeight: 600,
              }}
            >
              Sumber:
            </div>
            <EvidenceCard id="DRG-001" title="Amoksisilin 500mg" startFrame={120} />
            <EvidenceCard id="DRG-002" title="Amoksisilin 250mg" startFrame={135} />
            <EvidenceCard
              id="DOC-006"
              title="Formularium Obat Puskesmas 2026"
              timestamp="2026-01-05"
              startFrame={150}
            />
          </div>

          <DijawabFooter userId="STF-005" startFrame={170} />
        </ResponsePanel>

        {/* Annotation arrows */}
        {annotations.map((ann, i) => {
          const annOpacity = interpolate(
            frame,
            [ann.showAt, ann.showAt + 15, ann.showAt + 120, ann.showAt + 135],
            [0, 1, 1, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          const annX = interpolate(
            frame,
            [ann.showAt, ann.showAt + 20],
            [20, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          return (
            <div
              key={i}
              style={{
                opacity: annOpacity,
                position: "absolute",
                right: -20,
                top: ann.targetY,
                transform: `translateX(${annX}px)`,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  color: COLORS.accent,
                  fontSize: 24,
                }}
              >
                ←
              </div>
              <div
                style={{
                  background: COLORS.accent,
                  color: COLORS.bg,
                  padding: "6px 14px",
                  borderRadius: 6,
                  fontSize: 16,
                  fontWeight: 600,
                  fontFamily: FONT_FAMILY,
                  whiteSpace: "nowrap",
                }}
              >
                {ann.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom highlight: three key takeaways */}
      <div
        style={{
          position: "absolute",
          bottom: 50,
          left: "50%",
          transform: "translateX(-50%)",
          opacity: interpolate(frame, [600, 650], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <div style={{ display: "flex", gap: 24 }}>
          {[
            { icon: "1.", text: "Jawaban langsung" },
            { icon: "2.", text: "Sumber jelas" },
            { icon: "3.", text: "Identitas terverifikasi" },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  color: COLORS.accent,
                  fontSize: 20,
                  fontWeight: 700,
                  fontFamily: FONT_FAMILY,
                }}
              >
                {item.icon}
              </span>
              <span
                style={{
                  color: COLORS.gray,
                  fontSize: 18,
                  fontFamily: FONT_FAMILY,
                }}
              >
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
