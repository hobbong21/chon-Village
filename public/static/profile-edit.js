// Profile Edit Functions

// Edit profile modal
function showEditProfileModal() {
  const user = getCurrentUser();
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 600px;">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">프로필 수정</h2>
        <button onclick="this.closest('.modal-overlay').remove()" class="text-gray-500 hover:text-gray-700">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <form id="editProfileForm">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">이름</label>
          <input type="text" id="edit_full_name" value="${user.full_name || ''}" 
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">헤드라인</label>
          <input type="text" id="edit_headline" value="${user.headline || ''}" 
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">이메일</label>
          <input type="email" id="edit_email" value="${user.email || ''}" 
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">소개</label>
          <textarea id="edit_about" rows="4" 
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">${user.about || ''}</textarea>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">위치</label>
          <input type="text" id="edit_location" value="${user.location || ''}" 
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">웹사이트</label>
          <input type="url" id="edit_website" value="${user.website || ''}" 
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
        
        <div class="flex justify-end space-x-2">
          <button type="button" onclick="this.closest('.modal-overlay').remove()" 
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
            취소
          </button>
          <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            저장
          </button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('editProfileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveProfile(user.id);
    modal.remove();
  });
}

// Save profile
async function saveProfile(userId) {
  const full_name = document.getElementById('edit_full_name').value;
  const headline = document.getElementById('edit_headline').value;
  const email = document.getElementById('edit_email').value;
  const about = document.getElementById('edit_about').value;
  const location = document.getElementById('edit_location').value;
  const website = document.getElementById('edit_website').value;
  
  try {
    // Update users table
    await axios.put(`/api/users/${userId}`, {
      full_name,
      headline,
      email
    });
    
    // Update profiles table
    await axios.put(`/api/users/${userId}/profile`, {
      about,
      location,
      website
    });
    
    // Update localStorage
    const user = getCurrentUser();
    user.full_name = full_name;
    user.headline = headline;
    user.email = email;
    user.about = about;
    user.location = location;
    user.website = website;
    localStorage.setItem('user', JSON.stringify(user));
    
    alert('프로필이 수정되었습니다.');
    loadProfile(userId);
  } catch (error) {
    console.error('Profile update error:', error);
    alert('프로필 수정 중 오류가 발생했습니다.');
  }
}

// Add experience modal
function showAddExperienceModal() {
  const user = getCurrentUser();
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 600px;">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">경력 추가</h2>
        <button onclick="this.closest('.modal-overlay').remove()" class="text-gray-500 hover:text-gray-700">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <form id="addExperienceForm">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">직책</label>
          <input type="text" id="exp_position" 
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">회사</label>
          <input type="text" id="exp_company" 
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">시작일</label>
          <input type="month" id="exp_start_date" 
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">종료일</label>
          <input type="month" id="exp_end_date" 
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
        
        <div class="mb-4">
          <label class="flex items-center">
            <input type="checkbox" id="exp_is_current" class="mr-2">
            <span class="text-sm text-gray-700">현재 재직 중</span>
          </label>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">설명</label>
          <textarea id="exp_description" rows="3" 
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
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
  
  document.getElementById('exp_is_current').addEventListener('change', (e) => {
    document.getElementById('exp_end_date').disabled = e.target.checked;
  });
  
  document.getElementById('addExperienceForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await addExperience(user.id);
    modal.remove();
  });
}

// Add experience
async function addExperience(userId) {
  const position = document.getElementById('exp_position').value;
  const company = document.getElementById('exp_company').value;
  const start_date = document.getElementById('exp_start_date').value;
  const end_date = document.getElementById('exp_end_date').value;
  const is_current = document.getElementById('exp_is_current').checked;
  const description = document.getElementById('exp_description').value;
  
  try {
    await axios.post('/api/experiences', {
      user_id: userId,
      position,
      company,
      start_date,
      end_date: is_current ? null : end_date,
      is_current,
      description
    });
    
    alert('경력이 추가되었습니다.');
    loadProfile(userId);
  } catch (error) {
    console.error('Add experience error:', error);
    alert('경력 추가 중 오류가 발생했습니다.');
  }
}

// Delete experience
async function deleteExperience(expId) {
  if (!confirm('이 경력을 삭제하시겠습니까?')) return;
  
  try {
    await axios.delete(`/api/experiences/${expId}`);
    alert('경력이 삭제되었습니다.');
    loadProfile(getCurrentUser().id);
  } catch (error) {
    console.error('Delete experience error:', error);
    alert('경력 삭제 중 오류가 발생했습니다.');
  }
}

// Add education modal
function showAddEducationModal() {
  const user = getCurrentUser();
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 600px;">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">학력 추가</h2>
        <button onclick="this.closest('.modal-overlay').remove()" class="text-gray-500 hover:text-gray-700">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <form id="addEducationForm">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">학교</label>
          <input type="text" id="edu_school" 
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">학위</label>
          <input type="text" id="edu_degree" 
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">전공</label>
          <input type="text" id="edu_field" 
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">시작일</label>
          <input type="month" id="edu_start_date" 
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">종료일</label>
          <input type="month" id="edu_end_date" 
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">설명</label>
          <textarea id="edu_description" rows="3" 
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
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
  
  document.getElementById('addEducationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await addEducation(user.id);
    modal.remove();
  });
}

// Add education
async function addEducation(userId) {
  const school = document.getElementById('edu_school').value;
  const degree = document.getElementById('edu_degree').value;
  const field_of_study = document.getElementById('edu_field').value;
  const start_date = document.getElementById('edu_start_date').value;
  const end_date = document.getElementById('edu_end_date').value;
  const description = document.getElementById('edu_description').value;
  
  try {
    await axios.post('/api/education', {
      user_id: userId,
      school,
      degree,
      field_of_study,
      start_date,
      end_date,
      description
    });
    
    alert('학력이 추가되었습니다.');
    loadProfile(userId);
  } catch (error) {
    console.error('Add education error:', error);
    alert('학력 추가 중 오류가 발생했습니다.');
  }
}

// Delete education
async function deleteEducation(eduId) {
  if (!confirm('이 학력을 삭제하시겠습니까?')) return;
  
  try {
    await axios.delete(`/api/education/${eduId}`);
    alert('학력이 삭제되었습니다.');
    loadProfile(getCurrentUser().id);
  } catch (error) {
    console.error('Delete education error:', error);
    alert('학력 삭제 중 오류가 발생했습니다.');
  }
}

// Add skill modal
function showAddSkillModal() {
  const user = getCurrentUser();
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 400px;">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">스킬 추가</h2>
        <button onclick="this.closest('.modal-overlay').remove()" class="text-gray-500 hover:text-gray-700">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <form id="addSkillForm">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">스킬 이름</label>
          <input type="text" id="skill_name" 
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            placeholder="예: JavaScript, Python, Design" required>
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
  
  document.getElementById('addSkillForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await addSkill(user.id);
    modal.remove();
  });
}

// Add skill
async function addSkill(userId) {
  const skill_name = document.getElementById('skill_name').value;
  
  try {
    await axios.post('/api/skills', {
      user_id: userId,
      skill_name
    });
    
    alert('스킬이 추가되었습니다.');
    loadProfile(userId);
  } catch (error) {
    console.error('Add skill error:', error);
    alert('스킬 추가 중 오류가 발생했습니다.');
  }
}

// Delete skill
async function deleteSkill(skillId) {
  if (!confirm('이 스킬을 삭제하시겠습니까?')) return;
  
  try {
    await axios.delete(`/api/skills/${skillId}`);
    alert('스킬이 삭제되었습니다.');
    loadProfile(getCurrentUser().id);
  } catch (error) {
    console.error('Delete skill error:', error);
    alert('스킬 삭제 중 오류가 발생했습니다.');
  }
}
