# CHON-Network Database Summary

## 📊 데이터베이스 구조 요약

이 문서는 CHON-Network 플랫폼의 데이터베이스 구조를 한눈에 파악할 수 있도록 요약한 문서입니다.

---

## 🎯 전체 개요

| 항목 | 수량 | 비고 |
|------|------|------|
| **총 테이블 수** | 44개 | 6개 카테고리 |
| **총 인덱스 수** | 70+개 | 성능 최적화 |
| **마이그레이션 파일** | 6개 | 버전 관리 |
| **관계 타입** | 3가지 | 1:1, 1:N, M:N |
| **데이터베이스** | Cloudflare D1 | SQLite 기반 |

---

## 📦 카테고리별 테이블 현황

### 1️⃣ 사용자 & 프로필 (5개 테이블)
```
users ─┬─ profiles
       ├─ experiences
       ├─ education
       └─ skills
```

**핵심 기능**
- 회원 가입/로그인
- 프로필 관리
- 경력 관리
- 학력 관리
- 기술 스킬 관리

---

### 2️⃣ 소셜 네트워크 (7개 테이블)
```
posts ─┬─ post_likes
       ├─ comments
       ├─ post_shares
       └─ post_hashtags ─ hashtags

connections (users ↔ users)
```

**핵심 기능**
- 게시물 작성/수정/삭제
- 좋아요/댓글/공유
- 해시태그 시스템
- 사용자 연결 (팔로우)
- 트렌딩 해시태그

---

### 3️⃣ 노드 시스템 (10개 테이블)
```
node_types ─ nodes ─┬─ node_roles
                    ├─ node_memberships ─ membership_verifications
                    ├─ node_connections
                    ├─ node_invitations
                    └─ node_activity_logs

relationship_levels (레벨 정의)
```

**핵심 기능**
- 그룹/조직 생성 (학교, 직장, 동호회)
- 멤버십 관리
- 역할/권한 시스템
- 관계 레벨 (1-5단계)
- 상호 인증 시스템
- 노드 간 연결
- 초대 링크

**노드 타입**
- 🏠 가족 (family)
- 🎓 학교 (school)
- 🏢 직장 (company)
- 👥 동호회 (club)
- 💬 커뮤니티 (community)
- ⭐ 팬클럽 (fanclub)

**관계 레벨**
- Level 1: 대기 (pending)
- Level 2: 연결 (connected)
- Level 3: 활동 (active)
- Level 4: 리더 (leader)
- Level 5: 공인 (verified)

---

### 4️⃣ 가족 트리 (7개 테이블)
```
users ─ family_members ─┬─ contact_info
                        ├─ family_relationships
                        ├─ relationship_verifications
                        ├─ marriage_events
                        ├─ family_profiles
                        └─ privacy_settings
```

**핵심 기능**
- 가족 구성원 관리
- 가족 관계 정의 (부모, 자식, 형제, 배우자)
- 관계 인증 시스템
- 연락처 관리
- 결혼 정보
- 개인정보 공개 설정

---

### 5️⃣ 가족 고급 기능 (7개 테이블)
```
family_members ─┬─ family_albums ─ family_photos ─ photo_tags
                ├─ family_events ─ event_participants
                └─ family_invitations ─ invitation_acceptances
```

**핵심 기능**
- 가족 앨범
- 사진 업로드/태그
- 가족 이벤트 타임라인 (생일, 결혼, 졸업 등)
- 초대 링크 생성
- PNG 가계도 내보내기

---

### 6️⃣ 알림 & 메시징 (4개 테이블)
```
users ─┬─ notifications
       ├─ notification_preferences
       ├─ messages
       └─ search_history
```

**핵심 기능**
- 실시간 알림 시스템 (8가지 타입)
- 알림 설정 관리
- 1:1 메시지
- 검색 기록

**알림 타입**
- 연결 요청 (connection_request)
- 연결 수락 (connection_accepted)
- 게시물 좋아요 (post_like)
- 게시물 댓글 (post_comment)
- 노드 초대 (node_invitation)
- 가족 인증 (family_verification)
- 이벤트 알림 (event_reminder)
- 멘션 (mention)

---

## 🔗 주요 관계도

### 데이터 흐름
```
┌─────────────┐
│   users     │ (중심 엔티티)
└──────┬──────┘
       │
       ├──────────┬──────────┬──────────┐
       │          │          │          │
    posts    connections  nodes    family_members
       │          │          │          │
       │          │          │          │
    likes     followers  memberships  relationships
```

### 핵심 관계
- **users ↔ family_members**: 1:1 (선택적)
- **users ↔ posts**: 1:N
- **users ↔ nodes**: M:N (through node_memberships)
- **posts ↔ hashtags**: M:N (through post_hashtags)
- **family_members ↔ family_members**: M:N (relationships)

---

## 📈 성능 최적화

### 인덱스 전략
- **70+ 인덱스** 활용
- **복합 인덱스**: 자주 조회되는 패턴
- **부분 인덱스**: 조건부 데이터만
- **외래키 인덱스**: 모든 FK에 인덱스

### 쿼리 최적화
- **N+1 문제 해결**: JOIN 사용
- **Keyset Pagination**: 빠른 페이징
- **카운터 캐싱**: likes_count, member_count
- **Prepared Statements**: 쿼리 재사용

### Cloudflare D1 최적화
- **배치 작업**: DB.batch() 사용
- **읽기 최적화**: .first(), .raw() 활용
- **캐싱**: 애플리케이션 레벨

---

## 🎨 데이터 무결성

### Cascade 규칙
- **ON DELETE CASCADE**: 부모 삭제 시 자식도 삭제
  - users → 모든 관련 데이터
  - nodes → node_memberships, roles
  - posts → likes, comments
  
### Unique 제약
- (follower_id, following_id) - 중복 연결 방지
- (post_id, user_id) - 중복 좋아요 방지
- (node_id, user_id) - 중복 멤버십 방지

### Check 제약
- gender IN ('male', 'female')
- status IN ('pending', 'approved', 'rejected')
- relationship_level BETWEEN 1 AND 5
- visibility IN ('public', 'private', 'invite_only')

---

## 📊 주요 통계 필드

### 카운터 필드
- `posts.likes_count` - 좋아요 수
- `posts.comments_count` - 댓글 수
- `nodes.member_count` - 멤버 수
- `hashtags.usage_count` - 사용 횟수
- `node_memberships.verification_count` - 인증 횟수
- `node_memberships.activity_score` - 활동 점수

### 타임스탬프
- `created_at` - 생성일시 (모든 테이블)
- `updated_at` - 수정일시 (주요 테이블)
- `verified_at` - 인증일시
- `joined_at` - 가입일시
- `left_at` - 탈퇴일시

---

## 🔐 보안 & 개인정보

### 비밀번호
- `users.password_hash`: 암호화된 비밀번호 저장

### 개인정보 보호
- `privacy_settings`: 필드별 공개 설정
- `family_profiles.is_public`: 공개 여부
- `family_photos.is_public`: 사진 공개 여부

### 접근 제어
- `nodes.visibility`: 노드 공개 설정
- `node_memberships.share_profile`: 프로필 공개
- `node_memberships.share_contact`: 연락처 공개

---

## 📁 마이그레이션 히스토리

| 버전 | 파일명 | 날짜 | 내용 |
|------|--------|------|------|
| 0001 | initial_schema.sql | 2026-02-20 | 사용자, 소셜 네트워크 |
| 0002 | family_tree_schema.sql | 2026-02-20 | 가족 트리 시스템 |
| 0003 | node_expansion_system.sql | 2026-02-20 | 노드 확장 시스템 |
| 0004 | family_advanced_features.sql | 2026-02-23 | 가족 고급 기능 |
| 0005 | notifications_and_search.sql | 2026-02-23 | 알림 & 검색 |
| 0006 | posts_advanced.sql | 2026-02-23 | 게시물 고급 기능 |

---

## 🚀 향후 확장 가능성

### 추가 가능한 기능
1. **결제 시스템**: subscriptions, payments
2. **이벤트 관리**: events, tickets, attendees
3. **실시간 채팅**: conversations, chat_messages
4. **파일 관리**: files, folders, permissions
5. **분석 시스템**: analytics_events, user_activities

### 성능 확장
1. **읽기 전용 복제본**: 읽기 부하 분산
2. **샤딩**: 사용자 기반 파티셔닝
3. **캐싱 레이어**: Redis 통합
4. **전문 검색**: Elasticsearch 통합

---

## 📚 관련 문서

### 상세 문서
- **[DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)** (27KB)
  - 모든 테이블의 상세 컬럼 정보
  - 관계 및 제약조건
  - 인덱스 목록

- **[DATABASE_ERD.md](DATABASE_ERD.md)** (15KB)
  - Mermaid 기반 ERD 다이어그램
  - 시스템별 관계도
  - 시각적 구조 표현

- **[DATABASE_OPTIMIZATION.md](DATABASE_OPTIMIZATION.md)** (12KB)
  - 성능 최적화 전략
  - 쿼리 최적화 가이드
  - 인덱스 설계 원칙
  - Cloudflare D1 팁

---

## 🎯 빠른 참조

### 자주 사용되는 테이블
```sql
-- 사용자 정보
SELECT * FROM users WHERE id = ?;

-- 사용자 게시물
SELECT p.*, u.full_name FROM posts p
JOIN users u ON p.user_id = u.id
WHERE p.user_id = ?
ORDER BY p.created_at DESC;

-- 노드 멤버십
SELECT n.*, nm.relationship_level FROM nodes n
JOIN node_memberships nm ON n.id = nm.node_id
WHERE nm.user_id = ? AND nm.status = 'approved';

-- 가족 관계
SELECT fm.*, fr.relationship_type FROM family_members fm
JOIN family_relationships fr ON fm.id = fr.relative_id
WHERE fr.person_id = ?;

-- 읽지 않은 알림
SELECT * FROM notifications
WHERE user_id = ? AND is_read = 0
ORDER BY created_at DESC
LIMIT 50;
```

---

## 💡 개발 가이드

### 새 테이블 추가 시
1. 마이그레이션 파일 생성 (`000X_feature.sql`)
2. 필요한 인덱스 추가
3. Foreign Key 설정
4. CASCADE 규칙 정의
5. 문서 업데이트

### 쿼리 작성 시
1. 필요한 컬럼만 SELECT
2. WHERE 절에 인덱스 활용
3. JOIN 사용 (서브쿼리 최소화)
4. LIMIT 적용
5. EXPLAIN으로 성능 확인

---

**문서 생성일**: 2026-02-23  
**데이터베이스 버전**: 0006  
**총 문서 크기**: 54KB (3개 파일)

**다음 단계**: 서버 구축 준비 완료 ✅
