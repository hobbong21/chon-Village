-- Insert sample family members for John Doe (user_id = 1)
-- John Doe의 가족 구성

-- 1. John Doe 본인
INSERT OR IGNORE INTO family_members (id, user_id, name_ko, name_en, birth_date, gender, is_alive, is_registered, created_by) VALUES 
  (1, 1, '존 도', 'John Doe', '1990-05-15', 'male', 1, 1, 1);

-- 2. 아버지
INSERT OR IGNORE INTO family_members (id, user_id, name_ko, name_en, birth_date, gender, is_alive, is_registered, created_by) VALUES 
  (2, NULL, '제임스 도', 'James Doe', '1960-03-20', 'male', 1, 0, 1);

-- 3. 어머니
INSERT OR IGNORE INTO family_members (id, user_id, name_ko, name_en, birth_date, gender, is_alive, is_registered, created_by) VALUES 
  (3, NULL, '메리 도', 'Mary Doe', '1962-07-10', 'female', 1, 0, 1);

-- 4. 형
INSERT OR IGNORE INTO family_members (id, user_id, name_ko, name_en, birth_date, gender, is_alive, is_registered, created_by) VALUES 
  (4, NULL, '마이클 도', 'Michael Doe', '1987-12-05', 'male', 1, 0, 1);

-- 5. 여동생
INSERT OR IGNORE INTO family_members (id, user_id, name_ko, name_en, birth_date, gender, is_alive, is_registered, created_by) VALUES 
  (5, NULL, '사라 도', 'Sarah Doe', '1992-09-22', 'female', 1, 0, 1);

-- 6. 배우자
INSERT OR IGNORE INTO family_members (id, user_id, name_ko, name_en, birth_date, gender, is_alive, is_registered, created_by) VALUES 
  (6, NULL, '에밀리 도', 'Emily Doe', '1991-11-08', 'female', 1, 0, 1);

-- 7. 자녀1
INSERT OR IGNORE INTO family_members (id, user_id, name_ko, name_en, birth_date, gender, is_alive, is_registered, created_by) VALUES 
  (7, NULL, '리사 도', 'Lisa Doe', '2015-04-12', 'female', 1, 0, 1);

-- 8. 자녀2
INSERT OR IGNORE INTO family_members (id, user_id, name_ko, name_en, birth_date, gender, is_alive, is_registered, created_by) VALUES 
  (8, NULL, '톰 도', 'Tom Doe', '2018-08-25', 'male', 1, 0, 1);

-- Insert contact information
INSERT OR IGNORE INTO contact_info (family_member_id, contact_type, contact_value, is_primary) VALUES 
  (1, 'email', 'john.doe@example.com', 1),
  (1, 'phone', '010-1234-5678', 1),
  (2, 'phone', '010-1111-2222', 1),
  (3, 'phone', '010-3333-4444', 1),
  (4, 'email', 'michael.doe@example.com', 1),
  (5, 'email', 'sarah.doe@example.com', 1),
  (6, 'email', 'emily.doe@example.com', 1);

-- Insert relationships (John Doe's perspective)
-- Parents
INSERT OR IGNORE INTO family_relationships (person_id, relative_id, relationship_type, is_verified) VALUES 
  (1, 2, 'father', 1),
  (1, 3, 'mother', 1);

-- Siblings
INSERT OR IGNORE INTO family_relationships (person_id, relative_id, relationship_type, is_verified) VALUES 
  (1, 4, 'sibling', 1),
  (1, 5, 'sibling', 1);

-- Spouse
INSERT OR IGNORE INTO family_relationships (person_id, relative_id, relationship_type, is_verified) VALUES 
  (1, 6, 'spouse', 1);

-- Children
INSERT OR IGNORE INTO family_relationships (person_id, relative_id, relationship_type, is_verified) VALUES 
  (1, 7, 'child', 1),
  (1, 8, 'child', 1);

-- Reverse relationships (for bidirectional queries)
INSERT OR IGNORE INTO family_relationships (person_id, relative_id, relationship_type, is_verified) VALUES 
  (2, 1, 'child', 1),
  (3, 1, 'child', 1),
  (4, 1, 'sibling', 1),
  (5, 1, 'sibling', 1),
  (6, 1, 'spouse', 1),
  (7, 1, 'father', 1),
  (8, 1, 'father', 1);

-- Insert marriage event
INSERT OR IGNORE INTO marriage_events (person_id, spouse_id, marriage_date, is_verified) VALUES 
  (1, 6, '2014-06-20', 1);

-- Insert family profiles
INSERT OR IGNORE INTO family_profiles (family_member_id, occupation, education, bio, is_public) VALUES 
  (1, 'Software Engineer', 'Stanford University', '안녕하세요. 소프트웨어 엔지니어 존입니다.', 1),
  (2, 'Retired Engineer', 'MIT', '은퇴한 엔지니어입니다.', 1),
  (3, 'Teacher', 'Harvard University', '초등학교 선생님입니다.', 1),
  (4, 'Doctor', 'Johns Hopkins', '의사로 일하고 있습니다.', 1),
  (5, 'Designer', 'RISD', 'UX 디자이너입니다.', 1),
  (6, 'Marketing Manager', 'UCLA', '마케팅 매니저로 일하고 있습니다.', 1);

-- Insert privacy settings (기본적으로 모든 정보 공개)
INSERT OR IGNORE INTO privacy_settings (family_member_id, field_name, is_visible) VALUES 
  (1, 'birth_date', 1),
  (1, 'contact_info', 1),
  (1, 'occupation', 1),
  (1, 'education', 1);
