# ProNetwork - 전문가 네트워킹 플랫폼

링크드인과 유사한 전문가 네트워킹 플랫폼입니다. 사용자 프로필, 경력 관리, 게시물 피드, 네트워크 연결 등의 기능을 제공합니다.

## 🌐 URL

- **개발 서버**: https://3000-ii5rtpcf2fh15ealmj4kc-2e1b9533.sandbox.novita.ai
- **로그인 페이지**: https://3000-ii5rtpcf2fh15ealmj4kc-2e1b9533.sandbox.novita.ai/login
- **새 로그인 페이지 (한국 쇼핑몰 스타일)**: https://3000-ii5rtpcf2fh15ealmj4kc-2e1b9533.sandbox.novita.ai/login-new
- **회원가입 페이지**: https://3000-ii5rtpcf2fh15ealmj4kc-2e1b9533.sandbox.novita.ai/register
- **API 엔드포인트**: https://3000-ii5rtpcf2fh15ealmj4kc-2e1b9533.sandbox.novita.ai/api

## ✅ 완성된 기능

### 1. 사용자 인증 (UPDATED! 🎉)
- **로그인 페이지**: 
  - 기본 로그인 페이지 (/login)
  - **새로운 한국 쇼핑몰 스타일** (/login-new):
    - 좌우 2단 레이아웃
    - 회원 혜택 안내 섹션 (4가지 혜택 강조)
    - 서비스 미리보기 이미지
    - 이용약관 및 개인정보 처리방침 모달
    - 헤더 및 푸터 포함
- **회원가입 페이지**: 약관 동의 및 비밀번호 강도 표시
- 이메일/비밀번호 기반 인증
- LocalStorage 기반 세션 관리
- 로그아웃 기능
- 소셜 로그인 UI (Google, Facebook - 향후 연동 예정)

### 2. 사용자 프로필 관리
- 사용자 기본 정보 (이름, 이메일, 헤드라인, 프로필 이미지)
- 자기 소개 (About)
- 위치 및 웹사이트 정보

### 3. 경력 및 학력 관리
- 경력 사항 추가/조회 (회사명, 직책, 기간, 설명)
- 학력 사항 추가/조회 (학교명, 학위, 전공, 기간)
- 현재 재직 중 표시

### 4. 스킬 관리
- 스킬 등록 및 조회
- 스킬별 추천(Endorsement) 수 표시

### 5. 게시물 피드
- 게시물 작성 (텍스트, 이미지)
- 게시물 목록 조회 (전체 피드)
- 사용자별 게시물 조회
- 좋아요 기능
- 댓글 기능

### 6. 네트워크 연결
- 다른 사용자 검색 및 발견
- 연결 요청 보내기
- 연결 수락/거부
- 내 연결 목록 조회

### 7. 사용자 인터페이스
- 반응형 디자인 (Tailwind CSS)
- 홈 피드 페이지
- 네트워크 페이지 (사용자 검색)
- 프로필 상세 페이지
- 실시간 댓글 표시

## 📊 데이터 모델

### 주요 테이블
- **users**: 사용자 기본 정보
- **profiles**: 사용자 프로필 상세 정보
- **experiences**: 경력 사항
- **education**: 학력 사항
- **skills**: 스킬 및 추천
- **posts**: 게시물
- **post_likes**: 게시물 좋아요
- **comments**: 댓글
- **connections**: 사용자 간 연결 관계
- **messages**: 메시지 (미구현)

### 저장소 서비스
- **Cloudflare D1**: SQLite 기반 관계형 데이터베이스
- 로컬 개발: `.wrangler/state/v3/d1`에 자동 생성

## 📝 기능별 API 엔드포인트

### 인증 (NEW! 🎉)
- `POST /api/auth/login` - 로그인
- `POST /api/auth/register` - 회원가입

### 사용자 관리
- `GET /api/users` - 전체 사용자 목록 조회
- `GET /api/users/:id` - 특정 사용자 상세 조회
- `GET /api/users/:id/experiences` - 사용자 경력 조회
- `GET /api/users/:id/education` - 사용자 학력 조회
- `GET /api/users/:id/skills` - 사용자 스킬 조회
- `GET /api/users/:id/posts` - 사용자 게시물 조회
- `GET /api/users/:id/connections` - 사용자 연결 목록

### 게시물 관리
- `GET /api/posts` - 전체 게시물 피드 조회
- `POST /api/posts` - 새 게시물 작성
- `POST /api/posts/:id/like` - 게시물 좋아요
- `GET /api/posts/:id/comments` - 게시물 댓글 조회
- `POST /api/posts/:id/comments` - 댓글 작성

### 네트워크 관리
- `POST /api/connections` - 연결 요청 보내기
- `PUT /api/connections/:id` - 연결 수락/거부

## 🎯 아직 구현되지 않은 기능

### 1. JWT 토큰 기반 인증
- JWT 토큰 발급 및 검증
- 보호된 API 라우트
- 토큰 갱신 (Refresh Token)
- 비밀번호 암호화 (bcrypt) - 현재는 데모용 간단 인증

### 2. 실시간 메시징
- 1:1 메시지 전송
- 메시지 읽음 표시
- 메시지 알림

### 3. 알림 시스템
- 연결 요청 알림
- 게시물 좋아요/댓글 알림
- 메시지 알림

### 4. 검색 기능
- 사용자 이름으로 검색
- 스킬로 검색
- 회사/학교로 검색

### 5. 프로필 편집
- 프로필 정보 수정
- 경력/학력 추가/수정/삭제
- 스킬 추가/삭제
- 프로필 이미지 업로드

### 6. 게시물 고급 기능
- 이미지 업로드 (Cloudflare R2)
- 게시물 수정/삭제
- 게시물 공유
- 해시태그 기능

### 7. 추천 시스템
- 사용자 추천 (스킬 기반)
- 게시물 추천 (관심사 기반)
- 연결 추천

## 🚀 추천 개발 단계

### Phase 1: JWT 토큰 인증 강화 (우선순위: 높음)
1. JWT 토큰 발급 및 검증 미들웨어
2. bcrypt를 사용한 비밀번호 해싱
3. 보호된 API 라우트 설정
4. Refresh Token 구현

### Phase 2: 프로필 편집 (우선순위: 높음)
1. 프로필 정보 수정 API
2. 경력/학력 CRUD API
3. 스킬 추가/삭제 API
4. 프론트엔드 편집 폼 구현

### Phase 3: 이미지 업로드 (우선순위: 중간)
1. Cloudflare R2 버킷 설정
2. 프로필 이미지 업로드 API
3. 게시물 이미지 업로드 API
4. 이미지 리사이징 및 최적화

### Phase 4: 검색 기능 (우선순위: 중간)
1. 사용자 검색 API (이름, 스킬, 회사)
2. 전체 텍스트 검색 구현
3. 검색 필터 및 정렬
4. 자동완성 기능

### Phase 5: 알림 시스템 (우선순위: 중간)
1. 알림 테이블 추가
2. 알림 생성 로직 (좋아요, 댓글, 연결)
3. 알림 조회/읽음 표시 API
4. 실시간 알림 (WebSocket 또는 폴링)

### Phase 6: 메시징 시스템 (우선순위: 낮음)
1. 메시지 전송 API
2. 메시지 조회 API
3. 대화 목록
4. 실시간 메시지 (WebSocket)

### Phase 7: 고급 기능 (우선순위: 낮음)
1. 게시물 수정/삭제
2. 게시물 공유 기능
3. 해시태그 및 멘션
4. 추천 알고리즘 구현

## 💻 기술 스택

- **프레임워크**: Hono (경량 웹 프레임워크)
- **런타임**: Cloudflare Workers
- **데이터베이스**: Cloudflare D1 (SQLite)
- **프론트엔드**: Vanilla JavaScript + Tailwind CSS
- **HTTP 클라이언트**: Axios
- **아이콘**: Font Awesome
- **개발 도구**: Vite, Wrangler, PM2

## 🛠️ 로컬 개발

### 설치
```bash
npm install
```

### 데이터베이스 마이그레이션
```bash
# 로컬 D1 데이터베이스 마이그레이션
npm run db:migrate:local

# 테스트 데이터 삽입
npm run db:seed

# 데이터베이스 초기화 (리셋)
npm run db:reset
```

### 개발 서버 실행
```bash
# 빌드
npm run build

# PM2로 서버 시작
pm2 start ecosystem.config.cjs

# 서버 상태 확인
pm2 list

# 로그 확인
pm2 logs webapp --nostream

# 서버 재시작
npm run clean-port && pm2 restart webapp

# 서버 종료
pm2 delete webapp
```

### 테스트
```bash
# API 테스트
curl http://localhost:3000/api/users
curl http://localhost:3000/api/posts
```

## 📦 배포

### Cloudflare Pages 배포 (Production)
```bash
# 1. Cloudflare API 키 설정 (setup_cloudflare_api_key 호출 필요)

# 2. D1 데이터베이스 생성
npx wrangler d1 create webapp-production

# 3. wrangler.jsonc에 database_id 업데이트

# 4. 프로덕션 마이그레이션
npm run db:migrate:prod

# 5. 배포
npm run deploy:prod
```

## 📚 사용자 가이드

### 0. 로그인/회원가입 (NEW! 🎉)
1. **로그인**: `/login` 페이지에서 이메일과 비밀번호 입력
   - 데모 계정: john.doe@example.com (비밀번호는 임의)
2. **회원가입**: `/register` 페이지에서 필수 정보 입력
   - 이름, 이메일, 비밀번호, 한 줄 소개
   - 약관 동의 체크
3. **로그아웃**: 상단 메뉴의 로그아웃 버튼 클릭

### 1. 홈 피드
- 메인 페이지에서 모든 사용자의 게시물을 볼 수 있습니다
- 상단 텍스트 영역에 내용을 입력하고 "게시" 버튼을 클릭하여 게시물을 작성합니다
- 각 게시물에서 좋아요, 댓글, 공유 버튼을 사용할 수 있습니다
- 댓글 버튼을 클릭하면 댓글을 보고 작성할 수 있습니다

### 2. 네트워크
- 상단 메뉴에서 "네트워크"를 클릭합니다
- 다른 사용자 목록을 볼 수 있습니다
- "연결" 버튼을 클릭하여 연결 요청을 보냅니다
- 검색창에서 사용자를 검색할 수 있습니다 (향후 구현 예정)

### 3. 프로필 보기
- 사용자 이름을 클릭하면 해당 사용자의 프로필 페이지로 이동합니다
- 프로필에서 다음 정보를 볼 수 있습니다:
  - 기본 정보 (이름, 헤드라인, 위치)
  - 소개
  - 경력 사항
  - 학력 사항
  - 스킬
  - 활동 (게시물)

### 4. 추천 연결
- 오른쪽 사이드바에서 추천 연결을 볼 수 있습니다
- 사용자 이름을 클릭하여 프로필을 확인하거나
- "+" 버튼을 클릭하여 바로 연결 요청을 보낼 수 있습니다

## 📝 최근 업데이트

- **2026-02-20 (업데이트 2)**: 한국 쇼핑몰 스타일 로그인 페이지 추가 🛍️
  - 좌우 2단 레이아웃 디자인
  - 회원 혜택 안내 섹션 (무제한 네트워킹, 커리어 도구, 맞춤 알림, 인사이트 분석)
  - 서비스 미리보기 이미지 및 기능 소개
  - 이용약관 및 개인정보 처리방침 모달 창
  - 전문적인 헤더 및 푸터 디자인
  - 아이디/비밀번호 찾기 링크
- **2026-02-20 (업데이트 1)**: 로그인/회원가입 기능 추가 🎉
  - 전문적인 디자인의 로그인 페이지 구현
  - 회원가입 페이지 (비밀번호 강도 표시, 약관 동의)
  - 인증 API (로그인/회원가입)
  - LocalStorage 기반 세션 관리
  - 로그아웃 기능
- **2026-02-20**: 초기 버전 완성
  - 사용자 프로필, 경력, 학력, 스킬 관리
  - 게시물 피드 및 댓글 기능
  - 네트워크 연결 기능
  - 반응형 UI 구현

## 🔄 배포 상태

- **플랫폼**: Cloudflare Pages (로컬 개발 완료)
- **상태**: 🟢 한국 쇼핑몰 스타일 로그인 완료
- **기술 스택**: Hono + TypeScript + Cloudflare D1 + Tailwind CSS
- **마지막 업데이트**: 2026-02-20

## 📄 라이선스

MIT License
