-- ========================================
-- Dummy Users Seed Data (100 users)
-- ========================================
-- Purpose: Generate 100 test users with profiles and connections

-- Korean family names and given names for realistic names
-- Password hash is for 'password123' (bcrypt)

-- Users 1-20
INSERT INTO users (email, password_hash, full_name, headline, profile_image) VALUES
('kim.minho@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '김민호', 'Full Stack Developer', 'https://i.pravatar.cc/150?img=11'),
('lee.jiyeon@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '이지연', 'UI/UX Designer', 'https://i.pravatar.cc/150?img=12'),
('park.seojun@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '박서준', 'Data Scientist', 'https://i.pravatar.cc/150?img=13'),
('choi.yuna@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '최유나', 'Product Manager', 'https://i.pravatar.cc/150?img=14'),
('jung.daniel@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '정대니엘', 'DevOps Engineer', 'https://i.pravatar.cc/150?img=15'),
('kang.sohee@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '강소희', 'Marketing Specialist', 'https://i.pravatar.cc/150?img=16'),
('yoon.jihoon@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '윤지훈', 'Backend Developer', 'https://i.pravatar.cc/150?img=17'),
('han.minji@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '한민지', 'Frontend Developer', 'https://i.pravatar.cc/150?img=18'),
('shin.taehyung@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '신태형', 'AI Engineer', 'https://i.pravatar.cc/150?img=19'),
('lim.eunji@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '임은지', 'Business Analyst', 'https://i.pravatar.cc/150?img=20'),
('jang.woojin@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '장우진', 'iOS Developer', 'https://i.pravatar.cc/150?img=21'),
('oh.seoyeon@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '오서연', 'Android Developer', 'https://i.pravatar.cc/150?img=22'),
('kwon.minsoo@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '권민수', 'System Architect', 'https://i.pravatar.cc/150?img=23'),
('song.hyejin@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '송혜진', 'Graphic Designer', 'https://i.pravatar.cc/150?img=24'),
('baek.junho@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '백준호', 'Security Engineer', 'https://i.pravatar.cc/150?img=25'),
('nam.sora@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '남소라', 'Content Writer', 'https://i.pravatar.cc/150?img=26'),
('go.hyunwoo@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '고현우', 'Cloud Engineer', 'https://i.pravatar.cc/150?img=27'),
('yang.jiwon@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '양지원', 'HR Manager', 'https://i.pravatar.cc/150?img=28'),
('moon.sanghyun@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '문상현', 'Sales Director', 'https://i.pravatar.cc/150?img=29'),
('bae.yeonjung@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '배연정', 'Finance Manager', 'https://i.pravatar.cc/150?img=30');

-- Users 21-40
INSERT INTO users (email, password_hash, full_name, headline, profile_image) VALUES
('seo.donghyun@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '서동현', 'Machine Learning Engineer', 'https://i.pravatar.cc/150?img=31'),
('hong.jisoo@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '홍지수', 'Project Manager', 'https://i.pravatar.cc/150?img=32'),
('hwang.kyungsoo@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '황경수', 'Database Administrator', 'https://i.pravatar.cc/150?img=33'),
('ahn.yejin@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '안예진', 'QA Engineer', 'https://i.pravatar.cc/150?img=34'),
('im.seungwoo@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '임승우', 'Technical Writer', 'https://i.pravatar.cc/150?img=35'),
('noh.chaewon@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '노채원', 'Scrum Master', 'https://i.pravatar.cc/150?img=36'),
('son.jinwoo@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '손진우', 'Game Developer', 'https://i.pravatar.cc/150?img=37'),
('ryu.nayeon@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '류나연', 'Video Editor', 'https://i.pravatar.cc/150?img=38'),
('woo.minjae@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '우민재', 'Blockchain Developer', 'https://i.pravatar.cc/150?img=39'),
('joo.seoyoung@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '주서영', 'Social Media Manager', 'https://i.pravatar.cc/150?img=40'),
('cha.youngmin@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '차영민', 'Network Engineer', 'https://i.pravatar.cc/150?img=41'),
('do.haeun@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '도하은', 'Customer Success Manager', 'https://i.pravatar.cc/150?img=42'),
('heo.junseo@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '허준서', 'Site Reliability Engineer', 'https://i.pravatar.cc/150?img=43'),
('jin.suhyun@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '진수현', 'Brand Manager', 'https://i.pravatar.cc/150?img=44'),
('ma.dohyun@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '마도현', 'Operations Manager', 'https://i.pravatar.cc/150?img=45'),
('pyo.jiwoo@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '표지우', 'Legal Counsel', 'https://i.pravatar.cc/150?img=46'),
('sok.hyeonsu@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '석현수', 'Investment Analyst', 'https://i.pravatar.cc/150?img=47'),
('tan.aeri@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '탄애리', 'Researcher', 'https://i.pravatar.cc/150?img=48'),
('ha.seungjin@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '하승진', 'Supply Chain Manager', 'https://i.pravatar.cc/150?img=49'),
('ga.yujin@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '가유진', 'Event Planner', 'https://i.pravatar.cc/150?img=50');

-- Users 41-60
INSERT INTO users (email, password_hash, full_name, headline, profile_image) VALUES
('kim.sunwoo@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '김선우', 'Solutions Architect', 'https://i.pravatar.cc/150?img=51'),
('lee.daeun@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '이다은', 'Recruiter', 'https://i.pravatar.cc/150?img=52'),
('park.jaehyun@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '박재현', 'Software Engineer', 'https://i.pravatar.cc/150?img=53'),
('choi.sumin@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '최수민', 'Digital Marketer', 'https://i.pravatar.cc/150?img=54'),
('jung.taeyang@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '정태양', 'Tech Lead', 'https://i.pravatar.cc/150?img=55'),
('kang.nari@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '강나리', 'Account Executive', 'https://i.pravatar.cc/150?img=56'),
('yoon.chanwoo@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '윤찬우', 'Embedded Engineer', 'https://i.pravatar.cc/150?img=57'),
('han.yebin@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '한예빈', 'Community Manager', 'https://i.pravatar.cc/150?img=58'),
('shin.gyuwon@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '신규원', 'Data Engineer', 'https://i.pravatar.cc/150?img=59'),
('lim.hansol@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '임한솔', 'Product Designer', 'https://i.pravatar.cc/150?img=60'),
('jang.jaemin@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '장재민', 'Infrastructure Engineer', 'https://i.pravatar.cc/150?img=61'),
('oh.yeji@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '오예지', 'Business Development', 'https://i.pravatar.cc/150?img=62'),
('kwon.seokjin@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '권석진', 'Platform Engineer', 'https://i.pravatar.cc/150?img=63'),
('song.nayoung@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '송나영', 'Partnership Manager', 'https://i.pravatar.cc/150?img=64'),
('baek.jonghyun@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '백종현', 'Release Manager', 'https://i.pravatar.cc/150?img=65'),
('nam.yewon@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '남예원', 'Training Coordinator', 'https://i.pravatar.cc/150?img=66'),
('go.siwoo@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '고시우', 'Performance Engineer', 'https://i.pravatar.cc/150?img=67'),
('yang.hayeon@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '양하연', 'Corporate Trainer', 'https://i.pravatar.cc/150?img=68'),
('moon.jinsung@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '문진성', 'IT Consultant', 'https://i.pravatar.cc/150?img=69'),
('bae.soeun@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '배소은', 'Compliance Officer', 'https://i.pravatar.cc/150?img=70');

-- Users 61-80
INSERT INTO users (email, password_hash, full_name, headline, profile_image) VALUES
('seo.youngwoo@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '서영우', 'Frontend Architect', 'https://i.pravatar.cc/150?img=71'),
('hong.sujin@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '홍수진', 'Content Strategist', 'https://i.pravatar.cc/150?img=72'),
('hwang.junhee@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '황준희', 'Mobile Developer', 'https://i.pravatar.cc/150?img=73'),
('ahn.seohyun@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '안서현', 'Email Marketing Specialist', 'https://i.pravatar.cc/150?img=74'),
('im.donghwan@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '임동환', 'API Developer', 'https://i.pravatar.cc/150?img=75'),
('noh.jiyoung@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '노지영', 'Conversion Optimizer', 'https://i.pravatar.cc/150?img=76'),
('son.minseok@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '손민석', 'Growth Hacker', 'https://i.pravatar.cc/150?img=77'),
('ryu.seoyun@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '류서윤', 'UX Researcher', 'https://i.pravatar.cc/150?img=78'),
('woo.jihwan@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '우지환', 'Test Automation Engineer', 'https://i.pravatar.cc/150?img=79'),
('joo.dayeon@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '주다연', 'PR Specialist', 'https://i.pravatar.cc/150?img=80'),
('cha.seonghoon@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '차성훈', 'WebGL Developer', 'https://i.pravatar.cc/150?img=81'),
('do.minjung@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '도민정', 'Accessibility Specialist', 'https://i.pravatar.cc/150?img=82'),
('heo.yunseo@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '허윤서', 'Technical Support Lead', 'https://i.pravatar.cc/150?img=83'),
('jin.geunho@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '진근호', 'Unity Developer', 'https://i.pravatar.cc/150?img=84'),
('ma.chaemin@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '마채민', 'Localization Manager', 'https://i.pravatar.cc/150?img=85'),
('pyo.taejoon@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '표태준', 'Automation Engineer', 'https://i.pravatar.cc/150?img=86'),
('sok.areum@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '석아름', 'SEO Specialist', 'https://i.pravatar.cc/150?img=87'),
('tan.sanghoon@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '탄상훈', 'WordPress Developer', 'https://i.pravatar.cc/150?img=88'),
('ha.jiwon@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '하지원', 'E-commerce Manager', 'https://i.pravatar.cc/150?img=89'),
('ga.dooyoung@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '가두영', 'Copywriter', 'https://i.pravatar.cc/150?img=90');

-- Users 81-100
INSERT INTO users (email, password_hash, full_name, headline, profile_image) VALUES
('kim.yeonwoo@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '김연우', 'React Native Developer', 'https://i.pravatar.cc/150?img=91'),
('lee.junwon@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '이준원', 'Vue.js Developer', 'https://i.pravatar.cc/150?img=92'),
('park.soyoung@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '박소영', 'Angular Developer', 'https://i.pravatar.cc/150?img=93'),
('choi.jihyun@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '최지현', 'Node.js Developer', 'https://i.pravatar.cc/150?img=94'),
('jung.hangyeol@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '정한결', 'Python Developer', 'https://i.pravatar.cc/150?img=95'),
('kang.jieun@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '강지은', 'Java Developer', 'https://i.pravatar.cc/150?img=96'),
('yoon.minjun@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '윤민준', 'Go Developer', 'https://i.pravatar.cc/150?img=97'),
('han.dayoung@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '한다영', 'Ruby Developer', 'https://i.pravatar.cc/150?img=98'),
('shin.junsik@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '신준식', 'PHP Developer', 'https://i.pravatar.cc/150?img=99'),
('lim.yujin@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '임유진', 'C++ Developer', 'https://i.pravatar.cc/150?img=100'),
('jang.seungho@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '장승호', 'Rust Developer', 'https://i.pravatar.cc/150?img=101'),
('oh.hyemin@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '오혜민', 'Swift Developer', 'https://i.pravatar.cc/150?img=102'),
('kwon.dokyun@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '권도균', 'Kotlin Developer', 'https://i.pravatar.cc/150?img=103'),
('song.yejin@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '송예진', 'Flutter Developer', 'https://i.pravatar.cc/150?img=104'),
('baek.hyunsu@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '백현수', 'Svelte Developer', 'https://i.pravatar.cc/150?img=105'),
('nam.jiho@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '남지호', 'TypeScript Developer', 'https://i.pravatar.cc/150?img=106'),
('go.yunseo@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '고윤서', 'GraphQL Developer', 'https://i.pravatar.cc/150?img=107'),
('yang.mingyu@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '양민규', 'REST API Developer', 'https://i.pravatar.cc/150?img=108'),
('moon.chaeyu@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '문채유', 'Microservices Architect', 'https://i.pravatar.cc/150?img=109'),
('bae.siwon@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye', '배시원', 'Serverless Developer', 'https://i.pravatar.cc/150?img=110');

-- Add profiles for all users (simple version)
INSERT INTO profiles (user_id, about, location, website)
SELECT 
  id,
  '안녕하세요! ' || full_name || '입니다. ' || headline || '로 일하고 있습니다.',
  CASE (id % 10)
    WHEN 0 THEN '서울, 대한민국'
    WHEN 1 THEN '부산, 대한민국'
    WHEN 2 THEN '인천, 대한민국'
    WHEN 3 THEN '대구, 대한민국'
    WHEN 4 THEN '광주, 대한민국'
    WHEN 5 THEN '대전, 대한민국'
    WHEN 6 THEN '울산, 대한민국'
    WHEN 7 THEN '세종, 대한민국'
    WHEN 8 THEN '경기, 대한민국'
    ELSE '서울, 대한민국'
  END,
  'https://example.com/' || LOWER(REPLACE(full_name, ' ', ''))
FROM users
WHERE id > 1;

-- Add some connections (followers) - with IGNORE to skip duplicates
INSERT OR IGNORE INTO connections (follower_id, following_id, created_at)
SELECT 
  u1.id,
  u2.id,
  datetime('now', '-' || ABS(RANDOM() % 365) || ' days')
FROM users u1
CROSS JOIN users u2
WHERE u1.id != u2.id 
  AND u1.id <= 50 
  AND u2.id <= 50
  AND (u1.id + u2.id) % 5 = 0
LIMIT 200;

-- Add some posts from various users
INSERT INTO posts (user_id, content, likes_count, comments_count, created_at)
SELECT 
  id,
  CASE (id % 10)
    WHEN 0 THEN '오늘도 열심히 코딩 중입니다! 💻 새로운 프로젝트를 시작했는데 정말 흥미진진하네요.'
    WHEN 1 THEN '팀원들과 함께한 프로젝트가 성공적으로 마무리되었습니다! 🎉 모두 고생하셨습니다.'
    WHEN 2 THEN '오늘 배운 새로운 기술을 공유합니다. 많은 분들께 도움이 되길 바랍니다!'
    WHEN 3 THEN '컨퍼런스 참석 후기입니다. 정말 유익한 시간이었어요! 📚'
    WHEN 4 THEN '우리 회사가 새로운 서비스를 출시했습니다! 많은 관심 부탁드립니다. 🚀'
    WHEN 5 THEN '주말에 사이드 프로젝트를 진행했는데 재미있는 결과물이 나왔네요!'
    WHEN 6 THEN '오늘 회의에서 좋은 아이디어들이 많이 나왔습니다. 실행이 기대되네요!'
    WHEN 7 THEN '새로운 팀원을 환영합니다! 함께 좋은 성과 만들어가요! 👋'
    WHEN 8 THEN '오랜만에 기술 블로그를 업데이트했습니다. 많은 피드백 부탁드려요!'
    ELSE '일상을 공유합니다. 오늘도 좋은 하루 보내세요! ☀️'
  END,
  ABS(RANDOM() % 50),
  ABS(RANDOM() % 20),
  datetime('now', '-' || ABS(RANDOM() % 30) || ' days')
FROM users
WHERE id > 1 AND id <= 51
LIMIT 50;

-- Add some skills for users
INSERT INTO skills (user_id, skill_name, endorsements)
SELECT 
  id,
  skill,
  ABS(RANDOM() % 20)
FROM users
CROSS JOIN (
  SELECT 'JavaScript' as skill UNION ALL
  SELECT 'Python' UNION ALL
  SELECT 'React' UNION ALL
  SELECT 'Node.js' UNION ALL
  SELECT 'TypeScript' UNION ALL
  SELECT 'AWS' UNION ALL
  SELECT 'Docker' UNION ALL
  SELECT 'Kubernetes' UNION ALL
  SELECT 'Git' UNION ALL
  SELECT 'Agile'
)
WHERE id > 1 AND (id + LENGTH(skill)) % 3 = 0
LIMIT 300;
