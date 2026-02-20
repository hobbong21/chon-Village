-- Extended Family Data for John Doe (user_id = 1)
-- 확장 가족 데이터: 조부모, 형제의 배우자 및 자녀

-- ==================== 조부모 (Grandparents) ====================

-- 9. 할아버지 (아버지 쪽)
INSERT OR IGNORE INTO family_members (id, user_id, name_ko, name_en, birth_date, gender, is_alive, is_registered, created_by) VALUES 
  (9, NULL, '윌리엄 도', 'William Doe', '1935-08-15', 'male', 0, 0, 1);

-- 10. 할머니 (아버지 쪽)
INSERT OR IGNORE INTO family_members (id, user_id, name_ko, name_en, birth_date, gender, is_alive, is_registered, created_by) VALUES 
  (10, NULL, '마거릿 도', 'Margaret Doe', '1938-11-22', 'female', 1, 0, 1);

-- 11. 외할아버지 (어머니 쪽)
INSERT OR IGNORE INTO family_members (id, user_id, name_ko, name_en, birth_date, gender, is_alive, is_registered, created_by) VALUES 
  (11, NULL, '로버트 스미스', 'Robert Smith', '1937-02-10', 'male', 1, 0, 1);

-- 12. 외할머니 (어머니 쪽)
INSERT OR IGNORE INTO family_members (id, user_id, name_ko, name_en, birth_date, gender, is_alive, is_registered, created_by) VALUES 
  (12, NULL, '헬렌 스미스', 'Helen Smith', '1940-06-18', 'female', 1, 0, 1);

-- ==================== 형의 가족 (Brother's Family) ====================

-- 13. 형수 (Michael's wife)
INSERT OR IGNORE INTO family_members (id, user_id, name_ko, name_en, birth_date, gender, is_alive, is_registered, created_by) VALUES 
  (13, NULL, '제니퍼 도', 'Jennifer Doe', '1989-03-25', 'female', 1, 0, 1);

-- 14. 조카1 (Michael's son)
INSERT OR IGNORE INTO family_members (id, user_id, name_ko, name_en, birth_date, gender, is_alive, is_registered, created_by) VALUES 
  (14, NULL, '데이빗 도', 'David Doe', '2012-09-12', 'male', 1, 0, 1);

-- 15. 조카2 (Michael's daughter)
INSERT OR IGNORE INTO family_members (id, user_id, name_ko, name_en, birth_date, gender, is_alive, is_registered, created_by) VALUES 
  (15, NULL, '올리비아 도', 'Olivia Doe', '2014-11-08', 'female', 1, 0, 1);

-- ==================== 여동생의 가족 (Sister's Family) ====================

-- 16. 매형 (Sarah's husband)
INSERT OR IGNORE INTO family_members (id, user_id, name_ko, name_en, birth_date, gender, is_alive, is_registered, created_by) VALUES 
  (16, NULL, '브라이언 존슨', 'Brian Johnson', '1991-07-30', 'male', 1, 0, 1);

-- 17. 조카3 (Sarah's daughter)
INSERT OR IGNORE INTO family_members (id, user_id, name_ko, name_en, birth_date, gender, is_alive, is_registered, created_by) VALUES 
  (17, NULL, '소피아 존슨', 'Sophia Johnson', '2016-05-20', 'female', 1, 0, 1);

-- ==================== 연락처 정보 ====================

INSERT OR IGNORE INTO contact_info (family_member_id, contact_type, contact_value, is_primary) VALUES 
  (9, 'phone', '010-5555-6666', 1),
  (10, 'phone', '010-7777-8888', 1),
  (11, 'phone', '010-9999-0000', 1),
  (12, 'phone', '010-1212-3434', 1),
  (13, 'email', 'jennifer.doe@example.com', 1),
  (13, 'phone', '010-4567-8901', 0),
  (16, 'email', 'brian.johnson@example.com', 1),
  (16, 'phone', '010-2345-6789', 0);

-- ==================== 관계 설정 ====================

-- John Doe의 조부모 관계
INSERT OR IGNORE INTO family_relationships (person_id, relative_id, relationship_type, is_verified) VALUES 
  (1, 9, 'grandfather', 1),
  (1, 10, 'grandmother', 1),
  (1, 11, 'grandfather', 1),
  (1, 12, 'grandmother', 1);

-- 부모와 조부모의 관계
INSERT OR IGNORE INTO family_relationships (person_id, relative_id, relationship_type, is_verified) VALUES 
  (2, 9, 'father', 1),
  (2, 10, 'mother', 1),
  (3, 11, 'father', 1),
  (3, 12, 'mother', 1);

-- 형과 형수의 결혼 관계
INSERT OR IGNORE INTO family_relationships (person_id, relative_id, relationship_type, is_verified) VALUES 
  (4, 13, 'spouse', 1),
  (13, 4, 'spouse', 1);

-- 형의 자녀들 (John의 조카)
INSERT OR IGNORE INTO family_relationships (person_id, relative_id, relationship_type, is_verified) VALUES 
  (4, 14, 'child', 1),
  (4, 15, 'child', 1),
  (13, 14, 'child', 1),
  (13, 15, 'child', 1),
  (1, 14, 'nephew', 1),
  (1, 15, 'niece', 1);

-- 여동생과 매형의 결혼 관계
INSERT OR IGNORE INTO family_relationships (person_id, relative_id, relationship_type, is_verified) VALUES 
  (5, 16, 'spouse', 1),
  (16, 5, 'spouse', 1);

-- 여동생의 자녀 (John의 조카)
INSERT OR IGNORE INTO family_relationships (person_id, relative_id, relationship_type, is_verified) VALUES 
  (5, 17, 'child', 1),
  (16, 17, 'child', 1),
  (1, 17, 'niece', 1);

-- ==================== 결혼 이벤트 ====================

INSERT OR IGNORE INTO marriage_events (person_id, spouse_id, marriage_date, is_verified) VALUES 
  (4, 13, '2011-08-15', 1),
  (5, 16, '2015-10-10', 1),
  (2, 3, '1986-05-20', 1);

-- ==================== 가족 프로필 ====================

INSERT OR IGNORE INTO family_profiles (family_member_id, occupation, education, bio, is_public) VALUES 
  (9, 'Retired Military Officer', 'West Point', '전직 군인으로 명예롭게 은퇴했습니다.', 1),
  (10, 'Homemaker', 'High School', '평생 가정을 지켰습니다.', 1),
  (11, 'Retired Professor', 'Yale University', '대학 교수로 40년간 재직했습니다.', 1),
  (12, 'Retired Nurse', 'Nursing School', '간호사로 평생 봉사했습니다.', 1),
  (13, 'Lawyer', 'Columbia Law School', '변호사로 일하고 있습니다.', 1),
  (16, 'Software Architect', 'Berkeley', '소프트웨어 아키텍트입니다.', 1),
  (14, 'Student', 'Elementary School', '초등학생입니다.', 1),
  (15, 'Student', 'Elementary School', '초등학생입니다.', 1),
  (17, 'Student', 'Kindergarten', '유치원생입니다.', 1);

-- ==================== 개인정보 설정 ====================

INSERT OR IGNORE INTO privacy_settings (family_member_id, field_name, is_visible) VALUES 
  (9, 'birth_date', 1),
  (10, 'birth_date', 1),
  (11, 'birth_date', 1),
  (12, 'birth_date', 1),
  (13, 'birth_date', 1),
  (13, 'contact_info', 1),
  (16, 'birth_date', 1),
  (16, 'contact_info', 1);
