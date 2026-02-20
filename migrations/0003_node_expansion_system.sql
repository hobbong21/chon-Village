-- Migration: Node Expansion System (2단계)
-- 노드 확장 시스템: 학교, 직장, 동호회 등 커뮤니티 그룹

-- 1. 노드 타입 테이블
CREATE TABLE IF NOT EXISTS node_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  name_ko TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 기본 노드 타입 삽입
INSERT OR IGNORE INTO node_types (id, name, name_ko, icon, color, description) VALUES
  (1, 'family', '가족', 'fa-home', '#10b981', '가족 관계 기반 노드'),
  (2, 'school', '학교', 'fa-graduation-cap', '#3b82f6', '학교/교육 기관'),
  (3, 'company', '직장', 'fa-building', '#f59e0b', '회사/직장'),
  (4, 'club', '동호회', 'fa-users', '#8b5cf6', '취미/관심사 모임'),
  (5, 'community', '커뮤니티', 'fa-comments', '#ec4899', '지역/온라인 커뮤니티'),
  (6, 'fanclub', '팬클럽', 'fa-star', '#ef4444', '연예인/스포츠 팬클럽');

-- 2. 노드 테이블 (그룹/조직)
CREATE TABLE IF NOT EXISTS nodes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  node_type_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  creator_id INTEGER NOT NULL,
  
  -- 접근 권한 설정
  visibility TEXT DEFAULT 'private' CHECK(visibility IN ('public', 'private', 'invite_only')),
  join_approval_required INTEGER DEFAULT 1,
  
  -- 위치 정보
  location TEXT,
  address TEXT,
  
  -- 추가 정보
  website TEXT,
  contact_email TEXT,
  logo_url TEXT,
  
  -- 통계
  member_count INTEGER DEFAULT 0,
  verified_member_count INTEGER DEFAULT 0,
  
  -- 인증 상태
  is_verified INTEGER DEFAULT 0,
  verification_level INTEGER DEFAULT 1,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (node_type_id) REFERENCES node_types(id),
  FOREIGN KEY (creator_id) REFERENCES users(id)
);

-- 3. 노드 역할 테이블 (직책/역할)
CREATE TABLE IF NOT EXISTS node_roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  node_id INTEGER NOT NULL,
  role_name TEXT NOT NULL,
  role_name_ko TEXT NOT NULL,
  level INTEGER DEFAULT 1, -- 권한 레벨 (1: 일반, 2: 관리자, 3: 소유자)
  color TEXT,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
);

-- 4. 노드 멤버십 테이블 (사용자-노드 관계)
CREATE TABLE IF NOT EXISTS node_memberships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  node_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  role_id INTEGER,
  
  -- 관계 레벨 시스템 (1-5단계)
  relationship_level INTEGER DEFAULT 1 CHECK(relationship_level BETWEEN 1 AND 5),
  
  -- 인증 상태
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'blocked')),
  is_verified INTEGER DEFAULT 0,
  verified_at DATETIME,
  verified_by INTEGER,
  
  -- 활동 통계
  verification_count INTEGER DEFAULT 0, -- 받은 인증 횟수
  activity_score INTEGER DEFAULT 0,
  
  -- 정보 공개 설정
  share_profile INTEGER DEFAULT 0,
  share_contact INTEGER DEFAULT 0,
  share_activity INTEGER DEFAULT 0,
  
  -- 초대 정보
  invited_by INTEGER,
  invited_at DATETIME,
  
  joined_at DATETIME,
  left_at DATETIME,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (role_id) REFERENCES node_roles(id),
  FOREIGN KEY (invited_by) REFERENCES users(id),
  FOREIGN KEY (verified_by) REFERENCES users(id),
  
  UNIQUE(node_id, user_id)
);

-- 5. 노드 간 연결 테이블 (노드-노드 관계)
CREATE TABLE IF NOT EXISTS node_connections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_node_id INTEGER NOT NULL,
  to_node_id INTEGER NOT NULL,
  connection_type TEXT, -- 'partnership', 'parent-child', 'affiliated', etc.
  
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
  requested_by INTEGER NOT NULL,
  approved_by INTEGER,
  
  description TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  approved_at DATETIME,
  
  FOREIGN KEY (from_node_id) REFERENCES nodes(id) ON DELETE CASCADE,
  FOREIGN KEY (to_node_id) REFERENCES nodes(id) ON DELETE CASCADE,
  FOREIGN KEY (requested_by) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id),
  
  UNIQUE(from_node_id, to_node_id)
);

-- 6. 멤버십 인증 테이블 (상호 인증 기록)
CREATE TABLE IF NOT EXISTS membership_verifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  membership_id INTEGER NOT NULL,
  verified_by_user_id INTEGER NOT NULL,
  verification_type TEXT DEFAULT 'mutual' CHECK(verification_type IN ('mutual', 'admin', 'system')),
  
  -- 인증 근거
  evidence_type TEXT, -- 'photo', 'document', 'reference', etc.
  evidence_url TEXT,
  comment TEXT,
  
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  approved_at DATETIME,
  
  FOREIGN KEY (membership_id) REFERENCES node_memberships(id) ON DELETE CASCADE,
  FOREIGN KEY (verified_by_user_id) REFERENCES users(id)
);

-- 7. 노드 활동 로그
CREATE TABLE IF NOT EXISTS node_activity_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  node_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  activity_type TEXT NOT NULL, -- 'join', 'leave', 'post', 'comment', 'verify', etc.
  activity_data TEXT, -- JSON
  points INTEGER DEFAULT 0,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 8. 노드 초대 테이블
CREATE TABLE IF NOT EXISTS node_invitations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  node_id INTEGER NOT NULL,
  inviter_id INTEGER NOT NULL,
  invitee_email TEXT,
  invitee_user_id INTEGER,
  
  role_id INTEGER,
  message TEXT,
  
  token TEXT UNIQUE,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'rejected', 'expired')),
  
  expires_at DATETIME,
  accepted_at DATETIME,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE,
  FOREIGN KEY (inviter_id) REFERENCES users(id),
  FOREIGN KEY (invitee_user_id) REFERENCES users(id),
  FOREIGN KEY (role_id) REFERENCES node_roles(id)
);

-- 9. 관계 레벨 정의 테이블
CREATE TABLE IF NOT EXISTS relationship_levels (
  level INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  name_ko TEXT NOT NULL,
  description TEXT,
  color TEXT,
  min_verifications INTEGER DEFAULT 0,
  min_activity_score INTEGER DEFAULT 0,
  required_nodes_created INTEGER DEFAULT 0,
  required_verified_members INTEGER DEFAULT 0,
  is_premium INTEGER DEFAULT 0,
  
  -- 권한
  can_create_nodes INTEGER DEFAULT 0,
  can_invite_members INTEGER DEFAULT 0,
  can_verify_others INTEGER DEFAULT 0,
  max_nodes INTEGER DEFAULT 0,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 기본 관계 레벨 데이터
INSERT OR IGNORE INTO relationship_levels (level, name, name_ko, description, color, min_verifications, min_activity_score, can_create_nodes, can_invite_members, can_verify_others, max_nodes) VALUES
  (1, 'pending', '대기', '관계 입력 후 승인 대기', '#9ca3af', 0, 0, 0, 0, 0, 0),
  (2, 'connected', '연결', '상호 승인 완료', '#3b82f6', 1, 0, 1, 1, 0, 3),
  (3, 'active', '활동', '네트워크 활동 중 (3회 이상 인증)', '#10b981', 3, 100, 1, 1, 1, 10),
  (4, 'leader', '리더', '모임장 또는 인증 5명 이상', '#f59e0b', 5, 500, 1, 1, 1, 50),
  (5, 'verified', '공인', 'Admin 인증 (프리미엄)', '#8b5cf6', 10, 1000, 1, 1, 1, 999);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_nodes_creator ON nodes(creator_id);
CREATE INDEX IF NOT EXISTS idx_nodes_type ON nodes(node_type_id);
CREATE INDEX IF NOT EXISTS idx_node_memberships_user ON node_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_node_memberships_node ON node_memberships(node_id);
CREATE INDEX IF NOT EXISTS idx_node_memberships_status ON node_memberships(status);
CREATE INDEX IF NOT EXISTS idx_node_memberships_level ON node_memberships(relationship_level);
CREATE INDEX IF NOT EXISTS idx_node_connections_from ON node_connections(from_node_id);
CREATE INDEX IF NOT EXISTS idx_node_connections_to ON node_connections(to_node_id);
CREATE INDEX IF NOT EXISTS idx_membership_verifications_membership ON membership_verifications(membership_id);
CREATE INDEX IF NOT EXISTS idx_node_activity_logs_node ON node_activity_logs(node_id);
CREATE INDEX IF NOT EXISTS idx_node_activity_logs_user ON node_activity_logs(user_id);
