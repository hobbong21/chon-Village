// Get current user from localStorage
let currentUser = JSON.parse(localStorage.getItem('user'));

// Check if user is logged in
if (!currentUser) {
  // Redirect to login page if not logged in
  // For demo, use default user
  currentUser = { id: 1, full_name: 'John Doe' };
}

// State management
let currentPage = 'feed';
let users = [];
let posts = [];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  updateUserProfile();
  updateSidebarProfile();
  loadPage('feed');
  setupEventListeners();
  loadSidebarNotifications();
  initRealtimeNotifications();
});

// Update user profile in sidebar
function updateUserProfile() {
  if (currentUser) {
    const profileCard = document.getElementById('profileCard');
    if (profileCard) {
      profileCard.querySelector('img').src = currentUser.profile_image || 'https://i.pravatar.cc/150?img=1';
      profileCard.querySelector('h3').textContent = currentUser.full_name;
      profileCard.querySelector('p').textContent = currentUser.headline || '전문가';
    }
  }
}

// Update left sidebar profile
function updateSidebarProfile() {
  if (currentUser) {
    const avatar = document.getElementById('sidebarAvatar');
    const name = document.getElementById('sidebarName');
    const headline = document.getElementById('sidebarHeadline');
    
    if (avatar) avatar.src = currentUser.profile_image || 'https://i.pravatar.cc/150?img=1';
    if (name) name.textContent = currentUser.full_name;
    if (headline) headline.textContent = currentUser.headline || '전문가';
  }
}

// Load notifications in right sidebar
async function loadSidebarNotifications() {
  const container = document.getElementById('sidebarNotifications');
  if (!container) return;

  try {
    const response = await axios.get('/api/notifications');
    const notifications = response.data.notifications;

    // Update badge
    const unreadCount = notifications.filter(n => !n.is_read).length;
    const badge = document.getElementById('notificationBadge');
    const badgeMobile = document.getElementById('notificationBadgeMobile');
    
    if (unreadCount > 0) {
      if (badge) {
        badge.classList.remove('hidden');
        badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
      }
      if (badgeMobile) {
        badgeMobile.classList.remove('hidden');
        badgeMobile.textContent = unreadCount > 9 ? '9+' : unreadCount;
      }
    } else {
      if (badge) badge.classList.add('hidden');
      if (badgeMobile) badgeMobile.classList.add('hidden');
    }

    if (notifications.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding: 2rem 1rem;">
          <i class="fas fa-bell-slash"></i>
          <p style="margin-top: 0.5rem;">알림이 없습니다</p>
        </div>
      `;
      return;
    }

    container.innerHTML = notifications.map(notif => {
      const icon = getNotificationIcon(notif.type);
      const bgColor = notif.is_read ? 'var(--gray-50)' : 'var(--primary-50)';
      
      return `
        <div onclick="handleNotificationClick(${notif.id}, '${notif.type}', ${notif.related_id})" 
             style="padding: 0.75rem; border-bottom: 1px solid var(--gray-200); 
                    background: ${bgColor}; cursor: pointer; transition: all 0.15s;"
             onmouseover="this.style.background='var(--gray-100)'"
             onmouseout="this.style.background='${bgColor}'">
          <div class="flex gap-3">
            <div style="flex-shrink: 0;">
              <div style="width: 40px; height: 40px; background: var(--primary-100); 
                          border-radius: var(--radius-full); display: flex; 
                          align-items: center; justify-content: center;">
                <i class="${icon}" style="color: var(--primary-600);"></i>
              </div>
            </div>
            <div style="flex: 1; min-width: 0;">
              <p style="font-size: var(--text-sm); color: var(--gray-800); 
                        font-weight: ${notif.is_read ? 'var(--font-regular)' : 'var(--font-semibold)'}; 
                        line-height: 1.4; margin-bottom: 0.25rem;">
                ${notif.message}
              </p>
              <p style="font-size: var(--text-xs); color: var(--gray-500);">
                ${formatTimeAgo(notif.created_at)}
              </p>
            </div>
            ${!notif.is_read ? `
              <div style="flex-shrink: 0;">
                <div style="width: 8px; height: 8px; background: var(--primary-600); 
                            border-radius: var(--radius-full);"></div>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Error loading sidebar notifications:', error);
    container.innerHTML = `
      <div class="empty-state" style="padding: 2rem 1rem;">
        <i class="fas fa-exclamation-circle" style="color: var(--error);"></i>
        <p style="margin-top: 0.5rem; color: var(--error);">알림을 불러올 수 없습니다</p>
      </div>
    `;
  }
}

function getNotificationIcon(type) {
  const icons = {
    'connection_request': 'fas fa-user-plus',
    'connection_accepted': 'fas fa-user-check',
    'post_like': 'fas fa-heart',
    'post_comment': 'fas fa-comment',
    'post_share': 'fas fa-share',
    'node_invitation': 'fas fa-sitemap',
    'family_invitation': 'fas fa-users',
    'system': 'fas fa-info-circle'
  };
  return icons[type] || 'fas fa-bell';
}

function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  return date.toLocaleDateString('ko-KR');
}

async function handleNotificationClick(notifId, type, relatedId) {
  // Mark as read
  try {
    await axios.put(`/api/notifications/${notifId}/read`);
    loadSidebarNotifications(); // Refresh
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }

  // Navigate based on type
  switch (type) {
    case 'connection_request':
    case 'connection_accepted':
      loadProfile(relatedId);
      break;
    case 'post_like':
    case 'post_comment':
    case 'post_share':
      loadPage('feed');
      break;
    case 'node_invitation':
      loadPage('nodes');
      break;
    case 'family_invitation':
      loadProfile(currentUser.id);
      break;
  }
}

async function markAllAsRead() {
  try {
    const response = await axios.get('/api/notifications');
    const unreadNotifs = response.data.notifications.filter(n => !n.is_read);
    
    await Promise.all(
      unreadNotifs.map(n => axios.put(`/api/notifications/${n.id}/read`))
    );
    
    loadSidebarNotifications();
  } catch (error) {
    console.error('Error marking all as read:', error);
  }
}

// Real-time notifications with Server-Sent Events
let eventSource = null;
let reconnectTimeout = null;

function initRealtimeNotifications() {
  if (!window.EventSource) {
    console.warn('[Realtime] EventSource not supported');
    return;
  }

  connectEventSource();
}

function connectEventSource() {
  // Close existing connection
  if (eventSource) {
    eventSource.close();
  }

  console.log('[Realtime] Connecting to notification stream...');
  eventSource = new EventSource('/api/notifications/stream');

  eventSource.onopen = () => {
    console.log('[Realtime] Connected to notification stream');
  };

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === 'connected') {
        console.log('[Realtime]', data.message);
      } else if (data.type === 'notifications') {
        console.log('[Realtime] Received notifications:', data.count);
        
        // Refresh sidebar notifications
        loadSidebarNotifications();
        
        // Show browser notification if permission granted
        if (Notification.permission === 'granted' && data.notifications.length > 0) {
          const latest = data.notifications[0];
          new Notification('CHON Village', {
            body: latest.message,
            icon: '/static/icons/icon-192x192.png',
            badge: '/static/icons/icon-72x72.png',
            tag: `notification-${latest.id}`
          });
        }
      }
    } catch (error) {
      console.error('[Realtime] Error parsing message:', error);
    }
  };

  eventSource.onerror = (error) => {
    console.error('[Realtime] Connection error:', error);
    eventSource.close();
    
    // Reconnect after 5 seconds
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    reconnectTimeout = setTimeout(() => {
      console.log('[Realtime] Reconnecting...');
      connectEventSource();
    }, 5000);
  };
}

// Request notification permission
function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('[Notifications] Not supported');
    return;
  }

  if (Notification.permission === 'default') {
    Notification.requestPermission().then((permission) => {
      console.log('[Notifications] Permission:', permission);
      if (permission === 'granted') {
        new Notification('CHON Village', {
          body: '알림이 활성화되었습니다!',
          icon: '/static/icons/icon-192x192.png'
        });
      }
    });
  }
}

// Call this after user interaction (e.g., on first button click)
setTimeout(() => {
  requestNotificationPermission();
}, 3000);

// Setup event listeners
function setupEventListeners() {
  // Navigation links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = e.currentTarget.dataset.page;
      loadPage(page);
    });
  });

  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('user');
      window.location.href = '/login';
    });
  }

  // Search input
  document.getElementById('searchInput').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    if (query.length > 0) {
      searchUsers(query);
    }
  });
}

// Load different pages
async function loadPage(page) {
  currentPage = page;
  const mainContent = document.getElementById('mainContent');
  
  // Update navigation active state
  document.querySelectorAll('.nav-link, .mobile-nav-item').forEach(item => {
    if (item.dataset.page === page) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
  
  switch (page) {
    case 'feed':
      await loadFeed();
      break;
    case 'nodes':
      await loadNodesPage();
      break;
    case 'profile':
      await loadProfile(currentUser.id);
      break;
    case 'settings':
      await loadSettingsPage();
      break;
    default:
      await loadFeed();
      break;
  }
}

// Load feed page
async function loadFeed() {
  const mainContent = document.getElementById('mainContent');
  
  // Post creation form
  mainContent.innerHTML = `
    <div class="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4">
      <div class="flex items-start space-x-3">
        <img src="${currentUser.profile_image || 'https://via.placeholder.com/40'}" 
             alt="${currentUser.name}" 
             class="w-10 h-10 sm:w-12 sm:h-12 rounded-full">
        <div class="flex-1">
          <textarea id="postContent" rows="3" 
                    class="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="무슨 생각을 하고 계신가요? (#해시태그 사용 가능)"></textarea>
          <div class="flex items-center justify-between mt-3">
            <div class="text-xs text-gray-500">
              <i class="fas fa-hashtag"></i> 해시태그를 사용해보세요! 예: #개발 #코딩
            </div>
            <button onclick="createPost()" class="btn-primary">
              <i class="fas fa-paper-plane mr-2"></i>게시
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Trending Hashtags Button -->
    <div class="mb-4">
      <button onclick="loadTrendingHashtags()" class="text-blue-600 hover:underline text-sm">
        <i class="fas fa-fire"></i> 트렌딩 해시태그 보기
      </button>
    </div>
    
    <div id="feedPosts"></div>
  `;
  
  // Load posts
  try {
    const response = await axios.get('/api/posts');
    posts = response.data.posts;
    renderPosts(posts);
  } catch (error) {
    console.error('Error loading posts:', error);
  }
}

// Render posts
function renderPosts(postsData) {
  const feedPosts = document.getElementById('feedPosts');
  
  feedPosts.innerHTML = postsData.map(post => renderPost(post)).join('');
  
  // Load share counts for all posts
  loadShareCounts();
}

// Create new post
async function createPost() {
  const content = document.getElementById('postContent').value.trim();
  
  if (!content) {
    alert('내용을 입력해주세요.');
    return;
  }
  
  try {
    await axios.post('/api/posts', {
      user_id: currentUser.id,
      content: content
    });
    
    document.getElementById('postContent').value = '';
    await loadFeed();
  } catch (error) {
    console.error('Error creating post:', error);
    alert('게시물 작성에 실패했습니다.');
  }
}

// Like post
async function likePost(postId) {
  try {
    await axios.post(`/api/posts/${postId}/like`, {
      user_id: currentUser.id
    });
    
    await loadFeed();
  } catch (error) {
    console.error('Error liking post:', error);
  }
}

// Load comments
async function loadComments(postId) {
  const commentsDiv = document.getElementById(`comments-${postId}`);
  
  if (commentsDiv.classList.contains('hidden')) {
    try {
      const response = await axios.get(`/api/posts/${postId}/comments`);
      const comments = response.data.comments;
      
      commentsDiv.innerHTML = `
        <div class="border-t pt-4">
          <div class="space-y-3 mb-4">
            ${comments.map(comment => `
              <div class="flex items-start">
                <img src="${comment.profile_image}" class="w-8 h-8 rounded-full mr-2">
                <div class="flex-1 bg-gray-100 rounded-lg p-3">
                  <p class="font-semibold text-sm">${comment.full_name}</p>
                  <p class="text-sm">${comment.content}</p>
                </div>
              </div>
            `).join('')}
          </div>
          
          <div class="flex items-center space-x-2">
            <input type="text" id="commentInput-${postId}" 
                   placeholder="댓글을 입력하세요..." 
                   class="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <button onclick="addComment(${postId})" class="btn-primary">
              <i class="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      `;
      
      commentsDiv.classList.remove('hidden');
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  } else {
    commentsDiv.classList.add('hidden');
  }
}

// Add comment
async function addComment(postId) {
  const input = document.getElementById(`commentInput-${postId}`);
  const content = input.value.trim();
  
  if (!content) return;
  
  try {
    await axios.post(`/api/posts/${postId}/comments`, {
      user_id: currentUser.id,
      content: content
    });
    
    input.value = '';
    
    // Reload comments
    const commentsDiv = document.getElementById(`comments-${postId}`);
    commentsDiv.classList.add('hidden');
    await loadComments(postId);
  } catch (error) {
    console.error('Error adding comment:', error);
  }
}

// Load network page
async function loadNetwork() {
  const mainContent = document.getElementById('mainContent');
  
  try {
    const response = await axios.get('/api/users');
    users = response.data.users;
    
    mainContent.innerHTML = `
      <div class="card">
        <h2 class="text-2xl font-bold mb-6">네트워크</h2>
        
        <div class="grid grid-cols-1 gap-4">
          ${users.map(user => `
            <div class="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition">
              <div class="flex items-center space-x-4">
                <img src="${user.profile_image}" class="w-16 h-16 rounded-full">
                <div>
                  <h4 class="font-bold cursor-pointer hover:text-blue-600" 
                      onclick="loadProfile(${user.id})">
                    ${user.full_name}
                  </h4>
                  <p class="text-sm text-gray-600">${user.headline || '전문가'}</p>
                  <p class="text-xs text-gray-500">${user.email}</p>
                </div>
              </div>
              <button onclick="sendConnectionRequest(${user.id})" class="btn-primary">
                <i class="fas fa-user-plus mr-1"></i>연결
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error loading network:', error);
  }
}

// Send connection request
async function sendConnectionRequest(followingId) {
  try {
    await axios.post('/api/connections', {
      follower_id: currentUser.id,
      following_id: followingId
    });
    
    alert('연결 요청을 보냈습니다!');
  } catch (error) {
    console.error('Error sending connection request:', error);
    alert('이미 연결 요청을 보냈거나 연결되어 있습니다.');
  }
}

// Load profile page
async function loadProfile(userId) {
  const mainContent = document.getElementById('mainContent');
  
  try {
    const [userResponse, experiencesResponse, educationResponse, skillsResponse, postsResponse] = await Promise.all([
      axios.get(`/api/users/${userId}`),
      axios.get(`/api/users/${userId}/experiences`),
      axios.get(`/api/users/${userId}/education`),
      axios.get(`/api/users/${userId}/skills`),
      axios.get(`/api/users/${userId}/posts`)
    ]);
    
    const user = userResponse.data.user;
    const experiences = experiencesResponse.data.experiences;
    const education = educationResponse.data.education;
    const skills = skillsResponse.data.skills;
    const userPosts = postsResponse.data.posts;
    
    const isOwnProfile = currentUser.id === parseInt(userId);
    
    mainContent.innerHTML = `
      <!-- Profile Header -->
      <div class="card">
        <div class="flex items-start space-x-6">
          <img src="${user.profile_image}" class="w-32 h-32 rounded-full border-4 border-blue-100">
          <div class="flex-1">
            <div class="flex justify-between items-start">
              <div>
                <h2 class="text-3xl font-bold">${user.full_name}</h2>
                <p class="text-lg text-gray-600 mt-1">${user.headline || '전문가'}</p>
                <p class="text-gray-500 mt-2">
                  <i class="fas fa-map-marker-alt mr-1"></i>${user.location || '위치 미제공'}
                </p>
                ${user.website ? `
                  <a href="${user.website}" target="_blank" class="text-blue-600 hover:underline mt-2 inline-block">
                    <i class="fas fa-link mr-1"></i>${user.website}
                  </a>
                ` : ''}
              </div>
              ${isOwnProfile ? `
                <div class="flex gap-2">
                  <button onclick="showProfileQRCode()" class="btn btn-secondary">
                    <i class="fas fa-qrcode mr-1"></i>QR 코드
                  </button>
                  <a href="/profile/edit" class="btn btn-primary">
                    <i class="fas fa-edit mr-1"></i>프로필 편집
                  </a>
                </div>
              ` : ''}
            </div>
            ${!isOwnProfile ? `
              <div class="mt-4 flex space-x-3">
                <button class="btn-primary">
                  <i class="fas fa-user-plus mr-1"></i>연결
                </button>
                <button class="btn-secondary">
                  <i class="fas fa-envelope mr-1"></i>메시지
                </button>
              </div>
            ` : ''}
          </div>
        </div>
        
        ${user.about ? `
          <div class="mt-6 pt-6 border-t">
            <h3 class="font-bold text-lg mb-2">소개</h3>
            <p class="text-gray-700 whitespace-pre-wrap">${user.about}</p>
          </div>
        ` : ''}
      </div>
      
      <!-- Experience -->
      <div class="card">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold text-xl">
            <i class="fas fa-briefcase mr-2"></i>경력
          </h3>
          ${isOwnProfile ? `
            <button onclick="showAddExperienceModal()" class="btn-secondary text-sm">
              <i class="fas fa-plus mr-1"></i>추가
            </button>
          ` : ''}
        </div>
        ${experiences.length > 0 ? `
          <div class="space-y-6">
            ${experiences.map(exp => `
              <div class="flex">
                <div class="w-12 h-12 bg-blue-100 rounded flex items-center justify-center mr-4 flex-shrink-0">
                  <i class="fas fa-building text-blue-600"></i>
                </div>
                <div class="flex-1">
                  <div class="flex justify-between items-start">
                    <div>
                      <h4 class="font-bold">${exp.position}</h4>
                      <p class="text-gray-600">${exp.company}</p>
                      <p class="text-sm text-gray-500 mt-1">
                        ${exp.start_date} - ${exp.is_current ? '현재' : exp.end_date}
                      </p>
                      ${exp.description ? `<p class="text-gray-700 mt-2">${exp.description}</p>` : ''}
                    </div>
                    ${isOwnProfile ? `
                      <button onclick="deleteExperience(${exp.id})" class="text-red-500 hover:text-red-700 text-sm">
                        <i class="fas fa-trash"></i>
                      </button>
                    ` : ''}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `<p class="text-gray-500">등록된 경력이 없습니다.</p>`}
      </div>
      
      <!-- Education -->
      <div class="card">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold text-xl">
            <i class="fas fa-graduation-cap mr-2"></i>학력
          </h3>
          ${isOwnProfile ? `
            <button onclick="showAddEducationModal()" class="btn-secondary text-sm">
              <i class="fas fa-plus mr-1"></i>추가
            </button>
          ` : ''}
        </div>
        ${education.length > 0 ? `
          <div class="space-y-6">
            ${education.map(edu => `
              <div class="flex">
                <div class="w-12 h-12 bg-green-100 rounded flex items-center justify-center mr-4 flex-shrink-0">
                  <i class="fas fa-university text-green-600"></i>
                </div>
                <div class="flex-1">
                  <div class="flex justify-between items-start">
                    <div>
                      <h4 class="font-bold">${edu.school}</h4>
                      <p class="text-gray-600">${edu.degree} - ${edu.field_of_study}</p>
                      <p class="text-sm text-gray-500 mt-1">
                        ${edu.start_date} - ${edu.end_date}
                      </p>
                      ${edu.description ? `<p class="text-gray-700 mt-2">${edu.description}</p>` : ''}
                    </div>
                    ${isOwnProfile ? `
                      <button onclick="deleteEducation(${edu.id})" class="text-red-500 hover:text-red-700 text-sm">
                        <i class="fas fa-trash"></i>
                      </button>
                    ` : ''}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `<p class="text-gray-500">등록된 학력이 없습니다.</p>`}
      </div>
      
      <!-- Skills -->
      <div class="card">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold text-xl">
            <i class="fas fa-star mr-2"></i>스킬
          </h3>
          ${isOwnProfile ? `
            <button onclick="showAddSkillModal()" class="btn-secondary text-sm">
              <i class="fas fa-plus mr-1"></i>추가
            </button>
          ` : ''}
        </div>
        ${skills.length > 0 ? `
          <div class="flex flex-wrap gap-2">
            ${skills.map(skill => `
              <div class="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium flex items-center">
                ${skill.skill_name}
                <span class="ml-2 text-blue-600">${skill.endorsements}</span>
                ${isOwnProfile ? `
                  <button onclick="deleteSkill(${skill.id})" class="ml-2 text-red-500 hover:text-red-700">
                    <i class="fas fa-times text-xs"></i>
                  </button>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : `<p class="text-gray-500">등록된 스킬이 없습니다.</p>`}
      </div>
      
      <!-- Family Section -->
      ${isOwnProfile ? `
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">
              <i class="fas fa-users mr-2"></i>가족
            </h3>
            <div class="flex gap-2">
              <button onclick="loadFamilyAlbums()" class="btn btn-secondary btn-sm">
                <i class="fas fa-images"></i>
                <span class="hidden sm:inline ml-1">앨범</span>
              </button>
              <button onclick="loadFamilyTimeline()" class="btn btn-secondary btn-sm">
                <i class="fas fa-calendar-alt"></i>
                <span class="hidden sm:inline ml-1">타임라인</span>
              </button>
              <button onclick="loadKoreanFamilyTree()" class="btn btn-primary btn-sm">
                <i class="fas fa-project-diagram"></i>
                <span class="hidden sm:inline ml-1">가족 관계도</span>
              </button>
            </div>
          </div>
          
          <div id="compactFamilyNetwork" style="height: 300px; position: relative;">
            <div class="loading">
              <div class="loading-spinner"></div>
              <p style="margin-top: 1rem; color: var(--gray-500);">가족 관계도를 불러오는 중...</p>
            </div>
          </div>
          
          <div class="divider"></div>
          
          <div class="grid grid-cols-3 gap-4 text-center">
            <div>
              <div id="familyMemberCount" style="font-size: var(--text-2xl); font-weight: var(--font-bold); color: var(--primary-600);">-</div>
              <div style="font-size: var(--text-sm); color: var(--gray-600); margin-top: var(--spacing-1);">등록된 가족</div>
            </div>
            <div>
              <div id="verifiedMemberCount" style="font-size: var(--text-2xl); font-weight: var(--font-bold); color: var(--success);">-</div>
              <div style="font-size: var(--text-sm); color: var(--gray-600); margin-top: var(--spacing-1);">인증 완료</div>
            </div>
            <div>
              <div id="pendingMemberCount" style="font-size: var(--text-2xl); font-weight: var(--font-bold); color: var(--warning);">-</div>
              <div style="font-size: var(--text-sm); color: var(--gray-600); margin-top: var(--spacing-1);">인증 대기</div>
            </div>
          </div>
          
          <div class="divider"></div>
          
          <div class="flex gap-3">
            <button onclick="showAddMemberModal()" class="btn btn-primary flex-1">
              <i class="fas fa-plus mr-2"></i>가족 추가
            </button>
            <button onclick="viewFullFamilyTree()" class="btn btn-secondary flex-1">
              <i class="fas fa-sitemap mr-2"></i>전체 보기
            </button>
          </div>
        </div>
      ` : ''}
      
      <!-- Posts -->
      ${userPosts.length > 0 ? `
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">
              <i class="fas fa-rss mr-2"></i>활동
            </h3>
          </div>
          <div class="card-body">
            <div class="space-y-4">
              ${userPosts.map(post => `
                <div style="border-bottom: 1px solid var(--gray-200); padding-bottom: 1rem;">
                  <p style="color: var(--gray-700); margin-bottom: 0.5rem;">${post.content.substring(0, 150)}${post.content.length > 150 ? '...' : ''}</p>
                  <p style="font-size: var(--text-sm); color: var(--gray-500);">
                    <i class="fas fa-thumbs-up mr-1"></i>${post.likes_count}
                    <i class="fas fa-comment ml-3 mr-1"></i>${post.comments_count}
                    <span class="ml-3">${formatDate(post.created_at)}</span>
                  </p>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      ` : ''}
    `;
    
    // Load family network if on own profile
    if (isOwnProfile) {
      setTimeout(() => {
        if (typeof loadCompactFamilyNetwork === 'function') {
          loadCompactFamilyNetwork();
        }
      }, 500);
    }
  } catch (error) {
    console.error('Error loading profile:', error);
    mainContent.innerHTML = '<div class="card"><p>프로필을 불러오는데 실패했습니다.</p></div>';
  }
}

// Load suggested connections
// Suggested connections state
let allAvailableUsers = [];
let currentSuggestionIndex = 0;

async function loadSuggestedConnections() {
  try {
    const response = await axios.get('/api/users');
    allAvailableUsers = response.data.users.filter(u => u.id !== currentUser.id);
    
    // Shuffle for random suggestions
    allAvailableUsers = shuffleArray(allAvailableUsers);
    currentSuggestionIndex = 0;
    
    displaySuggestedConnections();
  } catch (error) {
    console.error('Error loading suggested connections:', error);
  }
}

function displaySuggestedConnections() {
  const container = document.getElementById('suggestedConnections');
  if (!container) return;
  
  // Get next 5 users
  const suggestedUsers = allAvailableUsers.slice(currentSuggestionIndex, currentSuggestionIndex + 5);
  
  if (suggestedUsers.length === 0) {
    // Reset to beginning if no more users
    currentSuggestionIndex = 0;
    allAvailableUsers = shuffleArray(allAvailableUsers);
    return displaySuggestedConnections();
  }
  
  container.innerHTML = suggestedUsers.map(user => `
    <div class="flex items-center justify-between mb-4 pb-4 border-b last:border-b-0 hover:bg-gray-50 p-2 rounded transition">
      <div class="flex items-center space-x-3 flex-1">
        <img src="${user.profile_image}" class="w-12 h-12 rounded-full object-cover">
        <div class="flex-1 min-w-0">
          <h5 class="font-semibold text-sm cursor-pointer hover:text-blue-600 truncate" 
              onclick="loadProfile(${user.id})">
            ${user.full_name}
          </h5>
          <p class="text-xs text-gray-600 truncate">${user.headline || '전문가'}</p>
          <p class="text-xs text-gray-400 mt-1">
            <i class="fas fa-users text-blue-500"></i> 공통 연결 ${Math.floor(Math.random() * 10) + 1}명
          </p>
        </div>
      </div>
      <button onclick="sendConnectionRequest(${user.id})" 
              class="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-full transition"
              title="연결 요청">
        <i class="fas fa-user-plus"></i>
      </button>
    </div>
  `).join('');
}

// Refresh suggested connections
function refreshSuggestedConnections() {
  const button = event.currentTarget;
  const icon = button.querySelector('i');
  
  // Add spin animation
  icon.classList.add('fa-spin');
  
  // Move to next batch
  currentSuggestionIndex += 5;
  
  // If we've gone through all users, reshuffle
  if (currentSuggestionIndex >= allAvailableUsers.length) {
    currentSuggestionIndex = 0;
    allAvailableUsers = shuffleArray(allAvailableUsers);
  }
  
  setTimeout(() => {
    displaySuggestedConnections();
    icon.classList.remove('fa-spin');
  }, 300);
}

// Shuffle array helper
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Search users
async function searchUsers(query) {
  const filteredUsers = users.filter(user => 
    user.full_name.toLowerCase().includes(query) ||
    (user.headline && user.headline.toLowerCase().includes(query))
  );
  
  // Show search results (you can implement a dropdown here)
  console.log('Search results:', filteredUsers);
}

// Utility function to format dates
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return '오늘';
  if (diffDays === 1) return '어제';
  if (diffDays < 7) return `${diffDays}일 전`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`;
  return `${Math.floor(diffDays / 365)}년 전`;
}

// Load family tree page
async function loadFamilyTree() {
  const mainContent = document.getElementById('mainContent');
  
  mainContent.innerHTML = `
    <div class="card">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">
          <i class="fas fa-sitemap mr-2 text-blue-600"></i>
          나의 가족 관계도
        </h2>
        <div class="flex space-x-2">
          <button onclick="loadFamilyTreeNetwork()" class="btn-secondary">
            <i class="fas fa-project-diagram mr-2"></i>네트워크 보기
          </button>
          <button onclick="showAddFamilyMemberModal()" class="btn-primary">
            <i class="fas fa-plus mr-2"></i>가족 구성원 추가
          </button>
        </div>
      </div>
      
      <div id="familyTreeContent" class="mt-6">
        <div class="text-center py-12">
          <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
          <p class="text-gray-500 mt-4">가족 관계도를 불러오는 중...</p>
        </div>
      </div>
    </div>
  `;
  
  try {
    const response = await axios.get('/api/family/tree');
    const { relatives } = response.data;
    
    renderFamilyTree(relatives);
  } catch (error) {
    console.error('Error loading family tree:', error);
    document.getElementById('familyTreeContent').innerHTML = `
      <div class="text-center py-12">
        <i class="fas fa-exclamation-circle text-4xl text-red-500"></i>
        <p class="text-red-600 mt-4">가족 관계도를 불러오는데 실패했습니다.</p>
      </div>
    `;
  }
}

// Load family tree network view
async function loadFamilyTreeNetwork() {
  try {
    const response = await axios.get('/api/family/tree');
    const { relatives } = response.data;
    
    showFamilyTreeNetwork(relatives);
  } catch (error) {
    console.error('Error loading family tree:', error);
    alert('가족 관계도를 불러오는데 실패했습니다.');
  }
}

// Render family tree
function renderFamilyTree(relatives) {
  const container = document.getElementById('familyTreeContent');
  
  if (!relatives || relatives.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
        <i class="fas fa-users text-6xl text-gray-300 mb-4"></i>
        <p class="text-gray-600 text-lg font-medium mb-2">아직 등록된 가족 구성원이 없습니다</p>
        <p class="text-gray-500 text-sm mb-6">아버지, 어머니부터 시작해보세요</p>
        <button onclick="showAddFamilyMemberModal()" class="btn-primary">
          <i class="fas fa-plus mr-2"></i>첫 가족 구성원 추가하기
        </button>
      </div>
    `;
    return;
  }
  
  // Group relatives by type
  const parents = relatives.filter(r => r.relationship_type === 'father' || r.relationship_type === 'mother');
  const siblings = relatives.filter(r => r.relationship_type === 'sibling');
  const spouse = relatives.find(r => r.relationship_type === 'spouse');
  const children = relatives.filter(r => r.relationship_type === 'child');
  
  container.innerHTML = `
    <!-- Parents -->
    ${parents.length > 0 ? `
      <div class="mb-8">
        <h3 class="text-lg font-bold text-gray-700 mb-4 flex items-center">
          <i class="fas fa-user-friends mr-2 text-green-600"></i>
          부모님
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${parents.map(member => renderFamilyMember(member)).join('')}
        </div>
      </div>
    ` : ''}
    
    <!-- Me -->
    <div class="mb-8">
      <h3 class="text-lg font-bold text-gray-700 mb-4 flex items-center">
        <i class="fas fa-user mr-2 text-blue-600"></i>
        나
      </h3>
      <div class="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
        <div class="flex items-center space-x-4">
          <img src="${currentUser.profile_image || 'https://i.pravatar.cc/150?img=1'}" 
               class="w-16 h-16 rounded-full border-4 border-blue-400">
          <div>
            <h4 class="font-bold text-lg text-blue-800">${currentUser.full_name}</h4>
            <p class="text-blue-600">${currentUser.headline || '전문가'}</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Siblings -->
    ${siblings.length > 0 ? `
      <div class="mb-8">
        <h3 class="text-lg font-bold text-gray-700 mb-4 flex items-center">
          <i class="fas fa-users mr-2 text-purple-600"></i>
          형제/자매
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${siblings.map(member => renderFamilyMember(member)).join('')}
        </div>
      </div>
    ` : ''}
    
    <!-- Spouse -->
    ${spouse ? `
      <div class="mb-8">
        <h3 class="text-lg font-bold text-gray-700 mb-4 flex items-center">
          <i class="fas fa-heart mr-2 text-red-600"></i>
          배우자
        </h3>
        <div class="max-w-md">
          ${renderFamilyMember(spouse)}
        </div>
      </div>
    ` : ''}
    
    <!-- Children -->
    ${children.length > 0 ? `
      <div class="mb-8">
        <h3 class="text-lg font-bold text-gray-700 mb-4 flex items-center">
          <i class="fas fa-child mr-2 text-orange-600"></i>
          자녀
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${children.map(member => renderFamilyMember(member)).join('')}
        </div>
      </div>
    ` : ''}
  `;
}

// Render individual family member card
function renderFamilyMember(member) {
  const genderIcon = member.gender === 'male' ? 'fa-mars' : 'fa-venus';
  const genderColor = member.gender === 'male' ? 'text-blue-500' : 'text-pink-500';
  const verifiedBadge = member.is_verified ? 
    '<span class="text-green-500 text-xs"><i class="fas fa-check-circle"></i> 인증됨</span>' : 
    '<span class="text-gray-400 text-xs"><i class="fas fa-clock"></i> 미인증</span>';
  
  return `
    <div class="bg-white border rounded-lg p-4 hover:shadow-md transition cursor-pointer"
         onclick="viewFamilyMember(${member.id})">
      <div class="flex items-start space-x-3">
        <div class="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
          <i class="fas fa-user text-gray-500 text-xl"></i>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center space-x-2">
            <h4 class="font-bold text-gray-800 truncate">
              ${member.name_ko || member.name_en}
            </h4>
            <i class="fas ${genderIcon} ${genderColor} text-sm"></i>
          </div>
          ${member.name_en && member.name_ko ? `
            <p class="text-xs text-gray-500">${member.name_en}</p>
          ` : ''}
          ${member.birth_date ? `
            <p class="text-xs text-gray-500 mt-1">${member.birth_date}</p>
          ` : ''}
          <div class="mt-2">
            ${verifiedBadge}
          </div>
        </div>
      </div>
    </div>
  `;
}

// View family member details
async function viewFamilyMember(memberId) {
  try {
    const response = await axios.get(`/api/family/members/${memberId}`);
    const { member, contacts, relationships } = response.data;
    
    // Show modal with member details
    alert(`
      이름: ${member.name_ko || member.name_en}
      생년월일: ${member.birth_date || '미등록'}
      성별: ${member.gender === 'male' ? '남성' : '여성'}
      
      연락처:
      ${contacts.map(c => `${c.contact_type}: ${c.contact_value}`).join('\n')}
    `);
  } catch (error) {
    console.error('Error loading member details:', error);
    alert('가족 구성원 정보를 불러오는데 실패했습니다.');
  }
}

// Show add family member modal
function showAddFamilyMemberModal() {
  const modal = document.createElement('div');
  modal.id = 'addFamilyMemberModal';
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
  
  modal.innerHTML = `
    <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div class="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
        <h3 class="text-2xl font-bold text-gray-800">가족 구성원 추가</h3>
        <button onclick="closeAddFamilyMemberModal()" class="text-gray-500 hover:text-gray-700">
          <i class="fas fa-times text-2xl"></i>
        </button>
      </div>
      
      <form id="addFamilyMemberForm" class="p-6 space-y-4">
        <!-- Relationship Type -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            관계 <span class="text-red-500">*</span>
          </label>
          <select id="relationshipType" required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">선택하세요</option>
            <option value="father">아버지</option>
            <option value="mother">어머니</option>
            <option value="sibling">형제/자매</option>
            <option value="spouse">배우자</option>
            <option value="child">자녀</option>
          </select>
        </div>
        
        <!-- Name (Korean) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            이름 (한글) <span class="text-red-500">*</span>
          </label>
          <input type="text" id="nameKo" required
                 class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                 placeholder="홍길동">
        </div>
        
        <!-- Name (English) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            이름 (영문)
          </label>
          <input type="text" id="nameEn"
                 class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                 placeholder="Hong Gildong">
        </div>
        
        <!-- Gender -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            성별 <span class="text-red-500">*</span>
          </label>
          <div class="flex space-x-4">
            <label class="flex items-center cursor-pointer">
              <input type="radio" name="gender" value="male" required class="mr-2">
              <span>남성</span>
            </label>
            <label class="flex items-center cursor-pointer">
              <input type="radio" name="gender" value="female" required class="mr-2">
              <span>여성</span>
            </label>
          </div>
        </div>
        
        <!-- Birth Date -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            생년월일
          </label>
          <input type="date" id="birthDate"
                 class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
        
        <!-- Contact Info -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            연락처 <span class="text-red-500">*</span> (최소 1개 이상)
          </label>
          <div class="space-y-2">
            <div class="flex space-x-2">
              <select class="contact-type px-3 py-2 border border-gray-300 rounded-lg">
                <option value="phone">전화번호</option>
                <option value="email">이메일</option>
                <option value="address">주소</option>
              </select>
              <input type="text" class="contact-value flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                     placeholder="연락처를 입력하세요">
            </div>
            <button type="button" onclick="addContactField()" 
                    class="text-blue-600 hover:text-blue-700 text-sm">
              <i class="fas fa-plus mr-1"></i>연락처 추가
            </button>
          </div>
        </div>
        
        <!-- Submit -->
        <div class="flex space-x-3">
          <button type="submit" class="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition">
            <i class="fas fa-plus mr-2"></i>추가하기
          </button>
          <button type="button" onclick="closeAddFamilyMemberModal()" 
                  class="px-6 bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-300 transition">
            취소
          </button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Handle form submission
  document.getElementById('addFamilyMemberForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await submitAddFamilyMember();
  });
}

// Close modal
function closeAddFamilyMemberModal() {
  const modal = document.getElementById('addFamilyMemberModal');
  if (modal) {
    modal.remove();
  }
}

// Submit add family member
async function submitAddFamilyMember() {
  const relationshipType = document.getElementById('relationshipType').value;
  const nameKo = document.getElementById('nameKo').value;
  const nameEn = document.getElementById('nameEn').value;
  const gender = document.querySelector('input[name="gender"]:checked').value;
  const birthDate = document.getElementById('birthDate').value;
  
  // Collect contact info
  const contactTypes = document.querySelectorAll('.contact-type');
  const contactValues = document.querySelectorAll('.contact-value');
  const contactInfo = [];
  
  for (let i = 0; i < contactTypes.length; i++) {
    if (contactValues[i].value.trim()) {
      contactInfo.push({
        type: contactTypes[i].value,
        value: contactValues[i].value.trim(),
        is_primary: i === 0 ? 1 : 0
      });
    }
  }
  
  if (contactInfo.length === 0) {
    alert('최소 1개 이상의 연락처를 입력해주세요.');
    return;
  }
  
  try {
    await axios.post('/api/family/members', {
      name_ko: nameKo,
      name_en: nameEn || null,
      birth_date: birthDate || null,
      gender,
      relationship_type: relationshipType,
      contact_info: contactInfo
    });
    
    closeAddFamilyMemberModal();
    alert('가족 구성원이 추가되었습니다!');
    await loadFamilyTree();
  } catch (error) {
    console.error('Error adding family member:', error);
    alert('가족 구성원 추가에 실패했습니다.');
  }
}

// Add contact field
function addContactField() {
  const container = event.target.closest('.space-y-2');
  const newField = document.createElement('div');
  newField.className = 'flex space-x-2';
  newField.innerHTML = `
    <select class="contact-type px-3 py-2 border border-gray-300 rounded-lg">
      <option value="phone">전화번호</option>
      <option value="email">이메일</option>
      <option value="address">주소</option>
    </select>
    <input type="text" class="contact-value flex-1 px-4 py-2 border border-gray-300 rounded-lg"
           placeholder="연락처를 입력하세요">
    <button type="button" onclick="this.parentElement.remove()" 
            class="px-3 text-red-600 hover:text-red-700">
      <i class="fas fa-times"></i>
    </button>
  `;
  container.insertBefore(newField, event.target.parentElement);
}

// ==================== Compact Family Network ====================

// Load compact family network on page load
document.addEventListener('DOMContentLoaded', () => {
  loadCompactFamilyNetwork();
});

// Load and render compact family network
async function loadCompactFamilyNetwork() {
  const container = document.getElementById('compactFamilyNetwork');
  
  if (!container) return;
  
  try {
    // Fetch family data
    const response = await axios.get('/api/family/tree');
    const relatives = response.data.relatives || [];
    
    // Update stats
    updateFamilyStats(relatives);
    
    // Render compact Korean style network
    renderCompactKoreanFamilyTree(relatives);
    
  } catch (error) {
    console.error('Error loading compact family network:', error);
    container.innerHTML = `
      <div class="text-center py-12 text-gray-400">
        <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
        <p class="text-xs">가족 정보를 불러올 수 없습니다</p>
      </div>
    `;
  }
}

// Update family statistics
function updateFamilyStats(relatives) {
  const totalCount = relatives.length;
  const verifiedCount = relatives.filter(r => r.is_verified === 1).length;
  const pendingCount = totalCount - verifiedCount;
  
  const totalEl = document.getElementById('familyMemberCount');
  const verifiedEl = document.getElementById('verifiedMemberCount');
  const pendingEl = document.getElementById('pendingMemberCount');
  
  if (totalEl) totalEl.textContent = totalCount;
  if (verifiedEl) verifiedEl.textContent = verifiedCount;
  if (pendingEl) pendingEl.textContent = pendingCount;
}

// Render compact family network (simplified version)
function renderCompactFamilyNetwork(relatives) {
  const container = document.getElementById('compactFamilyNetwork');
  
  if (!relatives || relatives.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 text-gray-400">
        <i class="fas fa-users text-3xl mb-2"></i>
        <p class="text-xs">등록된 가족이 없습니다</p>
      </div>
    `;
    return;
  }
  
  // Clear container
  container.innerHTML = '';
  
  const width = container.offsetWidth;
  const height = 300;
  
  // Prepare data
  const { nodes, links } = prepareNetworkData(relatives);
  
  // Create SVG
  const svg = d3.select('#compactFamilyNetwork')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`);
  
  const g = svg.append('g');
  
  // Force simulation (compact layout)
  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(80))
    .force('charge', d3.forceManyBody().strength(-200))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(25));
  
  // Draw links
  const link = g.append('g')
    .selectAll('line')
    .data(links)
    .enter()
    .append('line')
    .attr('stroke', d => getLinkColor(d.type))
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', d => d.verified ? '0' : '3,3')
    .attr('opacity', 0.5);
  
  // Draw nodes
  const node = g.append('g')
    .selectAll('g')
    .data(nodes)
    .enter()
    .append('g')
    .style('cursor', 'pointer')
    .on('click', (event, d) => {
      showFamilyMemberQuickView(d);
    });
  
  // Node circles
  node.append('circle')
    .attr('r', 20)
    .attr('fill', d => getNodeColor(d.relation))
    .attr('stroke', d => d.is_verified ? '#10b981' : '#ef4444')
    .attr('stroke-width', 2);
  
  // Node icons
  node.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '0.3em')
    .attr('font-size', '14px')
    .attr('fill', 'white')
    .text(d => getRelationIcon(d.relation));
  
  // Node labels (name)
  node.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '32px')
    .attr('font-size', '9px')
    .attr('font-weight', 'bold')
    .attr('fill', '#1f2937')
    .text(d => {
      const name = d.name_ko || d.name_en || '?';
      return name.length > 6 ? name.substring(0, 5) + '...' : name;
    });
  
  // Update positions on simulation tick
  simulation.on('tick', () => {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);
    
    node.attr('transform', d => `translate(${d.x},${d.y})`);
  });
  
  // Store simulation reference
  window.compactFamilySimulation = simulation;
}

// Show family member quick view
function showFamilyMemberQuickView(member) {
  const relationLabel = getRelationLabel(member.relation);
  const age = member.birth_date ? calculateAge(member.birth_date) : '-';
  const verifiedIcon = member.is_verified 
    ? '<i class="fas fa-check-circle text-green-500"></i>' 
    : '<i class="fas fa-clock text-yellow-500"></i>';
  
  alert(`${verifiedIcon} ${member.name_ko || member.name_en}\n관계: ${relationLabel}\n나이: ${age}세`);
}

// Toggle to full family network view
function toggleFamilyNetwork() {
  viewFullFamilyTree();
}

// View full family tree (opens Family Tree tab)
function viewFullFamilyTree() {
  loadPage('family');
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==================== Settings Page ====================

// Load settings page
async function loadSettingsPage() {
  const mainContent = document.getElementById('mainContent');
  const rightSidebar = document.getElementById('rightSidebar');
  
  // Clear right sidebar
  if (rightSidebar) {
    rightSidebar.innerHTML = '';
  }
  
  // Get session info from localStorage
  const loginTime = localStorage.getItem('loginTime') || new Date().toISOString();
  const loginHistory = JSON.parse(localStorage.getItem('loginHistory') || '[]');
  const sessionId = localStorage.getItem('sessionId') || 'session-' + Date.now();
  
  mainContent.innerHTML = `
    <div class="card">
      <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 2px solid var(--gray-200);">
        <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--primary-500); display: flex; align-items: center; justify-content: center;">
          <i class="fas fa-cog" style="font-size: 1.5rem; color: white;"></i>
        </div>
        <div>
          <h1 style="font-size: var(--text-2xl); font-weight: var(--font-bold); margin-bottom: 0.25rem;">설정</h1>
          <p style="font-size: var(--text-sm); color: var(--gray-600);">계정 및 앱 설정을 관리하세요</p>
        </div>
      </div>
      
      <!-- Settings Sections -->
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        
        <!-- Login Status Section -->
        <div class="card" style="background: var(--gray-50); border: 1px solid var(--gray-200);">
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
            <i class="fas fa-user-check" style="font-size: 1.25rem; color: var(--success);"></i>
            <h2 style="font-size: var(--text-xl); font-weight: var(--font-bold);">로그인 상황</h2>
          </div>
          
          <!-- Current Session -->
          <div style="background: white; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
              <h3 style="font-weight: 600; color: var(--gray-800);">현재 세션</h3>
              <span class="badge badge-success">활성</span>
            </div>
            <div style="display: grid; gap: 0.5rem; font-size: var(--text-sm);">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--gray-600);">사용자:</span>
                <span style="font-weight: 600;">${currentUser.full_name}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--gray-600);">이메일:</span>
                <span style="font-weight: 600;">${currentUser.email || 'test@example.com'}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--gray-600);">세션 ID:</span>
                <span style="font-family: monospace; font-size: var(--text-xs); color: var(--gray-500);">${sessionId.substring(0, 20)}...</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--gray-600);">로그인 시간:</span>
                <span style="font-weight: 600;">${formatDateTime(loginTime)}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--gray-600);">활동 시간:</span>
                <span style="font-weight: 600;">${calculateActiveTime(loginTime)}</span>
              </div>
            </div>
          </div>
          
          <!-- Login History -->
          <div style="background: white; padding: 1rem; border-radius: 0.5rem;">
            <h3 style="font-weight: 600; color: var(--gray-800); margin-bottom: 0.75rem;">최근 로그인 기록</h3>
            ${renderLoginHistory(loginHistory)}
          </div>
          
          <!-- Actions -->
          <div style="display: flex; gap: 0.75rem; margin-top: 1rem;">
            <button onclick="refreshSession()" class="btn btn-secondary btn-sm">
              <i class="fas fa-sync-alt" style="margin-right: 0.5rem;"></i>세션 새로고침
            </button>
            <button onclick="clearLoginHistory()" class="btn btn-ghost btn-sm">
              <i class="fas fa-trash" style="margin-right: 0.5rem;"></i>기록 삭제
            </button>
          </div>
        </div>
        
        <!-- Account Settings Section -->
        <div class="card" style="background: var(--gray-50); border: 1px solid var(--gray-200);">
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
            <i class="fas fa-user-cog" style="font-size: 1.25rem; color: var(--primary-600);"></i>
            <h2 style="font-size: var(--text-xl); font-weight: var(--font-bold);">계정 설정</h2>
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <button onclick="window.location.href='/profile/edit'" class="setting-item">
              <div style="display: flex; align-items: center; gap: 1rem;">
                <i class="fas fa-edit" style="color: var(--gray-600);"></i>
                <div style="flex: 1;">
                  <div style="font-weight: 600;">프로필 편집</div>
                  <div style="font-size: var(--text-sm); color: var(--gray-600);">이름, 사진, 소개 등을 수정</div>
                </div>
                <i class="fas fa-chevron-right" style="color: var(--gray-400);"></i>
              </div>
            </button>
            
            <button onclick="showChangePassword()" class="setting-item">
              <div style="display: flex; align-items: center; gap: 1rem;">
                <i class="fas fa-key" style="color: var(--gray-600);"></i>
                <div style="flex: 1;">
                  <div style="font-weight: 600;">비밀번호 변경</div>
                  <div style="font-size: var(--text-sm); color: var(--gray-600);">보안을 위해 정기적으로 변경하세요</div>
                </div>
                <i class="fas fa-chevron-right" style="color: var(--gray-400);"></i>
              </div>
            </button>
            
            <button onclick="showDeleteAccount()" class="setting-item">
              <div style="display: flex; align-items: center; gap: 1rem;">
                <i class="fas fa-user-times" style="color: var(--error);"></i>
                <div style="flex: 1;">
                  <div style="font-weight: 600; color: var(--error);">계정 삭제</div>
                  <div style="font-size: var(--text-sm); color: var(--gray-600);">계정을 영구적으로 삭제</div>
                </div>
                <i class="fas fa-chevron-right" style="color: var(--gray-400);"></i>
              </div>
            </button>
          </div>
        </div>
        
        <!-- Privacy Settings Section -->
        <div class="card" style="background: var(--gray-50); border: 1px solid var(--gray-200);">
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
            <i class="fas fa-shield-alt" style="font-size: 1.25rem; color: var(--success);"></i>
            <h2 style="font-size: var(--text-xl); font-weight: var(--font-bold);">프라이버시</h2>
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <div class="setting-item">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                  <i class="fas fa-eye" style="color: var(--gray-600);"></i>
                  <div>
                    <div style="font-weight: 600;">프로필 공개</div>
                    <div style="font-size: var(--text-sm); color: var(--gray-600);">다른 사용자에게 프로필 표시</div>
                  </div>
                </div>
                <label class="switch">
                  <input type="checkbox" id="profileVisibility" checked onchange="toggleSetting('profileVisibility', this.checked)">
                  <span class="slider"></span>
                </label>
              </div>
            </div>
            
            <div class="setting-item">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                  <i class="fas fa-search" style="color: var(--gray-600);"></i>
                  <div>
                    <div style="font-weight: 600;">검색 허용</div>
                    <div style="font-size: var(--text-sm); color: var(--gray-600);">검색 결과에 표시</div>
                  </div>
                </div>
                <label class="switch">
                  <input type="checkbox" id="searchable" checked onchange="toggleSetting('searchable', this.checked)">
                  <span class="slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Notification Settings Section -->
        <div class="card" style="background: var(--gray-50); border: 1px solid var(--gray-200);">
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
            <i class="fas fa-bell" style="font-size: 1.25rem; color: var(--warning);"></i>
            <h2 style="font-size: var(--text-xl); font-weight: var(--font-bold);">알림 설정</h2>
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <div class="setting-item">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                  <i class="fas fa-desktop" style="color: var(--gray-600);"></i>
                  <div>
                    <div style="font-weight: 600;">푸시 알림</div>
                    <div style="font-size: var(--text-sm); color: var(--gray-600);">브라우저 알림 받기</div>
                  </div>
                </div>
                <label class="switch">
                  <input type="checkbox" id="pushNotifications" checked onchange="toggleSetting('pushNotifications', this.checked)">
                  <span class="slider"></span>
                </label>
              </div>
            </div>
            
            <div class="setting-item">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                  <i class="fas fa-envelope" style="color: var(--gray-600);"></i>
                  <div>
                    <div style="font-weight: 600;">이메일 알림</div>
                    <div style="font-size: var(--text-sm); color: var(--gray-600);">중요 알림을 이메일로 받기</div>
                  </div>
                </div>
                <label class="switch">
                  <input type="checkbox" id="emailNotifications" onchange="toggleSetting('emailNotifications', this.checked)">
                  <span class="slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <!-- App Settings Section -->
        <div class="card" style="background: var(--gray-50); border: 1px solid var(--gray-200);">
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
            <i class="fas fa-sliders-h" style="font-size: 1.25rem; color: var(--info);"></i>
            <h2 style="font-size: var(--text-xl); font-weight: var(--font-bold);">앱 설정</h2>
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <div class="setting-item">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                  <i class="fas fa-moon" style="color: var(--gray-600);"></i>
                  <div>
                    <div style="font-weight: 600;">다크 모드</div>
                    <div style="font-size: var(--text-sm); color: var(--gray-600);">어두운 테마 사용</div>
                  </div>
                </div>
                <label class="switch">
                  <input type="checkbox" id="darkModeToggle" onchange="toggleDarkModeFromSettings(this.checked)">
                  <span class="slider"></span>
                </label>
              </div>
            </div>
            
            <button onclick="clearCache()" class="setting-item">
              <div style="display: flex; align-items: center; gap: 1rem;">
                <i class="fas fa-broom" style="color: var(--gray-600);"></i>
                <div style="flex: 1;">
                  <div style="font-weight: 600;">캐시 삭제</div>
                  <div style="font-size: var(--text-sm); color: var(--gray-600);">저장된 데이터 정리</div>
                </div>
                <i class="fas fa-chevron-right" style="color: var(--gray-400);"></i>
              </div>
            </button>
            
            <button onclick="showAbout()" class="setting-item">
              <div style="display: flex; align-items: center; gap: 1rem;">
                <i class="fas fa-info-circle" style="color: var(--gray-600);"></i>
                <div style="flex: 1;">
                  <div style="font-weight: 600;">앱 정보</div>
                  <div style="font-size: var(--text-sm); color: var(--gray-600);">버전 1.0.0</div>
                </div>
                <i class="fas fa-chevron-right" style="color: var(--gray-400);"></i>
              </div>
            </button>
          </div>
        </div>
        
        <!-- Logout Button -->
        <div class="card" style="background: var(--error-light); border: 2px solid var(--error);">
          <button onclick="logout()" style="width: 100%; padding: 1rem; background: var(--error); color: white; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.75rem; transition: all 0.15s;"
                  onmouseover="this.style.background='#dc2626'"
                  onmouseout="this.style.background='var(--error)'">
            <i class="fas fa-sign-out-alt"></i>
            <span>로그아웃</span>
          </button>
        </div>
      </div>
    </div>
  `;
  
  // Load saved settings
  loadSettings();
}

// Format date time
function formatDateTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours === 0 && minutes === 0) {
    return '방금 전';
  } else if (hours === 0) {
    return `${minutes}분 전`;
  } else if (hours < 24) {
    return `${hours}시간 ${minutes}분 전`;
  } else {
    return date.toLocaleDateString('ko-KR') + ' ' + date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  }
}

// Calculate active time
function calculateActiveTime(loginTime) {
  const start = new Date(loginTime);
  const now = new Date();
  const diff = now - start;
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours === 0) {
    return `${minutes}분`;
  } else {
    return `${hours}시간 ${minutes}분`;
  }
}

// Render login history
function renderLoginHistory(history) {
  if (!history || history.length === 0) {
    return `
      <div style="text-align: center; padding: 1rem; color: var(--gray-500);">
        <i class="fas fa-history" style="font-size: 2rem; margin-bottom: 0.5rem; opacity: 0.5;"></i>
        <p style="font-size: var(--text-sm);">로그인 기록이 없습니다</p>
      </div>
    `;
  }
  
  return `
    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
      ${history.slice(0, 5).map((record, index) => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: var(--gray-50); border-radius: 0.25rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <i class="fas fa-clock" style="color: var(--gray-400); font-size: var(--text-sm);"></i>
            <div>
              <div style="font-size: var(--text-sm); font-weight: 600;">${formatDateTime(record.time)}</div>
              <div style="font-size: var(--text-xs); color: var(--gray-500);">${record.device || 'Unknown Device'}</div>
            </div>
          </div>
          ${index === 0 ? '<span class="badge badge-success" style="font-size: var(--text-xs);">현재</span>' : ''}
        </div>
      `).join('')}
    </div>
  `;
}

// Refresh session
function refreshSession() {
  const newSessionId = 'session-' + Date.now();
  localStorage.setItem('sessionId', newSessionId);
  localStorage.setItem('loginTime', new Date().toISOString());
  
  // Add to login history
  const history = JSON.parse(localStorage.getItem('loginHistory') || '[]');
  history.unshift({
    time: new Date().toISOString(),
    device: navigator.userAgent.substring(0, 50)
  });
  localStorage.setItem('loginHistory', JSON.stringify(history.slice(0, 10)));
  
  alert('세션이 새로고침되었습니다!');
  loadSettingsPage();
}

// Clear login history
function clearLoginHistory() {
  if (confirm('로그인 기록을 모두 삭제하시겠습니까?')) {
    localStorage.removeItem('loginHistory');
    alert('로그인 기록이 삭제되었습니다.');
    loadSettingsPage();
  }
}

// Load settings from localStorage
function loadSettings() {
  const settings = {
    profileVisibility: localStorage.getItem('profileVisibility') !== 'false',
    searchable: localStorage.getItem('searchable') !== 'false',
    pushNotifications: localStorage.getItem('pushNotifications') !== 'false',
    emailNotifications: localStorage.getItem('emailNotifications') === 'true'
  };
  
  Object.keys(settings).forEach(key => {
    const element = document.getElementById(key);
    if (element) {
      element.checked = settings[key];
    }
  });
  
  // Load dark mode setting
  const currentTheme = localStorage.getItem('theme') || 'light';
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (darkModeToggle) {
    darkModeToggle.checked = currentTheme === 'dark';
  }
}

// Toggle setting
function toggleSetting(setting, value) {
  localStorage.setItem(setting, value);
  console.log(`Setting ${setting} changed to ${value}`);
  
  if (setting === 'pushNotifications' && value) {
    requestNotificationPermission();
  }
}

// Show change password modal
function showChangePassword() {
  alert('비밀번호 변경 기능은 준비 중입니다.');
}

// Show delete account modal
function showDeleteAccount() {
  if (confirm('정말로 계정을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.')) {
    alert('계정 삭제 기능은 준비 중입니다.');
  }
}

// Clear cache
function clearCache() {
  if (confirm('캐시를 삭제하시겠습니까?\n\n일부 설정이 초기화될 수 있습니다.')) {
    // Clear specific cache items
    const keysToKeep = ['user', 'theme', 'loginTime', 'sessionId'];
    Object.keys(localStorage).forEach(key => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });
    
    alert('캐시가 삭제되었습니다.');
  }
}

// Toggle dark mode from settings
function toggleDarkModeFromSettings(enabled) {
  const theme = enabled ? 'dark' : 'light';
  localStorage.setItem('theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
  console.log(`Theme changed to ${theme}`);
}

// Show about modal
function showAbout() {
  alert(`CHON Village v1.0.0\n\n프로페셔널 네트워킹 플랫폼\n\n© 2026 CHON Village. All rights reserved.`);
}

// Logout
function logout() {
  if (confirm('로그아웃하시겠습니까?')) {
    localStorage.removeItem('user');
    localStorage.removeItem('sessionId');
    window.location.href = '/login';
  }
}

// ========================================
// QR Code Functions
// ========================================

// Show profile QR code modal
function showProfileQRCode() {
  const profileUrl = `${window.location.origin}/profile/${currentUser.id}`;
  
  // Create modal
  const modal = document.createElement('div');
  modal.id = 'qrCodeModal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 1rem;
  `;
  
  modal.innerHTML = `
    <div style="
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      max-width: 400px;
      width: 100%;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    ">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h3 style="font-size: 1.5rem; font-weight: bold; color: var(--gray-900);">
          <i class="fas fa-qrcode" style="color: var(--primary-600); margin-right: 0.5rem;"></i>
          내 프로필 QR 코드
        </h3>
        <button onclick="closeQRCodeModal()" style="
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background: var(--gray-100);
          color: var(--gray-600);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        " onmouseover="this.style.background='var(--gray-200)'" onmouseout="this.style.background='var(--gray-100)'">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div style="text-align: center;">
        <div id="qrCodeContainer" style="
          display: inline-block;
          padding: 1rem;
          background: white;
          border-radius: 0.5rem;
          border: 2px solid var(--gray-200);
          margin-bottom: 1rem;
        "></div>
        
        <div style="background: var(--gray-50); padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;">
          <p style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: 0.5rem;">프로필 URL</p>
          <div style="
            background: white;
            padding: 0.75rem;
            border-radius: 0.375rem;
            border: 1px solid var(--gray-300);
            font-family: monospace;
            font-size: 0.75rem;
            color: var(--gray-800);
            word-break: break-all;
          ">${profileUrl}</div>
        </div>
        
        <div style="display: flex; gap: 0.5rem;">
          <button onclick="copyProfileURL('${profileUrl}')" class="btn btn-secondary" style="flex: 1;">
            <i class="fas fa-copy"></i> URL 복사
          </button>
          <button onclick="downloadQRCode()" class="btn btn-primary" style="flex: 1;">
            <i class="fas fa-download"></i> 다운로드
          </button>
        </div>
        
        <p style="font-size: 0.75rem; color: var(--gray-500); margin-top: 1rem;">
          <i class="fas fa-info-circle"></i> QR 코드를 스캔하면 내 프로필로 바로 연결됩니다
        </p>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Generate QR code
  QRCode.toCanvas(document.getElementById('qrCodeContainer'), profileUrl, {
    width: 256,
    margin: 2,
    color: {
      dark: '#1f2937',
      light: '#ffffff'
    }
  }, function (error) {
    if (error) {
      console.error('QR Code generation error:', error);
      document.getElementById('qrCodeContainer').innerHTML = `
        <p style="color: var(--error); padding: 2rem;">QR 코드 생성에 실패했습니다.</p>
      `;
    }
  });
  
  // Close on background click
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeQRCodeModal();
    }
  });
}

// Close QR code modal
function closeQRCodeModal() {
  const modal = document.getElementById('qrCodeModal');
  if (modal) {
    modal.remove();
  }
}

// Copy profile URL to clipboard
function copyProfileURL(url) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      // Show success message
      const btn = event.target.closest('button');
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-check"></i> 복사됨!';
      btn.style.background = 'var(--success)';
      btn.style.color = 'white';
      
      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.background = '';
        btn.style.color = '';
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
      alert('URL 복사에 실패했습니다.');
    });
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = url;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      alert('URL이 클립보드에 복사되었습니다!');
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('URL 복사에 실패했습니다.');
    }
    
    document.body.removeChild(textArea);
  }
}

// Download QR code as image
function downloadQRCode() {
  const canvas = document.querySelector('#qrCodeContainer canvas');
  if (!canvas) {
    alert('QR 코드를 찾을 수 없습니다.');
    return;
  }
  
  // Convert canvas to blob and download
  canvas.toBlob(function(blob) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `chon-village-profile-qr-${currentUser.id}.png`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  });
}

