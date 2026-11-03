#!/bin/bash
# Merge natural-tempo TTS audio with re-rendered SAKSI demo video
# NO atempo speedup - audio plays at natural pace
# Each scene's audio is padded with silence to match the scene's frame duration

set -e

FFMPEG="C:/saksi-hackathon/demo-video/node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe"
FFPROBE="C:/saksi-hackathon/demo-video/node_modules/@remotion/compositor-win32-x64-msvc/ffprobe.exe"

AUDIO_DIR="C:/saksi-hackathon/demo-video/out/audio"
WORK_DIR="C:/saksi-hackathon/demo-video/out/audio_work2"
OUT_DIR="C:/saksi-hackathon/demo-video/out"

mkdir -p "$WORK_DIR"

# Scene durations in seconds (frames / 30fps) - matches new Root.tsx
declare -A SCENE_DUR
SCENE_DUR[1]=35.0   # 1050 frames
SCENE_DUR[2]=38.0   # 1140 frames
SCENE_DUR[3]=35.0   # 1050 frames
SCENE_DUR[4]=35.0   # 1050 frames
SCENE_DUR[5]=36.0   # 1080 frames
SCENE_DUR[6]=44.0   # 1320 frames
SCENE_DUR[7]=34.0   # 1020 frames
SCENE_DUR[8]=37.0   # 1110 frames

echo "=== Step 1: Pad each audio with silence to match scene duration (NO speedup) ==="

for i in 1 2 3 4 5 6 7 8; do
  INPUT="$AUDIO_DIR/scene${i}.mp3"
  OUTPUT="$WORK_DIR/scene${i}_padded.wav"
  TARGET_DUR=${SCENE_DUR[$i]}

  # Get actual audio duration
  AUDIO_DUR=$("$FFPROBE" -v quiet -show_entries format=duration -of csv=p=0 "$INPUT" 2>/dev/null)
  echo "  Scene $i: audio=${AUDIO_DUR}s -> target=${TARGET_DUR}s (pad with silence)"

  # Pad audio with silence at the end to match target duration
  # No atempo - natural tempo preserved!
  "$FFMPEG" -y -i "$INPUT" \
    -af "apad" \
    -t "$TARGET_DUR" \
    -ar 44100 -ac 2 -c:a pcm_s16le \
    "$OUTPUT" 2>&1 | tail -2

  echo "    -> $(ls -la "$OUTPUT" | awk '{print $5}') bytes"
done

echo ""
echo "=== Step 2: Create concat list ==="
CONCAT_FILE="$WORK_DIR/concat.txt"
> "$CONCAT_FILE"
for i in 1 2 3 4 5 6 7 8; do
  echo "file 'scene${i}_padded.wav'" >> "$CONCAT_FILE"
done
cat "$CONCAT_FILE"

echo ""
echo "=== Step 3: Concatenate all audio ==="
FULL_AUDIO="$WORK_DIR/full_narration.wav"
"$FFMPEG" -y -f concat -safe 0 -i "$CONCAT_FILE" \
  -ar 44100 -ac 2 -c:a pcm_s16le \
  "$FULL_AUDIO" 2>&1 | tail -3

FULL_DUR=$("$FFPROBE" -v quiet -show_entries format=duration -of csv=p=0 "$FULL_AUDIO" 2>/dev/null)
echo "  Full audio duration: ${FULL_DUR}s"

echo ""
echo "=== Step 4: Mux audio with video ==="
VIDEO_IN="$OUT_DIR/saksi-demo-video-only.mp4"
VIDEO_OUT="$OUT_DIR/saksi-demo-final.mp4"

"$FFMPEG" -y -i "$VIDEO_IN" -i "$FULL_AUDIO" \
  -c:v copy -c:a aac -b:a 192k \
  -map 0:v:0 -map 1:a:0 \
  -shortest \
  "$VIDEO_OUT" 2>&1 | tail -5

echo ""
echo "=== Done! ==="
ls -la "$VIDEO_OUT"
FINAL_DUR=$("$FFPROBE" -v quiet -show_entries format=duration -of csv=p=0 "$VIDEO_OUT" 2>/dev/null)
echo "Final video duration: ${FINAL_DUR}s"
echo "Output: $VIDEO_OUT"
