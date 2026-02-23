// Notifications and Search UI

// ============================================
// Notifications
// ============================================

let notificationUpdateInterval = null;

// Initialize notifications
async function initNotifications() {
  await updateNotificationBadge();
  
  // Update badge every 30 seconds
  if (notificationUpdateInterval) {
    clearInterval(notificationUpdateInterval);
  }
  notificationUpdateInterval = setInterval(updateNotificationBadge, 30000);
}

// Update notification badge
async function updateNotificationBadge() {
  try {
    const response = await axios.get('/api/notifications/unread-count');
    const count = response.data.count;
    
    const badges = document.querySelectorAll('.notification-badge');
    badges.forEach(badge => {
      if (count > 0) {
        badge.textContent = count > 99 ? '99+' : count;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    });
  } catch (error) {
    console.error('Error updating notification badge:', error);
  }
}

// Show notification center
async function showNotificationCenter() {
  try {
    const response = await axios.get('/api/notifications');
    const notifications = response.data.notifications;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 600px;">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl md:text-2xl font-bold">알림</h2>
          <div class="flex items-center space-x-2">
            ${notifications.filter(n => !n.is_read).length > 0 ? `
              <button onclick="markAllAsRead()" class="text-sm text-blue-600 hover:text-blue-700">
                모두 읽음
              </button>
            ` : ''}
            <button onclick="this.closest('.modal-overlay').remove()" class="text-gray-500 hover:text-gray-700">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>
        
        ${notifications.length > 0 ? `
          <div class="space-y-2 max-h-96 overflow-y-auto">
            ${notifications.map(notif => {
              const iconMap = {
                'connection_request': 'fa-user-plus',
                'connection_accepted': 'fa-user-check',
                'post_like': 'fa-heart',
                'post_comment': 'fa-comment',
                'node_invitation': 'fa-envelope',
                'family_verification': 'fa-users',
                'event_reminder': 'fa-calendar',
                'mention': 'fa-at'
              };
              
              const colorMap = {
                'connection_request': 'text-blue-500',
                'connection_accepted': 'text-green-500',
                'post_like': 'text-red-500',
                'post_comment': 'text-purple-500',
                'node_invitation': 'text-orange-500',
                'family_verification': 'text-indigo-500',
                'event_reminder': 'text-yellow-500',
                'mention': 'text-pink-500'
              };
              
              return `
                <div class="p-3 rounded-lg hover:bg-gray-50 transition cursor-pointer ${notif.is_read ? 'opacity-60' : 'bg-blue-50'}"
                     onclick="markAsRead(${notif.id})">
                  <div class="flex items-start space-x-3">
                    <div class="w-10 h-10 rounded-full ${colorMap[notif.type] || 'text-gray-500'} bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <i class="fas ${iconMap[notif.type] || 'fa-bell'}"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                      <h3 class="font-semibold text-sm">${notif.title}</h3>
                      <p class="text-sm text-gray-600 line-clamp-2">${notif.message}</p>
                      <p class="text-xs text-gray-400 mt-1">${formatDate(notif.created_at)}</p>
                    </div>
                    ${!notif.is_read ? '<div class="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>' : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <div class="text-center py-12">
            <i class="fas fa-bell-slash text-6xl text-gray-300 mb-4"></i>
            <p class="text-gray-500">알림이 없습니다</p>
          </div>
        `}
      </div>
    `;
    
    document.body.appendChild(modal);
  } catch (error) {
    console.error('Error loading notifications:', error);
    alert('알림을 불러오는데 실패했습니다.');
  }
}

// Mark notification as read
async function markAsRead(notificationId) {
  try {
    await axios.put(`/api/notifications/${notificationId}/read`);
    await updateNotificationBadge();
    
    // Close and reload notification center
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
      modal.remove();
      showNotificationCenter();
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

// Mark all as read
async function markAllAsRead() {
  try {
    await axios.put('/api/notifications/read-all');
    await updateNotificationBadge();
    
    // Close and reload notification center
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
      modal.remove();
      showNotificationCenter();
    }
  } catch (error) {
    console.error('Error marking all as read:', error);
  }
}

// ============================================
// Search
// ============================================

let searchTimeout = null;

// Initialize search
function initSearch() {
  const searchInputs = document.querySelectorAll('#searchInput, [data-search]');
  
  searchInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        performSearch(e.target.value);
      }, 500);
    });
    
    input.addEventListener('focus', () => {
      if (input.value.length >= 2) {
        performSearch(input.value);
      }
    });
  });
  
  // Close search results on click outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
      closeSearchResults();
    }
  });
}

// Perform search
async function performSearch(query) {
  if (query.length < 2) {
    closeSearchResults();
    return;
  }
  
  try {
    const response = await axios.get(`/api/search?q=${encodeURIComponent(query)}&type=all`);
    const results = response.data.results;
    
    showSearchResults(results, query);
  } catch (error) {
    console.error('Search error:', error);
  }
}

// Show search results
function showSearchResults(results, query) {
  // Remove existing results
  closeSearchResults();
  
  const searchContainer = document.querySelector('.search-container') || document.body;
  const resultsDiv = document.createElement('div');
  resultsDiv.className = 'search-results absolute top-full left-0 right-0 bg-white shadow-lg rounded-lg mt-2 max-h-96 overflow-y-auto z-50';
  resultsDiv.style.maxWidth = '400px';
  
  const hasResults = results.users.length > 0 || results.nodes.length > 0 || results.posts.length > 0;
  
  if (!hasResults) {
    resultsDiv.innerHTML = `
      <div class="p-4 text-center text-gray-500">
        "${query}"에 대한 검색 결과가 없습니다
      </div>
    `;
  } else {
    let html = '';
    
    // Users
    if (results.users.length > 0) {
      html += `
        <div class="p-2 border-b">
          <h3 class="text-xs font-semibold text-gray-500 uppercase px-2 mb-2">사람</h3>
          ${results.users.map(user => `
            <a href="#" onclick="loadProfile(${user.id}); closeSearchResults(); return false;" 
               class="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded transition">
              <img src="${user.profile_image}" class="w-10 h-10 rounded-full">
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-sm truncate">${user.full_name}</p>
                <p class="text-xs text-gray-500 truncate">${user.headline || ''}</p>
              </div>
            </a>
          `).join('')}
        </div>
      `;
    }
    
    // Nodes
    if (results.nodes.length > 0) {
      html += `
        <div class="p-2 border-b">
          <h3 class="text-xs font-semibold text-gray-500 uppercase px-2 mb-2">노드</h3>
          ${results.nodes.map(node => `
            <a href="#" onclick="viewNodeDetail(${node.id}); closeSearchResults(); return false;" 
               class="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded transition">
              <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background-color: ${node.type_color}20;">
                <i class="fas ${node.type_icon}" style="color: ${node.type_color};"></i>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-sm truncate">${node.name}</p>
                <p class="text-xs text-gray-500 truncate">${node.type_name}</p>
              </div>
            </a>
          `).join('')}
        </div>
      `;
    }
    
    // Posts
    if (results.posts.length > 0) {
      html += `
        <div class="p-2">
          <h3 class="text-xs font-semibold text-gray-500 uppercase px-2 mb-2">게시물</h3>
          ${results.posts.map(post => `
            <div class="p-2 hover:bg-gray-50 rounded transition">
              <div class="flex items-center space-x-2 mb-1">
                <img src="${post.profile_image}" class="w-6 h-6 rounded-full">
                <p class="text-xs font-semibold">${post.full_name}</p>
              </div>
              <p class="text-sm text-gray-700 line-clamp-2">${post.content}</p>
            </div>
          `).join('')}
        </div>
      `;
    }
    
    resultsDiv.innerHTML = html;
  }
  
  // Position the results
  const searchInputs = document.querySelectorAll('#searchInput');
  if (searchInputs.length > 0) {
    const firstInput = searchInputs[0];
    const rect = firstInput.getBoundingClientRect();
    resultsDiv.style.position = 'fixed';
    resultsDiv.style.top = `${rect.bottom + 5}px`;
    resultsDiv.style.left = `${rect.left}px`;
    resultsDiv.style.width = `${Math.max(rect.width, 300)}px`;
  }
  
  document.body.appendChild(resultsDiv);
}

// Close search results
function closeSearchResults() {
  const results = document.querySelector('.search-results');
  if (results) {
    results.remove();
  }
}

// ============================================
// Messages (Simple)
// ============================================

async function showMessages() {
  const mainContent = document.getElementById('mainContent');
  
  try {
    const response = await axios.get('/api/messages/conversations');
    const conversations = response.data.conversations;
    
    mainContent.innerHTML = `
      <div class="mb-4 md:mb-6 flex justify-between items-center">
        <h2 class="text-xl md:text-2xl font-bold">
          <i class="fas fa-envelope mr-2"></i>메시지
        </h2>
      </div>
      
      ${conversations.length > 0 ? `
        <div class="space-y-2">
          ${conversations.map(conv => `
            <div class="card hover:shadow-lg transition cursor-pointer" onclick="openChat(${conv.other_user_id})">
              <div class="flex items-center space-x-3">
                <div class="relative">
                  <img src="${conv.user.profile_image}" class="w-12 h-12 md:w-16 md:h-16 rounded-full">
                  ${conv.unread_count > 0 ? `
                    <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      ${conv.unread_count}
                    </span>
                  ` : ''}
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-bold text-sm md:text-base truncate">${conv.user.full_name}</h3>
                  <p class="text-xs md:text-sm text-gray-600 truncate">${conv.user.headline || ''}</p>
                  <p class="text-xs text-gray-400 mt-1">${formatDate(conv.last_message_at)}</p>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      ` : `
        <div class="card text-center py-12">
          <i class="fas fa-envelope text-6xl text-gray-300 mb-4"></i>
          <p class="text-gray-500">메시지가 없습니다</p>
        </div>
      `}
    `;
  } catch (error) {
    console.error('Error loading messages:', error);
    mainContent.innerHTML = '<div class="card"><p>메시지를 불러오는데 실패했습니다.</p></div>';
  }
}

async function openChat(userId) {
  // TODO: Implement chat UI
  alert(`Chat with user ${userId} - 개발 중입니다`);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initNotifications();
  initSearch();
});
