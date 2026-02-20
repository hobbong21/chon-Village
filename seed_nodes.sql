-- Sample Node Data (노드 확장 시스템 샘플 데이터)

-- 1. 학교 노드 생성
INSERT OR IGNORE INTO nodes (id, node_type_id, name, description, creator_id, visibility, location, member_count, verified_member_count, is_verified, verification_level) VALUES
  (1, 2, 'Stanford University CS Department', '스탠포드 대학교 컴퓨터과학과', 1, 'public', 'Stanford, CA', 5, 3, 1, 4),
  (2, 2, 'Seoul High School Class of 2010', '서울고등학교 2010년 졸업반', 1, 'private', 'Seoul, Korea', 8, 5, 1, 3);

-- 2. 직장 노드 생성
INSERT OR IGNORE INTO nodes (id, node_type_id, name, description, creator_id, visibility, location, member_count, verified_member_count, is_verified, verification_level) VALUES
  (3, 3, 'Tech Corp Engineering Team', '테크코프 엔지니어링 팀', 1, 'invite_only', 'San Francisco, CA', 12, 10, 1, 5),
  (4, 3, 'Startup Inc', '스타트업 주식회사', 1, 'private', 'Seoul, Korea', 6, 4, 1, 3);

-- 3. 동호회 노드 생성
INSERT OR IGNORE INTO nodes (id, node_type_id, name, description, creator_id, visibility, location, member_count, verified_member_count) VALUES
  (5, 4, 'Mountain Hiking Club', '등산 동호회', 1, 'public', 'Seoul, Korea', 15, 8),
  (6, 4, 'Photography Lovers', '사진 동호회', 2, 'public', 'Seoul, Korea', 10, 6),
  (7, 6, 'K-Pop Fans United', 'K-Pop 팬클럽', 3, 'public', 'Online', 50, 20);

-- 4. 노드 역할 정의 (학교)
INSERT OR IGNORE INTO node_roles (node_id, role_name, role_name_ko, level, color) VALUES
  -- Stanford University
  (1, 'professor', '교수', 3, '#8b5cf6'),
  (1, 'teaching_assistant', '조교', 2, '#3b82f6'),
  (1, 'student', '학생', 1, '#10b981'),
  
  -- Seoul High School
  (2, 'class_president', '반장', 2, '#f59e0b'),
  (2, 'vice_president', '부반장', 2, '#fb923c'),
  (2, 'classmate', '학우', 1, '#60a5fa');

-- 5. 노드 역할 정의 (직장)
INSERT OR IGNORE INTO node_roles (node_id, role_name, role_name_ko, level, color) VALUES
  -- Tech Corp
  (3, 'ceo', '대표', 3, '#8b5cf6'),
  (3, 'cto', '기술이사', 3, '#a78bfa'),
  (3, 'director', '이사', 3, '#c4b5fd'),
  (3, 'team_lead', '팀장', 2, '#f59e0b'),
  (3, 'senior_engineer', '선임 엔지니어', 2, '#fbbf24'),
  (3, 'engineer', '엔지니어', 1, '#3b82f6'),
  (3, 'intern', '인턴', 1, '#93c5fd'),
  
  -- Startup Inc
  (4, 'founder', '창업자', 3, '#ec4899'),
  (4, 'co_founder', '공동창업자', 3, '#f472b6'),
  (4, 'employee', '직원', 1, '#60a5fa');

-- 6. 노드 역할 정의 (동호회)
INSERT OR IGNORE INTO node_roles (node_id, role_name, role_name_ko, level, color) VALUES
  -- Mountain Hiking Club
  (5, 'club_president', '회장', 3, '#10b981'),
  (5, 'vice_president', '부회장', 2, '#34d399'),
  (5, 'member', '회원', 1, '#6ee7b7'),
  
  -- Photography Lovers
  (6, 'admin', '관리자', 2, '#f59e0b'),
  (6, 'member', '회원', 1, '#fbbf24'),
  
  -- K-Pop Fans
  (7, 'fanclub_leader', '팬클럽장', 3, '#ef4444'),
  (7, 'moderator', '운영진', 2, '#f87171'),
  (7, 'fan', '팬', 1, '#fca5a5');

-- 7. 노드 멤버십 (John Doe의 소속)
INSERT OR IGNORE INTO node_memberships (node_id, user_id, role_id, relationship_level, status, is_verified, verification_count, activity_score, share_profile, share_contact, joined_at) VALUES
  -- Stanford University (교수 역할은 없으므로 학생으로)
  (1, 1, 3, 3, 'approved', 1, 5, 250, 1, 1, '2015-09-01'),
  
  -- Seoul High School (학우)
  (2, 1, 6, 4, 'approved', 1, 8, 500, 1, 1, '2007-03-01'),
  
  -- Tech Corp (엔지니어)
  (3, 1, 6, 5, 'approved', 1, 12, 1200, 1, 1, '2018-01-15'),
  
  -- Mountain Hiking Club (회원)
  (5, 1, 3, 3, 'approved', 1, 6, 300, 1, 0, '2020-05-10');

-- 8. 다른 사용자들의 멤버십
INSERT OR IGNORE INTO node_memberships (node_id, user_id, role_id, relationship_level, status, is_verified, verification_count, activity_score, joined_at) VALUES
  -- Jane Smith at Tech Corp (팀장)
  (3, 2, 4, 4, 'approved', 1, 10, 800, '2017-03-01'),
  
  -- Mike Johnson at Stanford (학생)
  (1, 3, 3, 2, 'approved', 1, 2, 50, '2016-09-01'),
  
  -- Sarah Williams at Photography Lovers (관리자)
  (6, 4, 4, 4, 'approved', 1, 8, 600, '2019-06-01'),
  
  -- David Brown at K-Pop Fans (팬클럽장)
  (7, 5, 7, 5, 'approved', 1, 15, 1500, '2018-01-01');

-- 9. 멤버십 인증 기록
INSERT OR IGNORE INTO membership_verifications (membership_id, verified_by_user_id, verification_type, status, comment, created_at, approved_at) VALUES
  -- John Doe's Stanford membership verified by Mike
  (1, 3, 'mutual', 'approved', '같은 수업을 들었습니다', '2015-09-15', '2015-09-15'),
  
  -- John Doe's Tech Corp membership verified by Jane
  (3, 2, 'mutual', 'approved', '같은 팀에서 근무합니다', '2018-01-20', '2018-01-20'),
  
  -- John Doe's Seoul High verified by classmates
  (2, 2, 'mutual', 'approved', '같은 반 친구입니다', '2007-03-10', '2007-03-10');

-- 10. 노드 활동 로그
INSERT OR IGNORE INTO node_activity_logs (node_id, user_id, activity_type, points) VALUES
  (1, 1, 'join', 10),
  (1, 1, 'verify', 20),
  (2, 1, 'join', 10),
  (2, 1, 'post', 5),
  (3, 1, 'join', 10),
  (3, 1, 'verify', 20),
  (5, 1, 'join', 10),
  (5, 1, 'post', 5);

-- 11. 노드 초대 (대기중인 초대)
INSERT OR IGNORE INTO node_invitations (node_id, inviter_id, invitee_email, role_id, message, token, expires_at) VALUES
  (5, 1, 'friend@example.com', 3, '등산 동호회에 초대합니다!', 'invite-token-12345', datetime('now', '+7 days')),
  (6, 4, 'photographer@example.com', 5, '사진 동호회에 함께 하실래요?', 'invite-token-67890', datetime('now', '+7 days'));

-- 12. 노드 간 연결 (제휴 관계)
INSERT OR IGNORE INTO node_connections (from_node_id, to_node_id, connection_type, status, requested_by, description) VALUES
  -- Stanford <-> Tech Corp (채용 파트너십)
  (1, 3, 'partnership', 'approved', 1, '인턴십 및 채용 협력'),
  
  -- Mountain Hiking <-> Photography (공동 활동)
  (5, 6, 'affiliated', 'approved', 1, '야외 사진 촬영 공동 활동');
