# CHON-Network Database Schema

## 📊 데이터베이스 개요

이 문서는 CHON-Network 플랫폼의 전체 데이터베이스 구조를 상세히 설명합니다.

**데이터베이스 타입**: SQLite (Cloudflare D1)  
**마이그레이션 파일**: 6개  
**총 테이블 수**: 44개  
**마지막 업데이트**: 2026-02-23

---

## 🗂️ 테이블 카테고리

### 1. 사용자 & 프로필 (User & Profile)
- [users](#users) - 기본 사용자 정보
- [profiles](#profiles) - 확장 프로필
- [experiences](#experiences) - 경력 사항
- [education](#education) - 학력 사항
- [skills](#skills) - 기술/스킬

### 2. 소셜 네트워크 (Social Network)
- [connections](#connections) - 사용자 연결/팔로우
- [posts](#posts) - 게시물
- [post_likes](#post_likes) - 게시물 좋아요
- [post_shares](#post_shares) - 게시물 공유
- [comments](#comments) - 댓글
- [hashtags](#hashtags) - 해시태그
- [post_hashtags](#post_hashtags) - 게시물-해시태그 관계

### 3. 노드 시스템 (Node System)
- [node_types](#node_types) - 노드 타입 정의
- [nodes](#nodes) - 노드(그룹/조직)
- [node_roles](#node_roles) - 노드 내 역할
- [node_memberships](#node_memberships) - 노드 멤버십
- [node_connections](#node_connections) - 노드 간 연결
- [node_invitations](#node_invitations) - 노드 초대
- [node_activity_logs](#node_activity_logs) - 노드 활동 로그
- [membership_verifications](#membership_verifications) - 멤버십 인증
- [relationship_levels](#relationship_levels) - 관계 레벨 정의

### 4. 가족 관계 (Family Tree)
- [family_members](#family_members) - 가족 구성원
- [family_relationships](#family_relationships) - 가족 관계
- [relationship_verifications](#relationship_verifications) - 관계 인증
- [contact_info](#contact_info) - 연락처 정보
- [marriage_events](#marriage_events) - 결혼 이벤트
- [family_profiles](#family_profiles) - 가족 프로필
- [privacy_settings](#privacy_settings) - 개인정보 설정

### 5. 가족 고급 기능 (Family Advanced)
- [family_albums](#family_albums) - 가족 앨범
- [family_photos](#family_photos) - 가족 사진
- [photo_tags](#photo_tags) - 사진 태그
- [family_events](#family_events) - 가족 이벤트
- [event_participants](#event_participants) - 이벤트 참여자
- [family_invitations](#family_invitations) - 가족 초대
- [invitation_acceptances](#invitation_acceptances) - 초대 수락

### 6. 알림 & 메시징 (Notifications & Messaging)
- [notifications](#notifications) - 알림
- [notification_preferences](#notification_preferences) - 알림 설정
- [messages](#messages) - 메시지
- [search_history](#search_history) - 검색 기록

---

## 📋 테이블 상세 설명

### 1. 사용자 & 프로필

#### <a name="users"></a>users
**핵심 사용자 정보**

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INTEGER | PK, AUTO | 사용자 ID |
| email | TEXT | UNIQUE, NOT NULL | 이메일 (로그인) |
| password_hash | TEXT | NOT NULL | 암호화된 비밀번호 |
| full_name | TEXT | NOT NULL | 전체 이름 |
| headline | TEXT | | 한줄 소개 |
| profile_image | TEXT | | 프로필 이미지 URL |
| created_at | DATETIME | DEFAULT NOW | 생성일시 |
| updated_at | DATETIME | DEFAULT NOW | 수정일시 |

**인덱스**: `idx_users_email`

---

#### <a name="profiles"></a>profiles
**확장 프로필 정보**

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INTEGER | PK, AUTO | 프로필 ID |
| user_id | INTEGER | FK → users, NOT NULL | 사용자 ID |
| about | TEXT | | 자기소개 |
| location | TEXT | | 위치 |
| website | TEXT | | 웹사이트 |

**관계**: users (1:1)  
**인덱스**: `idx_profiles_user_id`

---

#### <a name="experiences"></a>experiences
**경력 정보**

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INTEGER | PK, AUTO | 경력 ID |
| user_id | INTEGER | FK → users, NOT NULL | 사용자 ID |
| company | TEXT | NOT NULL | 회사명 |
| position | TEXT | NOT NULL | 직책 |
| description | TEXT | | 업무 설명 |
| start_date | TEXT | NOT NULL | 시작일 |
| end_date | TEXT | | 종료일 |
| is_current | BOOLEAN | DEFAULT 0 | 현재 재직 여부 |
| created_at | DATETIME | DEFAULT NOW | 생성일시 |

**관계**: users (N:1)  
**인덱스**: `idx_experiences_user_id`

---

#### <a name="education"></a>education
**학력 정보**

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INTEGER | PK, AUTO | 학력 ID |
| user_id | INTEGER | FK → users, NOT NULL | 사용자 ID |
| school | TEXT | NOT NULL | 학교명 |
| degree | TEXT | NOT NULL | 학위 |
| field_of_study | TEXT | | 전공 |
| start_date | TEXT | NOT NULL | 시작일 |
| end_date | TEXT | | 종료일 |
| description | TEXT | | 설명 |
| created_at | DATETIME | DEFAULT NOW | 생성일시 |

**관계**: users (N:1)  
**인덱스**: `idx_education_user_id`

---

#### <a name="skills"></a>skills
**기술/스킬**

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INTEGER | PK, AUTO | 스킬 ID |
| user_id | INTEGER | FK → users, NOT NULL | 사용자 ID |
| skill_name | TEXT | NOT NULL | 스킬명 |
| endorsements | INTEGER | DEFAULT 0 | 추천 수 |
| created_at | DATETIME | DEFAULT NOW | 생성일시 |

**관계**: users (N:1)  
**인덱스**: `idx_skills_user_id`

---

### 2. 소셜 네트워크

#### <a name="connections"></a>connections
**사용자 간 연결 (팔로우 관계)**

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INTEGER | PK, AUTO | 연결 ID |
| follower_id | INTEGER | FK → users, NOT NULL | 팔로워 ID |
| following_id | INTEGER | FK → users, NOT NULL | 팔로잉 ID |
| status | TEXT | DEFAULT 'pending' | 상태 (pending/accepted/rejected) |
| created_at | DATETIME | DEFAULT NOW | 생성일시 |
| updated_at | DATETIME | DEFAULT NOW | 수정일시 |

**유니크 제약**: (follower_id, following_id)  
**인덱스**: `idx_connections_follower`, `idx_connections_following`

---

#### <a name="posts"></a>posts
**게시물**

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INTEGER | PK, AUTO | 게시물 ID |
| user_id | INTEGER | FK → users, NOT NULL | 작성자 ID |
| content | TEXT | NOT NULL | 내용 |
| image_url | TEXT | | 이미지 URL |
| likes_count | INTEGER | DEFAULT 0 | 좋아요 수 |
| comments_count | INTEGER | DEFAULT 0 | 댓글 수 |
| created_at | DATETIME | DEFAULT NOW | 생성일시 |
| updated_at | DATETIME | DEFAULT NOW | 수정일시 |

**관계**: users (N:1), hashtags (N:M through post_hashtags)  
**인덱스**: `idx_posts_user_id`, `idx_posts_created_at`

---

#### <a name="post_likes"></a>post_likes
**게시물 좋아요**

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INTEGER | PK, AUTO | 좋아요 ID |
| post_id | INTEGER | FK → posts, NOT NULL | 게시물 ID |
| user_id | INTEGER | FK → users, NOT NULL | 사용자 ID |
| created_at | DATETIME | DEFAULT NOW | 생성일시 |

**유니크 제약**: (post_id, user_id)  
**인덱스**: `idx_post_likes_post_id`, `idx_post_likes_user_id`

---

#### <a name="post_shares"></a>post_shares
**게시물 공유**

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INTEGER | PK, AUTO | 공유 ID |
| post_id | INTEGER | FK → posts, NOT NULL | 게시물 ID |
| user_id | INTEGER | FK → users, NOT NULL | 공유자 ID |
| shared_at | DATETIME | DEFAULT NOW | 공유일시 |

**인덱스**: `idx_post_shares_post`, `idx_post_shares_user`

---

#### <a name="comments"></a>comments
**댓글**

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INTEGER | PK, AUTO | 댓글 ID |
| post_id | INTEGER | FK → posts, NOT NULL | 게시물 ID |
| user_id | INTEGER | FK → users, NOT NULL | 작성자 ID |
| content | TEXT | NOT NULL | 내용 |
| created_at | DATETIME | DEFAULT NOW | 생성일시 |

**관계**: posts (N:1), users (N:1)  
**인덱스**: `idx_comments_post_id`

---

#### <a name="hashtags"></a>hashtags
**해시태그**

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INTEGER | PK, AUTO | 해시태그 ID |
| tag | TEXT | UNIQUE, NOT NULL | 태그명 |
| usage_count | INTEGER | DEFAULT 0 | 사용 횟수 |
| created_at | DATETIME | DEFAULT NOW | 생성일시 |

**인덱스**: `idx_hashtags_tag`, `idx_hashtags_usage`

---

#### <a name="post_hashtags"></a>post_hashtags
**게시물-해시태그 관계**

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INTEGER | PK, AUTO | 관계 ID |
| post_id | INTEGER | FK → posts, NOT NULL | 게시물 ID |
| hashtag_id | INTEGER | FK → hashtags, NOT NULL | 해시태그 ID |
| created_at | DATETIME | DEFAULT NOW | 생성일시 |

**유니크 제약**: (post_id, hashtag_id)  
**인덱스**: `idx_post_hashtags_post`, `idx_post_hashtags_hashtag`

---

### 3. 노드 시스템

#### <a name="node_types"></a>node_types
**노드 타입 정의**

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INTEGER | PK, AUTO | 타입 ID |
| name | TEXT | UNIQUE, NOT NULL | 타입명 (영문) |
| name_ko | TEXT | NOT NULL | 타입명 (한글) |
| icon | TEXT | | 아이콘 클래스 |
| color | TEXT | | 색상 코드 |
| description | TEXT | | 설명 |
| created_at | DATETIME | DEFAULT NOW | 생성일시 |

**기본 데이터**:
- family (가족) - #10b981
- school (학교) - #3b82f6
- company (직장) - #f59e0b
- club (동호회) - #8b5cf6
- community (커뮤니티) - #ec4899
- fanclub (팬클럽) - #ef4444

---

#### <a name="nodes"></a>nodes
**노드 (그룹/조직)**

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INTEGER | PK, AUTO | 노드 ID |
| node_type_id | INTEGER | FK → node_types, NOT NULL | 노드 타입 |
| name | TEXT | NOT NULL | 노드명 |
| description | TEXT | | 설명 |
| creator_id | INTEGER | FK → users, NOT NULL | 생성자 ID |
| visibility | TEXT | DEFAULT 'private' | 공개 설정 (public/private/invite_only) |
| join_approval_required | INTEGER | DEFAULT 1 | 가입 승인 필요 여부 |
| location | TEXT | | 위치 |
| address | TEXT | | 주소 |
| website | TEXT | | 웹사이트 |
| contact_email | TEXT | | 연락처 이메일 |
| logo_url | TEXT | | 로고 URL |
| member_count | INTEGER | DEFAULT 0 | 멤버 수 |
| verified_member_count | INTEGER | DEFAULT 0 | 인증된 멤버 수 |
| is_verified | INTEGER | DEFAULT 0 | 노드 인증 여부 |
| verification_level | INTEGER | DEFAULT 1 | 인증 레벨 |
| created_at | DATETIME | DEFAULT NOW | 생성일시 |
| updated_at | DATETIME | DEFAULT NOW | 수정일시 |

**관계**: node_types (N:1), users (N:1 creator)  
**인덱스**: `idx_nodes_creator`, `idx_nodes_type`

---

#### <a name="node_roles"></a>node_roles
**노드 내 역할**

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INTEGER | PK, AUTO | 역할 ID |
| node_id | INTEGER | FK → nodes, NOT NULL | 노드 ID |
| role_name | TEXT | NOT NULL | 역할명 (영문) |
| role_name_ko | TEXT | NOT NULL | 역할명 (한글) |
| level | INTEGER | DEFAULT 1 | 권한 레벨 (1:일반, 2:관리자, 3:소유자) |
| color | TEXT | | 색상 코드 |
| description | TEXT | | 설명 |
| created_at | DATETIME | DEFAULT NOW | 생성일시 |

**관계**: nodes (N:1)

---

#### <a name="node_memberships"></a>node_memberships
**노드 멤버십 (사용자-노드 관계)**

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INTEGER | PK, AUTO | 멤버십 ID |
| node_id | INTEGER | FK → nodes, NOT NULL | 노드 ID |
| user_id | INTEGER | FK → users, NOT NULL | 사용자 ID |
| role_id | INTEGER | FK → node_roles | 역할 ID |
| relationship_level | INTEGER | DEFAULT 1, CHECK (1-5) | 관계 레벨 (1-5) |
| status | TEXT | DEFAULT 'pending' | 상태 (pending/approved/rejected/blocked) |
| is_verified | INTEGER | DEFAULT 0 | 인증 여부 |
| verified_at | DATETIME | | 인증 일시 |
| verified_by | INTEGER | FK → users | 인증자 ID |
| verification_count | INTEGER | DEFAULT 0 | 받은 인증 횟수 |
| activity_score | INTEGER | DEFAULT 0 | 활동 점수 |
| share_profile | INTEGER | DEFAULT 0 | 프로필 공유 여부 |
| share_contact | INTEGER | DEFAULT 0 | 연락처 공유 여부 |
| share_activity | INTEGER | DEFAULT 0 | 활동 공유 여부 |
| invited_by | INTEGER | FK → users | 초대자 ID |
| invited_at | DATETIME | | 초대일시 |
| joined_at | DATETIME | | 가입일시 |
| left_at | DATETIME | | 탈퇴일시 |
| created_at | DATETIME | DEFAULT NOW | 생성일시 |
| updated_at | DATETIME | DEFAULT NOW | 수정일시 |

**유니크 제약**: (node_id, user_id)  
**인덱스**: `idx_node_memberships_user`, `idx_node_memberships_node`, `idx_node_memberships_status`, `idx_node_memberships_level`

---

#### <a name="node_connections"></a>node_connections
**노드 간 연결**

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INTEGER | PK, AUTO | 연결 ID |
| from_node_id | INTEGER | FK → nodes, NOT NULL | 출발 노드 ID |
| to_node_id | INTEGER | FK → nodes, NOT NULL | 도착 노드 ID |
| connection_type | TEXT | | 연결 타입 (partnership/parent-child/affiliated) |
| status | TEXT | DEFAULT 'pending' | 상태 (pending/approved/rejected) |
| requested_by | INTEGER | FK → users, NOT NULL | 요청자 ID |
| approved_by | INTEGER | FK → users | 승인자 ID |
| description | TEXT | | 설명 |
| created_at | DATETIME | DEFAULT NOW | 생성일시 |
| approved_at | DATETIME | | 승인일시 |

**유니크 제약**: (from_node_id, to_node_id)  
**인덱스**: `idx_node_connections_from`, `idx_node_connections_to`

---

#### <a name="node_invitations"></a>node_invitations
**노드 초대**

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INTEGER | PK, AUTO | 초대 ID |
| node_id | INTEGER | FK → nodes, NOT NULL | 노드 ID |
| inviter_id | INTEGER | FK → users, NOT NULL | 초대자 ID |
| invitee_email | TEXT | | 초대 대상 이메일 |
| invitee_user_id | INTEGER | FK → users | 초대 대상 사용자 ID |
| role_id | INTEGER | FK → node_roles | 역할 ID |
| message | TEXT | | 초대 메시지 |
| token | TEXT | UNIQUE | 초대 토큰 |
| status | TEXT | DEFAULT 'pending' | 상태 (pending/accepted/rejected/expired) |
| expires_at | DATETIME | | 만료일시 |
| accepted_at | DATETIME | | 수락일시 |
| created_at | DATETIME | DEFAULT NOW | 생성일시 |

**관계**: nodes (N:1), users (N:1 inviter, N:1 invitee)

---

#### <a name="node_activity_logs"></a>node_activity_logs
**노드 활동 로그**

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INTEGER | PK, AUTO | 로그 ID |
| node_id | INTEGER | FK → nodes, NOT NULL | 노드 ID |
| user_id | INTEGER | FK → users, NOT NULL | 사용자 ID |
| activity_type | TEXT | NOT NULL | 활동 타입 (join/leave/post/comment/verify) |
| activity_data | TEXT | | 활동 데이터 (JSON) |
| points | INTEGER | DEFAULT 0 | 획득 포인트 |
| created_at | DATETIME | DEFAULT NOW | 생성일시 |

**인덱스**: `idx_node_activity_logs_node`, `idx_node_activity_logs_user`

---

#### <a name="membership_verifications"></a>membership_verifications
**멤버십 인증**

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INTEGER | PK, AUTO | 인증 ID |
| membership_id | INTEGER | FK → node_memberships, NOT NULL | 멤버십 ID |
| verified_by_user_id | INTEGER | FK → users, NOT NULL | 인증자 ID |
| verification_type | TEXT | DEFAULT 'mutual' | 인증 타입 (mutual/admin/system) |
| evidence_type | TEXT | | 증거 타입 (photo/document/reference) |
| evidence_url | TEXT | | 증거 URL |
| comment | TEXT | | 코멘트 |
| status | TEXT | DEFAULT 'pending' | 상태 (pending/approved/rejected) |
| created_at | DATETIME | DEFAULT NOW | 생성일시 |
| approved_at | DATETIME | | 승인일시 |

**인덱스**: `idx_membership_verifications_membership`

---

#### <a name="relationship_levels"></a>relationship_levels
**관계 레벨 정의**

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| level | INTEGER | PK | 레벨 번호 (1-5) |
| name | TEXT | NOT NULL | 레벨명 (영문) |
| name_ko | TEXT | NOT NULL | 레벨명 (한글) |
| description | TEXT | | 설명 |
| color | TEXT | | 색상 코드 |
| min_verifications | INTEGER | DEFAULT 0 | 최소 인증 횟수 |
| min_activity_score | INTEGER | DEFAULT 0 | 최소 활동 점수 |
| required_nodes_created | INTEGER | DEFAULT 0 | 필요 노드 생성 수 |
| required_verified_members | INTEGER | DEFAULT 0 | 필요 인증 멤버 수 |
| is_premium | INTEGER | DEFAULT 0 | 프리미엄 레벨 여부 |
| can_create_nodes | INTEGER | DEFAULT 0 | 노드 생성 권한 |
| can_invite_members | INTEGER | DEFAULT 0 | 멤버 초대 권한 |
| can_verify_others | INTEGER | DEFAULT 0 | 타인 인증 권한 |
| max_nodes | INTEGER | DEFAULT 0 | 최대 노드 수 |
| created_at | DATETIME | DEFAULT NOW | 생성일시 |

**기본 데이터**:
- Level 1: 대기 (pending) - 승인 대기
- Level 2: 연결 (connected) - 상호 승인 완료
- Level 3: 활동 (active) - 3회 이상 인증
- Level 4: 리더 (leader) - 5명 이상 인증
- Level 5: 공인 (verified) - Admin 인증

---

### 4. 가족 관계

#### <a name="family_members"></a>family_members
**가족 구성원**

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INTEGER | PK, AUTO | 가족 구성원 ID |
| user_id | INTEGER | UNIQUE, FK → users | 사용자 ID (회원만) |
| name_ko | TEXT | | 한글 이름 |
| name_en | TEXT | | 영문 이름 |
| birth_date | TEXT | | 생년월일 |
| gender | TEXT | CHECK (male/female) | 성별 |
| is_alive | BOOLEAN | DEFAULT 1 | 생존 여부 |
| is_registered | BOOLEAN | DEFAULT 0 | 회원가입 여부 |
| created_by | INTEGER | FK → users, NOT NULL | 생성자 ID |
| created_at | DATETIME | DEFAULT NOW | 생성일시 |
| updated_at | DATETIME | DEFAULT NOW | 수정일시 |

**인덱스**: `idx_family_members_user`, `idx_family_members_created_by`

---

#### <a name="contact_info"></a>contact_info
**연락처 정보**

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INTEGER | PK, AUTO | 연락처 ID |
| family_member_id | INTEGER | FK → family_members, NOT NULL | 가족 구성원 ID |
| contact_type | TEXT | CHECK (phone/address/email) | 연락처 타입 |
| contact_value | TEXT | NOT NULL | 연락처 값 |
| is_primary | BOOLEAN | DEFAULT 0 | 기본 연락처 여부 |
| created_at | DATETIME | DEFAULT NOW | 생성일시 |

**인덱스**: `idx_contact_info_member`

---

#### <a name="family_relationships"></a>family_relationships
**가족 관계**

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INTEGER | PK, AUTO | 관계 ID |
| person_id | INTEGER | FK → family_members, NOT NULL | 주체 ID |
| relative_id | INTEGER | FK → family_members, NOT NULL | 상대방 ID |
| relationship_type | TEXT | NOT NULL | 관계 타입 (father/mother/sibling/spouse/child) |
| is_verified | BOOLEAN | DEFAULT 0 | 인증 여부 |
| created_at | DATETIME | DEFAULT NOW | 생성일시 |

**유니크 제약**: (person_id, relative_id, relationship_type)  
**인덱스**: `idx_relationships_person`, `idx_relationships_relative`

---

#### <a name="relationship_verifications"></a>relationship_verifications
**관계 인증 요청**

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INTEGER | PK, AUTO | 인증 ID |
| requester_id | INTEGER | FK → users, NOT NULL | 요청자 ID |
| target_id | INTEGER | FK → family_members, NOT NULL | 대상자 ID |
| relationship_type | TEXT | NOT NULL | 관계 타입 |
| status | TEXT | DEFAULT 'pending' | 상태 (pending/accepted/rejected) |
| verification_code | TEXT | | 인증 코드 |
| created_at | DATETIME | DEFAULT NOW | 생성일시 |
| responded_at | DATETIME | | 응답일시 |

**인덱스**: `idx_verifications_target`, `idx_verifications_status`

---

#### <a name="marriage_events"></a>marriage_events
**결혼 이벤트**

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INTEGER | PK, AUTO | 결혼 ID |
| person_id | INTEGER | FK → family_members, NOT NULL | 배우자 1 ID |
| spouse_id | INTEGER | FK → family_members, NOT NULL | 배우자 2 ID |
| marriage_date | TEXT | | 결혼일 |
| is_verified | BOOLEAN | DEFAULT 0 | 인증 여부 |
| created_at | DATETIME | DEFAULT NOW | 생성일시 |

**유니크 제약**: (person_id, spouse_id)  
**인덱스**: `idx_marriage_person`, `idx_marriage_spouse`

---

#### <a name="family_profiles"></a>family_profiles
**가족 프로필 (추가 정보)**

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INTEGER | PK, AUTO | 프로필 ID |
| family_member_id | INTEGER | UNIQUE, FK → family_members, NOT NULL | 가족 구성원 ID |
| occupation | TEXT | | 직업 |
| education | TEXT | | 학력 |
| bio | TEXT | | 소개 |
| profile_image | TEXT | | 프로필 이미지 URL |
| is_public | BOOLEAN | DEFAULT 0 | 공개 여부 |
| created_at | DATETIME | DEFAULT NOW | 생성일시 |
| updated_at | DATETIME | DEFAULT NOW | 수정일시 |

---

#### <a name="privacy_settings"></a>privacy_settings
**개인정보 공개 설정**

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INTEGER | PK, AUTO | 설정 ID |
| family_member_id | INTEGER | FK → family_members, NOT NULL | 가족 구성원 ID |
| field_name | TEXT | NOT NULL | 필드명 (birth_date/contact_info 등) |
| is_visible | BOOLEAN | DEFAULT 1 | 공개 여부 |

**유니크 제약**: (family_member_id, field_name)

---

### 5. 가족 고급 기능

#### <a name="family_albums"></a>family_albums
**가족 앨범**

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INTEGER | PK, AUTO | 앨범 ID |
| family_member_id | INTEGER | FK → family_members, NOT NULL | 생성자 ID |
| title | TEXT | NOT NULL | 앨범 제목 |
| description | TEXT | | 앨범 설명 |
| created_at | DATETIME | DEFAULT NOW | 생성일시 |

---

#### <a name="family_photos"></a>family_photos
**가족 사진**

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INTEGER | PK, AUTO | 사진 ID |
| album_id | INTEGER | FK → family_albums, NOT NULL | 앨범 ID |
| uploaded_by | INTEGER | FK → family_members, NOT NULL | 업로더 ID |
| image_url | TEXT | NOT NULL | 이미지 URL |
| caption | TEXT | | 캡션 |
| photo_date | TEXT | | 촬영일 |
| is_public | BOOLEAN | DEFAULT 0 | 공개 여부 |
| likes_count | INTEGER | DEFAULT 0 | 좋아요 수 |
| created_at | DATETIME | DEFAULT NOW | 생성일시 |

**인덱스**: `idx_family_photos_album`, `idx_family_photos_uploader`

---

#### <a name="photo_tags"></a>photo_tags
**사진 태그**

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INTEGER | PK, AUTO | 태그 ID |
| photo_id | INTEGER | FK → family_photos, NOT NULL | 사진 ID |
| family_member_id | INTEGER | FK → family_members, NOT NULL | 태그된 구성원 ID |
| created_at | DATETIME | DEFAULT NOW | 생성일시 |

**인덱스**: `idx_photo_tags_photo`, `idx_photo_tags_member`

---

#### <a name="family_events"></a>family_events
**가족 이벤트**

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INTEGER | PK, AUTO | 이벤트 ID |
| created_by | INTEGER | FK → family_members, NOT NULL | 생성자 ID |
| event_type | TEXT | CHECK (birth/wedding/death/graduation/birthday/anniversary/custom) | 이벤트 타입 |
| title | TEXT | NOT NULL | 제목 |
| description | TEXT | | 설명 |
| event_date | TEXT | NOT NULL | 이벤트 날짜 |
| location | TEXT | | 장소 |
| image_url | TEXT | | 이미지 URL |
| is_public | BOOLEAN | DEFAULT 1 | 공개 여부 |
| created_at | DATETIME | DEFAULT NOW | 생성일시 |

**인덱스**: `idx_family_events_creator`, `idx_family_events_date`

---

#### <a name="event_participants"></a>event_participants
**이벤트 참여자**

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INTEGER | PK, AUTO | 참여 ID |
| event_id | INTEGER | FK → family_events, NOT NULL | 이벤트 ID |
| family_member_id | INTEGER | FK → family_members, NOT NULL | 참여자 ID |
| role | TEXT | | 역할 (주인공/참석자) |
| created_at | DATETIME | DEFAULT NOW | 생성일시 |

**인덱스**: `idx_event_participants_event`, `idx_event_participants_member`

---

#### <a name="family_invitations"></a>family_invitations
**가족 초대 링크**

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INTEGER | PK, AUTO | 초대 ID |
| created_by | INTEGER | FK → family_members, NOT NULL | 생성자 ID |
| invitation_token | TEXT | UNIQUE, NOT NULL | 초대 토큰 |
| relationship_type | TEXT | | 초대 관계 타입 |
| max_uses | INTEGER | DEFAULT 1 | 최대 사용 횟수 |
| uses_count | INTEGER | DEFAULT 0 | 사용 횟수 |
| expires_at | DATETIME | | 만료일시 |
| is_active | BOOLEAN | DEFAULT 1 | 활성 여부 |
| created_at | DATETIME | DEFAULT NOW | 생성일시 |

**인덱스**: `idx_family_invitations_token`, `idx_family_invitations_creator`

---

#### <a name="invitation_acceptances"></a>invitation_acceptances
**초대 수락 기록**

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INTEGER | PK, AUTO | 수락 ID |
| invitation_id | INTEGER | FK → family_invitations, NOT NULL | 초대 ID |
| family_member_id | INTEGER | FK → family_members, NOT NULL | 수락자 ID |
| accepted_at | DATETIME | DEFAULT NOW | 수락일시 |

---

### 6. 알림 & 메시징

#### <a name="notifications"></a>notifications
**알림**

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INTEGER | PK, AUTO | 알림 ID |
| user_id | INTEGER | FK → users, NOT NULL | 사용자 ID |
| type | TEXT | CHECK (connection_request/connection_accepted/post_like/post_comment/node_invitation/family_verification/event_reminder/mention) | 알림 타입 |
| title | TEXT | NOT NULL | 제목 |
| message | TEXT | NOT NULL | 메시지 |
| related_id | INTEGER | | 관련 ID |
| related_type | TEXT | | 관련 타입 |
| is_read | BOOLEAN | DEFAULT 0 | 읽음 여부 |
| created_at | DATETIME | DEFAULT NOW | 생성일시 |

**인덱스**: `idx_notifications_user`, `idx_notifications_read`

---

#### <a name="notification_preferences"></a>notification_preferences
**알림 설정**

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INTEGER | PK, AUTO | 설정 ID |
| user_id | INTEGER | UNIQUE, FK → users, NOT NULL | 사용자 ID |
| connection_requests | BOOLEAN | DEFAULT 1 | 연결 요청 알림 |
| post_interactions | BOOLEAN | DEFAULT 1 | 게시물 상호작용 알림 |
| node_activities | BOOLEAN | DEFAULT 1 | 노드 활동 알림 |
| family_updates | BOOLEAN | DEFAULT 1 | 가족 업데이트 알림 |
| event_reminders | BOOLEAN | DEFAULT 1 | 이벤트 알림 |
| mentions | BOOLEAN | DEFAULT 1 | 멘션 알림 |
| email_notifications | BOOLEAN | DEFAULT 0 | 이메일 알림 |
| created_at | DATETIME | DEFAULT NOW | 생성일시 |
| updated_at | DATETIME | DEFAULT NOW | 수정일시 |

---

#### <a name="messages"></a>messages
**메시지**

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INTEGER | PK, AUTO | 메시지 ID |
| sender_id | INTEGER | FK → users, NOT NULL | 발신자 ID |
| receiver_id | INTEGER | FK → users, NOT NULL | 수신자 ID |
| content | TEXT | NOT NULL | 내용 |
| is_read | BOOLEAN | DEFAULT 0 | 읽음 여부 |
| created_at | DATETIME | DEFAULT NOW | 생성일시 |

**인덱스**: `idx_messages_receiver`, `idx_messages_sender`

---

#### <a name="search_history"></a>search_history
**검색 기록**

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INTEGER | PK, AUTO | 검색 ID |
| user_id | INTEGER | FK → users, NOT NULL | 사용자 ID |
| search_query | TEXT | NOT NULL | 검색어 |
| search_type | TEXT | CHECK (user/node/post/all) | 검색 타입 |
| created_at | DATETIME | DEFAULT NOW | 생성일시 |

**인덱스**: `idx_search_history_user`

---

## 🔗 주요 관계도

### 사용자 중심 관계
```
users (1) ←→ (N) profiles
users (1) ←→ (N) experiences
users (1) ←→ (N) education
users (1) ←→ (N) skills
users (1) ←→ (N) posts
users (1) ←→ (N) connections (양방향)
users (1) ←→ (N) node_memberships
users (1) ←→ (1) family_members
```

### 노드 중심 관계
```
nodes (1) ←→ (N) node_memberships
nodes (1) ←→ (N) node_roles
nodes (1) ←→ (N) node_connections
nodes (1) ←→ (N) node_invitations
nodes (1) ←→ (N) node_activity_logs
nodes (N) ←→ (1) node_types
```

### 가족 중심 관계
```
family_members (1) ←→ (N) family_relationships
family_members (1) ←→ (N) contact_info
family_members (1) ←→ (N) family_albums
family_members (1) ←→ (N) family_photos
family_members (1) ←→ (N) family_events
family_members (1) ←→ (1) family_profiles
```

### 게시물 중심 관계
```
posts (1) ←→ (N) post_likes
posts (1) ←→ (N) comments
posts (1) ←→ (N) post_shares
posts (N) ←→ (M) hashtags (through post_hashtags)
```

---

## 📈 인덱스 전략

### 자주 사용되는 쿼리 패턴
1. **사용자별 데이터 조회**: `user_id` 인덱스 (모든 user 관련 테이블)
2. **시간순 정렬**: `created_at DESC` 인덱스 (posts, notifications 등)
3. **관계 조회**: 양방향 인덱스 (connections, relationships 등)
4. **검색 성능**: 태그, 상태 필드 인덱스

### 복합 인덱스
- `(user_id, is_read)` - notifications: 읽지 않은 알림 조회
- `(post_id, user_id)` - post_likes: 중복 좋아요 방지
- `(node_id, user_id)` - node_memberships: 멤버십 확인

---

## 🔐 데이터 무결성

### Cascade 삭제
- users 삭제 시 → 모든 관련 데이터 삭제
- nodes 삭제 시 → node_memberships, node_roles 등 삭제
- posts 삭제 시 → post_likes, comments 삭제
- family_members 삭제 시 → 모든 가족 관련 데이터 삭제

### Unique 제약
- (follower_id, following_id) - 중복 연결 방지
- (post_id, user_id) - 중복 좋아요 방지
- (node_id, user_id) - 중복 멤버십 방지
- (person_id, relative_id, relationship_type) - 중복 관계 방지

### Check 제약
- gender IN ('male', 'female')
- status IN ('pending', 'approved', 'rejected')
- relationship_level BETWEEN 1 AND 5
- event_type IN (birth, wedding, death 등)

---

## 📊 통계 및 집계 필드

### 카운터 필드
- posts.likes_count, posts.comments_count
- nodes.member_count, nodes.verified_member_count
- hashtags.usage_count
- node_memberships.verification_count, activity_score
- family_photos.likes_count

### 상태 추적
- created_at, updated_at (대부분 테이블)
- verified_at, approved_at (인증/승인 관련)
- joined_at, left_at (멤버십 관련)
- expires_at (초대 관련)

---

## 🚀 확장 가능성

### 향후 추가 가능한 기능
1. **지불 시스템**: subscriptions, payments, invoices 테이블
2. **이벤트 시스템**: events, tickets, attendees 테이블
3. **채팅 시스템**: conversations, chat_messages 테이블
4. **파일 관리**: files, folders, permissions 테이블
5. **분석 시스템**: analytics_events, user_activities 테이블

### 성능 최적화 방안
1. 읽기 전용 복제본 구축
2. 캐싱 레이어 추가 (Redis)
3. 파티셔닝 (시간 기반, 사용자 기반)
4. 전문 검색 엔진 통합 (Elasticsearch)

---

## 📝 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 0001 | 2026-02-20 | 초기 스키마 (사용자, 소셜 네트워크) |
| 0002 | 2026-02-20 | 가족 트리 시스템 추가 |
| 0003 | 2026-02-20 | 노드 확장 시스템 추가 |
| 0004 | 2026-02-23 | 가족 고급 기능 (앨범, 이벤트, 초대) |
| 0005 | 2026-02-23 | 알림 시스템 및 검색 기능 |
| 0006 | 2026-02-23 | 게시물 고급 기능 (해시태그, 공유) |

---

**문서 생성일**: 2026-02-23  
**총 테이블 수**: 44개  
**총 인덱스 수**: 70+개  
**마지막 마이그레이션**: 0006_posts_advanced.sql
