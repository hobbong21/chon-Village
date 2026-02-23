// Family Advanced Features UI

// ============================================
// Family Albums
// ============================================

async function loadFamilyAlbums() {
  const mainContent = document.getElementById('mainContent');
  
  try {
    const response = await axios.get('/api/family/albums');
    const albums = response.data.albums;
    
    mainContent.innerHTML = `
      <div class="mb-6 flex justify-between items-center">
        <h2 class="text-2xl font-bold"><i class="fas fa-images mr-2"></i>가족 앨범</h2>
        <button onclick="showCreateAlbumModal()" class="btn-primary">
          <i class="fas fa-plus mr-1"></i>앨범 만들기
        </button>
      </div>
      
      ${albums.length > 0 ? `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${albums.map(album => `
            <div class="card cursor-pointer hover:shadow-lg transition" onclick="viewAlbum(${album.id})">
              <div class="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mb-4 flex items-center justify-center">
                <i class="fas fa-images text-6xl text-gray-400"></i>
              </div>
              <h3 class="font-bold text-lg mb-2">${album.title}</h3>
              <p class="text-sm text-gray-600 mb-2">${album.description || '설명 없음'}</p>
              <div class="flex justify-between items-center text-sm text-gray-500">
                <span><i class="fas fa-user mr-1"></i>${album.creator_name}</span>
                <span><i class="fas fa-image mr-1"></i>${album.photo_count}장</span>
              </div>
            </div>
          `).join('')}
        </div>
      ` : `
        <div class="card text-center py-12">
          <i class="fas fa-images text-6xl text-gray-300 mb-4"></i>
          <p class="text-gray-500">아직 앨범이 없습니다.</p>
          <button onclick="showCreateAlbumModal()" class="btn-primary mt-4">
            첫 앨범 만들기
          </button>
        </div>
      `}
    `;
  } catch (error) {
    console.error('Error loading albums:', error);
    mainContent.innerHTML = '<div class="card"><p>앨범을 불러오는데 실패했습니다.</p></div>';
  }
}

async function viewAlbum(albumId) {
  const mainContent = document.getElementById('mainContent');
  
  try {
    const response = await axios.get(`/api/family/albums/${albumId}`);
    const { album, photos } = response.data;
    
    mainContent.innerHTML = `
      <div class="mb-6">
        <button onclick="loadFamilyAlbums()" class="text-blue-600 hover:underline mb-4">
          <i class="fas fa-arrow-left mr-1"></i>앨범 목록으로
        </button>
        
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-2xl font-bold">${album.title}</h2>
            <p class="text-gray-600">${album.description || ''}</p>
            <p class="text-sm text-gray-500 mt-1">만든 사람: ${album.creator_name}</p>
          </div>
          <button onclick="showUploadPhotoModal(${albumId})" class="btn-primary">
            <i class="fas fa-upload mr-1"></i>사진 추가
          </button>
        </div>
      </div>
      
      ${photos.length > 0 ? `
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          ${photos.map(photo => `
            <div class="relative group">
              <img src="${photo.image_url}" alt="${photo.caption}" 
                   class="w-full aspect-square object-cover rounded-lg">
              <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button onclick="deletePhoto(${photo.id}, ${albumId})" class="text-white hover:text-red-300">
                  <i class="fas fa-trash text-2xl"></i>
                </button>
              </div>
              ${photo.caption ? `
                <p class="text-sm text-gray-700 mt-2">${photo.caption}</p>
              ` : ''}
              <p class="text-xs text-gray-500">${photo.uploader_name} · ${formatDate(photo.created_at)}</p>
            </div>
          `).join('')}
        </div>
      ` : `
        <div class="card text-center py-12">
          <i class="fas fa-image text-6xl text-gray-300 mb-4"></i>
          <p class="text-gray-500">아직 사진이 없습니다.</p>
          <button onclick="showUploadPhotoModal(${albumId})" class="btn-primary mt-4">
            첫 사진 추가하기
          </button>
        </div>
      `}
    `;
  } catch (error) {
    console.error('Error loading album:', error);
    mainContent.innerHTML = '<div class="card"><p>앨범을 불러오는데 실패했습니다.</p></div>';
  }
}

function showCreateAlbumModal() {
  const user = getCurrentUser();
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 500px;">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">새 앨범 만들기</h2>
        <button onclick="this.closest('.modal-overlay').remove()" class="text-gray-500 hover:text-gray-700">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <form id="createAlbumForm">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">앨범 제목</label>
          <input type="text" id="album_title" required
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="예: 2024년 가족 여행">
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">설명</label>
          <textarea id="album_description" rows="3"
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="이 앨범에 대한 설명을 입력하세요"></textarea>
        </div>
        
        <div class="flex justify-end space-x-2">
          <button type="button" onclick="this.closest('.modal-overlay').remove()" 
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
            취소
          </button>
          <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            만들기
          </button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('createAlbumForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('album_title').value;
    const description = document.getElementById('album_description').value;
    
    try {
      // Get user's family member id
      const treeResponse = await axios.get('/api/family/tree');
      const members = treeResponse.data.family_members;
      const currentMember = members.find(m => m.user_id === user.id);
      
      if (!currentMember) {
        alert('가족 구성원 정보를 찾을 수 없습니다.');
        return;
      }
      
      await axios.post('/api/family/albums', {
        family_member_id: currentMember.id,
        title,
        description
      });
      
      modal.remove();
      alert('앨범이 생성되었습니다.');
      loadFamilyAlbums();
    } catch (error) {
      console.error('Error creating album:', error);
      alert('앨범 생성 중 오류가 발생했습니다.');
    }
  });
}

function showUploadPhotoModal(albumId) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 500px;">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">사진 추가</h2>
        <button onclick="this.closest('.modal-overlay').remove()" class="text-gray-500 hover:text-gray-700">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <form id="uploadPhotoForm">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">이미지 URL</label>
          <input type="url" id="photo_url" required
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com/photo.jpg">
          <p class="text-xs text-gray-500 mt-1">현재는 이미지 URL만 지원됩니다</p>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">설명</label>
          <input type="text" id="photo_caption"
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="사진에 대한 설명">
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">촬영 날짜</label>
          <input type="date" id="photo_date"
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
        
        <div class="mb-4">
          <label class="flex items-center">
            <input type="checkbox" id="photo_public" class="mr-2">
            <span class="text-sm text-gray-700">공개 사진으로 설정</span>
          </label>
        </div>
        
        <div class="flex justify-end space-x-2">
          <button type="button" onclick="this.closest('.modal-overlay').remove()" 
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
            취소
          </button>
          <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            추가
          </button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('uploadPhotoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const user = getCurrentUser();
    const image_url = document.getElementById('photo_url').value;
    const caption = document.getElementById('photo_caption').value;
    const photo_date = document.getElementById('photo_date').value;
    const is_public = document.getElementById('photo_public').checked;
    
    try {
      const treeResponse = await axios.get('/api/family/tree');
      const members = treeResponse.data.family_members;
      const currentMember = members.find(m => m.user_id === user.id);
      
      await axios.post('/api/family/photos', {
        album_id: albumId,
        uploaded_by: currentMember.id,
        image_url,
        caption,
        photo_date,
        is_public
      });
      
      modal.remove();
      alert('사진이 추가되었습니다.');
      viewAlbum(albumId);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('사진 추가 중 오류가 발생했습니다.');
    }
  });
}

async function deletePhoto(photoId, albumId) {
  if (!confirm('이 사진을 삭제하시겠습니까?')) return;
  
  try {
    await axios.delete(`/api/family/photos/${photoId}`);
    alert('사진이 삭제되었습니다.');
    viewAlbum(albumId);
  } catch (error) {
    console.error('Error deleting photo:', error);
    alert('사진 삭제 중 오류가 발생했습니다.');
  }
}

// ============================================
// Family Events Timeline
// ============================================

async function loadFamilyTimeline() {
  const mainContent = document.getElementById('mainContent');
  
  try {
    const response = await axios.get('/api/family/events');
    const events = response.data.events;
    
    mainContent.innerHTML = `
      <div class="mb-6 flex justify-between items-center">
        <h2 class="text-2xl font-bold"><i class="fas fa-calendar-alt mr-2"></i>가족 타임라인</h2>
        <button onclick="showCreateEventModal()" class="btn-primary">
          <i class="fas fa-plus mr-1"></i>이벤트 추가
        </button>
      </div>
      
      ${events.length > 0 ? `
        <div class="space-y-4">
          ${events.map(event => {
            const eventIcon = {
              birth: 'fa-baby',
              wedding: 'fa-ring',
              death: 'fa-cross',
              graduation: 'fa-graduation-cap',
              birthday: 'fa-birthday-cake',
              anniversary: 'fa-heart',
              custom: 'fa-star'
            }[event.event_type] || 'fa-calendar';
            
            const eventColor = {
              birth: 'bg-green-100 text-green-600',
              wedding: 'bg-pink-100 text-pink-600',
              death: 'bg-gray-100 text-gray-600',
              graduation: 'bg-blue-100 text-blue-600',
              birthday: 'bg-yellow-100 text-yellow-600',
              anniversary: 'bg-red-100 text-red-600',
              custom: 'bg-purple-100 text-purple-600'
            }[event.event_type] || 'bg-gray-100 text-gray-600';
            
            return `
              <div class="card flex">
                <div class="w-12 h-12 ${eventColor} rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <i class="fas ${eventIcon}"></i>
                </div>
                <div class="flex-1">
                  <div class="flex justify-between items-start">
                    <div>
                      <h3 class="font-bold text-lg">${event.title}</h3>
                      <p class="text-sm text-gray-600 mb-2">${event.description || ''}</p>
                      <div class="flex items-center space-x-4 text-sm text-gray-500">
                        <span><i class="fas fa-calendar mr-1"></i>${event.event_date}</span>
                        ${event.location ? `<span><i class="fas fa-map-marker-alt mr-1"></i>${event.location}</span>` : ''}
                        <span><i class="fas fa-user mr-1"></i>${event.creator_name}</span>
                      </div>
                    </div>
                    <button onclick="deleteEvent(${event.id})" class="text-red-500 hover:text-red-700">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      ` : `
        <div class="card text-center py-12">
          <i class="fas fa-calendar-alt text-6xl text-gray-300 mb-4"></i>
          <p class="text-gray-500">아직 이벤트가 없습니다.</p>
          <button onclick="showCreateEventModal()" class="btn-primary mt-4">
            첫 이벤트 추가하기
          </button>
        </div>
      `}
    `;
  } catch (error) {
    console.error('Error loading timeline:', error);
    mainContent.innerHTML = '<div class="card"><p>타임라인을 불러오는데 실패했습니다.</p></div>';
  }
}

function showCreateEventModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 600px;">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">새 이벤트 추가</h2>
        <button onclick="this.closest('.modal-overlay').remove()" class="text-gray-500 hover:text-gray-700">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <form id="createEventForm">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">이벤트 종류</label>
          <select id="event_type" required
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="birthday">생일</option>
            <option value="wedding">결혼</option>
            <option value="birth">출생</option>
            <option value="graduation">졸업</option>
            <option value="anniversary">기념일</option>
            <option value="custom">기타</option>
          </select>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">제목</label>
          <input type="text" id="event_title" required
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="예: 홍길동 생일">
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">설명</label>
          <textarea id="event_description" rows="3"
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">날짜</label>
          <input type="date" id="event_date" required
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">장소</label>
          <input type="text" id="event_location"
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="예: 서울시 강남구">
        </div>
        
        <div class="flex justify-end space-x-2">
          <button type="button" onclick="this.closest('.modal-overlay').remove()" 
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
            취소
          </button>
          <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            추가
          </button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('createEventForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const user = getCurrentUser();
    const event_type = document.getElementById('event_type').value;
    const title = document.getElementById('event_title').value;
    const description = document.getElementById('event_description').value;
    const event_date = document.getElementById('event_date').value;
    const location = document.getElementById('event_location').value;
    
    try {
      const treeResponse = await axios.get('/api/family/tree');
      const members = treeResponse.data.family_members;
      const currentMember = members.find(m => m.user_id === user.id);
      
      await axios.post('/api/family/events', {
        created_by: currentMember.id,
        event_type,
        title,
        description,
        event_date,
        location,
        participant_ids: []
      });
      
      modal.remove();
      alert('이벤트가 추가되었습니다.');
      loadFamilyTimeline();
    } catch (error) {
      console.error('Error creating event:', error);
      alert('이벤트 추가 중 오류가 발생했습니다.');
    }
  });
}

async function deleteEvent(eventId) {
  if (!confirm('이 이벤트를 삭제하시겠습니까?')) return;
  
  try {
    await axios.delete(`/api/family/events/${eventId}`);
    alert('이벤트가 삭제되었습니다.');
    loadFamilyTimeline();
  } catch (error) {
    console.error('Error deleting event:', error);
    alert('이벤트 삭제 중 오류가 발생했습니다.');
  }
}

// ============================================
// Family Invitations
// ============================================

async function loadFamilyInvitations() {
  const mainContent = document.getElementById('mainContent');
  
  try {
    const response = await axios.get('/api/family/my-invitations');
    const invitations = response.data.invitations;
    
    mainContent.innerHTML = `
      <div class="mb-6 flex justify-between items-center">
        <h2 class="text-2xl font-bold"><i class="fas fa-link mr-2"></i>초대 링크 관리</h2>
        <button onclick="showCreateInvitationModal()" class="btn-primary">
          <i class="fas fa-plus mr-1"></i>새 초대 링크
        </button>
      </div>
      
      ${invitations.length > 0 ? `
        <div class="space-y-4">
          ${invitations.map(inv => {
            const isExpired = inv.expires_at && new Date(inv.expires_at) < new Date();
            const isMaxUsed = inv.uses_count >= inv.max_uses;
            const isActive = inv.is_active && !isExpired && !isMaxUsed;
            
            return `
              <div class="card">
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-2">
                      <span class="px-2 py-1 text-xs rounded ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}">
                        ${isActive ? '활성' : '비활성'}
                      </span>
                      ${inv.relationship_type ? `
                        <span class="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">
                          ${inv.relationship_type}
                        </span>
                      ` : ''}
                    </div>
                    
                    <div class="bg-gray-50 p-3 rounded-lg font-mono text-sm mb-2 flex items-center">
                      <span class="flex-1 truncate">${window.location.origin}/family/invite/${inv.invitation_token}</span>
                      <button onclick="copyInvitationLink('${inv.invitation_token}')" 
                        class="ml-2 text-blue-600 hover:text-blue-700">
                        <i class="fas fa-copy"></i>
                      </button>
                    </div>
                    
                    <div class="text-sm text-gray-600 space-y-1">
                      <p>사용: ${inv.uses_count} / ${inv.max_uses}</p>
                      ${inv.expires_at ? `<p>만료: ${new Date(inv.expires_at).toLocaleDateString()}</p>` : '<p>만료 없음</p>'}
                      <p>생성: ${formatDate(inv.created_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      ` : `
        <div class="card text-center py-12">
          <i class="fas fa-link text-6xl text-gray-300 mb-4"></i>
          <p class="text-gray-500">초대 링크가 없습니다.</p>
          <button onclick="showCreateInvitationModal()" class="btn-primary mt-4">
            첫 초대 링크 만들기
          </button>
        </div>
      `}
    `;
  } catch (error) {
    console.error('Error loading invitations:', error);
    mainContent.innerHTML = '<div class="card"><p>초대 링크를 불러오는데 실패했습니다.</p></div>';
  }
}

function showCreateInvitationModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 500px;">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">초대 링크 만들기</h2>
        <button onclick="this.closest('.modal-overlay').remove()" class="text-gray-500 hover:text-gray-700">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <form id="createInvitationForm">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">관계 (선택사항)</label>
          <select id="inv_relationship"
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">선택 안 함</option>
            <option value="sibling">형제자매</option>
            <option value="child">자녀</option>
            <option value="parent">부모</option>
            <option value="spouse">배우자</option>
          </select>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">최대 사용 횟수</label>
          <input type="number" id="inv_max_uses" value="1" min="1" max="100"
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">유효 기간 (일)</label>
          <input type="number" id="inv_expires_days" value="7" min="1" max="365"
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
        
        <div class="flex justify-end space-x-2">
          <button type="button" onclick="this.closest('.modal-overlay').remove()" 
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
            취소
          </button>
          <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            생성
          </button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('createInvitationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const user = getCurrentUser();
    const relationship_type = document.getElementById('inv_relationship').value;
    const max_uses = parseInt(document.getElementById('inv_max_uses').value);
    const expires_in_days = parseInt(document.getElementById('inv_expires_days').value);
    
    try {
      const treeResponse = await axios.get('/api/family/tree');
      const members = treeResponse.data.family_members;
      const currentMember = members.find(m => m.user_id === user.id);
      
      const response = await axios.post('/api/family/invitations', {
        created_by: currentMember.id,
        relationship_type: relationship_type || null,
        max_uses,
        expires_in_days
      });
      
      modal.remove();
      
      // Show invitation link
      const inviteUrl = `${window.location.origin}${response.data.invitation_url}`;
      const linkModal = document.createElement('div');
      linkModal.className = 'modal-overlay';
      linkModal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
          <h2 class="text-2xl font-bold mb-4">초대 링크 생성 완료!</h2>
          <p class="text-gray-600 mb-4">아래 링크를 복사하여 가족에게 공유하세요.</p>
          <div class="bg-gray-50 p-3 rounded-lg font-mono text-sm mb-4 flex items-center">
            <span class="flex-1 truncate">${inviteUrl}</span>
            <button onclick="copyToClipboard('${inviteUrl}')" class="ml-2 text-blue-600 hover:text-blue-700">
              <i class="fas fa-copy"></i>
            </button>
          </div>
          <button onclick="this.closest('.modal-overlay').remove(); loadFamilyInvitations()" 
            class="w-full btn-primary">
            확인
          </button>
        </div>
      `;
      document.body.appendChild(linkModal);
    } catch (error) {
      console.error('Error creating invitation:', error);
      alert('초대 링크 생성 중 오류가 발생했습니다.');
    }
  });
}

function copyInvitationLink(token) {
  const url = `${window.location.origin}/family/invite/${token}`;
  copyToClipboard(url);
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert('링크가 복사되었습니다!');
  }).catch(err => {
    console.error('Copy failed:', err);
  });
}

// ============================================
// Export Family Tree as PNG
// ============================================

function exportFamilyTreeAsPNG() {
  // Get the SVG element from D3 visualization
  const svg = document.querySelector('#familyTreeViz svg');
  
  if (!svg) {
    alert('가계도를 먼저 로드해주세요.');
    return;
  }
  
  // Convert SVG to canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  const svgData = new XMLSerializer().serializeToString(svg);
  const img = new Image();
  
  img.onload = function() {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    // Download as PNG
    canvas.toBlob(function(blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `family-tree-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };
  
  img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
}
