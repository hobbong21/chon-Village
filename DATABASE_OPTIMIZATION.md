# CHON-Network Database Optimization Guide

## 📊 데이터베이스 성능 최적화 가이드

이 문서는 CHON-Network 플랫폼의 데이터베이스 성능 최적화 전략을 상세히 설명합니다.

**마지막 업데이트**: 2026-02-23

---

## 🎯 현재 인덱스 현황

### 총 인덱스 수: 70+개

#### 1. 사용자 & 프로필 시스템 (6개)
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_experiences_user_id ON experiences(user_id);
CREATE INDEX idx_education_user_id ON education(user_id);
CREATE INDEX idx_skills_user_id ON skills(user_id);
```

#### 2. 소셜 네트워크 (10개)
```sql
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_connections_follower ON connections(follower_id);
CREATE INDEX idx_connections_following ON connections(following_id);
CREATE INDEX idx_hashtags_tag ON hashtags(tag);
CREATE INDEX idx_hashtags_usage ON hashtags(usage_count DESC);
CREATE INDEX idx_post_hashtags_post ON post_hashtags(post_id);
CREATE INDEX idx_post_hashtags_hashtag ON post_hashtags(hashtag_id);
CREATE INDEX idx_post_shares_post ON post_shares(post_id);
CREATE INDEX idx_post_shares_user ON post_shares(user_id);
```

#### 3. 노드 시스템 (9개)
```sql
CREATE INDEX idx_nodes_creator ON nodes(creator_id);
CREATE INDEX idx_nodes_type ON nodes(node_type_id);
CREATE INDEX idx_node_memberships_user ON node_memberships(user_id);
CREATE INDEX idx_node_memberships_node ON node_memberships(node_id);
CREATE INDEX idx_node_memberships_status ON node_memberships(status);
CREATE INDEX idx_node_memberships_level ON node_memberships(relationship_level);
CREATE INDEX idx_node_connections_from ON node_connections(from_node_id);
CREATE INDEX idx_node_connections_to ON node_connections(to_node_id);
CREATE INDEX idx_membership_verifications_membership ON membership_verifications(membership_id);
CREATE INDEX idx_node_activity_logs_node ON node_activity_logs(node_id);
CREATE INDEX idx_node_activity_logs_user ON node_activity_logs(user_id);
```

#### 4. 가족 트리 시스템 (7개)
```sql
CREATE INDEX idx_family_members_user ON family_members(user_id);
CREATE INDEX idx_family_members_created_by ON family_members(created_by);
CREATE INDEX idx_contact_info_member ON contact_info(family_member_id);
CREATE INDEX idx_relationships_person ON family_relationships(person_id);
CREATE INDEX idx_relationships_relative ON family_relationships(relative_id);
CREATE INDEX idx_verifications_target ON relationship_verifications(target_id);
CREATE INDEX idx_verifications_status ON relationship_verifications(status);
CREATE INDEX idx_marriage_person ON marriage_events(person_id);
CREATE INDEX idx_marriage_spouse ON marriage_events(spouse_id);
```

#### 5. 가족 고급 기능 (8개)
```sql
CREATE INDEX idx_family_photos_album ON family_photos(album_id);
CREATE INDEX idx_family_photos_uploader ON family_photos(uploaded_by);
CREATE INDEX idx_photo_tags_photo ON photo_tags(photo_id);
CREATE INDEX idx_photo_tags_member ON photo_tags(family_member_id);
CREATE INDEX idx_family_events_creator ON family_events(created_by);
CREATE INDEX idx_family_events_date ON family_events(event_date);
CREATE INDEX idx_event_participants_event ON event_participants(event_id);
CREATE INDEX idx_event_participants_member ON event_participants(family_member_id);
CREATE INDEX idx_family_invitations_token ON family_invitations(invitation_token);
CREATE INDEX idx_family_invitations_creator ON family_invitations(created_by);
```

#### 6. 알림 & 메시징 (5개)
```sql
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, is_read);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_search_history_user ON search_history(user_id);
```

---

## 🚀 권장 추가 인덱스

### 1. 복합 인덱스 (Composite Index)

#### 자주 사용되는 쿼리 패턴
```sql
-- 읽지 않은 알림 조회 (이미 존재)
CREATE INDEX idx_notifications_read ON notifications(user_id, is_read);

-- 활성 멤버십 조회
CREATE INDEX idx_node_memberships_active ON node_memberships(node_id, status, left_at);

-- 공개 게시물 조회
CREATE INDEX idx_posts_public ON posts(created_at DESC, user_id);

-- 트렌딩 해시태그 + 최근 사용
CREATE INDEX idx_hashtags_trending ON hashtags(usage_count DESC, created_at DESC);

-- 가족 관계 + 인증 상태
CREATE INDEX idx_family_relationships_verified ON family_relationships(person_id, is_verified);

-- 노드 멤버십 + 레벨
CREATE INDEX idx_node_memberships_level_active ON node_memberships(node_id, relationship_level, status);
```

### 2. 부분 인덱스 (Partial Index)

**SQLite는 부분 인덱스를 지원합니다**

```sql
-- 활성 연결만 인덱싱
CREATE INDEX idx_connections_active ON connections(follower_id, following_id) 
WHERE status = 'accepted';

-- 읽지 않은 메시지만 인덱싱
CREATE INDEX idx_messages_unread ON messages(receiver_id) 
WHERE is_read = 0;

-- 승인 대기 중인 멤버십만 인덱싱
CREATE INDEX idx_memberships_pending ON node_memberships(node_id) 
WHERE status = 'pending';

-- 살아있는 가족 구성원만 인덱싱
CREATE INDEX idx_family_members_alive ON family_members(created_by) 
WHERE is_alive = 1;

-- 활성 초대만 인덱싱
CREATE INDEX idx_invitations_active ON family_invitations(invitation_token) 
WHERE is_active = 1 AND expires_at > CURRENT_TIMESTAMP;
```

### 3. 전문 검색 인덱스 (Full-Text Search)

**SQLite FTS5 사용**

```sql
-- 게시물 전문 검색
CREATE VIRTUAL TABLE posts_fts USING fts5(content, tokenize='porter unicode61');

-- 노드 전문 검색
CREATE VIRTUAL TABLE nodes_fts USING fts5(name, description, tokenize='porter unicode61');

-- 사용자 검색
CREATE VIRTUAL TABLE users_fts USING fts5(full_name, headline, tokenize='porter unicode61');
```

---

## 📈 쿼리 최적화 전략

### 1. SELECT 최적화

#### ❌ 나쁜 예
```sql
-- 모든 컬럼 조회
SELECT * FROM posts WHERE user_id = 1;

-- 서브쿼리 남용
SELECT * FROM users WHERE id IN (
  SELECT DISTINCT user_id FROM posts
);
```

#### ✅ 좋은 예
```sql
-- 필요한 컬럼만 조회
SELECT id, content, created_at FROM posts WHERE user_id = 1;

-- JOIN 사용
SELECT DISTINCT u.* FROM users u
INNER JOIN posts p ON u.id = p.user_id;
```

### 2. JOIN 최적화

#### ✅ 효율적인 JOIN
```sql
-- 인덱스 활용
SELECT p.*, u.full_name, u.profile_image
FROM posts p
INNER JOIN users u ON p.user_id = u.id
WHERE p.created_at > '2026-01-01'
ORDER BY p.created_at DESC
LIMIT 50;

-- LEFT JOIN에서 NULL 체크 활용
SELECT n.*, COUNT(nm.id) as member_count
FROM nodes n
LEFT JOIN node_memberships nm ON n.id = nm.node_id AND nm.status = 'approved'
GROUP BY n.id;
```

### 3. COUNT 최적화

#### ❌ 느린 COUNT
```sql
-- 전체 테이블 스캔
SELECT COUNT(*) FROM posts;
```

#### ✅ 빠른 COUNT
```sql
-- 인덱스 활용
SELECT COUNT(*) FROM posts WHERE user_id = 1;

-- 캐시된 카운터 사용
SELECT likes_count FROM posts WHERE id = 123;

-- 대략적인 카운트
SELECT CASE 
  WHEN COUNT(*) > 1000 THEN '1000+'
  ELSE CAST(COUNT(*) AS TEXT)
END as count_display
FROM posts;
```

### 4. LIMIT & OFFSET 최적화

#### ❌ 비효율적인 페이징
```sql
-- 큰 OFFSET은 느림
SELECT * FROM posts 
ORDER BY created_at DESC 
LIMIT 50 OFFSET 10000;
```

#### ✅ 효율적인 페이징 (Keyset Pagination)
```sql
-- 마지막 ID 기반 페이징
SELECT * FROM posts 
WHERE created_at < '2026-02-20 10:00:00'
ORDER BY created_at DESC 
LIMIT 50;

-- Cursor 기반 페이징
SELECT * FROM posts 
WHERE id < 12345
ORDER BY id DESC 
LIMIT 50;
```

---

## 🔍 쿼리 분석 도구

### EXPLAIN QUERY PLAN

```sql
-- 쿼리 실행 계획 확인
EXPLAIN QUERY PLAN
SELECT p.*, u.full_name 
FROM posts p 
INNER JOIN users u ON p.user_id = u.id 
WHERE p.created_at > '2026-01-01';

-- 예상 출력:
-- SCAN TABLE posts USING INDEX idx_posts_created_at
-- SEARCH TABLE users USING INTEGER PRIMARY KEY (rowid=?)
```

### 인덱스 사용 확인

```sql
-- 인덱스 목록
SELECT * FROM sqlite_master WHERE type = 'index';

-- 특정 테이블의 인덱스
PRAGMA index_list('posts');

-- 인덱스 상세 정보
PRAGMA index_info('idx_posts_user_id');
```

---

## 💾 데이터베이스 유지보수

### 1. VACUUM

```sql
-- 데이터베이스 최적화 (빈 공간 정리)
VACUUM;

-- 자동 VACUUM 설정
PRAGMA auto_vacuum = FULL;
```

### 2. ANALYZE

```sql
-- 통계 정보 수집
ANALYZE;

-- 특정 테이블만
ANALYZE posts;
ANALYZE users;
ANALYZE nodes;
```

### 3. REINDEX

```sql
-- 모든 인덱스 재구성
REINDEX;

-- 특정 인덱스만
REINDEX idx_posts_created_at;
```

---

## 📊 성능 모니터링

### 주요 메트릭

#### 1. 쿼리 실행 시간
```sql
-- SQLite에서 시간 측정
.timer ON
SELECT COUNT(*) FROM posts;
.timer OFF
```

#### 2. 인덱스 효율성
- **Index Hit Rate**: 인덱스 사용 비율
- **Table Scan Rate**: 전체 테이블 스캔 비율
- **Query Response Time**: 평균 쿼리 응답 시간

#### 3. 데이터베이스 크기
```sql
-- 데이터베이스 크기 확인
SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size();

-- 테이블별 크기
SELECT 
  name,
  SUM(pgsize) as size_bytes,
  ROUND(SUM(pgsize) / 1024.0 / 1024.0, 2) as size_mb
FROM dbstat
GROUP BY name
ORDER BY size_bytes DESC;
```

---

## 🎯 캐싱 전략

### 1. 애플리케이션 레벨 캐싱

**자주 조회되는 데이터**
- 사용자 프로필
- 노드 정보
- 관계 레벨 정의
- 해시태그 트렌딩 목록

**캐시 키 패턴**
```
user:{user_id}
node:{node_id}
trending:hashtags
user:{user_id}:notifications:unread
```

### 2. 쿼리 결과 캐싱

**TTL (Time To Live) 설정**
- 사용자 프로필: 5분
- 노드 정보: 10분
- 피드 게시물: 1분
- 알림: 실시간 (캐시 안함)

### 3. 카운터 캐싱

**데이터베이스 필드 활용**
```sql
-- 좋아요 수 증가 (캐시된 카운터)
UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?;

-- 멤버 수 업데이트
UPDATE nodes SET member_count = (
  SELECT COUNT(*) FROM node_memberships 
  WHERE node_id = nodes.id AND status = 'approved'
) WHERE id = ?;
```

---

## 🔧 Cloudflare D1 최적화

### D1 특화 최적화

#### 1. 배치 작업
```javascript
// 단일 쿼리 (느림)
for (const user of users) {
  await DB.prepare('INSERT INTO ...').bind(user.id).run();
}

// 배치 처리 (빠름)
const batch = users.map(user => 
  DB.prepare('INSERT INTO ...').bind(user.id)
);
await DB.batch(batch);
```

#### 2. Prepared Statements
```javascript
// 재사용 가능한 준비된 문장
const stmt = DB.prepare('SELECT * FROM users WHERE id = ?');
const user1 = await stmt.bind(1).first();
const user2 = await stmt.bind(2).first();
```

#### 3. 읽기 최적화
```javascript
// .all() - 모든 결과 반환
const { results } = await DB.prepare('SELECT * FROM posts').all();

// .first() - 첫 번째 결과만 (빠름)
const post = await DB.prepare('SELECT * FROM posts WHERE id = ?').bind(1).first();

// .raw() - Raw array (가장 빠름)
const rows = await DB.prepare('SELECT id, name FROM users').raw();
```

---

## 📉 병목 현상 해결

### 1. N+1 쿼리 문제

#### ❌ N+1 문제
```javascript
// 게시물 목록 조회 (1번)
const posts = await DB.prepare('SELECT * FROM posts LIMIT 50').all();

// 각 게시물의 작성자 조회 (N번)
for (const post of posts.results) {
  const author = await DB.prepare('SELECT * FROM users WHERE id = ?')
    .bind(post.user_id).first();
  post.author = author;
}
```

#### ✅ JOIN 사용
```javascript
// 한 번의 쿼리로 해결
const { results } = await DB.prepare(`
  SELECT p.*, u.full_name, u.profile_image
  FROM posts p
  INNER JOIN users u ON p.user_id = u.id
  LIMIT 50
`).all();
```

### 2. 과도한 데이터 조회

#### ❌ 전체 데이터 조회
```javascript
// 전체 사용자 조회 후 필터링
const allUsers = await DB.prepare('SELECT * FROM users').all();
const activeUsers = allUsers.results.filter(u => u.created_at > lastWeek);
```

#### ✅ 데이터베이스에서 필터링
```javascript
// WHERE 절로 필터링
const { results } = await DB.prepare(`
  SELECT * FROM users 
  WHERE created_at > ? 
  LIMIT 100
`).bind(lastWeek).all();
```

---

## 🎨 인덱스 설계 원칙

### 1. 선택성 (Selectivity)
- 높은 선택성: email, token, unique 컬럼
- 낮은 선택성: gender, boolean 필드

**인덱스 생성 기준**: 선택성 > 5%

### 2. 쿼리 패턴 분석
- WHERE 절에 자주 사용되는 컬럼
- JOIN 조건 컬럼
- ORDER BY 컬럼
- GROUP BY 컬럼

### 3. 복합 인덱스 순서
```sql
-- 올바른 순서: 선택성 높은 것부터
CREATE INDEX idx_posts_user_date ON posts(user_id, created_at);

-- 잘못된 순서
CREATE INDEX idx_posts_date_user ON posts(created_at, user_id);
```

### 4. 인덱스 크기 고려
- 인덱스도 저장 공간 사용
- 너무 많은 인덱스는 INSERT/UPDATE 성능 저하
- 사용하지 않는 인덱스 제거

---

## 📝 성능 체크리스트

### ✅ 일반 사항
- [ ] 모든 FK에 인덱스 존재
- [ ] WHERE 절 컬럼에 인덱스
- [ ] ORDER BY 컬럼에 인덱스
- [ ] JOIN 조건에 인덱스
- [ ] UNIQUE 제약조건 확인

### ✅ 쿼리 최적화
- [ ] SELECT * 대신 필요한 컬럼만 조회
- [ ] 서브쿼리 대신 JOIN 사용
- [ ] COUNT(*) 최소화
- [ ] LIMIT 사용
- [ ] Keyset Pagination 적용

### ✅ 인덱스 최적화
- [ ] 복합 인덱스 순서 확인
- [ ] 부분 인덱스 활용
- [ ] 사용하지 않는 인덱스 제거
- [ ] ANALYZE 정기 실행

### ✅ 유지보수
- [ ] 주기적인 VACUUM
- [ ] 주기적인 ANALYZE
- [ ] 성능 모니터링
- [ ] 슬로우 쿼리 로깅

---

## 🚀 성능 목표

### 응답 시간 목표
- **단일 레코드 조회**: < 10ms
- **목록 조회 (50개)**: < 50ms
- **복잡한 JOIN**: < 100ms
- **집계 쿼리**: < 200ms
- **전문 검색**: < 500ms

### 처리량 목표
- **읽기 QPS**: 1,000+ queries/second
- **쓰기 QPS**: 100+ queries/second
- **동시 연결**: 100+ connections

---

**문서 생성일**: 2026-02-23  
**현재 인덱스 수**: 70+개  
**권장 추가 인덱스**: 10+개  
**예상 성능 향상**: 2-5배
