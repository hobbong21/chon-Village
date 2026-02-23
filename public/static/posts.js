// Posts advanced features: edit, delete, share, hashtags

// Global variable to store current post being edited
let editingPostId = null;

// Render post item with actions
function renderPost(post) {
  const isOwner = post.user_id === currentUser.id;
  const timeAgo = getTimeAgo(post.created_at);
  
  return `
    <div class="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4" data-post-id="${post.id}">
      <!-- Post Header -->
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center space-x-3">
          <img src="${post.profile_image || 'https://via.placeholder.com/40'}" 
               alt="${post.full_name}" 
               class="w-10 h-10 sm:w-12 sm:h-12 rounded-full">
          <div>
            <h3 class="font-semibold text-gray-800">${post.full_name}</h3>
            <p class="text-xs sm:text-sm text-gray-500">${post.headline || ''}</p>
            <p class="text-xs text-gray-400">${timeAgo}</p>
          </div>
        </div>
        
        ${isOwner ? `
          <div class="relative post-actions">
            <button onclick="togglePostActions(${post.id})" class="p-2 hover:bg-gray-100 rounded-full">
              <i class="fas fa-ellipsis-h text-gray-500"></i>
            </button>
            <div id="post-actions-${post.id}" class="hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border">
              <button onclick="editPost(${post.id})" class="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2">
                <i class="fas fa-edit text-blue-600"></i>
                <span>게시물 수정</span>
              </button>
              <button onclick="deletePost(${post.id})" class="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2 text-red-600">
                <i class="fas fa-trash"></i>
                <span>삭제</span>
              </button>
            </div>
          </div>
        ` : ''}
      </div>
      
      <!-- Post Content -->
      <div class="mb-4">
        <p class="text-gray-800 whitespace-pre-wrap post-content">${formatPostContent(post.content)}</p>
        ${post.image_url ? `<img src="${post.image_url}" alt="Post image" class="mt-3 rounded-lg w-full">` : ''}
        ${post.updated_at && post.updated_at !== post.created_at ? '<p class="text-xs text-gray-400 mt-2">(수정됨)</p>' : ''}
      </div>
      
      <!-- Post Stats -->
      <div class="flex items-center justify-between text-sm text-gray-500 mb-3 pb-3 border-b">
        <span><i class="fas fa-thumbs-up text-blue-600"></i> ${post.likes_count || 0}</span>
        <div class="space-x-4">
          <span>${post.comments_count || 0} 댓글</span>
          <span class="share-count-${post.id}">0 공유</span>
        </div>
      </div>
      
      <!-- Post Actions -->
      <div class="flex items-center justify-around border-t pt-3">
        <button onclick="likePost(${post.id})" class="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition">
          <i class="far fa-thumbs-up text-gray-600"></i>
          <span class="text-sm sm:text-base">좋아요</span>
        </button>
        <button onclick="commentPost(${post.id})" class="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition">
          <i class="far fa-comment text-gray-600"></i>
          <span class="text-sm sm:text-base">댓글</span>
        </button>
        <button onclick="sharePost(${post.id})" class="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition">
          <i class="fas fa-share text-gray-600"></i>
          <span class="text-sm sm:text-base">공유</span>
        </button>
      </div>
    </div>
  `;
}

// Format post content with hashtags as links
function formatPostContent(content) {
  return content.replace(/#[\w가-힣]+/g, (hashtag) => {
    const tag = hashtag.substring(1);
    return `<a href="#" onclick="searchHashtag('${tag}'); return false;" class="text-blue-600 hover:underline">${hashtag}</a>`;
  });
}

// Get time ago string
function getTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return '방금 전';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}일 전`;
  
  return date.toLocaleDateString('ko-KR');
}

// Toggle post actions menu
function togglePostActions(postId) {
  const menu = document.getElementById(`post-actions-${postId}`);
  if (menu) {
    menu.classList.toggle('hidden');
  }
  
  // Close other menus
  document.querySelectorAll('[id^="post-actions-"]').forEach(el => {
    if (el.id !== `post-actions-${postId}`) {
      el.classList.add('hidden');
    }
  });
}

// Close post actions when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.post-actions')) {
    document.querySelectorAll('[id^="post-actions-"]').forEach(el => {
      el.classList.add('hidden');
    });
  }
});

// Edit post
async function editPost(postId) {
  editingPostId = postId;
  
  try {
    // Get current post content
    const postElement = document.querySelector(`[data-post-id="${postId}"]`);
    const contentElement = postElement.querySelector('.post-content');
    const currentContent = contentElement.textContent;
    
    // Show edit modal
    const modalHTML = `
      <div id="editPostModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg w-full max-w-lg max-h-90vh overflow-y-auto">
          <div class="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
            <h2 class="text-xl font-bold">게시물 수정</h2>
            <button onclick="closeEditModal()" class="text-gray-500 hover:text-gray-700">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
          
          <div class="p-6">
            <textarea id="editPostContent" 
                      class="w-full border rounded-lg p-3 min-h-32 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      placeholder="무슨 생각을 하고 계신가요? (#해시태그 사용 가능)">${currentContent}</textarea>
            
            <div class="mt-4 text-sm text-gray-500">
              <p><i class="fas fa-hashtag"></i> 해시태그 사용법: #태그명</p>
              <p class="mt-1">예: #개발 #코딩 #JavaScript</p>
            </div>
            
            <div class="flex justify-end space-x-3 mt-6">
              <button onclick="closeEditModal()" 
                      class="px-6 py-2 border rounded-lg hover:bg-gray-50">
                취소
              </button>
              <button onclick="submitEditPost()" 
                      class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                수정
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
  } catch (error) {
    console.error('Failed to load post for editing:', error);
    alert('게시물을 불러오는데 실패했습니다.');
  }
}

// Submit edited post
async function submitEditPost() {
  const content = document.getElementById('editPostContent').value.trim();
  
  if (!content) {
    alert('내용을 입력해주세요.');
    return;
  }
  
  try {
    const response = await axios.put(`/api/posts/${editingPostId}`, {
      content,
      image_url: null
    });
    
    if (response.data.success) {
      closeEditModal();
      // Reload feed to show updated post
      loadFeed();
    }
  } catch (error) {
    console.error('Failed to update post:', error);
    alert('게시물 수정에 실패했습니다.');
  }
}

// Close edit modal
function closeEditModal() {
  const modal = document.getElementById('editPostModal');
  if (modal) {
    modal.remove();
  }
  editingPostId = null;
}

// Delete post
async function deletePost(postId) {
  if (!confirm('정말 이 게시물을 삭제하시겠습니까?')) {
    return;
  }
  
  try {
    const response = await axios.delete(`/api/posts/${postId}`);
    
    if (response.data.success) {
      // Remove post element from DOM
      const postElement = document.querySelector(`[data-post-id="${postId}"]`);
      if (postElement) {
        postElement.remove();
      }
    }
  } catch (error) {
    console.error('Failed to delete post:', error);
    alert('게시물 삭제에 실패했습니다.');
  }
}

// Share post
async function sharePost(postId) {
  if (!confirm('이 게시물을 공유하시겠습니까?')) {
    return;
  }
  
  try {
    const response = await axios.post(`/api/posts/${postId}/share`, {
      user_id: currentUser.id
    });
    
    if (response.data.success) {
      // Update share count
      await updateShareCount(postId);
      alert('게시물이 공유되었습니다!');
    }
  } catch (error) {
    console.error('Failed to share post:', error);
    alert('게시물 공유에 실패했습니다.');
  }
}

// Update share count for a post
async function updateShareCount(postId) {
  try {
    const response = await axios.get(`/api/posts/${postId}/shares`);
    const shareCountElement = document.querySelector(`.share-count-${postId}`);
    if (shareCountElement) {
      shareCountElement.textContent = `${response.data.share_count} 공유`;
    }
  } catch (error) {
    console.error('Failed to get share count:', error);
  }
}

// Load share counts for all posts
async function loadShareCounts() {
  const posts = document.querySelectorAll('[data-post-id]');
  
  for (const post of posts) {
    const postId = post.dataset.postId;
    await updateShareCount(postId);
  }
}

// Search by hashtag
async function searchHashtag(tag) {
  try {
    const response = await axios.get(`/api/hashtags/${tag}/posts`);
    
    // Show hashtag results in main content
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
      <div class="mb-6">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-800">
            <i class="fas fa-hashtag text-blue-600"></i> ${tag}
          </h2>
          <button onclick="loadFeed()" class="text-blue-600 hover:underline">
            <i class="fas fa-arrow-left"></i> 피드로 돌아가기
          </button>
        </div>
        <p class="text-gray-500 mt-2">${response.data.posts.length}개의 게시물</p>
      </div>
      
      <div id="hashtagPosts">
        ${response.data.posts.length > 0 
          ? response.data.posts.map(post => renderPost(post)).join('') 
          : '<p class="text-center text-gray-500 py-8">이 해시태그가 포함된 게시물이 없습니다.</p>'}
      </div>
    `;
    
    // Load share counts
    loadShareCounts();
    
  } catch (error) {
    console.error('Failed to search hashtag:', error);
    alert('해시태그 검색에 실패했습니다.');
  }
}

// Load trending hashtags
async function loadTrendingHashtags() {
  try {
    const response = await axios.get('/api/hashtags/trending?limit=10');
    
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-800">
          <i class="fas fa-fire text-orange-500"></i> 트렌딩 해시태그
        </h2>
        <p class="text-gray-500 mt-2">가장 많이 사용되고 있는 해시태그입니다</p>
      </div>
      
      <div class="bg-white rounded-lg shadow-md p-6">
        ${response.data.hashtags.length > 0 
          ? response.data.hashtags.map((h, index) => `
            <div class="flex items-center justify-between py-3 border-b last:border-0">
              <div class="flex items-center space-x-4">
                <span class="text-2xl font-bold text-gray-400">${index + 1}</span>
                <a href="#" onclick="searchHashtag('${h.tag}'); return false;" 
                   class="text-lg font-semibold text-blue-600 hover:underline">
                  #${h.tag}
                </a>
              </div>
              <span class="text-sm text-gray-500">${h.usage_count}회 사용</span>
            </div>
          `).join('') 
          : '<p class="text-center text-gray-500 py-4">아직 해시태그가 없습니다.</p>'}
      </div>
      
      <div class="mt-4">
        <button onclick="loadFeed()" class="text-blue-600 hover:underline">
          <i class="fas fa-arrow-left"></i> 피드로 돌아가기
        </button>
      </div>
    `;
    
  } catch (error) {
    console.error('Failed to load trending hashtags:', error);
    alert('트렌딩 해시태그를 불러오는데 실패했습니다.');
  }
}

// Comment on post (placeholder)
function commentPost(postId) {
  alert('댓글 기능은 곧 추가될 예정입니다!');
}

// Like post (placeholder - already implemented in app.js)
async function likePost(postId) {
  try {
    await axios.post(`/api/posts/${postId}/like`, {
      user_id: currentUser.id
    });
    
    // Reload feed to update like count
    loadFeed();
  } catch (error) {
    console.error('Failed to like post:', error);
  }
}
