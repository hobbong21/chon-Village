-- Seed data for posts with hashtags and shares

-- Sample hashtags
INSERT OR IGNORE INTO hashtags (tag, usage_count) VALUES 
  ('개발', 15),
  ('코딩', 12),
  ('JavaScript', 10),
  ('React', 8),
  ('TypeScript', 7),
  ('웹개발', 9),
  ('프론트엔드', 6),
  ('백엔드', 5),
  ('데이터베이스', 4),
  ('클라우드', 3);

-- Create some posts with hashtags
UPDATE posts SET content = '오늘 #JavaScript와 #React로 새로운 프로젝트를 시작했습니다! 너무 재미있어요 🚀 #웹개발 #프론트엔드' WHERE id = 1;
UPDATE posts SET content = '#TypeScript로 마이그레이션 완료! 타입 안정성이 확실히 좋네요 👍 #개발 #코딩' WHERE id = 2;
UPDATE posts SET content = '새로운 #백엔드 API를 #Node.js로 구현했습니다. #데이터베이스 최적화도 완료! 성능이 2배 향상되었어요 ⚡' WHERE id = 3;

-- Link posts to hashtags
-- Post 1: JavaScript, React, 웹개발, 프론트엔드
INSERT OR IGNORE INTO post_hashtags (post_id, hashtag_id) VALUES 
  (1, (SELECT id FROM hashtags WHERE tag = 'JavaScript')),
  (1, (SELECT id FROM hashtags WHERE tag = 'React')),
  (1, (SELECT id FROM hashtags WHERE tag = '웹개발')),
  (1, (SELECT id FROM hashtags WHERE tag = '프론트엔드'));

-- Post 2: TypeScript, 개발, 코딩
INSERT OR IGNORE INTO post_hashtags (post_id, hashtag_id) VALUES 
  (2, (SELECT id FROM hashtags WHERE tag = 'TypeScript')),
  (2, (SELECT id FROM hashtags WHERE tag = '개발')),
  (2, (SELECT id FROM hashtags WHERE tag = '코딩'));

-- Post 3: 백엔드, 데이터베이스
INSERT OR IGNORE INTO post_hashtags (post_id, hashtag_id) VALUES 
  (3, (SELECT id FROM hashtags WHERE tag = '백엔드')),
  (3, (SELECT id FROM hashtags WHERE tag = '데이터베이스'));

-- Sample post shares
INSERT OR IGNORE INTO post_shares (post_id, user_id) VALUES 
  (1, 2),
  (1, 3),
  (2, 1),
  (2, 3),
  (3, 1);
