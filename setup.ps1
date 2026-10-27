# setup.ps1 — Instalasi SAKSI untuk Juri / Reviewer
# Jalankan: .\setup.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SAKSI — Setup untuk Juri" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# === Cek Node.js ===
Write-Host "[1/4] Cek Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node -v
    Write-Host "      Node.js $nodeVersion OK" -ForegroundColor Green
} catch {
    Write-Host "      ERROR: Node.js tidak terpasang." -ForegroundColor Red
    Write-Host "      Install dari https://nodejs.org (versi LTS)" -ForegroundColor Red
    exit 1
}

# === Cek WorkBuddy Desktop ===
Write-Host "[2/4] Cek WorkBuddy Desktop..." -ForegroundColor Yellow
$workbuddyPath = "$env:USERPROFILE\.workbuddy-ai"
if (Test-Path $workbuddyPath) {
    Write-Host "      WorkBuddy terdeteksi di $workbuddyPath" -ForegroundColor Green
} else {
    Write-Host "      WARNING: WorkBuddy tidak terdeteksi." -ForegroundColor Yellow
    Write-Host "      Jika belum install, download dari Tencent Cloud." -ForegroundColor Yellow
    Write-Host "      Lanjut setup engine standalone..." -ForegroundColor Yellow
}

# === Copy Skill ke WorkBuddy ===
Write-Host "[3/4] Install skill ke WorkBuddy..." -ForegroundColor Yellow
$skillTarget = "$env:USERPROFILE\.workbuddy-ai\skills\saksi"
$skillSource = Join-Path $PSScriptRoot "skill"

if (Test-Path $skillSource) {
    # Buat folder target jika belum ada
    New-Item -ItemType Directory -Force -Path $skillTarget | Out-Null
    
    # Copy semua file skill
    Copy-Item -Recurse -Force "$skillSource\*" $skillTarget
    
    # Copy current-user.example.json → current-user.json
    $examplePath = Join-Path $skillTarget "current-user.example.json"
    $currentPath = Join-Path $skillTarget "current-user.json"
    
    if (Test-Path $examplePath) {
        Copy-Item -Force $examplePath $currentPath
        Write-Host "      Skill terinstall di $skillTarget" -ForegroundColor Green
        Write-Host "      current-user.json dibuat (default: STF-005)" -ForegroundColor Green
    } else {
        Write-Host "      WARNING: current-user.example.json tidak ditemukan" -ForegroundColor Yellow
    }
} else {
    Write-Host "      ERROR: Folder skill tidak ditemukan di $skillSource" -ForegroundColor Red
    exit 1
}

# === Test Engine Standalone ===
Write-Host "[4/4] Test engine standalone..." -ForegroundColor Yellow
$env:BRAIN_USER = "STF-005"
$enginePath = Join-Path $PSScriptRoot "engine\ask.mjs"

try {
    $result = node $enginePath --query "Berapa stok Amoksisilin 500mg sekarang?" 2>&1
    if ($result -match "TERVERIFIKASI") {
        Write-Host "      Engine berjalan dengan baik" -ForegroundColor Green
    } else {
        Write-Host "      WARNING: Output tidak sesuai harapan:" -ForegroundColor Yellow
        Write-Host $result -ForegroundColor Gray
    }
} catch {
    Write-Host "      ERROR: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    $env:BRAIN_USER = $null
}

# === Selesai ===
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Selesai" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Langkah selanjutnya:" -ForegroundColor White
Write-Host "  1. Buka WorkBuddy Desktop" -ForegroundColor White
Write-Host "  2. Klik chat baru (New Chat)" -ForegroundColor White
Write-Host "  3. Ketik:" -ForegroundColor White
Write-Host ""
Write-Host '     /saksi Berapa stok Amoksisilin 500mg sekarang?' -ForegroundColor Cyan
Write-Host ""
Write-Host "Atau test engine langsung:" -ForegroundColor White
Write-Host '  $env:BRAIN_USER="STF-005"' -ForegroundColor Cyan
Write-Host '  node engine\ask.mjs --query "Jam berapa poli buka?"' -ForegroundColor Cyan
Write-Host ""
Write-Host "Ganti user (untuk demo multi-role):" -ForegroundColor White
Write-Host '  Edit file:' -ForegroundColor White
Write-Host "  $env:USERPROFILE\.workbuddy-ai\skills\saksi\current-user.json" -ForegroundColor Cyan
Write-Host ""