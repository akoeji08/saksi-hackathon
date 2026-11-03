import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { COLORS, FONT_FAMILY, MONO_FAMILY } from "../utils";

// ==================== "Dijawab untuk" Footer ====================
type DijawabFooterProps = {
  userId: string;
  startFrame?: number;
};

// ==================== User Query Bubble ====================
type QueryBubbleProps = {
  text: string;
  startFrame?: number;
  typewriter?: boolean;
};

export const QueryBubble: React.FC<QueryBubbleProps> = ({
  text,
  startFrame = 0,
  typewriter = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({ frame, fps, delay: startFrame, config: { damping: 200 } });
  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const translateX = interpolate(entrance, [0, 1], [30, 0]);

  let displayText = text;
  if (typewriter) {
    const charsToShow = Math.max(0, Math.floor((frame - startFrame - 10) * 1.5));
    displayText = text.slice(0, Math.min(charsToShow, text.length));
  }

  const showCursor =
    typewriter && displayText.length < text.length
      ? Math.floor(frame / 15) % 2 === 0
        ? "|"
        : ""
      : "";

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${translateX}px)`,
        display: "flex",
        justifyContent: "flex-end",
        paddingRight: 40,
        marginBottom: 20,
      }}
    >
      <div
        style={{
          background: COLORS.accent,
          color: COLORS.bg,
          padding: "18px 28px",
          borderRadius: "18px 18px 4px 18px",
          maxWidth: 800,
          fontFamily: FONT_FAMILY,
          fontSize: 28,
          fontWeight: 500,
          lineHeight: 1.5,
          boxShadow: "0 4px 20px rgba(0, 212, 255, 0.3)",
        }}
      >
        <span style={{ color: COLORS.bg, opacity: 0.6, marginRight: 8 }}>/saksi</span>
        {displayText}
        <span style={{ opacity: 0.8 }}>{showCursor}</span>
      </div>
    </div>
  );
};

// ==================== SAKSI Response Panel ====================
type ResponsePanelProps = {
  children: React.ReactNode;
  startFrame?: number;
  variant?: "normal" | "warning" | "conflict" | "refusal";
};

export const ResponsePanel: React.FC<ResponsePanelProps> = ({
  children,
  startFrame = 0,
  variant = "normal",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({ frame, fps, delay: startFrame, config: { damping: 200 } });
  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const translateX = interpolate(entrance, [0, 1], [-30, 0]);

  const borderColor =
    variant === "warning"
      ? COLORS.warning
      : variant === "conflict"
      ? COLORS.yellow
      : variant === "refusal"
      ? COLORS.gray
      : COLORS.accentDim;

  const glow =
    variant === "warning"
      ? "rgba(245, 158, 11, 0.15)"
      : variant === "conflict"
      ? "rgba(250, 204, 21, 0.15)"
      : variant === "refusal"
      ? "rgba(148, 163, 184, 0.1)"
      : "rgba(0, 153, 204, 0.15)";

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${translateX}px)`,
        paddingLeft: 40,
        marginBottom: 20,
      }}
    >
      <div
        style={{
          background: `linear-gradient(135deg, ${COLORS.panel} 0%, ${COLORS.bg} 100%)`,
          border: `1px solid ${borderColor}`,
          borderRadius: "18px 18px 18px 4px",
          padding: "28px 32px",
          maxWidth: 900,
          boxShadow: `0 4px 24px ${glow}`,
          fontFamily: FONT_FAMILY,
        }}
      >
        {/* SAKSI avatar */}
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
              width: 36,
              height: 36,
              borderRadius: 8,
              background: COLORS.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: 700,
              color: COLORS.bg,
            }}
          >
            S
          </div>
          <span style={{ color: COLORS.white, fontWeight: 600, fontSize: 22 }}>SAKSI</span>
        </div>
        {children}
      </div>
    </div>
  );
};

// ==================== Evidence Card ====================
type EvidenceCardProps = {
  id: string;
  title: string;
  timestamp?: string;
  startFrame?: number;
};

export const EvidenceCard: React.FC<EvidenceCardProps> = ({
  id,
  title,
  timestamp,
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({ frame, fps, delay: startFrame, config: { damping: 200 } });
  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const translateY = interpolate(entrance, [0, 1], [15, 0]);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "8px 0",
      }}
    >
      <div
        style={{
          background: COLORS.evidence,
          color: COLORS.white,
          padding: "3px 10px",
          borderRadius: 4,
          fontSize: 18,
          fontFamily: MONO_FAMILY,
          fontWeight: 600,
          minWidth: 80,
          textAlign: "center",
        }}
      >
        {id}
      </div>
      <span style={{ color: COLORS.gray, fontSize: 20 }}>{title}</span>
      {timestamp && (
        <span style={{ color: COLORS.grayDark, fontSize: 16, fontFamily: MONO_FAMILY }}>
          ({timestamp})
        </span>
      )}
    </div>
  );
};

// ==================== "Dijawab untuk" Footer ====================
export const DijawabFooter: React.FC<DijawabFooterProps> = ({ userId, startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({ frame, fps, delay: startFrame, config: { damping: 200 } });
  const opacity = interpolate(entrance, [0, 1], [0, 1]);

  return (
    <div
      style={{
        opacity,
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
          fontFamily: MONO_FAMILY,
          fontWeight: 600,
        }}
      >
        {userId}
      </span>
    </div>
  );
};

// ==================== Scene Label ====================
type SceneLabelProps = {
  label: string;
  number: string;
};

export const SceneLabel: React.FC<SceneLabelProps> = ({ label, number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        opacity,
        position: "absolute",
        top: 30,
        left: 50,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          background: COLORS.accent,
          color: COLORS.bg,
          padding: "4px 12px",
          borderRadius: 6,
          fontSize: 16,
          fontWeight: 700,
          fontFamily: FONT_FAMILY,
        }}
      >
        {number}
      </div>
      <span style={{ color: COLORS.gray, fontSize: 18, fontFamily: FONT_FAMILY }}>{label}</span>
    </div>
  );
};
