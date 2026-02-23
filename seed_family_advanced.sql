-- Seed data for family advanced features

-- Insert sample albums
INSERT INTO family_albums (family_member_id, title, description) VALUES
(1, '2024년 가족 여행', '제주도 가족 여행 사진들'),
(1, '명절 모임', '설날과 추석 가족 모임 사진들'),
(2, '아이들 성장 앨범', '아이들이 자라는 모습을 담은 사진들');

-- Insert sample photos
INSERT INTO family_photos (album_id, uploaded_by, image_url, caption, photo_date, is_public) VALUES
(1, 1, 'https://picsum.photos/800/600?random=1', '제주 해변에서', '2024-08-15', 1),
(1, 1, 'https://picsum.photos/800/600?random=2', '성산일출봉 정상', '2024-08-16', 1),
(1, 2, 'https://picsum.photos/800/600?random=3', '가족 단체 사진', '2024-08-17', 1),
(2, 1, 'https://picsum.photos/800/600?random=4', '설날 차례상', '2024-02-10', 1),
(2, 1, 'https://picsum.photos/800/600?random=5', '온 가족이 모였어요', '2024-09-17', 1),
(3, 2, 'https://picsum.photos/800/600?random=6', '첫 돌 사진', '2023-03-20', 1),
(3, 2, 'https://picsum.photos/800/600?random=7', '유치원 입학', '2025-03-02', 1);

-- Insert sample events
INSERT INTO family_events (created_by, event_type, title, description, event_date, location, is_public) VALUES
(1, 'birthday', 'John Doe 생일', '아버지 생일 파티', '1985-03-15', '서울시 강남구', 1),
(1, 'wedding', 'John과 Emily 결혼 기념일', '결혼 5주년', '2019-06-20', '서울 웨딩홀', 1),
(2, 'birth', 'Sara Do 탄생', '둘째 딸 출생', '2023-03-20', '서울대병원', 1),
(1, 'graduation', 'Michael Do 대학 졸업', '컴퓨터공학과 졸업', '2022-02-28', 'Stanford University', 1),
(2, 'birthday', 'Sara Do 첫 돌', '사랑스러운 우리 딸', '2024-03-20', '집', 1),
(1, 'anniversary', '부모님 결혼 기념일', '부모님 결혼 30주년', '1994-05-15', '서울', 1),
(1, 'custom', '가족 제주도 여행', '여름 휴가', '2024-08-15', '제주도', 1);

-- Add participants to events
INSERT INTO event_participants (event_id, family_member_id, role) VALUES
(1, 1, '주인공'),
(1, 2, '참석자'),
(1, 3, '참석자'),
(2, 1, '주인공'),
(2, 5, '주인공'),
(3, 2, '엄마'),
(3, 4, '주인공'),
(4, 3, '주인공'),
(5, 4, '주인공'),
(5, 1, '아빠'),
(5, 2, '엄마'),
(7, 1, '아빠'),
(7, 2, '엄마'),
(7, 3, '아들'),
(7, 4, '딸');
