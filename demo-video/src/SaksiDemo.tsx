import { AbsoluteFill, Sequence, Series } from "remotion";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Architecture } from "./scenes/Scene2Architecture";
import { Scene3Evidence } from "./scenes/Scene3Evidence";
import { Scene4Refusal } from "./scenes/Scene4Refusal";
import { Scene5Conflict } from "./scenes/Scene5Conflict";
import { Scene6Injection } from "./scenes/Scene6Injection";
import { Scene7Audit } from "./scenes/Scene7Audit";
import { Scene8Outro } from "./scenes/Scene8Outro";

// Background gradient shared across all scenes
const BackgroundGradient: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at 30% 20%, #0f2b46 0%, #0a1628 40%, #050b14 100%)",
      }}
    />
  );
};

export const SaksiDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#050b14" }}>
      <BackgroundGradient />

      <Series>
        <Series.Sequence durationInFrames={1050}>
          <Scene1Hook />
        </Series.Sequence>

        <Series.Sequence durationInFrames={1140}>
          <Scene2Architecture />
        </Series.Sequence>

        <Series.Sequence durationInFrames={1050}>
          <Scene3Evidence />
        </Series.Sequence>

        <Series.Sequence durationInFrames={1050}>
          <Scene4Refusal />
        </Series.Sequence>

        <Series.Sequence durationInFrames={1080}>
          <Scene5Conflict />
        </Series.Sequence>

        <Series.Sequence durationInFrames={1320}>
          <Scene6Injection />
        </Series.Sequence>

        <Series.Sequence durationInFrames={1020}>
          <Scene7Audit />
        </Series.Sequence>

        <Series.Sequence durationInFrames={1110}>
          <Scene8Outro />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
