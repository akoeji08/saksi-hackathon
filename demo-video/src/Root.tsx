import { Composition } from "remotion";
import { SaksiDemo } from "./SaksiDemo";

// Scene durations matched to natural TTS audio length + 1.5s padding
// Scenes:
//   1. Hook           = 1050 frames (35.0s)  audio: 33.48s
//   2. Architecture    = 1140 frames (38.0s)  audio: 36.36s
//   3. Evidence        = 1050 frames (35.0s)  audio: 32.66s
//   4. Refusal         = 1050 frames (35.0s)  audio: 33.12s
//   5. Conflict        = 1080 frames (36.0s)  audio: 33.72s
//   6. Injection       = 1320 frames (44.0s)  audio: 41.74s
//   7. Audit Ledger    = 1020 frames (34.0s)  audio: 32.40s
//   8. Summary + Outro = 1110 frames (37.0s)  audio: 35.16s
// Total: 8820 frames = 294 seconds = 4.9 minutes

export const RemotionRoot = () => {
  return (
    <Composition
      id="SaksiDemo"
      component={SaksiDemo}
      durationInFrames={8820}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
