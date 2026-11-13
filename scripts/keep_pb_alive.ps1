# 수프리마 플랫폼: PocketBase 서버 무중단 운영 스크립트
# Rule 6: PB 자동 재시작 (서비스 등록 대안)

$PB_PATH = "C:\Users\chris\Desktop\수프리마랩\backend\backend\pocketbase.exe"
$PB_DIR = "C:\Users\chris\Desktop\수프리마랩\backend\backend"

Write-Host "Suprema PocketBase Monitoring Started..." -ForegroundColor Cyan

while($true) {
    $process = Get-Process pocketbase -ErrorAction SilentlyContinue
    if (!$process) {
        Write-Host "PocketBase is down. Restarting..." -ForegroundColor Red
        Start-Process -FilePath $PB_PATH -ArgumentList "serve" -WorkingDirectory $PB_DIR -WindowStyle Hidden
    }
    Start-Sleep -Seconds 10
}
