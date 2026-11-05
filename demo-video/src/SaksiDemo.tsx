import { AbsoluteFill, Series } from "remotion";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Gate } from "./scenes/Scene2Gate";
import { Scene3Evidence } from "./scenes/Scene3Evidence";
import { Scene4Refusal } from "./scenes/Scene4Refusal";
import { Scene5Conflict } from "./scenes/Scene5Conflict";
import { Scene6Injection } from "./scenes/Scene6Injection";
import { Scene7Audit } from "./scenes/Scene7Audit";
import { Scene8Install } from "./scenes/Scene8Install";

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

/**
 * Durasi tiap scene = durasi audio narasi + 1.5 detik jeda (45 frame @30fps).
 * Kalau narasi berubah, jalankan scripts/generate_tts.py lalu perbarui angka
 * di sini dan di scripts/merge_audio_natural.sh.
 *
 *   1. Hook          1128   37.6s   audio 36.12s
 *   2. Gerbang izin  1613   53.8s   audio 52.27s
 *   3. Bukti         1024   34.1s   audio 32.66s
 *   4. Penolakan     1038   34.6s   audio 33.12s
 *   5. Konflik       1056   35.2s   audio 33.72s
 *   6. Injeksi       1297   43.2s   audio 41.74s
 *   7. Jejak audit   1017   33.9s   audio 32.40s
 *   8. Pasang        1304   43.5s   audio 41.98s
 *   Total            9477  315.9s  = 5:16
 */
export const SaksiDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#050b14" }}>
      <BackgroundGradient />

      <Series>
        <Series.Sequence durationInFrames={1128}>
          <Scene1Hook />
        </Series.Sequence>

        <Series.Sequence durationInFrames={1613}>
          <Scene2Gate />
        </Series.Sequence>

        <Series.Sequence durationInFrames={1024}>
          <Scene3Evidence />
        </Series.Sequence>

        <Series.Sequence durationInFrames={1038}>
          <Scene4Refusal />
        </Series.Sequence>

        <Series.Sequence durationInFrames={1056}>
          <Scene5Conflict />
        </Series.Sequence>

        <Series.Sequence durationInFrames={1297}>
          <Scene6Injection />
        </Series.Sequence>

        <Series.Sequence durationInFrames={1017}>
          <Scene7Audit />
        </Series.Sequence>

        <Series.Sequence durationInFrames={1304}>
          <Scene8Install />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
