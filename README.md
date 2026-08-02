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

## 홈서버 배포 (FIREBAT R3 + WSL2 + Docker + Nginx Proxy Manager 기준)

기존에 구축해두신 환경(WSL2, Docker, Nginx Proxy Manager, GitHub Actions SSH 배포)에
그대로 얹는 구조로 설계했음.

### 1) 서버에 프로젝트 클론 후 .env 작성

```bash
git clone <이 프로젝트 저장소> roufit
cd roufit
cp .env.example .env
# .env 안의 비밀번호/시크릿/도메인 값을 실제 값으로 교체
```

### 2) 컨테이너 빌드 및 실행

```bash
docker compose up -d --build
```

- `mysql`: 내부 네트워크에서만 접근 가능 (호스트에 포트 노출 안 함)
- `backend`: 8080 포트를 컨테이너 내부에 `expose`만 함 (host 포트 바인딩 없음)
- `frontend`: 80 포트를 컨테이너 내부에 `expose`만 함

### 3) Nginx Proxy Manager에서 프록시 호스트 2개 등록

| 도메인 | 대상 컨테이너 | 포트 |
|---|---|---|
| `roufit.내도메인` | `roufit-frontend` | 80 |
| `roufit-api.내도메인` | `roufit-backend` | 8080 |

두 도메인 모두 NPM에서 SSL(Let's Encrypt) 발급 체크. 컨테이너 이름으로 접근 가능한 건
`docker-compose.yml`의 `roufit-net` 브리지 네트워크 덕분이라, NPM 컨테이너도 같은
Docker 네트워크에 붙어 있거나 NPM이 컨테이너 이름을 resolve할 수 있어야 함
(기존에 Nginx Proxy Manager로 다른 프로젝트 배포하신 방식과 동일).

### 4) GitHub Actions로 자동 배포 연결 (선택)

`.github/workflows/deploy-backend.yml`, `deploy-frontend.yml` 두 개를 이미 넣어뒀어요.
`paths` 필터로 `backend/` 변경 시엔 백엔드만, `frontend/` 변경 시엔 프론트만 재빌드/재기동돼요.
두 시크릿(`HOME_SERVER_HOST`, `HOME_SERVER_USER`, `HOME_SERVER_SSH_KEY`)만 저장소
Settings → Secrets and variables → Actions에 등록하면 바로 동작함.


## 알아두면 좋은 점

- **체지방률 10단계 기준**(`BodyFatLevelService.java`)은 의학적 진단 기준이 아니라
  동기부여용 커스텀 구간이에요. 본인 체형/목표에 맞게 임계값 배열을 자유롭게 조정하면 됨.
- **PWA로 홈 화면에 추가**하면 아이폰 사파리에서도 주소창 없이 거의 네이티브 앱처럼 쓸 수 있어요
  (설정 → 공유 → "홈 화면에 추가").
- 나중에 정말 HealthKit 자동 연동이 하고 싶어지면, 이 백엔드 API(`/api/v1/body-metrics`)는
  그대로 두고 React Native 앱만 별도로 추가해서 같은 서버에 데이터를 쏘는 구조로 확장 가능.
