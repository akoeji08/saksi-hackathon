import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { COLORS, FONT_FAMILY } from "../utils";
import { SceneLabel, QueryBubble, ResponsePanel } from "../components/ChatBubble";

export const Scene4Refusal: React.FC = () => {
  const frame = useCurrentFrame();

  // Phase 1: Cakalang query (0-450)
  // Phase 2: Naga (fictitious) query (450-900)

  const phase1Opacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const phase2Opacity = interpolate(frame, [450, 460], [0, 1], { extrapolateRight: "clamp" });
  const phase1Exit = interpolate(frame, [430, 450], [1, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  // Comparison banner
  const comparisonOpacity = interpolate(frame, [470, 510], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Identical badge
  const identicalScale = spring({ frame, delay: 750, fps: 30, config: { damping: 12, stiffness: 100 } });
  const identicalOpacity = interpolate(identicalScale, [0, 1], [0, 1]);

  // Exit (adjusted for 1050-frame duration)
  const exitOpacity = interpolate(frame, [1010, 1050], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const refusalResponse = (
    <>
      <p
        style={{
          color: COLORS.gray,
          fontSize: 24,
          fontFamily: FONT_FAMILY,
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        Saya tidak menemukan informasi yang dapat saya akses untuk pertanyaan itu.
      </p>
      <p
        style={{
          color: COLORS.gray,
          fontSize: 22,
          fontFamily: FONT_FAMILY,
          margin: "12px 0 0 0",
        }}
      >
        Silakan hubungi pemilik topik terkait.
      </p>
      <div
        style={{
          marginTop: 16,
          paddingTop: 12,
          borderTop: `1px solid ${COLORS.panelLight}`,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ color: COLORS.gray, fontSize: 18 }}>Dijawab untuk:</span>
        <span
          style={{
            color: COLORS.accent,
            fontSize: 18,
            fontFamily: "'JetBrains Mono', 'Consolas', monospace",
            fontWeight: 600,
          }}
        >
          STF-005
        </span>
      </div>
    </>
  );

  return (
    <AbsoluteFill style={{ opacity: exitOpacity }}>
      <SceneLabel label="Demo 2: Refusal Equivalence" number="04" />

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
          Tidak menyiratkan keberadaan data terbatas
        </h2>
        <p style={{ color: COLORS.gray, fontSize: 18, fontFamily: FONT_FAMILY, marginTop: 8 }}>
          User tidak berhak → respons netral
        </p>
      </div>

      {/* Phase 1: Cakalang query */}
      <div
        style={{
          position: "absolute",
          top: 180,
          left: 80,
          right: 80,
          opacity: phase1Opacity * phase1Exit,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              background: COLORS.red,
              padding: "4px 12px",
              borderRadius: 6,
              fontSize: 16,
              fontWeight: 600,
              fontFamily: FONT_FAMILY,
              color: COLORS.white,
            }}
          >
            RESTRICTED
          </div>
          <span style={{ color: COLORS.gray, fontSize: 18, fontFamily: FONT_FAMILY }}>
            Proyek Cakalang — investigasi KLB Hepatitis A
          </span>
        </div>
        <QueryBubble text="Apa itu Proyek Cakalang?" startFrame={30} />
        <ResponsePanel startFrame={80} variant="refusal">
          {refusalResponse}
        </ResponsePanel>
      </div>

      {/* Phase 2: Naga query */}
      <div
        style={{
          position: "absolute",
          top: 180,
          left: 80,
          right: 80,
          opacity: phase2Opacity,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              background: COLORS.grayDark,
              padding: "4px 12px",
              borderRadius: 6,
              fontSize: 16,
              fontWeight: 600,
              fontFamily: FONT_FAMILY,
              color: COLORS.white,
            }}
          >
            NON-EXISTENT
          </div>
          <span style={{ color: COLORS.gray, fontSize: 18, fontFamily: FONT_FAMILY }}>
            Proyek Naga — tidak ada di dataset
          </span>
        </div>
        <QueryBubble text="Apa itu Proyek Naga?" startFrame={480} />
        <ResponsePanel startFrame={530} variant="refusal">
          {refusalResponse}
        </ResponsePanel>
      </div>

      {/* Comparison highlight */}
      <div
        style={{
          opacity: comparisonOpacity,
          position: "absolute",
          bottom: 140,
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
        }}
      >
        <p
          style={{
            color: COLORS.gray,
            fontSize: 20,
            fontFamily: FONT_FAMILY,
            margin: 0,
          }}
        >
          Respons untuk proyek terlarang{" "}
          <span style={{ color: COLORS.red, fontWeight: 600 }}>(Cakalang)</span>
          {"  "}vs{"  "}
          proyek fiktif{" "}
          <span style={{ color: COLORS.grayDark, fontWeight: 600 }}>(Naga)</span>
        </p>
      </div>

      {/* IDENTICAL badge */}
      <div
        style={{
          opacity: identicalOpacity,
          position: "absolute",
          bottom: 60,
          left: "50%",
          transform: `translateX(-50%) scale(${identicalScale})`,
        }}
      >
        <div
          style={{
            background: `linear-gradient(135deg, ${COLORS.green} 0%, #16a34a 100%)`,
            color: COLORS.white,
            padding: "12px 36px",
            borderRadius: 12,
            fontSize: 24,
            fontWeight: 800,
            fontFamily: FONT_FAMILY,
            textAlign: "center",
            boxShadow: "0 4px 24px rgba(34, 197, 94, 0.4)",
          }}
        >
          IDENTIK — Kata per Kata
        </div>
        <p
          style={{
            color: COLORS.gray,
            fontSize: 16,
            fontFamily: FONT_FAMILY,
            marginTop: 8,
            textAlign: "center",
          }}
        >
          Tidak ada informasi yang bocor melalui penolakan.
        </p>
      </div>
    </AbsoluteFill>
  );
};
