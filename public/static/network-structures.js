// Network Structure Types Management
// 4가지 관계망 유형 처리: 가계도, 일반 네트워크, 위계적 수직, 계층적 수직

let networkStructures = [];
let currentNodeStructure = null;

// Load network structures
async function loadNetworkStructures() {
  try {
    const response = await axios.get('/api/network-structures');
    networkStructures = response.data.structures;
    return networkStructures;
  } catch (error) {
    console.error('Error loading network structures:', error);
    return [];
  }
}

// Get structure type info
function getStructureTypeInfo(structureId) {
  return networkStructures.find(s => s.id === structureId);
}

// Get structure type icon
function getStructureTypeIcon(structureType) {
  const icons = {
    'family_tree': 'fas fa-sitemap',
    'social_network': 'fas fa-project-diagram',
    'hub_network': 'fas fa-circle-notch',
    'org_chart': 'fas fa-sitemap fa-rotate-180'
  };
  return icons[structureType] || 'fas fa-network-wired';
}

// Get structure type color
function getStructureTypeColor(structureType) {
  const colors = {
    'family_tree': '#10b981',    // Green
    'social_network': '#3b82f6',  // Blue
    'hub_network': '#8b5cf6',     // Purple
    'org_chart': '#f59e0b'        // Orange
  };
  return colors[structureType] || '#6b7280';
}

// Render structure type badge
function renderStructureTypeBadge(structure) {
  const icon = getStructureTypeIcon(structure.name);
  const color = getStructureTypeColor(structure.name);
  
  return `
    <div style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.75rem; 
                background: ${color}20; border: 1px solid ${color}; border-radius: 1rem; 
                font-size: var(--text-sm);">
      <i class="${icon}" style="color: ${color};"></i>
      <span style="color: ${color}; font-weight: 600;">${structure.name_ko}</span>
    </div>
  `;
}

// Render structure type details
function renderStructureTypeDetails(structure) {
  const icon = getStructureTypeIcon(structure.name);
  const color = getStructureTypeColor(structure.name);
  
  const rules = structure.connection_rule ? JSON.parse(structure.connection_rule) : {};
  
  return `
    <div class="card" style="border-left: 4px solid ${color};">
      <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
        <div style="width: 48px; height: 48px; border-radius: 0.5rem; 
                    background: ${color}20; display: flex; align-items: center; justify-content: center;">
          <i class="${icon}" style="font-size: 1.5rem; color: ${color};"></i>
        </div>
        <div>
          <h3 style="font-size: var(--text-xl); font-weight: var(--font-bold); margin-bottom: 0.25rem;">
            ${structure.name_ko}
          </h3>
          <p style="font-size: var(--text-sm); color: var(--gray-600);">
            ${structure.description}
          </p>
        </div>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; 
                  padding: 1rem; background: var(--gray-50); border-radius: 0.5rem;">
        <div>
          <div style="font-size: var(--text-xs); color: var(--gray-500); margin-bottom: 0.25rem;">그래프 타입</div>
          <div style="font-weight: 600;">${structure.graph_type.toUpperCase()}</div>
        </div>
        <div>
          <div style="font-size: var(--text-xs); color: var(--gray-500); margin-bottom: 0.25rem;">방향성</div>
          <div style="font-weight: 600;">${structure.is_directed ? '단방향' : '양방향'}</div>
        </div>
        <div>
          <div style="font-size: var(--text-xs); color: var(--gray-500); margin-bottom: 0.25rem;">사이클 허용</div>
          <div style="font-weight: 600;">${structure.allows_cycles ? '허용' : '불허'}</div>
        </div>
        <div>
          <div style="font-size: var(--text-xs); color: var(--gray-500); margin-bottom: 0.25rem;">최대 부모</div>
          <div style="font-weight: 600;">${structure.max_parents === -1 ? '무제한' : structure.max_parents}</div>
        </div>
      </div>
      
      ${rules.rule ? `
        <div style="margin-top: 1rem; padding: 0.75rem; background: var(--info-light); 
                    border-radius: 0.5rem; border-left: 3px solid var(--info);">
          <div style="font-size: var(--text-sm); font-weight: 600; color: var(--info); margin-bottom: 0.25rem;">
            <i class="fas fa-info-circle" style="margin-right: 0.5rem;"></i>연결 규칙
          </div>
          <div style="font-size: var(--text-sm); color: var(--gray-700);">
            ${getRuleDescription(rules)}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

// Get rule description
function getRuleDescription(rules) {
  const descriptions = {
    'parent_to_child': '부모에서 자녀로 단방향 연결',
    'free_connection': '모든 멤버 간 자유로운 양방향 연결',
    'hub_to_spoke': '중심 인물에서 모든 멤버로 연결',
    'hierarchical': '상위 계층에서 하위 계층으로 단방향 연결'
  };
  return descriptions[rules.rule] || rules.rule;
}

// Visualize network structure
function visualizeNetworkStructure(containerId, structure, nodes, connections) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const visualizationType = structure.visualization_type;
  
  switch (visualizationType) {
    case 'tree':
      renderTreeVisualization(container, structure, nodes, connections);
      break;
    case 'hierarchical':
      renderHierarchicalVisualization(container, structure, nodes, connections);
      break;
    case 'radial':
      renderRadialVisualization(container, structure, nodes, connections);
      break;
    case 'network':
      renderNetworkVisualization(container, structure, nodes, connections);
      break;
    default:
      renderDefaultVisualization(container, structure, nodes, connections);
  }
}

// Render tree visualization (for family_tree)
function renderTreeVisualization(container, structure, nodes, connections) {
  const color = getStructureTypeColor(structure.name);
  
  container.innerHTML = `
    <div style="text-align: center; padding: 2rem;">
      <i class="fas fa-sitemap" style="font-size: 3rem; color: ${color}; margin-bottom: 1rem;"></i>
      <h3 style="font-weight: 600; margin-bottom: 0.5rem;">가계도 구조</h3>
      <p style="color: var(--gray-600); font-size: var(--text-sm);">
        세대별 계층 구조로 표시됩니다
      </p>
      <div style="margin-top: 1.5rem; display: flex; justify-content: center; gap: 1rem;">
        <div style="padding: 0.5rem 1rem; background: var(--gray-100); border-radius: 0.5rem;">
          <div style="font-size: var(--text-xs); color: var(--gray-500);">총 멤버</div>
          <div style="font-weight: 600; font-size: var(--text-lg);">${nodes.length}</div>
        </div>
        <div style="padding: 0.5rem 1rem; background: var(--gray-100); border-radius: 0.5rem;">
          <div style="font-size: var(--text-xs); color: var(--gray-500);">연결</div>
          <div style="font-weight: 600; font-size: var(--text-lg);">${connections.length}</div>
        </div>
      </div>
    </div>
  `;
}

// Render hierarchical visualization (for org_chart)
function renderHierarchicalVisualization(container, structure, nodes, connections) {
  const color = getStructureTypeColor(structure.name);
  
  container.innerHTML = `
    <div style="text-align: center; padding: 2rem;">
      <i class="fas fa-sitemap fa-rotate-180" style="font-size: 3rem; color: ${color}; margin-bottom: 1rem;"></i>
      <h3 style="font-weight: 600; margin-bottom: 0.5rem;">조직도 구조</h3>
      <p style="color: var(--gray-600); font-size: var(--text-sm);">
        명확한 계층 구조로 표시됩니다
      </p>
      <div style="margin-top: 1.5rem; display: flex; justify-content: center; gap: 1rem;">
        <div style="padding: 0.5rem 1rem; background: var(--gray-100); border-radius: 0.5rem;">
          <div style="font-size: var(--text-xs); color: var(--gray-500);">총 멤버</div>
          <div style="font-weight: 600; font-size: var(--text-lg);">${nodes.length}</div>
        </div>
        <div style="padding: 0.5rem 1rem; background: var(--gray-100); border-radius: 0.5rem;">
          <div style="font-size: var(--text-xs); color: var(--gray-500);">연결</div>
          <div style="font-weight: 600; font-size: var(--text-lg);">${connections.length}</div>
        </div>
      </div>
    </div>
  `;
}

// Render radial visualization (for hub_network)
function renderRadialVisualization(container, structure, nodes, connections) {
  const color = getStructureTypeColor(structure.name);
  
  container.innerHTML = `
    <div style="text-align: center; padding: 2rem;">
      <i class="fas fa-circle-notch" style="font-size: 3rem; color: ${color}; margin-bottom: 1rem;"></i>
      <h3 style="font-weight: 600; margin-bottom: 0.5rem;">방사형 구조</h3>
      <p style="color: var(--gray-600); font-size: var(--text-sm);">
        중심에서 외곽으로 연결됩니다
      </p>
      <div style="margin-top: 1.5rem; display: flex; justify-content: center; gap: 1rem;">
        <div style="padding: 0.5rem 1rem; background: var(--gray-100); border-radius: 0.5rem;">
          <div style="font-size: var(--text-xs); color: var(--gray-500);">총 멤버</div>
          <div style="font-weight: 600; font-size: var(--text-lg);">${nodes.length}</div>
        </div>
        <div style="padding: 0.5rem 1rem; background: var(--gray-100); border-radius: 0.5rem;">
          <div style="font-size: var(--text-xs); color: var(--gray-500);">연결</div>
          <div style="font-weight: 600; font-size: var(--text-lg);">${connections.length}</div>
        </div>
      </div>
    </div>
  `;
}

// Render network visualization (for social_network)
function renderNetworkVisualization(container, structure, nodes, connections) {
  const color = getStructureTypeColor(structure.name);
  
  container.innerHTML = `
    <div style="text-align: center; padding: 2rem;">
      <i class="fas fa-project-diagram" style="font-size: 3rem; color: ${color}; margin-bottom: 1rem;"></i>
      <h3 style="font-weight: 600; margin-bottom: 0.5rem;">네트워크 구조</h3>
      <p style="color: var(--gray-600); font-size: var(--text-sm);">
        자유로운 연결 구조로 표시됩니다
      </p>
      <div style="margin-top: 1.5rem; display: flex; justify-content: center; gap: 1rem;">
        <div style="padding: 0.5rem 1rem; background: var(--gray-100); border-radius: 0.5rem;">
          <div style="font-size: var(--text-xs); color: var(--gray-500);">총 멤버</div>
          <div style="font-weight: 600; font-size: var(--text-lg);">${nodes.length}</div>
        </div>
        <div style="padding: 0.5rem 1rem; background: var(--gray-100); border-radius: 0.5rem;">
          <div style="font-size: var(--text-xs); color: var(--gray-500);">연결</div>
          <div style="font-weight: 600; font-size: var(--text-lg);">${connections.length}</div>
        </div>
      </div>
    </div>
  `;
}

// Render default visualization
function renderDefaultVisualization(container, structure, nodes, connections) {
  container.innerHTML = `
    <div style="text-align: center; padding: 2rem; color: var(--gray-500);">
      <i class="fas fa-network-wired" style="font-size: 3rem; margin-bottom: 1rem;"></i>
      <p>시각화 준비 중입니다</p>
    </div>
  `;
}

// Validate connection
async function validateNodeConnection(nodeId, fromUserId, toUserId, connectionType) {
  try {
    const response = await axios.post(`/api/nodes/${nodeId}/validate-connection`, {
      from_user_id: fromUserId,
      to_user_id: toUserId,
      connection_type: connectionType
    });
    
    return response.data;
  } catch (error) {
    console.error('Error validating connection:', error);
    return { isValid: false, errors: ['Validation failed'] };
  }
}

// Show structure type selector modal
function showStructureTypeSelector(callback) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 800px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h2 style="font-size: var(--text-2xl); font-weight: var(--font-bold);">
          관계망 구조 선택
        </h2>
        <button onclick="this.closest('.modal-overlay').remove()" 
                style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--gray-500);">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div id="structureTypesList" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
        <div class="loading" style="grid-column: 1 / -1;">
          <div class="loading-spinner"></div>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Load structures
  loadNetworkStructures().then(structures => {
    const list = document.getElementById('structureTypesList');
    list.innerHTML = structures.map(structure => {
      const icon = getStructureTypeIcon(structure.name);
      const color = getStructureTypeColor(structure.name);
      
      return `
        <div onclick="selectStructureType(${structure.id}, ${callback ? `() => ${callback.toString()}(${structure.id})` : ''})" 
             class="card" 
             style="cursor: pointer; border: 2px solid var(--gray-200); transition: all 0.15s;"
             onmouseover="this.style.borderColor='${color}'; this.style.background='${color}10';"
             onmouseout="this.style.borderColor='var(--gray-200)'; this.style.background='white';">
          <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.75rem;">
            <div style="width: 40px; height: 40px; border-radius: 0.5rem; 
                        background: ${color}20; display: flex; align-items: center; justify-content: center;">
              <i class="${icon}" style="font-size: 1.25rem; color: ${color};"></i>
            </div>
            <h3 style="font-weight: 600; font-size: var(--text-lg);">${structure.name_ko}</h3>
          </div>
          <p style="font-size: var(--text-sm); color: var(--gray-600); line-height: 1.5;">
            ${structure.description}
          </p>
        </div>
      `;
    }).join('');
  });
}

// Select structure type
function selectStructureType(structureId, callback) {
  document.querySelector('.modal-overlay')?.remove();
  if (callback) callback(structureId);
}
