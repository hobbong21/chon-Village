-- Sample notifications for John Doe (user_id = 1)

INSERT INTO notifications (user_id, type, title, message, related_id, related_type, is_read) VALUES
(1, 'connection_request', '새로운 연결 요청', 'Jane Smith님이 연결을 요청했습니다', 2, 'user', 0),
(1, 'post_like', '게시물에 좋아요', 'Mike Johnson님이 회원님의 게시물을 좋아합니다', 1, 'post', 0),
(1, 'post_comment', '게시물에 댓글', 'Sarah Williams님이 댓글을 남겼습니다: "Great post!"', 1, 'post', 0),
(1, 'node_invitation', '노드 초대', 'Stanford University CS Department에서 회원님을 초대했습니다', 1, 'node', 1),
(1, 'family_verification', '가족 인증 요청', 'Michael Do님이 형제 관계 인증을 요청했습니다', 3, 'family', 1),
(1, 'event_reminder', '이벤트 알림', '내일 "John Doe 생일" 이벤트가 예정되어 있습니다', 1, 'event', 1),
(1, 'connection_accepted', '연결 수락됨', 'David Brown님이 연결 요청을 수락했습니다', 5, 'user', 1),
(1, 'mention', '멘션', 'Jane Smith님이 게시물에서 회원님을 언급했습니다', 2, 'post', 0);

-- Sample messages
INSERT INTO messages (sender_id, receiver_id, content, is_read) VALUES
(2, 1, '안녕하세요! 프로젝트에 대해 이야기 나누고 싶어요.', 0),
(1, 2, '물론이죠! 언제 통화 가능하신가요?', 1),
(2, 1, '오늘 오후 3시는 어떠세요?', 0),
(3, 1, '다음 주 회의 일정을 확인하시겠어요?', 0),
(1, 3, '네, 확인했습니다. 참석하겠습니다.', 1);

-- Notification preferences for all users
INSERT INTO notification_preferences (user_id, connection_requests, post_interactions, node_activities, family_updates, event_reminders, mentions, email_notifications) VALUES
(1, 1, 1, 1, 1, 1, 1, 0),
(2, 1, 1, 1, 0, 1, 1, 0),
(3, 1, 1, 0, 1, 1, 1, 0),
(4, 1, 0, 1, 1, 1, 1, 0),
(5, 1, 1, 1, 1, 0, 1, 0);
