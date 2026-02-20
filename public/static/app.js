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
  loadPage('feed');
  setupEventListeners();
  loadSuggestedConnections();
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
  
  switch (page) {
    case 'feed':
      await loadFeed();
      break;
    case 'nodes':
      await loadNodesPage();
      break;
    case 'family':
      await loadKoreanFamilyTree();
      break;
    case 'profile':
      await loadProfile(currentUser.id);
      break;
  }
}

// Load feed page
async function loadFeed() {
  const mainContent = document.getElementById('mainContent');
  
  // Post creation form
  mainContent.innerHTML = `
    <div class="card">
      <textarea id="postContent" rows="3" 
                class="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="무슨 생각을 하고 계신가요?"></textarea>
      <div class="flex justify-end mt-3">
        <button onclick="createPost()" class="btn-primary">
          <i class="fas fa-paper-plane mr-2"></i>게시
        </button>
      </div>
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
  
  feedPosts.innerHTML = postsData.map(post => `
    <div class="card">
      <div class="flex items-start mb-4">
        <img src="${post.profile_image}" class="w-12 h-12 rounded-full mr-3">
        <div class="flex-1">
          <h4 class="font-bold">${post.full_name}</h4>
          <p class="text-sm text-gray-600">${post.headline}</p>
          <p class="text-xs text-gray-500">${formatDate(post.created_at)}</p>
        </div>
      </div>
      
      <p class="mb-4 whitespace-pre-wrap">${post.content}</p>
      
      ${post.image_url ? `<img src="${post.image_url}" class="w-full rounded-lg mb-4">` : ''}
      
      <div class="flex items-center space-x-6 pt-4 border-t text-gray-600">
        <button onclick="likePost(${post.id})" class="hover:text-blue-600 transition">
          <i class="fas fa-thumbs-up mr-1"></i>${post.likes_count} 좋아요
        </button>
        <button onclick="loadComments(${post.id})" class="hover:text-blue-600 transition">
          <i class="fas fa-comment mr-1"></i>${post.comments_count} 댓글
        </button>
        <button class="hover:text-blue-600 transition">
          <i class="fas fa-share mr-1"></i>공유
        </button>
      </div>
      
      <div id="comments-${post.id}" class="mt-4 hidden"></div>
    </div>
  `).join('');
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
    
    mainContent.innerHTML = `
      <!-- Profile Header -->
      <div class="card">
        <div class="flex items-start space-x-6">
          <img src="${user.profile_image}" class="w-32 h-32 rounded-full border-4 border-blue-100">
          <div class="flex-1">
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
            <div class="mt-4 flex space-x-3">
              <button class="btn-primary">
                <i class="fas fa-user-plus mr-1"></i>연결
              </button>
              <button class="btn-secondary">
                <i class="fas fa-envelope mr-1"></i>메시지
              </button>
            </div>
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
      ${experiences.length > 0 ? `
        <div class="card">
          <h3 class="font-bold text-xl mb-4">
            <i class="fas fa-briefcase mr-2"></i>경력
          </h3>
          <div class="space-y-6">
            ${experiences.map(exp => `
              <div class="flex">
                <div class="w-12 h-12 bg-blue-100 rounded flex items-center justify-center mr-4 flex-shrink-0">
                  <i class="fas fa-building text-blue-600"></i>
                </div>
                <div class="flex-1">
                  <h4 class="font-bold">${exp.position}</h4>
                  <p class="text-gray-600">${exp.company}</p>
                  <p class="text-sm text-gray-500 mt-1">
                    ${exp.start_date} - ${exp.is_current ? '현재' : exp.end_date}
                  </p>
                  ${exp.description ? `<p class="text-gray-700 mt-2">${exp.description}</p>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
      
      <!-- Education -->
      ${education.length > 0 ? `
        <div class="card">
          <h3 class="font-bold text-xl mb-4">
            <i class="fas fa-graduation-cap mr-2"></i>학력
          </h3>
          <div class="space-y-6">
            ${education.map(edu => `
              <div class="flex">
                <div class="w-12 h-12 bg-green-100 rounded flex items-center justify-center mr-4 flex-shrink-0">
                  <i class="fas fa-university text-green-600"></i>
                </div>
                <div class="flex-1">
                  <h4 class="font-bold">${edu.school}</h4>
                  <p class="text-gray-600">${edu.degree} - ${edu.field_of_study}</p>
                  <p class="text-sm text-gray-500 mt-1">
                    ${edu.start_date} - ${edu.end_date}
                  </p>
                  ${edu.description ? `<p class="text-gray-700 mt-2">${edu.description}</p>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
      
      <!-- Skills -->
      ${skills.length > 0 ? `
        <div class="card">
          <h3 class="font-bold text-xl mb-4">
            <i class="fas fa-star mr-2"></i>스킬
          </h3>
          <div class="flex flex-wrap gap-2">
            ${skills.map(skill => `
              <div class="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                ${skill.skill_name}
                <span class="ml-2 text-blue-600">${skill.endorsements}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
      
      <!-- Posts -->
      ${userPosts.length > 0 ? `
        <div class="card">
          <h3 class="font-bold text-xl mb-4">
            <i class="fas fa-rss mr-2"></i>활동
          </h3>
          <div class="space-y-4">
            ${userPosts.map(post => `
              <div class="border-b pb-4 last:border-b-0">
                <p class="text-gray-700 mb-2">${post.content.substring(0, 150)}${post.content.length > 150 ? '...' : ''}</p>
                <p class="text-sm text-gray-500">
                  <i class="fas fa-thumbs-up mr-1"></i>${post.likes_count}
                  <i class="fas fa-comment ml-3 mr-1"></i>${post.comments_count}
                  <span class="ml-3">${formatDate(post.created_at)}</span>
                </p>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    `;
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

