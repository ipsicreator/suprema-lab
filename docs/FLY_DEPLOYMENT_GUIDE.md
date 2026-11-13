# Fly.io PocketBase 배포 가이드

수프리마 플랫폼의 24/7 안정적인 운영을 위해 PocketBase를 Fly.io에 배포하는 절차입니다.

## 1. 사전 준비 (Local)

### 1-1. Fly CLI 설치 및 로그인
Fly.io를 처음 사용하신다면 CLI를 설치하고 로그인해야 합니다.
```powershell
# 설치 (Windows PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# 로그인
fly auth login
```

### 1-2. Linux용 PocketBase 바이너리 준비
Fly.io(Linux 환경)에서 실행될 PocketBase 바이너리가 필요합니다. 
프로젝트 루트에서 다음 준비 스크립트를 실행해 주세요.
```powershell
./scripts/prepare-fly.ps1
```
이 스크립트는 `fly/pocketbase/pocketbase` 위치에 Linux용 실행 파일을 다운로드하고 압축을 풉니다.

---

## 2. Fly.io 인프라 설정

### 2-1. 앱 생성
이미 앱 이름이 결정되었다면(예: `ipsidna-prism-pb`) 다음 명령어를 실행합니다.
```powershell
fly launch --name suprima-platform-pb --region nrt --no-deploy
```

### 2-2. 데이터 보존을 위한 볼륨 생성
PocketBase의 데이터를 영구적으로 저장할 1GB 볼륨을 생성합니다.
```powershell
fly volumes create pb_data --size 1 --region nrt
```

---

## 3. 배포 (Deploy)

이제 모든 준비가 끝났습니다. 배포를 시작합니다.
```powershell
fly deploy --config fly/pocketbase/fly.toml
```

배포가 완료되면 `https://suprima-platform-pb.fly.dev/_/` 경로를 통해 어드민 패널에 접속할 수 있습니다.

---

## 4. Next.js 연동 설정

Vercel 또는 다른 환경에 배포된 Next.js 앱에서 이 PocketBase를 사용하려면 환경 변수를 설정해야 합니다.

**환경 변수 추가:**
- `NEXT_PUBLIC_PB_URL`: `https://suprima-platform-pb.fly.dev`



---

## 5. 주의사항
- **Admin 계정 설정**: 처음 배포 후 즉시 Admin 계정을 생성하여 보안을 확보하세요.
- **포트 설정**: `fly.toml`에서 `internal_port = 8080`으로 설정되어 있는지 확인하세요 (Dockerfile의 CMD와 일치해야 함).
