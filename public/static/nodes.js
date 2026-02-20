// CHON-Network Node Expansion System UI
// 노드 관리 및 네트워크 확장 시스템

// State
let allNodes = [];
let myNodes = [];
let selectedNode = null;

// Get current user from app.js global variable or localStorage
function getCurrentUser() {
  if (typeof currentUser !== 'undefined' && currentUser) {
    return currentUser;
  }
  return JSON.parse(localStorage.getItem('user')) || {
    id: 1,
    full_name: 'John Doe',
    email: 'john.doe@example.com'
  };
}

// Load nodes page
async function loadNodesPage() {
  const content = document.getElementById('mainContent');
  
  content.innerHTML = `
    <div class="space-y-6">
      <!-- Header -->
      <div class="card">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h2 class="text-2xl font-bold text-gray-800">노드 네트워크</h2>
            <p class="text-gray-600 mt-1">학교, 직장, 동호회 등 다양한 그룹에 참여하세요</p>
          </div>
          <button onclick="showCreateNodeModal()" class="btn-primary">
            <i class="fas fa-plus mr-2"></i>노드 생성
          </button>
        </div>

        <!-- Tabs -->
        <div class="flex space-x-4 border-b border-gray-200 pb-2">
          <button onclick="loadAllNodesTab()" id="tab-all" class="tab-button active">
            <i class="fas fa-globe mr-2"></i>전체 노드
          </button>
          <button onclick="loadMyNodesTab()" id="tab-my" class="tab-button">
            <i class="fas fa-user mr-2"></i>내 노드
          </button>
          <button onclick="loadMyLevelTab()" id="tab-level" class="tab-button">
            <i class="fas fa-chart-bar mr-2"></i>관계 레벨
          </button>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="card" id="filter-bar">
        <div class="flex space-x-4">
          <select id="type-filter" class="flex-1 px-4 py-2 border rounded-lg" onchange="loadAllNodesTab()">
            <option value="">모든 타입</option>
            <option value="family">가족</option>
            <option value="school">학교</option>
            <option value="company">직장</option>
            <option value="club">동호회</option>
            <option value="community">커뮤니티</option>
            <option value="fanclub">팬클럽</option>
          </select>
          <select id="visibility-filter" class="flex-1 px-4 py-2 border rounded-lg" onchange="loadAllNodesTab()">
            <option value="">모든 공개 설정</option>
            <option value="true">공개</option>
            <option value="false">비공개</option>
          </select>
        </div>
      </div>

      <!-- Content Area -->
      <div id="nodes-content"></div>
    </div>

    <!-- Create Node Modal -->
    <div id="createNodeModal" class="modal hidden">
      <div class="modal-content" style="max-width: 600px;">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold">새 노드 만들기</h3>
          <button onclick="closeCreateNodeModal()" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form id="createNodeForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">노드 타입</label>
            <select id="node-type" required class="w-full px-4 py-2 border rounded-lg">
              <option value="">선택하세요</option>
              <option value="school">🎓 학교</option>
              <option value="company">🏢 직장</option>
              <option value="club">👥 동호회</option>
              <option value="community">💬 커뮤니티</option>
              <option value="fanclub">⭐ 팬클럽</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">노드 이름</label>
            <input type="text" id="node-name" required class="w-full px-4 py-2 border rounded-lg" 
                   placeholder="예: Stanford University CS Department">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">설명</label>
            <textarea id="node-description" rows="3" class="w-full px-4 py-2 border rounded-lg"
                      placeholder="노드에 대한 간단한 설명을 입력하세요"></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">공개 설정</label>
            <select id="node-visibility" class="w-full px-4 py-2 border rounded-lg">
              <option value="public">공개 - 누구나 검색하고 가입 요청 가능</option>
              <option value="private">비공개 - 초대받은 사람만 가입</option>
              <option value="invite_only">초대 전용 - 검색은 되지만 초대만 가능</option>
            </select>
          </div>

          <div class="flex items-center">
            <input type="checkbox" id="join-approval" checked class="mr-2">
            <label for="join-approval" class="text-sm text-gray-700">가입 승인 필요</label>
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button type="button" onclick="closeCreateNodeModal()" class="btn-secondary">
              취소
            </button>
            <button type="submit" class="btn-primary">
              <i class="fas fa-check mr-2"></i>생성
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Node Detail Modal -->
    <div id="nodeDetailModal" class="modal hidden">
      <div class="modal-content" style="max-width: 800px;">
        <div id="nodeDetailContent"></div>
      </div>
    </div>
  `;

  // Load initial tab
  loadAllNodesTab();
}

// Tab: All Nodes
async function loadAllNodesTab() {
  setActiveTab('all');
  
  const typeFilter = document.getElementById('type-filter')?.value || '';
  const visibilityFilter = document.getElementById('visibility-filter')?.value || '';
  
  let url = '/api/nodes';
  const params = [];
  if (typeFilter) params.push(`type=${typeFilter}`);
  if (visibilityFilter) params.push(`public=${visibilityFilter}`);
  if (params.length > 0) url += '?' + params.join('&');
  
  try {
    const response = await axios.get(url);
    allNodes = response.data.nodes;
    renderNodesGrid(allNodes);
  } catch (error) {
    console.error('Error loading nodes:', error);
    showError('노드 목록을 불러올 수 없습니다');
  }
}

// Tab: My Nodes
async function loadMyNodesTab() {
  setActiveTab('my');
  document.getElementById('filter-bar').style.display = 'none';
  
  try {
    const response = await axios.get('/api/my-nodes');
    myNodes = response.data.nodes;
    renderMyNodesGrid(myNodes);
  } catch (error) {
    console.error('Error loading my nodes:', error);
    showError('내 노드 목록을 불러올 수 없습니다');
  }
}

// Tab: My Level
async function loadMyLevelTab() {
  setActiveTab('level');
  document.getElementById('filter-bar').style.display = 'none';
  
  try {
    const response = await axios.get('/api/my-level');
    const summary = response.data.summary;
    renderLevelSummary(summary);
  } catch (error) {
    console.error('Error loading level summary:', error);
    showError('관계 레벨 정보를 불러올 수 없습니다');
  }
}

// Render nodes grid
function renderNodesGrid(nodes) {
  const content = document.getElementById('nodes-content');
  
  if (nodes.length === 0) {
    content.innerHTML = `
      <div class="card text-center py-12">
        <i class="fas fa-inbox text-gray-300 text-6xl mb-4"></i>
        <p class="text-gray-500">노드가 없습니다</p>
      </div>
    `;
    return;
  }
  
  content.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      ${nodes.map(node => `
        <div class="card hover:shadow-lg transition-shadow cursor-pointer" onclick="showNodeDetail(${node.id})">
          <!-- Node Icon & Type -->
          <div class="flex items-center mb-3">
            <div class="w-12 h-12 rounded-lg flex items-center justify-center text-2xl" 
                 style="background: ${node.type_color}20; color: ${node.type_color}">
              <i class="fas ${node.type_icon}"></i>
            </div>
            <div class="ml-3 flex-1">
              <span class="text-xs px-2 py-1 rounded" style="background: ${node.type_color}20; color: ${node.type_color}">
                ${getNodeTypeKorean(node.node_type)}
              </span>
              ${node.visibility === 'public' ? 
                '<i class="fas fa-globe text-green-500 text-xs ml-2" title="공개"></i>' : 
                '<i class="fas fa-lock text-gray-400 text-xs ml-2" title="비공개"></i>'}
            </div>
          </div>

          <!-- Node Info -->
          <h3 class="text-lg font-bold text-gray-800 mb-2">${node.name}</h3>
          <p class="text-sm text-gray-600 mb-4 line-clamp-2">${node.description || '설명 없음'}</p>

          <!-- Stats -->
          <div class="flex items-center justify-between text-sm text-gray-500 border-t pt-3">
            <div class="flex items-center">
              <i class="fas fa-users mr-1"></i>
              <span>${node.member_count}명</span>
            </div>
            <div class="flex items-center">
              <span class="mr-1">레벨</span>
              <span class="font-bold" style="color: ${getLevelColor(node.verification_level)}">
                ${node.verification_level}
              </span>
            </div>
          </div>

          <!-- Creator -->
          <div class="text-xs text-gray-400 mt-2">
            by ${node.creator_name}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// Render my nodes grid
function renderMyNodesGrid(nodes) {
  const content = document.getElementById('nodes-content');
  
  if (nodes.length === 0) {
    content.innerHTML = `
      <div class="card text-center py-12">
        <i class="fas fa-network-wired text-gray-300 text-6xl mb-4"></i>
        <p class="text-gray-500 mb-4">아직 가입한 노드가 없습니다</p>
        <button onclick="loadAllNodesTab()" class="btn-primary">
          <i class="fas fa-search mr-2"></i>노드 찾아보기
        </button>
      </div>
    `;
    return;
  }
  
  content.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      ${nodes.map(node => `
        <div class="card hover:shadow-lg transition-shadow cursor-pointer" onclick="showNodeDetail(${node.id})">
          <div class="flex items-start">
            <!-- Node Icon -->
            <div class="w-16 h-16 rounded-lg flex items-center justify-center text-3xl mr-4" 
                 style="background: ${node.type_color}20; color: ${node.type_color}">
              <i class="fas ${node.type_icon}"></i>
            </div>

            <!-- Node Info -->
            <div class="flex-1">
              <div class="flex items-center mb-1">
                <span class="text-xs px-2 py-1 rounded mr-2" 
                      style="background: ${node.type_color}20; color: ${node.type_color}">
                  ${getNodeTypeKorean(node.node_type)}
                </span>
                <span class="text-xs px-2 py-1 rounded" 
                      style="background: ${node.level_color}20; color: ${node.level_color}">
                  ${node.level_name || 'Lv ' + node.relationship_level}
                </span>
              </div>
              
              <h3 class="text-lg font-bold text-gray-800 mb-1">${node.name}</h3>
              <p class="text-sm text-gray-600 mb-2">${node.role_name}</p>
              
              <!-- Stats -->
              <div class="flex items-center space-x-4 text-xs text-gray-500">
                <div>
                  <i class="fas fa-check-circle text-green-500 mr-1"></i>
                  <span>인증 ${node.verification_count}회</span>
                </div>
                <div>
                  <i class="fas fa-star text-yellow-500 mr-1"></i>
                  <span>활동 ${node.activity_score}점</span>
                </div>
              </div>
              
              <div class="text-xs text-gray-400 mt-2">
                가입일: ${new Date(node.joined_at).toLocaleDateString('ko-KR')}
              </div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// Render level summary
function renderLevelSummary(summary) {
  const content = document.getElementById('nodes-content');
  
  const levelDescriptions = {
    5: { name: '공인', desc: '최고 레벨. 모든 권한 활성화. 노드 생성 및 타인 인증 가능', icon: 'fa-crown' },
    4: { name: '리더', desc: '리더십 레벨. 멤버 초대 및 관리 가능', icon: 'fa-star' },
    3: { name: '활동', desc: '활발한 활동 레벨. 대부분의 정보 공유 가능', icon: 'fa-fire' },
    2: { name: '연결', desc: '기본 연결 레벨. 기본 정보 공유 시작', icon: 'fa-link' },
    1: { name: '대기', desc: '초기 레벨. 승인 대기 중', icon: 'fa-hourglass-half' }
  };
  
  content.innerHTML = `
    <div class="card">
      <h3 class="text-xl font-bold mb-6">내 관계 레벨 현황</h3>
      
      <!-- Level Progress -->
      <div class="space-y-4 mb-8">
        ${summary.map(item => {
          const desc = levelDescriptions[item.relationship_level] || {};
          return `
            <div class="border rounded-lg p-4" style="border-color: ${item.color}">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center mr-3" 
                       style="background: ${item.color}20; color: ${item.color}">
                    <i class="fas ${desc.icon}"></i>
                  </div>
                  <div>
                    <span class="font-bold text-lg" style="color: ${item.color}">
                      레벨 ${item.relationship_level} - ${item.level_name || desc.name}
                    </span>
                    <p class="text-sm text-gray-600 mt-1">${desc.desc}</p>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-3xl font-bold" style="color: ${item.color}">${item.count}</div>
                  <div class="text-xs text-gray-500">개 노드</div>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Level System Guide -->
      <div class="bg-gray-50 rounded-lg p-6">
        <h4 class="font-bold mb-4 flex items-center">
          <i class="fas fa-info-circle text-blue-500 mr-2"></i>
          레벨 업그레이드 조건
        </h4>
        <div class="space-y-3 text-sm">
          <div class="flex items-start">
            <span class="font-bold text-purple-600 mr-2">Lv5 공인:</span>
            <span class="text-gray-700">인증 10회 이상 + 활동점수 500점 이상</span>
          </div>
          <div class="flex items-start">
            <span class="font-bold text-orange-500 mr-2">Lv4 리더:</span>
            <span class="text-gray-700">인증 5회 이상 + 활동점수 200점 이상</span>
          </div>
          <div class="flex items-start">
            <span class="font-bold text-green-500 mr-2">Lv3 활동:</span>
            <span class="text-gray-700">활동점수 100점 이상</span>
          </div>
          <div class="flex items-start">
            <span class="font-bold text-blue-500 mr-2">Lv2 연결:</span>
            <span class="text-gray-700">최소 1회 인증 받기</span>
          </div>
          <div class="flex items-start">
            <span class="font-bold text-gray-500 mr-2">Lv1 대기:</span>
            <span class="text-gray-700">초기 가입 상태</span>
          </div>
        </div>

        <div class="mt-6 pt-4 border-t">
          <h5 class="font-bold mb-3">활동점수 획득 방법</h5>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div>✅ 노드 가입: +10점</div>
            <div>✅ 타인 인증: +20점</div>
            <div>✅ 게시글 작성: +5점</div>
            <div>✅ 댓글 작성: +2점</div>
            <div>✅ 멤버 초대: +15점</div>
            <div>✅ 이벤트 참여: +50점</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Show node detail
async function showNodeDetail(nodeId) {
  try {
    const response = await axios.get(`/api/nodes/${nodeId}`);
    const { node, membership, is_member } = response.data;
    
    selectedNode = node;
    
    const modal = document.getElementById('nodeDetailModal');
    const content = document.getElementById('nodeDetailContent');
    
    content.innerHTML = `
      <div class="flex justify-between items-start mb-6">
        <div class="flex items-center">
          <div class="w-16 h-16 rounded-lg flex items-center justify-center text-3xl mr-4" 
               style="background: ${node.type_color}20; color: ${node.type_color}">
            <i class="fas ${node.type_icon}"></i>
          </div>
          <div>
            <h3 class="text-2xl font-bold">${node.name}</h3>
            <span class="text-sm px-2 py-1 rounded mt-2 inline-block" 
                  style="background: ${node.type_color}20; color: ${node.type_color}">
              ${getNodeTypeKorean(node.node_type)}
            </span>
          </div>
        </div>
        <button onclick="closeNodeDetail()" class="text-gray-500 hover:text-gray-700">
          <i class="fas fa-times text-2xl"></i>
        </button>
      </div>

      <div class="space-y-6">
        <!-- Description -->
        <div>
          <h4 class="font-bold mb-2">소개</h4>
          <p class="text-gray-700">${node.description || '설명이 없습니다'}</p>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-4">
          <div class="text-center p-4 bg-gray-50 rounded-lg">
            <div class="text-2xl font-bold text-blue-600">${node.member_count}</div>
            <div class="text-sm text-gray-600">멤버</div>
          </div>
          <div class="text-center p-4 bg-gray-50 rounded-lg">
            <div class="text-2xl font-bold text-green-600">${node.verified_member_count || 0}</div>
            <div class="text-sm text-gray-600">인증된 멤버</div>
          </div>
          <div class="text-center p-4 bg-gray-50 rounded-lg">
            <div class="text-2xl font-bold text-purple-600">${node.verification_level}</div>
            <div class="text-sm text-gray-600">노드 레벨</div>
          </div>
        </div>

        <!-- Membership Info -->
        ${is_member ? `
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <h4 class="font-bold text-blue-800">
                <i class="fas fa-check-circle mr-2"></i>가입된 노드입니다
              </h4>
              <span class="px-3 py-1 rounded text-sm" 
                    style="background: ${membership.level_color}20; color: ${membership.level_color}">
                ${membership.level_name || 'Lv ' + membership.relationship_level}
              </span>
            </div>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-600">역할:</span>
                <span class="font-bold ml-2">${membership.role_name}</span>
              </div>
              <div>
                <span class="text-gray-600">인증 횟수:</span>
                <span class="font-bold ml-2">${membership.verification_count}회</span>
              </div>
              <div>
                <span class="text-gray-600">활동 점수:</span>
                <span class="font-bold ml-2">${membership.activity_score}점</span>
              </div>
              <div>
                <span class="text-gray-600">권한 레벨:</span>
                <span class="font-bold ml-2">Level ${membership.role_level}</span>
              </div>
            </div>
          </div>
          
          <div class="flex space-x-3">
            ${membership.relationship_level >= 2 ? `
              <button onclick="viewMembers(${nodeId})" class="flex-1 btn-primary">
                <i class="fas fa-users mr-2"></i>멤버 보기
              </button>
            ` : ''}
            ${membership.relationship_level >= 3 ? `
              <button onclick="showInviteModal(${nodeId})" class="flex-1 btn-primary">
                <i class="fas fa-user-plus mr-2"></i>초대하기
              </button>
            ` : ''}
          </div>
        ` : `
          <div class="bg-gray-50 rounded-lg p-6 text-center">
            <p class="text-gray-600 mb-4">이 노드에 가입하시겠습니까?</p>
            ${node.visibility === 'public' ? `
              <button onclick="joinNode(${nodeId})" class="btn-primary">
                <i class="fas fa-sign-in-alt mr-2"></i>가입 신청
              </button>
            ` : `
              <p class="text-sm text-gray-500">
                <i class="fas fa-lock mr-2"></i>
                비공개 노드입니다. 초대가 필요합니다.
              </p>
            `}
          </div>
        `}

        <!-- Additional Info -->
        <div class="text-sm text-gray-500 border-t pt-4">
          <div>생성자: ${node.creator_name}</div>
          <div>생성일: ${new Date(node.created_at).toLocaleString('ko-KR')}</div>
          <div>공개 설정: ${node.visibility === 'public' ? '공개' : node.visibility === 'private' ? '비공개' : '초대 전용'}</div>
          <div>가입 승인: ${node.join_approval_required ? '필요' : '자동 승인'}</div>
        </div>
      </div>
    `;
    
    modal.classList.remove('hidden');
  } catch (error) {
    console.error('Error loading node detail:', error);
    showError('노드 정보를 불러올 수 없습니다');
  }
}

// Close node detail
function closeNodeDetail() {
  document.getElementById('nodeDetailModal').classList.add('hidden');
}

// Join node
async function joinNode(nodeId) {
  try {
    // Get default member role
    const response = await axios.post(`/api/nodes/${nodeId}/join`, {
      role_id: 1 // Default to basic member role - will be created automatically
    });
    
    showSuccess(response.data.message);
    closeNodeDetail();
    setTimeout(() => showNodeDetail(nodeId), 500);
  } catch (error) {
    console.error('Error joining node:', error);
    showError(error.response?.data?.error || '가입할 수 없습니다');
  }
}

// Create node modal
function showCreateNodeModal() {
  document.getElementById('createNodeModal').classList.remove('hidden');
  document.getElementById('createNodeForm').reset();
}

function closeCreateNodeModal() {
  document.getElementById('createNodeModal').classList.add('hidden');
}

// Handle create node form
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('createNodeForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const data = {
        name: document.getElementById('node-name').value,
        description: document.getElementById('node-description').value,
        node_type: document.getElementById('node-type').value,
        visibility: document.getElementById('node-visibility').value,
        join_approval_required: document.getElementById('join-approval').checked
      };
      
      try {
        const response = await axios.post('/api/nodes', data);
        showSuccess('노드가 생성되었습니다!');
        closeCreateNodeModal();
        loadMyNodesTab();
      } catch (error) {
        console.error('Error creating node:', error);
        showError(error.response?.data?.error || '노드를 생성할 수 없습니다');
      }
    });
  }
});

// Helper functions
function setActiveTab(tabName) {
  ['all', 'my', 'level'].forEach(tab => {
    const button = document.getElementById(`tab-${tab}`);
    if (button) {
      if (tab === tabName) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    }
  });
  
  const filterBar = document.getElementById('filter-bar');
  if (filterBar) {
    filterBar.style.display = tabName === 'all' ? 'block' : 'none';
  }
}

function getNodeTypeKorean(type) {
  const types = {
    family: '가족',
    school: '학교',
    company: '직장',
    club: '동호회',
    community: '커뮤니티',
    fanclub: '팬클럽'
  };
  return types[type] || type;
}

function getLevelColor(level) {
  const colors = {
    5: '#8b5cf6',
    4: '#f59e0b',
    3: '#10b981',
    2: '#3b82f6',
    1: '#6b7280'
  };
  return colors[level] || '#6b7280';
}

function showSuccess(message) {
  // TODO: Implement toast notification
  alert(message);
}

function showError(message) {
  // TODO: Implement toast notification
  alert(message);
}

// Export functions for global access
window.loadNodesPage = loadNodesPage;
window.showCreateNodeModal = showCreateNodeModal;
window.closeCreateNodeModal = closeCreateNodeModal;
window.showNodeDetail = showNodeDetail;
window.closeNodeDetail = closeNodeDetail;
window.joinNode = joinNode;
window.loadAllNodesTab = loadAllNodesTab;
window.loadMyNodesTab = loadMyNodesTab;
window.loadMyLevelTab = loadMyLevelTab;
