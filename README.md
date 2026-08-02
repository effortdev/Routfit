# Roufit — 루틴 & 체지방 트래커 (개인용)

매일의 루틴 체크리스트와 몸무게/체지방률을 수동으로 기록하고, 체지방률을 10단계로
시각화해 동기부여를 주는 개인용 웹앱. HealthKit 자동 연동 대신 수동 입력 방식으로
설계되어 완전한 웹 서비스(React/Vite + Spring Boot)로 동작함.

## 스택

- **Backend**: Java 17, Spring Boot 3.3, Spring Data JPA, Spring Security, JWT (jjwt), MySQL 8
- **Frontend**: React 18 + TypeScript + Vite, React Router, Tailwind CSS, vite-plugin-pwa
- **인증**: Google OAuth 2.0 (idToken 검증) + 자체 발급 JWT (Access/Refresh)
- **배포**: Docker Compose 3개 컨테이너 (mysql / backend / frontend) + 기존 Nginx Proxy Manager

## 폴더 구조

```
roufit/
├── backend/           # Spring Boot 프로젝트
├── frontend/          # Vite + React 프로젝트
├── docker-compose.yml
└── .env.example
```

## 구현된 기능

1. Google 로그인 + JWT 발급/재발급, 회원 프로필(키/성별) 관리
2. 루틴 CRUD + 오늘 체크/해제 + 일별 달성률 계산
3. 몸무게/체지방률 수동 입력(같은 날짜는 덮어쓰기) + 최근 30일 추이 차트
4. 체지방률 성별 기준 10단계 계산 로직 + 동심원(나이테) 시각화
5. 최근 10주 루틴 달성 히트맵 (깃허브 잔디 스타일)
6. 모바일 퍼스트 레이아웃 (하단 탭 네비게이션, 44px 이상 터치 영역, safe-area 대응)
7. PWA 설정 (홈 화면 추가 시 주소창 없이 앱처럼 실행)

## 로컬 개발 환경 실행

### 1) MySQL만 Docker로 띄우고 나머지는 로컬 실행

```bash
docker run -d --name roufit-mysql-dev \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=roufit \
  -e MYSQL_USER=roufit \
  -e MYSQL_PASSWORD=roufit \
  -p 3306:3306 mysql:8.0
```

### 2) 백엔드 실행

```bash
cd backend
export GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
export JWT_SECRET=local-dev-secret-change-me-32chars
./gradlew bootRun
```
(최초 실행 시 `gradle wrapper` 파일이 없다면 `gradle wrapper` 명령으로 생성하거나, 시스템에 설치된 gradle로 직접 실행)

### 3) 프론트엔드 실행

```bash
cd frontend
cp .env.example .env
# .env에서 VITE_API_BASE_URL=http://localhost:8080, VITE_GOOGLE_CLIENT_ID 채우기
npm install
npm run dev
```

`http://localhost:5173` 접속 후 Google 로그인.

## Google OAuth 클라이언트 발급 (필수 사전 작업)

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. OAuth 2.0 클라이언트 ID 생성 (유형: 웹 애플리케이션)
3. 승인된 자바스크립트 원본(Authorized JavaScript origins)에 다음 추가:
   - `http://localhost:5173` (로컬 개발용)
   - `https://roufit.효과적인도메인` (홈서버 배포용 실제 도메인)
4. 발급된 클라이언트 ID를 백엔드 `GOOGLE_CLIENT_ID`와 프론트 `VITE_GOOGLE_CLIENT_ID`에 동일하게 설정

## 홈서버 배포 (Docker만 설치, 서버는 이미지 pull만 함)

**핵심 구조**: GitHub Actions가 `backend/`, `frontend/`를 각각 Docker 이미지로 빌드해서
`ghcr.io`(GitHub Container Registry)에 push하고, 서버는 그 이미지를 pull 받아 실행만 해요.
즉 서버에는 소스코드, Gradle, Node 아무것도 필요 없고 **Docker + Docker Compose만 있으면 됨**.

### 1) 최초 1회 서버 세팅

```bash
mkdir -p ~/roufit && cd ~/roufit
# docker-compose.yml, .env 두 파일만 서버에 올려두면 됨 (git clone 불필요)
```

로컬에서 `docker-compose.yml`과 `.env`(값 채운 것)를 scp로 서버에 복사:
```bash
scp docker-compose.yml .env your-server-user@your-server-host:~/roufit/
```

### 2) ghcr.io 이미지가 private일 경우, 서버에서 최초 1회 로그인

`ghcr.io`에 push된 이미지는 기본적으로 private이라 서버에서 pull하려면 인증이 필요해요.
GitHub에서 `read:packages` 권한만 가진 PAT을 발급해서:
```bash
echo <PAT> | docker login ghcr.io -u effortdev --password-stdin
```
(또는 GitHub 저장소 → Packages → 각 이미지 → Package settings → Change visibility → Public으로
바꾸면 로그인 없이도 pull 가능)

### 3) GitHub Secrets 등록 (저장소 Settings → Secrets and variables → Actions)

| 이름 | 용도 |
|---|---|
| `HOME_SERVER_HOST` | 서버 IP/도메인 |
| `HOME_SERVER_USER` | SSH 접속 계정 |
| `HOME_SERVER_SSH_KEY` | SSH 개인키 |
| `VITE_API_BASE_URL` | 프론트 빌드에 주입될 백엔드 API 주소 |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth 클라이언트 ID |

(`GITHUB_TOKEN`은 별도 등록 없이 Actions가 자동으로 제공해요.)

### 4) 이후로는 push만 하면 끝

`.github/workflows/deploy-backend.yml`, `deploy-frontend.yml`이 각각:
1. 변경된 폴더(`backend/` 또는 `frontend/`)만 감지해서
2. Docker 이미지 빌드 → ghcr.io에 push
3. SSH로 서버 접속 → 해당 서비스만 `docker compose pull` + `up -d`

즉 **git push 한 번 = 해당 부분만 빌드되고 서버에 자동 반영**돼요. 서버는 그 사이에
아무 파일도 받지 않고 이미지만 새로 받아서 컨테이너를 재시작할 뿐이에요.

### 5) Nginx Proxy Manager 프록시 등록 (기존 방식과 동일)

| 도메인 | 대상 컨테이너 | 포트 |
|---|---|---|
| `roufit.내도메인` | `roufit-frontend` | 80 |
| `roufit-api.내도메인` | `roufit-backend` | 8080 |


## 알아두면 좋은 점

- **체지방률 10단계 기준**(`BodyFatLevelService.java`)은 의학적 진단 기준이 아니라
  동기부여용 커스텀 구간이에요. 본인 체형/목표에 맞게 임계값 배열을 자유롭게 조정하면 됨.
- **PWA로 홈 화면에 추가**하면 아이폰 사파리에서도 주소창 없이 거의 네이티브 앱처럼 쓸 수 있어요
  (설정 → 공유 → "홈 화면에 추가").
- 나중에 정말 HealthKit 자동 연동이 하고 싶어지면, 이 백엔드 API(`/api/v1/body-metrics`)는
  그대로 두고 React Native 앱만 별도로 추가해서 같은 서버에 데이터를 쏘는 구조로 확장 가능.
