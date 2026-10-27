#!/bin/bash
# setup.sh — Instalasi SAKSI untuk Juri (Linux/Mac)

set -e

echo "========================================"
echo "  SAKSI — Setup untuk Juri"
echo "========================================"

# Cek Node.js
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js tidak terpasang. Install dari https://nodejs.org"
    exit 1
fi
echo "Node.js $(node -v) OK"

# Copy skill
SKILL_TARGET="$HOME/.workbuddy-ai/skills/saksi"
mkdir -p "$SKILL_TARGET"
cp -r skill/* "$SKILL_TARGET/"

# Copy example
if [ -f "$SKILL_TARGET/current-user.example.json" ]; then
    cp "$SKILL_TARGET/current-user.example.json" "$SKILL_TARGET/current-user.json"
    echo "current-user.json dibuat (default: STF-005)"
fi

# Test engine
BRAIN_USER=STF-005 node engine/ask.mjs --query "Berapa stok Amoksisilin 500mg sekarang?"

echo ""
echo "Setup selesai. Buka WorkBuddy dan ketik: /saksi <query>"