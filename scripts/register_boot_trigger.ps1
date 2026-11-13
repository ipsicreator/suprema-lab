# 수프리마 24/7 무중단 구동 작업 스케줄러 등록 스크립트
$TaskName = "Suprema_247_Watchdog"
$ActionPath = "C:\Users\chris\Desktop\수프리마랩\start_suprima_247.bat"
$WorkingDirectory = "C:\Users\chris\Desktop\수프리마랩"

# 기존 작업이 있으면 삭제
Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue

# 1. 실행할 동작 설정 (배치 파일 실행)
$Action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"$ActionPath`"" -WorkingDirectory $WorkingDirectory

# 2. 트리거 설정 (시스템 시작 시)
$Trigger = New-ScheduledTaskTrigger -AtStartup

# 3. 설정 (전원 연결 시에만 실행 옵션 해제 등)
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Days 365)

# 4. 작업 등록 (가장 높은 권한으로, 사용자 로그인 여부 관계없이 실행)
# 참고: 로그인 여부 관계없이 실행하려면 암호가 필요할 수 있으므로, 
# 여기서는 가장 안정적인 '가장 높은 권한으로 로그인 시' 트리거도 함께 추가하거나 
# 시스템 계정(SYSTEM)으로 등록하는 방식을 고려합니다.
Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -RunLevel Highest -User "SYSTEM"

echo "--------------------------------------------------"
echo "수프리마 24/7 시스템 부팅 트리거 등록 완료!"
echo "이제 랩탑이 켜지면 로그인 없이도 수프리마가 자동 실행됩니다."
echo "--------------------------------------------------"
