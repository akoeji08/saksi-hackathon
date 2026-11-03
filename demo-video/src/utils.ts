import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

// Colors for the SAKSI brand
export const COLORS = {
  bg: "#050b14",
  panel: "#0f2b46",
  panelLight: "#1a3a5c",
  accent: "#00d4ff",
  accentDim: "#0099cc",
  green: "#22c55e",
  red: "#ef4444",
  yellow: "#facc15",
  orange: "#fb923c",
  white: "#f8fafc",
  gray: "#94a3b8",
  grayDark: "#475569",
  evidence: "#3b82f6",
  warning: "#f59e0b",
  masked: "#fbbf24",
};

// Typography
export const FONT_FAMILY = "'Inter', 'Segoe UI', system-ui, sans-serif";
export const MONO_FAMILY = "'JetBrains Mono', 'Consolas', 'Courier New', monospace";

// Fade in helper
export const useFadeIn = (delay: number = 0, duration: number = 15) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [delay, delay + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

// Spring entrance helper
export const useSpringEntrance = (delay: number = 0, damping: number = 200) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame,
    fps,
    delay,
    config: { damping },
  });
};

// Slide in from bottom
export const useSlideUp = (delay: number = 0, distance: number = 40) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame, fps, delay, config: { damping: 200 } });
  return interpolate(progress, [0, 1], [distance, 0]);
};

// Typewriter effect
export const useTypewriter = (text: string, startFrame: number, charsPerFrame: number = 1) => {
  const frame = useCurrentFrame();
  const charsToShow = Math.max(0, Math.floor((frame - startFrame) * charsPerFrame));
  return text.slice(0, Math.min(charsToShow, text.length));
};

// Blinking cursor
export const useBlinkingCursor = (startFrame: number, text: string, charsPerFrame: number = 1) => {
  const frame = useCurrentFrame();
  const fullText = useTypewriter(text, startFrame, charsPerFrame);
  const isComplete = fullText.length >= text.length;
  const showCursor = isComplete ? Math.floor(frame / 15) % 2 === 0 : true;
  return { text: fullText, cursor: showCursor ? "|" : "" };
};
