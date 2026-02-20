-- Simple Family Data for John Doe (user_id = 1)

-- John Doe's family member record (self)
INSERT OR IGNORE INTO family_members (id, user_id, name_ko, name_en, birth_date, gender, is_alive, is_registered, created_by) VALUES 
  (1, 1, '존 도', 'John Doe', '1990-05-15', 'male', 1, 1, 1);

-- Father
INSERT OR IGNORE INTO family_members (id, user_id, name_ko, name_en, birth_date, gender, is_alive, is_registered, created_by) VALUES 
  (2, NULL, '제임스 도', 'James Doe', '1960-03-20', 'male', 1, 0, 1);

-- Mother
INSERT OR IGNORE INTO family_members (id, user_id, name_ko, name_en, birth_date, gender, is_alive, is_registered, created_by) VALUES 
  (3, NULL, '메리 도', 'Mary Doe', '1962-07-10', 'female', 1, 0, 1);

-- Brother
INSERT OR IGNORE INTO family_members (id, user_id, name_ko, name_en, birth_date, gender, is_alive, is_registered, created_by) VALUES 
  (4, NULL, '마이클 도', 'Michael Doe', '1987-12-05', 'male', 1, 0, 1);

-- Sister
INSERT OR IGNORE INTO family_members (id, user_id, name_ko, name_en, birth_date, gender, is_alive, is_registered, created_by) VALUES 
  (5, NULL, '사라 도', 'Sarah Doe', '1992-09-22', 'female', 1, 0, 1);

-- Spouse
INSERT OR IGNORE INTO family_members (id, user_id, name_ko, name_en, birth_date, gender, is_alive, is_registered, created_by) VALUES 
  (6, NULL, '에밀리 도', 'Emily Doe', '1991-11-08', 'female', 1, 0, 1);

-- Child 1
INSERT OR IGNORE INTO family_members (id, user_id, name_ko, name_en, birth_date, gender, is_alive, is_registered, created_by) VALUES 
  (7, NULL, '리사 도', 'Lisa Doe', '2015-04-12', 'female', 1, 0, 1);

-- Child 2
INSERT OR IGNORE INTO family_members (id, user_id, name_ko, name_en, birth_date, gender, is_alive, is_registered, created_by) VALUES 
  (8, NULL, '톰 도', 'Tom Doe', '2018-08-25', 'male', 1, 0, 1);

-- Contact Information
INSERT OR IGNORE INTO contact_info (family_member_id, contact_type, contact_value, is_primary) VALUES
  (1, 'email', 'john.doe@example.com', 1),
  (1, 'phone', '010-1234-5678', 1),
  (2, 'phone', '010-1111-2222', 1),
  (3, 'phone', '010-3333-4444', 1),
  (4, 'email', 'michael.doe@example.com', 1),
  (5, 'email', 'sarah.doe@example.com', 1),
  (6, 'email', 'emily.doe@example.com', 1);

-- Family Relationships (John's perspective)
INSERT OR IGNORE INTO family_relationships (person_id, relative_id, relationship_type, is_verified) VALUES
  -- John's relationships
  (1, 2, 'father', 1),
  (1, 3, 'mother', 1),
  (1, 4, 'sibling', 1),
  (1, 5, 'sibling', 1),
  (1, 6, 'spouse', 1),
  (1, 7, 'child', 1),
  (1, 8, 'child', 1);

-- Reverse relationships
INSERT OR IGNORE INTO family_relationships (person_id, relative_id, relationship_type, is_verified) VALUES
  (2, 1, 'child', 1),
  (3, 1, 'child', 1),
  (4, 1, 'sibling', 1),
  (5, 1, 'sibling', 1),
  (6, 1, 'spouse', 1),
  (7, 1, 'father', 1),
  (8, 1, 'father', 1);

-- Marriage Event
INSERT OR IGNORE INTO marriage_events (person_id, spouse_id, marriage_date, is_verified) VALUES
  (1, 6, '2014-06-20', 1);

-- Family Profiles
INSERT OR IGNORE INTO family_profiles (family_member_id, occupation, education, bio, is_public) VALUES
  (1, 'Software Engineer', 'Stanford University, Computer Science', 'Passionate about technology and innovation', 1),
  (2, 'Retired Engineer', 'MIT', 'Worked in aerospace industry for 35 years', 1),
  (3, 'Teacher', 'Harvard University', 'Elementary school teacher', 1),
  (4, 'Doctor', 'Johns Hopkins University', 'Cardiologist', 1),
  (5, 'Designer', 'RISD', 'Graphic designer and artist', 1),
  (6, 'Marketing Manager', 'UCLA', 'Digital marketing specialist', 1);

-- Privacy Settings (John's settings)
INSERT OR IGNORE INTO privacy_settings (family_member_id, field_name, is_visible) VALUES
  (1, 'birth_date', 1),
  (1, 'contact_info', 1),
  (1, 'occupation', 1),
  (1, 'education', 1);
