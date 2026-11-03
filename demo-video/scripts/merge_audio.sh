#!/bin/bash
# Merge TTS audio with SAKSI demo video
# Uses Remotion's bundled ffmpeg to:
# 1. Pad/adjust each scene audio to match scene duration
# 2. Concatenate all audio into one track
# 3. Mux with existing video MP4

set -e

FFMPEG="C:/saksi-hackathon/demo-video/node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe"
FFPROBE="C:/saksi-hackathon/demo-video/node_modules/@remotion/compositor-win32-x64-msvc/ffprobe.exe"

AUDIO_DIR="C:/saksi-hackathon/demo-video/out/audio"
WORK_DIR="C:/saksi-hackathon/demo-video/out/audio_work"
OUT_DIR="C:/saksi-hackathon/demo-video/out"

mkdir -p "$WORK_DIR"

# Scene durations in seconds (frames / 30fps)
declare -A SCENE_DUR
SCENE_DUR[1]=20.0
SCENE_DUR[2]=30.0
SCENE_DUR[3]=35.0
SCENE_DUR[4]=30.0
SCENE_DUR[5]=25.0
SCENE_DUR[6]=30.0
SCENE_DUR[7]=25.0
SCENE_DUR[8]=15.0

echo "=== Step 1: Adjust each audio to fit scene duration ==="

for i in 1 2 3 4 5 6 7 8; do
  INPUT="$AUDIO_DIR/scene${i}.mp3"
  OUTPUT="$WORK_DIR/scene${i}_padded.wav"

  # Get actual audio duration
  AUDIO_DUR=$("$FFPROBE" -v quiet -show_entries format=duration -of csv=p=0 "$INPUT" 2>/dev/null)
  TARGET_DUR=${SCENE_DUR[$i]}

  echo "  Scene $i: audio=${AUDIO_DUR}s, target=${TARGET_DUR}s"

  # Calculate atempo factor (speed up to fit)
  # atempo range: 0.5 - 100.0, but keep reasonable (< 1.5x)
  TEMPO=$(python -c "print(f'{${AUDIO_DUR}/${TARGET_DUR}:.6f}')")
  echo "    -> atempo=${TEMPO}"

  # Apply atempo to speed up, then pad with silence to exact duration
  "$FFMPEG" -y -i "$INPUT" \
    -filter:a "atempo=${TEMPO},apad=pad_dur=0" \
    -t "$TARGET_DUR" \
    -ar 44100 -ac 2 \
    "$OUTPUT" 2>&1 | tail -3

  echo "    -> Output: $(ls -la "$OUTPUT" 2>/dev/null | awk '{print $5}') bytes"
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
  "$FULL_AUDIO" 2>&1 | tail -5

FULL_DUR=$("$FFPROBE" -v quiet -show_entries format=duration -of csv=p=0 "$FULL_AUDIO" 2>/dev/null)
echo "  Full audio duration: ${FULL_DUR}s"

echo ""
echo "=== Step 4: Mux audio with video ==="
VIDEO_IN="$OUT_DIR/saksi-demo.mp4"
VIDEO_OUT="$OUT_DIR/saksi-demo-with-audio.mp4"

"$FFMPEG" -y -i "$VIDEO_IN" -i "$FULL_AUDIO" \
  -c:v copy -c:a aac -b:a 192k \
  -map 0:v:0 -map 1:a:0 \
  -shortest \
  "$VIDEO_OUT" 2>&1 | tail -10

echo ""
echo "=== Done! ==="
ls -la "$VIDEO_OUT"
FINAL_DUR=$("$FFPROBE" -v quiet -show_entries format=duration -of csv=p=0 "$VIDEO_OUT" 2>/dev/null)
echo "Final video duration: ${FINAL_DUR}s"
echo "Output: $VIDEO_OUT"
