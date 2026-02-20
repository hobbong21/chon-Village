-- Family members table (확장된 사용자 정보)
CREATE TABLE IF NOT EXISTS family_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE, -- users 테이블과 연결 (로그인한 사용자만)
  name_ko TEXT, -- 한글 이름
  name_en TEXT, -- 영문 이름
  birth_date TEXT,
  gender TEXT CHECK(gender IN ('male', 'female')),
  is_alive BOOLEAN DEFAULT 1,
  is_registered BOOLEAN DEFAULT 0, -- 회원가입 여부
  created_by INTEGER NOT NULL, -- 누가 이 정보를 생성했는지
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Contact information (연락처는 누적)
CREATE TABLE IF NOT EXISTS contact_info (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  family_member_id INTEGER NOT NULL,
  contact_type TEXT NOT NULL CHECK(contact_type IN ('phone', 'address', 'email')),
  contact_value TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE CASCADE
);

-- Relationships between family members
CREATE TABLE IF NOT EXISTS family_relationships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  person_id INTEGER NOT NULL, -- 관계의 주체
  relative_id INTEGER NOT NULL, -- 상대방
  relationship_type TEXT NOT NULL, -- father, mother, sibling, spouse, child
  is_verified BOOLEAN DEFAULT 0, -- 상호 인증 여부
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(person_id, relative_id, relationship_type),
  FOREIGN KEY (person_id) REFERENCES family_members(id) ON DELETE CASCADE,
  FOREIGN KEY (relative_id) REFERENCES family_members(id) ON DELETE CASCADE
);

-- Relationship verification requests
CREATE TABLE IF NOT EXISTS relationship_verifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  requester_id INTEGER NOT NULL, -- 요청자
  target_id INTEGER NOT NULL, -- 대상자 (family_member_id)
  relationship_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'rejected')),
  verification_code TEXT, -- 인증 코드 (연락처로 전송)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  responded_at DATETIME,
  FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (target_id) REFERENCES family_members(id) ON DELETE CASCADE
);

-- Marriage events
CREATE TABLE IF NOT EXISTS marriage_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  person_id INTEGER NOT NULL,
  spouse_id INTEGER NOT NULL,
  marriage_date TEXT,
  is_verified BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(person_id, spouse_id),
  FOREIGN KEY (person_id) REFERENCES family_members(id) ON DELETE CASCADE,
  FOREIGN KEY (spouse_id) REFERENCES family_members(id) ON DELETE CASCADE
);

-- Additional profile information (선택적 정보)
CREATE TABLE IF NOT EXISTS family_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  family_member_id INTEGER UNIQUE NOT NULL,
  occupation TEXT,
  education TEXT,
  bio TEXT,
  profile_image TEXT,
  is_public BOOLEAN DEFAULT 0, -- 공개 여부 (인증된 가족에게만)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE CASCADE
);

-- Privacy settings per field
CREATE TABLE IF NOT EXISTS privacy_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  family_member_id INTEGER NOT NULL,
  field_name TEXT NOT NULL, -- birth_date, contact_info, occupation, etc.
  is_visible BOOLEAN DEFAULT 1,
  UNIQUE(family_member_id, field_name),
  FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_family_members_user ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_created_by ON family_members(created_by);
CREATE INDEX IF NOT EXISTS idx_contact_info_member ON contact_info(family_member_id);
CREATE INDEX IF NOT EXISTS idx_relationships_person ON family_relationships(person_id);
CREATE INDEX IF NOT EXISTS idx_relationships_relative ON family_relationships(relative_id);
CREATE INDEX IF NOT EXISTS idx_verifications_target ON relationship_verifications(target_id);
CREATE INDEX IF NOT EXISTS idx_verifications_status ON relationship_verifications(status);
CREATE INDEX IF NOT EXISTS idx_marriage_person ON marriage_events(person_id);
CREATE INDEX IF NOT EXISTS idx_marriage_spouse ON marriage_events(spouse_id);
