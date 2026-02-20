/**
 * Family Network Visualization using D3.js
 * 가족관계 네트워크 시각화
 */

// 가족 네트워크 차트 렌더링
function renderFamilyNetworkChart(relatives) {
  const container = document.getElementById('familyTreeContainer');
  
  if (!relatives || relatives.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 text-gray-500">
        <i class="fas fa-sitemap text-6xl mb-4"></i>
        <p class="text-lg">아직 등록된 가족이 없습니다.</p>
        <button onclick="showAddMemberModal()" class="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          <i class="fas fa-plus mr-2"></i>가족 추가하기
        </button>
      </div>
    `;
    return;
  }

  // 컨테이너 초기화
  container.innerHTML = `
    <div class="bg-white rounded-lg shadow-lg p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">
          <i class="fas fa-project-diagram mr-2 text-indigo-600"></i>
          가족 네트워크 차트
        </h2>
        <div class="flex gap-3">
          <button onclick="centerNetwork()" class="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
            <i class="fas fa-compress-arrows-alt mr-2"></i>중심으로
          </button>
          <button onclick="showAddMemberModal()" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            <i class="fas fa-plus mr-2"></i>가족 추가
          </button>
        </div>
      </div>
      
      <!-- 범례 -->
      <div class="mb-4 p-4 bg-gray-50 rounded-lg">
        <div class="flex flex-wrap gap-4 text-sm mb-3">
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded-full bg-blue-500"></div>
            <span>아버지</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded-full bg-pink-500"></div>
            <span>어머니</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded-full bg-green-500"></div>
            <span>나</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded-full bg-purple-500"></div>
            <span>배우자</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span>형제/자녀</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded-full bg-indigo-700"></div>
            <span>조부모</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded-full bg-orange-400"></div>
            <span>조카</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded-full border-2 border-red-500 bg-white"></div>
            <span>미인증</span>
          </div>
        </div>
        <div class="text-xs text-gray-600 mt-2 flex items-center gap-4">
          <span>💡 팁: 노드를 드래그하여 위치를 조정할 수 있습니다</span>
          <button onclick="toggleLegendExpand()" id="legendToggle" class="ml-auto text-indigo-600 hover:text-indigo-800">
            <i class="fas fa-info-circle mr-1"></i>더보기
          </button>
        </div>
        <div id="legendExpanded" class="hidden mt-3 pt-3 border-t text-xs text-gray-700">
          <div class="grid grid-cols-2 gap-2">
            <div><strong>실선:</strong> 인증된 관계</div>
            <div><strong>점선:</strong> 미인증 관계</div>
            <div><strong>파란 선:</strong> 부모-자식</div>
            <div><strong>분홍 선:</strong> 부부</div>
            <div><strong>주황 선:</strong> 형제</div>
            <div><strong>진한 파란 선:</strong> 조부모-손자</div>
          </div>
        </div>
      </div>
      
      <!-- SVG 컨테이너 -->
      <div id="networkChart" class="w-full" style="height: 600px; border: 1px solid #e5e7eb; border-radius: 0.5rem; overflow: hidden;"></div>
      
      <!-- 상세정보 패널 -->
      <div id="nodeDetailPanel" class="hidden mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
        <div class="flex justify-between items-start mb-3">
          <h3 class="text-lg font-bold text-indigo-900">상세정보</h3>
          <button onclick="closeDetailPanel()" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div id="nodeDetailContent"></div>
      </div>
    </div>
  `;

  // D3.js로 네트워크 시각화
  createD3Network(relatives);
}

// D3.js 네트워크 생성
function createD3Network(relatives) {
  const width = document.getElementById('networkChart').offsetWidth;
  const height = 600;

  // 노드와 링크 데이터 생성
  const { nodes, links } = prepareNetworkData(relatives);

  // SVG 생성
  const svg = d3.select('#networkChart')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .call(d3.zoom().on('zoom', (event) => {
      container.attr('transform', event.transform);
    }))
    .append('g');

  const container = svg.append('g');

  // 힘 시뮬레이션 설정
  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(150))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(60));

  // 링크(선) 그리기
  const link = container.append('g')
    .selectAll('line')
    .data(links)
    .enter()
    .append('line')
    .attr('stroke', d => getLinkColor(d.type))
    .attr('stroke-width', 3)
    .attr('stroke-dasharray', d => d.verified ? '0' : '5,5')
    .attr('opacity', 0.6);

  // 링크 레이블
  const linkLabel = container.append('g')
    .selectAll('text')
    .data(links)
    .enter()
    .append('text')
    .attr('class', 'link-label')
    .attr('font-size', '10px')
    .attr('fill', '#666')
    .attr('text-anchor', 'middle')
    .text(d => getLinkLabel(d.type));

  // 노드 그룹
  const node = container.append('g')
    .selectAll('g')
    .data(nodes)
    .enter()
    .append('g')
    .attr('class', 'node')
    .call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended))
    .on('click', (event, d) => showNodeDetail(d));

  // 노드 원
  node.append('circle')
    .attr('r', 30)
    .attr('fill', d => getNodeColor(d.relation))
    .attr('stroke', d => d.is_verified ? '#10b981' : '#ef4444')
    .attr('stroke-width', d => d.is_verified ? 3 : 2)
    .attr('stroke-dasharray', d => d.is_verified ? '0' : '5,5')
    .style('cursor', 'pointer')
    .attr('class', 'transition-all duration-300 hover:opacity-80');

  // 노드 아이콘
  node.append('text')
    .attr('class', 'node-icon')
    .attr('text-anchor', 'middle')
    .attr('dy', '0.3em')
    .attr('font-size', '20px')
    .attr('fill', 'white')
    .attr('pointer-events', 'none')
    .text(d => getRelationIcon(d.relation));

  // 노드 이름 레이블
  node.append('text')
    .attr('class', 'node-label')
    .attr('text-anchor', 'middle')
    .attr('dy', '50px')
    .attr('font-size', '13px')
    .attr('font-weight', 'bold')
    .attr('fill', '#1f2937')
    .attr('pointer-events', 'none')
    .text(d => d.name_ko || d.name_en || '이름 없음');

  // 노드 관계 레이블
  node.append('text')
    .attr('class', 'node-relation')
    .attr('text-anchor', 'middle')
    .attr('dy', '65px')
    .attr('font-size', '11px')
    .attr('fill', '#6b7280')
    .attr('pointer-events', 'none')
    .text(d => getRelationLabel(d.relation));

  // 시뮬레이션 업데이트
  simulation.on('tick', () => {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    linkLabel
      .attr('x', d => (d.source.x + d.target.x) / 2)
      .attr('y', d => (d.source.y + d.target.y) / 2);

    node.attr('transform', d => `translate(${d.x},${d.y})`);
  });

  // 드래그 이벤트 핸들러
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  // 전역 변수로 시뮬레이션 저장
  window.familySimulation = simulation;
}

// 네트워크 데이터 준비
function prepareNetworkData(relatives) {
  // 현재 사용자를 중심 노드로 추가
  const currentUser = {
    id: 'user-1',
    name_ko: '나',
    name_en: 'Me',
    relation: 'self',
    gender: 'male', // 실제로는 API에서 가져와야 함
    is_verified: true
  };

  // 노드 생성
  const nodes = [currentUser, ...relatives.map(r => ({
    ...r,
    id: `member-${r.id}`
  }))];

  // 링크 생성
  const links = [];
  
  relatives.forEach(relative => {
    const targetId = `member-${relative.id}`;
    
    // 관계 타입에 따라 링크 추가
    if (relative.relation === 'father' || relative.relation === 'mother') {
      links.push({
        source: targetId,
        target: 'user-1',
        type: 'parent-child',
        verified: relative.is_verified
      });
    } else if (relative.relation === 'grandfather' || relative.relation === 'grandmother') {
      links.push({
        source: targetId,
        target: 'user-1',
        type: 'grandparent-grandchild',
        verified: relative.is_verified
      });
    } else if (relative.relation === 'spouse') {
      links.push({
        source: 'user-1',
        target: targetId,
        type: 'marriage',
        verified: relative.is_verified
      });
    } else if (relative.relation === 'child') {
      links.push({
        source: 'user-1',
        target: targetId,
        type: 'parent-child',
        verified: relative.is_verified
      });
    } else if (relative.relation === 'sibling') {
      links.push({
        source: 'user-1',
        target: targetId,
        type: 'sibling',
        verified: relative.is_verified
      });
    } else if (relative.relation === 'nephew' || relative.relation === 'niece') {
      links.push({
        source: 'user-1',
        target: targetId,
        type: 'uncle-nephew',
        verified: relative.is_verified
      });
    }
  });

  // 부모 간 결혼 링크 추가
  const father = relatives.find(r => r.relation === 'father');
  const mother = relatives.find(r => r.relation === 'mother');
  if (father && mother) {
    links.push({
      source: `member-${father.id}`,
      target: `member-${mother.id}`,
      type: 'marriage',
      verified: father.is_verified && mother.is_verified
    });
  }

  return { nodes, links };
}

// 관계에 따른 노드 색상
function getNodeColor(relation) {
  const colors = {
    'father': '#3b82f6',      // 파랑
    'mother': '#ec4899',      // 분홍
    'self': '#10b981',        // 초록
    'spouse': '#8b5cf6',      // 보라
    'sibling': '#f59e0b',     // 주황
    'child': '#eab308',       // 노랑
    'grandfather': '#1e40af', // 진한 파랑
    'grandmother': '#be185d', // 진한 분홍
    'nephew': '#fb923c',      // 연한 주황
    'niece': '#fbbf24'        // 연한 노랑
  };
  return colors[relation] || '#6b7280';
}

// 관계에 따른 아이콘
function getRelationIcon(relation) {
  const icons = {
    'father': '👨',
    'mother': '👩',
    'self': '😊',
    'spouse': '💑',
    'sibling': '👫',
    'child': '👶',
    'grandfather': '👴',
    'grandmother': '👵',
    'nephew': '👦',
    'niece': '👧'
  };
  return icons[relation] || '👤';
}

// 관계 레이블
function getRelationLabel(relation) {
  const labels = {
    'father': '아버지',
    'mother': '어머니',
    'self': '본인',
    'spouse': '배우자',
    'sibling': '형제자매',
    'child': '자녀',
    'grandfather': '할아버지',
    'grandmother': '할머니',
    'nephew': '조카',
    'niece': '조카'
  };
  return labels[relation] || '기타';
}

// 링크 색상
function getLinkColor(type) {
  const colors = {
    'parent-child': '#3b82f6',
    'marriage': '#ec4899',
    'sibling': '#f59e0b',
    'grandparent-grandchild': '#1e40af',
    'uncle-nephew': '#fb923c'
  };
  return colors[type] || '#6b7280';
}

// 링크 레이블
function getLinkLabel(type) {
  const labels = {
    'parent-child': '부모-자식',
    'marriage': '부부',
    'sibling': '형제',
    'grandparent-grandchild': '조부모-손자녀',
    'uncle-nephew': '삼촌-조카'
  };
  return labels[type] || '';
}

// 노드 상세정보 표시
function showNodeDetail(node) {
  const panel = document.getElementById('nodeDetailPanel');
  const content = document.getElementById('nodeDetailContent');
  
  const verifiedBadge = node.is_verified 
    ? '<span class="px-2 py-1 bg-green-100 text-green-800 rounded text-xs"><i class="fas fa-check-circle mr-1"></i>인증됨</span>'
    : '<span class="px-2 py-1 bg-red-100 text-red-800 rounded text-xs"><i class="fas fa-exclamation-circle mr-1"></i>미인증</span>';
  
  const birthDate = node.birth_date ? new Date(node.birth_date).toLocaleDateString('ko-KR') : '미등록';
  const age = node.birth_date ? calculateAge(node.birth_date) : '-';
  
  content.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p class="text-sm text-gray-600 mb-1">이름</p>
        <p class="font-bold text-gray-900">${node.name_ko || node.name_en || '이름 없음'}</p>
      </div>
      <div>
        <p class="text-sm text-gray-600 mb-1">관계</p>
        <p class="font-bold text-gray-900">${getRelationLabel(node.relation)}</p>
      </div>
      <div>
        <p class="text-sm text-gray-600 mb-1">성별</p>
        <p class="font-bold text-gray-900">${node.gender === 'male' ? '남성' : '여성'}</p>
      </div>
      <div>
        <p class="text-sm text-gray-600 mb-1">인증상태</p>
        <p>${verifiedBadge}</p>
      </div>
      <div>
        <p class="text-sm text-gray-600 mb-1">생년월일</p>
        <p class="font-bold text-gray-900">${birthDate}</p>
      </div>
      <div>
        <p class="text-sm text-gray-600 mb-1">나이</p>
        <p class="font-bold text-gray-900">${age}세</p>
      </div>
    </div>
    ${!node.is_verified ? `
      <div class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
        <p class="text-sm text-yellow-800">
          <i class="fas fa-info-circle mr-2"></i>
          이 구성원은 아직 관계 인증을 완료하지 않았습니다.
        </p>
      </div>
    ` : ''}
  `;
  
  panel.classList.remove('hidden');
}

// 상세정보 패널 닫기
function closeDetailPanel() {
  document.getElementById('nodeDetailPanel').classList.add('hidden');
}

// 네트워크 중심으로 이동
function centerNetwork() {
  if (window.familySimulation) {
    window.familySimulation.alpha(1).restart();
  }
}

// 나이 계산
function calculateAge(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

// D3.js 라이브러리 로드
function loadD3Library() {
  return new Promise((resolve, reject) => {
    if (window.d3) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/d3@7.8.5/dist/d3.min.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// 가족 트리 로드 (수정된 버전)
async function loadFamilyTree() {
  const container = document.getElementById('familyTreeContainer');
  
  // 로딩 표시
  container.innerHTML = `
    <div class="text-center py-12">
      <i class="fas fa-spinner fa-spin text-4xl text-indigo-600 mb-4"></i>
      <p class="text-gray-600">가족 네트워크를 불러오는 중...</p>
    </div>
  `;
  
  try {
    // D3.js 라이브러리 로드
    await loadD3Library();
    
    // 가족 데이터 가져오기
    const response = await axios.get('/api/family/tree');
    const relatives = response.data.relatives || [];
    
    // 네트워크 차트 렌더링
    renderFamilyNetworkChart(relatives);
    
  } catch (error) {
    console.error('Error loading family tree:', error);
    container.innerHTML = `
      <div class="text-center py-12 text-red-600">
        <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
        <p class="text-lg">가족 네트워크를 불러오는데 실패했습니다.</p>
        <button onclick="loadFamilyTree()" class="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          다시 시도
        </button>
      </div>
    `;
  }
}

// Toggle legend expand
function toggleLegendExpand() {
  const expanded = document.getElementById('legendExpanded');
  const toggle = document.getElementById('legendToggle');
  
  if (expanded.classList.contains('hidden')) {
    expanded.classList.remove('hidden');
    toggle.innerHTML = '<i class="fas fa-info-circle mr-1"></i>접기';
  } else {
    expanded.classList.add('hidden');
    toggle.innerHTML = '<i class="fas fa-info-circle mr-1"></i>더보기';
  }
}
