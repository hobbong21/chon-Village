/**
 * Korean Traditional Family Tree (족보) Visualization
 * 한국 전통 족보 스타일 가족 관계도
 */

// 한국 족보 스타일 가족 관계도 렌더링
function renderKoreanFamilyTree(relatives) {
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

  // 촌수별로 그룹화
  const generations = organizeByGeneration(relatives);
  
  container.innerHTML = `
    <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg shadow-xl overflow-hidden" style="border: 8px solid #8b7355; position: relative;">
      <!-- 전통 문양 테두리 -->
      <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; border: 4px solid; border-image: repeating-linear-gradient(90deg, #8b7355 0px, #8b7355 10px, transparent 10px, transparent 20px) 1;"></div>
      
      <!-- 헤더 -->
      <div class="p-6 text-center border-b-4 border-amber-800" style="background: linear-gradient(135deg, #f5e6d3 0%, #e8d5b7 100%);">
        <div class="inline-block bg-amber-700 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg mb-4">
          <i class="fas fa-scroll mr-2"></i>
          가족 관계도 (족보)
        </div>
        <div class="flex justify-center gap-3 mt-4">
          <button onclick="centerKoreanTree()" class="px-4 py-2 bg-white border-2 border-amber-700 text-amber-800 rounded-lg hover:bg-amber-50 shadow">
            <i class="fas fa-compress-arrows-alt mr-2"></i>중심으로
          </button>
          <button onclick="showAddMemberModal()" class="px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 shadow">
            <i class="fas fa-plus mr-2"></i>가족 추가
          </button>
        </div>
      </div>

      <!-- 범례 -->
      <div class="px-6 py-4 bg-white border-b-2 border-amber-300">
        <div class="flex flex-wrap justify-center gap-4 text-sm">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded" style="background: #fbbf24;"></div>
            <span class="font-medium">직계 존속</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded" style="background: #fb923c;"></div>
            <span class="font-medium">방계 존속</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded" style="background: #34d399;"></div>
            <span class="font-medium">본인</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded" style="background: #60a5fa;"></div>
            <span class="font-medium">직계 비속</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded" style="background: #22d3ee;"></div>
            <span class="font-medium">방계 비속</span>
          </div>
        </div>
      </div>

      <!-- 스크롤 가능한 족보 영역 -->
      <div class="overflow-x-auto overflow-y-auto" style="max-height: 600px;">
        <div id="koreanTreeContent" class="p-8 min-w-max">
          <!-- 족보 내용이 여기에 렌더링됩니다 -->
        </div>
      </div>

      <!-- 하단 정보 -->
      <div class="p-4 bg-gradient-to-r from-amber-100 to-orange-100 border-t-4 border-amber-800 text-center text-sm text-gray-700">
        <p class="font-medium">
          <i class="fas fa-info-circle mr-2 text-amber-700"></i>
          좌우로 스크롤하여 전체 가계도를 확인하세요
        </p>
      </div>
    </div>
  `;

  // 족보 콘텐츠 렌더링
  renderTreeContent(generations);
}

// 촌수별로 가족 구성원 정리
function organizeByGeneration(relatives) {
  const generations = {
    '-3': [], // 증조부모
    '-2': [], // 조부모
    '-1': [], // 부모
    '0': [],  // 본인, 형제, 배우자
    '1': [],  // 자녀, 조카
    '2': []   // 손자
  };

  // 본인 추가
  generations['0'].push({
    id: 'self',
    name_ko: '나',
    name_en: 'Me',
    relation: 'self',
    gender: 'male',
    is_verified: true,
    chon: 0
  });

  relatives.forEach(relative => {
    const gen = getGenerationLevel(relative.relation);
    if (generations[gen]) {
      generations[gen].push({
        ...relative,
        chon: getChonNumber(relative.relation)
      });
    }
  });

  return generations;
}

// 관계에 따른 세대 레벨
function getGenerationLevel(relation) {
  const levels = {
    'grandfather': '-2',
    'grandmother': '-2',
    'father': '-1',
    'mother': '-1',
    'self': '0',
    'sibling': '0',
    'spouse': '0',
    'child': '1',
    'nephew': '1',
    'niece': '1'
  };
  return levels[relation] || '0';
}

// 관계에 따른 촌수
function getChonNumber(relation) {
  const chon = {
    'self': 0,
    'father': 1,
    'mother': 1,
    'grandfather': 2,
    'grandmother': 2,
    'sibling': 2,
    'spouse': 0,
    'child': 1,
    'nephew': 3,
    'niece': 3
  };
  return chon[relation] || 0;
}

// 족보 콘텐츠 렌더링
function renderTreeContent(generations) {
  const content = document.getElementById('koreanTreeContent');
  let html = '<div class="flex flex-col items-center gap-8">';

  // 각 세대별로 렌더링
  const levels = ['-3', '-2', '-1', '0', '1', '2'];
  
  levels.forEach(level => {
    const members = generations[level];
    if (members && members.length > 0) {
      html += renderGenerationRow(members, level);
    }
  });

  html += '</div>';
  content.innerHTML = html;
}

// 세대별 행 렌더링
function renderGenerationRow(members, level) {
  const levelNames = {
    '-3': '증조부모',
    '-2': '조부모',
    '-1': '부모',
    '0': '본인 세대',
    '1': '자녀 세대',
    '2': '손자 세대'
  };

  let html = '<div class="flex flex-col items-center mb-6">';
  
  // 세대 레이블
  html += `
    <div class="text-center mb-4">
      <span class="inline-block px-4 py-1 bg-amber-700 text-white rounded-full text-sm font-bold shadow">
        ${levelNames[level]}
      </span>
    </div>
  `;

  // 구성원들을 가로로 배치
  html += '<div class="flex flex-wrap justify-center gap-4 items-start">';
  
  members.forEach(member => {
    html += renderFamilyMemberBox(member);
  });

  html += '</div>';
  
  // 연결선 (다음 세대가 있는 경우)
  if (parseInt(level) < 2) {
    html += `
      <div class="my-4">
        <svg width="100" height="40" class="mx-auto">
          <line x1="50" y1="0" x2="50" y2="40" stroke="#8b7355" stroke-width="2"/>
        </svg>
      </div>
    `;
  }

  html += '</div>';
  return html;
}

// 가족 구성원 박스 렌더링
function renderFamilyMemberBox(member) {
  const boxColor = getMemberBoxColor(member.relation, member.chon);
  const relationLabel = getKoreanRelationLabel(member.relation);
  const icon = getRelationIcon(member.relation);
  const verifiedBadge = member.is_verified 
    ? '<div class="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs"><i class="fas fa-check"></i></div>'
    : '<div class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs"><i class="fas fa-clock"></i></div>';

  return `
    <div class="relative group cursor-pointer" onclick="showKoreanMemberDetail('${member.id || 'self'}')">
      <div class="w-32 p-3 rounded-lg shadow-lg border-3 border-amber-900 transition-all duration-200 hover:scale-105 hover:shadow-xl" 
           style="background: ${boxColor};">
        ${verifiedBadge}
        
        <!-- 아이콘 -->
        <div class="text-3xl text-center mb-2">
          ${icon}
        </div>
        
        <!-- 이름 -->
        <div class="text-center font-bold text-gray-800 text-sm mb-1">
          ${member.name_ko || member.name_en || '이름 없음'}
        </div>
        
        <!-- 관계 -->
        <div class="text-center text-xs text-gray-700 font-medium mb-1">
          ${relationLabel}
        </div>
        
        <!-- 촌수 -->
        <div class="text-center">
          <span class="inline-block px-2 py-0.5 bg-white bg-opacity-80 rounded-full text-xs font-bold text-amber-900">
            ${member.chon}촌
          </span>
        </div>
      </div>
      
      <!-- 호버 툴팁 -->
      <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
        클릭하여 상세정보 보기
        <div class="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  `;
}

// 관계에 따른 박스 색상
function getMemberBoxColor(relation, chon) {
  // 직계 존속 (조상)
  if (relation === 'grandfather' || relation === 'grandmother') {
    return 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)';
  }
  if (relation === 'father' || relation === 'mother') {
    return 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)';
  }
  
  // 방계 존속
  if (relation === 'sibling' && chon > 0) {
    return 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)';
  }
  
  // 본인
  if (relation === 'self') {
    return 'linear-gradient(135deg, #34d399 0%, #10b981 100%)';
  }
  
  // 배우자
  if (relation === 'spouse') {
    return 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)';
  }
  
  // 직계 비속 (자녀)
  if (relation === 'child') {
    return 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)';
  }
  
  // 방계 비속 (조카)
  if (relation === 'nephew' || relation === 'niece') {
    return 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)';
  }
  
  return 'linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)';
}

// 한국어 관계 레이블
function getKoreanRelationLabel(relation) {
  const labels = {
    'father': '부(아버지)',
    'mother': '모(어머니)',
    'self': '본인',
    'spouse': '배우자',
    'sibling': '형제자매',
    'child': '자녀',
    'grandfather': '조(할아버지)',
    'grandmother': '조모(할머니)',
    'nephew': '질(조카)',
    'niece': '질(조카)'
  };
  return labels[relation] || '기타';
}

// 족보 중심으로 스크롤
function centerKoreanTree() {
  const container = document.querySelector('#koreanTreeContent').parentElement;
  const content = document.getElementById('koreanTreeContent');
  
  // 가운데로 스크롤
  container.scrollLeft = (content.scrollWidth - container.clientWidth) / 2;
  container.scrollTop = 0;
}

// 구성원 상세정보 표시
function showKoreanMemberDetail(memberId) {
  // 기존 상세정보 패널 사용
  showFamilyMemberQuickView(memberId);
}

// 컴팩트 버전 (사이드바용)
function renderCompactKoreanFamilyTree(relatives) {
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

  // 간단한 트리 구조
  const generations = organizeByGeneration(relatives);
  
  let html = `
    <div class="relative bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 border-2 border-amber-300" style="height: 300px; overflow-y: auto;">
      <div class="space-y-3">
  `;

  // 각 세대별로 간단히 표시
  const levels = ['-2', '-1', '0', '1'];
  
  levels.forEach(level => {
    const members = generations[level];
    if (members && members.length > 0) {
      html += '<div class="flex flex-wrap gap-2 justify-center">';
      members.slice(0, 4).forEach(member => {
        const icon = getRelationIcon(member.relation);
        const color = getMemberBoxColor(member.relation, member.chon);
        html += `
          <div class="w-16 p-2 rounded shadow-sm text-center text-xs" style="background: ${color}; cursor: pointer;" onclick="viewFullFamilyTree()">
            <div class="text-lg">${icon}</div>
            <div class="font-bold text-gray-800 truncate">${(member.name_ko || member.name_en || '?').substring(0, 3)}</div>
          </div>
        `;
      });
      if (members.length > 4) {
        html += `<div class="w-16 p-2 rounded bg-gray-200 text-center text-xs flex items-center justify-center">+${members.length - 4}</div>`;
      }
      html += '</div>';
    }
  });

  html += `
      </div>
    </div>
  `;

  container.innerHTML = html;
}

// 가족 트리 로드 (한국 스타일)
async function loadKoreanFamilyTree() {
  const container = document.getElementById('familyTreeContainer');
  
  container.innerHTML = `
    <div class="text-center py-12">
      <i class="fas fa-spinner fa-spin text-4xl text-indigo-600 mb-4"></i>
      <p class="text-gray-600">가족 관계도를 불러오는 중...</p>
    </div>
  `;
  
  try {
    const response = await axios.get('/api/family/tree');
    const relatives = response.data.relatives || [];
    
    renderKoreanFamilyTree(relatives);
    
  } catch (error) {
    console.error('Error loading Korean family tree:', error);
    container.innerHTML = `
      <div class="text-center py-12 text-red-600">
        <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
        <p class="text-lg">가족 관계도를 불러오는데 실패했습니다.</p>
        <button onclick="loadKoreanFamilyTree()" class="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          다시 시도
        </button>
      </div>
    `;
  }
}
