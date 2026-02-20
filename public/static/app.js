// Current user (for demo purposes)
const currentUser = { id: 1, full_name: 'John Doe' };

// State management
let currentPage = 'feed';
let users = [];
let posts = [];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  loadPage('feed');
  setupEventListeners();
  loadSuggestedConnections();
});

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
    case 'network':
      await loadNetwork();
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
async function loadSuggestedConnections() {
  try {
    const response = await axios.get('/api/users');
    const users = response.data.users.slice(0, 5);
    
    const container = document.getElementById('suggestedConnections');
    container.innerHTML = users.map(user => `
      <div class="flex items-center justify-between mb-4 pb-4 border-b last:border-b-0">
        <div class="flex items-center space-x-3">
          <img src="${user.profile_image}" class="w-10 h-10 rounded-full">
          <div>
            <h5 class="font-semibold text-sm cursor-pointer hover:text-blue-600" 
                onclick="loadProfile(${user.id})">
              ${user.full_name}
            </h5>
            <p class="text-xs text-gray-600">${user.headline || '전문가'}</p>
          </div>
        </div>
        <button onclick="sendConnectionRequest(${user.id})" 
                class="text-blue-600 hover:text-blue-700">
          <i class="fas fa-user-plus"></i>
        </button>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading suggested connections:', error);
  }
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
