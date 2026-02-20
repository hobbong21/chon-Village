-- Insert test users
INSERT OR IGNORE INTO users (id, email, password_hash, full_name, headline, profile_image) VALUES 
  (1, 'john.doe@example.com', '$2a$10$abcdefghijklmnopqrstuv', 'John Doe', 'Software Engineer at Tech Corp', 'https://i.pravatar.cc/150?img=1'),
  (2, 'jane.smith@example.com', '$2a$10$abcdefghijklmnopqrstuv', 'Jane Smith', 'Product Manager at Innovation Inc', 'https://i.pravatar.cc/150?img=5'),
  (3, 'mike.johnson@example.com', '$2a$10$abcdefghijklmnopqrstuv', 'Mike Johnson', 'UX Designer at Creative Studio', 'https://i.pravatar.cc/150?img=12'),
  (4, 'sarah.williams@example.com', '$2a$10$abcdefghijklmnopqrstuv', 'Sarah Williams', 'Data Scientist at AI Labs', 'https://i.pravatar.cc/150?img=20'),
  (5, 'david.brown@example.com', '$2a$10$abcdefghijklmnopqrstuv', 'David Brown', 'Marketing Director at Growth Co', 'https://i.pravatar.cc/150?img=33');

-- Insert profiles
INSERT OR IGNORE INTO profiles (user_id, about, location, website) VALUES 
  (1, 'Passionate software engineer with 5+ years of experience in full-stack development.', 'San Francisco, CA', 'https://johndoe.dev'),
  (2, 'Product leader focused on building user-centric solutions.', 'New York, NY', 'https://janesmith.com'),
  (3, 'Creating delightful user experiences through thoughtful design.', 'Los Angeles, CA', 'https://mikedesigns.io'),
  (4, 'Machine learning enthusiast leveraging data to solve real-world problems.', 'Boston, MA', 'https://sarahwilliams.ai'),
  (5, 'Growth hacker with a proven track record of scaling startups.', 'Austin, TX', 'https://davidbrown.marketing');

-- Insert experiences
INSERT OR IGNORE INTO experiences (user_id, company, position, description, start_date, end_date, is_current) VALUES 
  (1, 'Tech Corp', 'Senior Software Engineer', 'Lead development of cloud-based applications', '2020-01', NULL, 1),
  (1, 'StartupXYZ', 'Full Stack Developer', 'Built scalable web applications', '2018-06', '2019-12', 0),
  (2, 'Innovation Inc', 'Product Manager', 'Manage product roadmap and cross-functional teams', '2019-03', NULL, 1),
  (3, 'Creative Studio', 'UX Designer', 'Design user interfaces for mobile and web apps', '2021-01', NULL, 1),
  (4, 'AI Labs', 'Data Scientist', 'Develop ML models for predictive analytics', '2020-06', NULL, 1);

-- Insert education
INSERT OR IGNORE INTO education (user_id, school, degree, field_of_study, start_date, end_date) VALUES 
  (1, 'Stanford University', 'Bachelor of Science', 'Computer Science', '2014-09', '2018-06'),
  (2, 'Harvard Business School', 'Master of Business Administration', 'Business Administration', '2017-09', '2019-06'),
  (3, 'Rhode Island School of Design', 'Bachelor of Fine Arts', 'Graphic Design', '2015-09', '2019-06'),
  (4, 'MIT', 'Master of Science', 'Data Science', '2018-09', '2020-06'),
  (5, 'University of Pennsylvania', 'Bachelor of Arts', 'Marketing', '2013-09', '2017-06');

-- Insert skills
INSERT OR IGNORE INTO skills (user_id, skill_name, endorsements) VALUES 
  (1, 'JavaScript', 45),
  (1, 'TypeScript', 38),
  (1, 'React', 52),
  (1, 'Node.js', 41),
  (2, 'Product Management', 67),
  (2, 'Agile', 54),
  (2, 'User Research', 43),
  (3, 'UI/UX Design', 89),
  (3, 'Figma', 76),
  (3, 'User Research', 58),
  (4, 'Python', 72),
  (4, 'Machine Learning', 65),
  (4, 'TensorFlow', 48),
  (5, 'Digital Marketing', 81),
  (5, 'SEO', 64),
  (5, 'Content Strategy', 55);

-- Insert posts
INSERT OR IGNORE INTO posts (user_id, content, likes_count, comments_count) VALUES 
  (1, 'Excited to share that I just launched a new open-source project! Check it out on GitHub. #opensource #webdev', 23, 5),
  (2, 'Just finished an amazing product strategy workshop. The key takeaway: always start with the user problem, not the solution. 🚀', 45, 8),
  (3, 'New design system is live! Proud of what our team has accomplished. #design #ux', 67, 12),
  (4, 'Fascinating paper on transformer architectures. AI is moving so fast! 🤖 #machinelearning #ai', 89, 15),
  (5, 'Our latest campaign generated 300% ROI. Sometimes the simplest ideas work best. #marketing #growth', 34, 7);

-- Insert connections
INSERT OR IGNORE INTO connections (follower_id, following_id, status) VALUES 
  (1, 2, 'accepted'),
  (1, 3, 'accepted'),
  (1, 4, 'accepted'),
  (2, 1, 'accepted'),
  (2, 3, 'accepted'),
  (2, 5, 'accepted'),
  (3, 1, 'accepted'),
  (3, 2, 'accepted'),
  (3, 4, 'pending'),
  (4, 1, 'accepted'),
  (4, 3, 'accepted'),
  (5, 2, 'accepted');

-- Insert post likes
INSERT OR IGNORE INTO post_likes (post_id, user_id) VALUES 
  (1, 2),
  (1, 3),
  (1, 4),
  (2, 1),
  (2, 3),
  (2, 5),
  (3, 1),
  (3, 2),
  (3, 4),
  (4, 1),
  (4, 2),
  (4, 3),
  (5, 2),
  (5, 4);

-- Insert comments
INSERT OR IGNORE INTO comments (post_id, user_id, content) VALUES 
  (1, 2, 'Great work! Will definitely check it out.'),
  (1, 4, 'This looks amazing! Starred it on GitHub.'),
  (2, 1, 'Thanks for sharing! Very insightful.'),
  (2, 3, 'Couldn''t agree more. User-first approach is key.'),
  (3, 1, 'Congrats! The design system looks fantastic.'),
  (3, 2, 'Love the attention to detail!'),
  (4, 1, 'Would love to discuss this further!'),
  (4, 3, 'Mind blown 🤯'),
  (5, 2, 'Impressive results! What was your strategy?');
