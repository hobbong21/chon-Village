-- Family Album - 가족 앨범
CREATE TABLE IF NOT EXISTS family_albums (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  family_member_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS family_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  album_id INTEGER NOT NULL,
  uploaded_by INTEGER NOT NULL, -- family_member_id
  image_url TEXT NOT NULL,
  caption TEXT,
  photo_date TEXT, -- 사진 촬영 날짜
  is_public BOOLEAN DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (album_id) REFERENCES family_albums(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES family_members(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS photo_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  photo_id INTEGER NOT NULL,
  family_member_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (photo_id) REFERENCES family_photos(id) ON DELETE CASCADE,
  FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE CASCADE
);

-- Family Events - 가족 이벤트 타임라인
CREATE TABLE IF NOT EXISTS family_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_by INTEGER NOT NULL, -- family_member_id
  event_type TEXT NOT NULL CHECK(event_type IN ('birth', 'wedding', 'death', 'graduation', 'birthday', 'anniversary', 'custom')),
  title TEXT NOT NULL,
  description TEXT,
  event_date TEXT NOT NULL,
  location TEXT,
  image_url TEXT,
  is_public BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES family_members(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS event_participants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL,
  family_member_id INTEGER NOT NULL,
  role TEXT, -- 역할 (예: 주인공, 참석자)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES family_events(id) ON DELETE CASCADE,
  FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE CASCADE
);

-- Family Invitations - 가족 초대 링크
CREATE TABLE IF NOT EXISTS family_invitations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_by INTEGER NOT NULL, -- family_member_id
  invitation_token TEXT UNIQUE NOT NULL,
  relationship_type TEXT, -- 초대할 관계 (선택사항)
  max_uses INTEGER DEFAULT 1,
  uses_count INTEGER DEFAULT 0,
  expires_at DATETIME,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES family_members(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS invitation_acceptances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invitation_id INTEGER NOT NULL,
  family_member_id INTEGER NOT NULL,
  accepted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invitation_id) REFERENCES family_invitations(id) ON DELETE CASCADE,
  FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_family_photos_album ON family_photos(album_id);
CREATE INDEX IF NOT EXISTS idx_family_photos_uploader ON family_photos(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_photo_tags_photo ON photo_tags(photo_id);
CREATE INDEX IF NOT EXISTS idx_photo_tags_member ON photo_tags(family_member_id);
CREATE INDEX IF NOT EXISTS idx_family_events_creator ON family_events(created_by);
CREATE INDEX IF NOT EXISTS idx_family_events_date ON family_events(event_date);
CREATE INDEX IF NOT EXISTS idx_event_participants_event ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_member ON event_participants(family_member_id);
CREATE INDEX IF NOT EXISTS idx_family_invitations_token ON family_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_family_invitations_creator ON family_invitations(created_by);
