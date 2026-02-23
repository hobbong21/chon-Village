// Dynamic Network Visualization with D3.js
// 노드 클릭 시 연결된 사용자들을 다이나믹하게 펼쳐서 보여주는 네트워크 뷰

let networkSvg = null;
let networkSimulation = null;
let networkData = { nodes: [], links: [] };
let selectedNodeId = null;

// Initialize network visualization
function initNetworkVisualization(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  // Clear existing SVG
  d3.select(container).select('svg').remove();
  
  // Get container dimensions
  const width = container.clientWidth;
  const height = container.clientHeight || 600;
  
  // Create SVG
  networkSvg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height])
    .style('background', 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)');
  
  // Add arrow marker for directed links
  networkSvg.append('defs').append('marker')
    .attr('id', 'arrowhead')
    .attr('viewBox', '-0 -5 10 10')
    .attr('refX', 25)
    .attr('refY', 0)
    .attr('orient', 'auto')
    .attr('markerWidth', 8)
    .attr('markerHeight', 8)
    .attr('xoverflow', 'visible')
    .append('svg:path')
    .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
    .attr('fill', '#999')
    .style('stroke', 'none');
  
  // Create container groups
  const g = networkSvg.append('g');
  
  // Add zoom behavior
  const zoom = d3.zoom()
    .scaleExtent([0.3, 3])
    .on('zoom', (event) => {
      g.attr('transform', event.transform);
    });
  
  networkSvg.call(zoom);
  
  // Create links group
  g.append('g').attr('class', 'links');
  
  // Create nodes group
  g.append('g').attr('class', 'nodes');
  
  // Initialize simulation
  networkSimulation = d3.forceSimulation()
    .force('link', d3.forceLink().id(d => d.id).distance(150))
    .force('charge', d3.forceManyBody().strength(-500))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(50));
  
  return { svg: networkSvg, simulation: networkSimulation };
}

// Load and display node network
async function showNodeNetwork(nodeId) {
  const mainContent = document.getElementById('mainContent');
  
  mainContent.innerHTML = `
    <div class="h-full flex flex-col">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-md p-4 mb-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button onclick="loadNodesPage()" class="p-2 hover:bg-gray-100 rounded-lg">
              <i class="fas fa-arrow-left text-gray-600"></i>
            </button>
            <div>
              <h2 class="text-2xl font-bold text-gray-800">네트워크 뷰</h2>
              <p class="text-sm text-gray-500" id="network-subtitle">노드를 클릭하여 연결된 사용자를 확인하세요</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-2">
            <button onclick="resetNetworkView()" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">
              <i class="fas fa-redo mr-2"></i>초기화
            </button>
            <button onclick="centerNetworkView()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm">
              <i class="fas fa-crosshairs mr-2"></i>중앙 정렬
            </button>
          </div>
        </div>
      </div>
      
      <!-- Legend -->
      <div class="bg-white rounded-lg shadow-md p-4 mb-4">
        <div class="flex items-center space-x-6 text-sm">
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 rounded-full bg-blue-600"></div>
            <span>중심 노드</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 rounded-full bg-green-500"></div>
            <span>연결된 사용자</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 rounded-full bg-purple-500"></div>
            <span>확장된 사용자</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-3 h-0.5 bg-gray-400"></div>
            <span>연결</span>
          </div>
        </div>
      </div>
      
      <!-- Network Visualization -->
      <div class="flex-1 bg-white rounded-lg shadow-md overflow-hidden">
        <div id="network-container" class="w-full h-full"></div>
      </div>
      
      <!-- Info Panel -->
      <div id="node-info-panel" class="hidden fixed bottom-4 right-4 bg-white rounded-lg shadow-xl p-4 max-w-sm z-50">
        <div class="flex items-start justify-between mb-2">
          <h3 class="font-bold text-lg" id="info-name"></h3>
          <button onclick="closeInfoPanel()" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div id="info-content" class="text-sm text-gray-600"></div>
      </div>
    </div>
  `;
  
  // Wait for DOM to be ready
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Initialize visualization
  initNetworkVisualization('network-container');
  
  // Load initial data
  if (nodeId) {
    await loadNodeNetworkData(nodeId);
  } else {
    await loadMyNetworkData();
  }
}

// Load network data for a specific node
async function loadNodeNetworkData(nodeId) {
  selectedNodeId = nodeId;
  
  try {
    // Fetch node details
    const nodeResponse = await axios.get(`/api/nodes/${nodeId}`);
    const node = nodeResponse.data.node;
    
    // Fetch node members
    const membersResponse = await axios.get(`/api/nodes/${nodeId}/members`);
    const members = membersResponse.data.members;
    
    // Update subtitle
    document.getElementById('network-subtitle').textContent = 
      `${node.node_name} - ${members.length}명의 멤버`;
    
    // Build network data
    networkData = buildNetworkData(node, members);
    
    // Render network
    renderNetwork(networkData);
    
  } catch (error) {
    console.error('Failed to load network data:', error);
    alert('네트워크 데이터를 불러오는데 실패했습니다.');
  }
}

// Load current user's network data
async function loadMyNetworkData() {
  const user = getCurrentUser();
  
  try {
    // Fetch user's nodes
    const nodesResponse = await axios.get('/api/my-nodes');
    const nodes = nodesResponse.data.nodes;
    
    // Fetch connections
    const connectionsResponse = await axios.get(`/api/users/${user.id}/connections`);
    const connections = connectionsResponse.data.connections || [];
    
    // Update subtitle
    document.getElementById('network-subtitle').textContent = 
      `내 네트워크 - ${nodes.length}개 노드, ${connections.length}명 연결`;
    
    // Build network data from user perspective
    networkData = buildUserNetworkData(user, nodes, connections);
    
    // Render network
    renderNetwork(networkData);
    
  } catch (error) {
    console.error('Failed to load my network:', error);
    alert('네트워크 데이터를 불러오는데 실패했습니다.');
  }
}

// Build network data structure from node and members
function buildNetworkData(node, members) {
  const nodes = [];
  const links = [];
  
  // Add center node (the group/node itself)
  nodes.push({
    id: `node-${node.id}`,
    label: node.node_name,
    type: 'center',
    nodeType: node.node_type,
    memberCount: members.length,
    isExpanded: false,
    originalData: node
  });
  
  // Add member nodes
  members.forEach(member => {
    nodes.push({
      id: `user-${member.user_id}`,
      label: member.full_name || member.name || `User ${member.user_id}`,
      type: 'member',
      role: member.role,
      joinedAt: member.joined_at,
      isExpanded: false,
      originalData: member
    });
    
    // Add link from center to member
    links.push({
      source: `node-${node.id}`,
      target: `user-${member.user_id}`,
      type: 'membership'
    });
  });
  
  return { nodes, links };
}

// Build network data from user perspective
function buildUserNetworkData(user, nodes, connections) {
  const networkNodes = [];
  const networkLinks = [];
  
  // Add center node (current user)
  networkNodes.push({
    id: `user-${user.id}`,
    label: user.full_name || user.name,
    type: 'center',
    isExpanded: false,
    originalData: user
  });
  
  // Add node connections
  nodes.forEach(node => {
    networkNodes.push({
      id: `node-${node.id}`,
      label: node.node_name,
      type: 'node',
      nodeType: node.node_type,
      isExpanded: false,
      originalData: node
    });
    
    networkLinks.push({
      source: `user-${user.id}`,
      target: `node-${node.id}`,
      type: 'membership'
    });
  });
  
  // Add user connections
  connections.forEach(conn => {
    networkNodes.push({
      id: `user-${conn.id}`,
      label: conn.full_name || conn.name,
      type: 'member',
      isExpanded: false,
      originalData: conn
    });
    
    networkLinks.push({
      source: `user-${user.id}`,
      target: `user-${conn.id}`,
      type: 'connection'
    });
  });
  
  return { nodes: networkNodes, links: networkLinks };
}

// Render network visualization
function renderNetwork(data) {
  if (!networkSvg || !networkSimulation) return;
  
  const linksGroup = networkSvg.select('g.links');
  const nodesGroup = networkSvg.select('g.nodes');
  
  // Render links
  const link = linksGroup.selectAll('line')
    .data(data.links)
    .join('line')
    .attr('stroke', '#999')
    .attr('stroke-opacity', 0.6)
    .attr('stroke-width', 2)
    .attr('marker-end', 'url(#arrowhead)');
  
  // Render nodes
  const node = nodesGroup.selectAll('g')
    .data(data.nodes)
    .join('g')
    .attr('cursor', 'pointer')
    .call(drag(networkSimulation))
    .on('click', (event, d) => handleNodeClick(event, d))
    .on('mouseover', (event, d) => handleNodeHover(event, d))
    .on('mouseout', handleNodeOut);
  
  // Add circles
  node.selectAll('circle').remove();
  node.append('circle')
    .attr('r', d => d.type === 'center' ? 30 : 20)
    .attr('fill', d => getNodeColor(d))
    .attr('stroke', '#fff')
    .attr('stroke-width', 3)
    .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))');
  
  // Add labels
  node.selectAll('text').remove();
  node.append('text')
    .text(d => d.label)
    .attr('x', 0)
    .attr('y', d => d.type === 'center' ? 45 : 35)
    .attr('text-anchor', 'middle')
    .attr('font-size', d => d.type === 'center' ? '14px' : '12px')
    .attr('font-weight', d => d.type === 'center' ? 'bold' : 'normal')
    .attr('fill', '#333')
    .style('pointer-events', 'none');
  
  // Add icons
  node.selectAll('text.icon').remove();
  node.append('text')
    .attr('class', 'icon')
    .text(d => getNodeIcon(d))
    .attr('x', 0)
    .attr('y', 5)
    .attr('text-anchor', 'middle')
    .attr('font-size', d => d.type === 'center' ? '18px' : '14px')
    .style('pointer-events', 'none');
  
  // Update simulation
  networkSimulation
    .nodes(data.nodes)
    .on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
      
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });
  
  networkSimulation.force('link').links(data.links);
  networkSimulation.alpha(1).restart();
}

// Get node color based on type
function getNodeColor(node) {
  if (node.type === 'center') return '#3b82f6'; // Blue
  if (node.type === 'member') return '#10b981'; // Green
  if (node.type === 'node') return '#8b5cf6'; // Purple
  if (node.isExpanded) return '#f59e0b'; // Orange
  return '#6b7280'; // Gray
}

// Get node icon
function getNodeIcon(node) {
  if (node.type === 'center') return '⭐';
  if (node.type === 'node') {
    const typeIcons = {
      'school': '🎓',
      'company': '🏢',
      'club': '👥',
      'community': '💬',
      'fanclub': '⭐',
      'family': '👨‍👩‍👧‍👦'
    };
    return typeIcons[node.nodeType] || '📍';
  }
  if (node.role === 'admin') return '👑';
  if (node.role === 'moderator') return '⚡';
  return '👤';
}

// Handle node click - expand to show connections
async function handleNodeClick(event, clickedNode) {
  event.stopPropagation();
  
  // If already expanded, collapse
  if (clickedNode.isExpanded) {
    collapseNode(clickedNode);
    return;
  }
  
  // Mark as expanded
  clickedNode.isExpanded = true;
  
  // Load connections for this node
  if (clickedNode.type === 'member' || clickedNode.type === 'center') {
    await expandUserConnections(clickedNode);
  } else if (clickedNode.type === 'node') {
    await expandNodeMembers(clickedNode);
  }
  
  // Show info panel
  showNodeInfo(clickedNode);
}

// Expand user connections
async function expandUserConnections(userNode) {
  try {
    const userId = userNode.id.replace('user-', '');
    
    // Fetch user connections
    const response = await axios.get(`/api/users/${userId}/connections`);
    const connections = response.data.connections || [];
    
    // Add new nodes
    connections.forEach(conn => {
      const newNodeId = `user-${conn.id}`;
      
      // Check if node already exists
      if (!networkData.nodes.find(n => n.id === newNodeId)) {
        networkData.nodes.push({
          id: newNodeId,
          label: conn.full_name || conn.name,
          type: 'expanded',
          isExpanded: false,
          originalData: conn
        });
        
        // Add link
        networkData.links.push({
          source: userNode.id,
          target: newNodeId,
          type: 'connection'
        });
      }
    });
    
    // Re-render
    renderNetwork(networkData);
    
  } catch (error) {
    console.error('Failed to expand user connections:', error);
  }
}

// Expand node members
async function expandNodeMembers(node) {
  try {
    const nodeId = node.id.replace('node-', '');
    
    // Fetch node members
    const response = await axios.get(`/api/nodes/${nodeId}/members`);
    const members = response.data.members;
    
    // Add new nodes
    members.forEach(member => {
      const newNodeId = `user-${member.user_id}`;
      
      // Check if node already exists
      if (!networkData.nodes.find(n => n.id === newNodeId)) {
        networkData.nodes.push({
          id: newNodeId,
          label: member.full_name || member.name || `User ${member.user_id}`,
          type: 'expanded',
          role: member.role,
          isExpanded: false,
          originalData: member
        });
        
        // Add link
        networkData.links.push({
          source: node.id,
          target: newNodeId,
          type: 'membership'
        });
      }
    });
    
    // Re-render
    renderNetwork(networkData);
    
  } catch (error) {
    console.error('Failed to expand node members:', error);
  }
}

// Collapse node (remove expanded connections)
function collapseNode(node) {
  node.isExpanded = false;
  
  // Find and remove all nodes connected to this node that were expanded
  const connectedLinks = networkData.links.filter(l => 
    l.source.id === node.id || l.target.id === node.id
  );
  
  const connectedNodeIds = connectedLinks.map(l => 
    l.source.id === node.id ? l.target.id : l.source.id
  );
  
  // Remove expanded nodes (keep original members)
  networkData.nodes = networkData.nodes.filter(n => {
    if (n.type !== 'expanded') return true;
    if (!connectedNodeIds.includes(n.id)) return true;
    return false;
  });
  
  // Remove links to removed nodes
  const remainingNodeIds = networkData.nodes.map(n => n.id);
  networkData.links = networkData.links.filter(l => 
    remainingNodeIds.includes(l.source.id || l.source) && 
    remainingNodeIds.includes(l.target.id || l.target)
  );
  
  // Re-render
  renderNetwork(networkData);
}

// Handle node hover
function handleNodeHover(event, node) {
  d3.select(event.currentTarget)
    .select('circle')
    .transition()
    .duration(200)
    .attr('r', node.type === 'center' ? 35 : 25)
    .style('filter', 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))');
}

// Handle node out
function handleNodeOut(event) {
  d3.select(event.currentTarget)
    .select('circle')
    .transition()
    .duration(200)
    .attr('r', d => d.type === 'center' ? 30 : 20)
    .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))');
}

// Show node info panel
function showNodeInfo(node) {
  const panel = document.getElementById('node-info-panel');
  const nameEl = document.getElementById('info-name');
  const contentEl = document.getElementById('info-content');
  
  nameEl.textContent = node.label;
  
  let infoHTML = `<div class="space-y-2">`;
  
  if (node.type === 'center' || node.type === 'member' || node.type === 'expanded') {
    infoHTML += `<p><strong>타입:</strong> 사용자</p>`;
    if (node.role) {
      infoHTML += `<p><strong>역할:</strong> ${node.role}</p>`;
    }
    if (node.joinedAt) {
      infoHTML += `<p><strong>가입일:</strong> ${new Date(node.joinedAt).toLocaleDateString('ko-KR')}</p>`;
    }
  } else if (node.type === 'node') {
    infoHTML += `<p><strong>타입:</strong> ${node.nodeType}</p>`;
    if (node.memberCount) {
      infoHTML += `<p><strong>멤버:</strong> ${node.memberCount}명</p>`;
    }
  }
  
  infoHTML += `<p class="text-xs text-gray-400 mt-2">클릭하여 ${node.isExpanded ? '축소' : '확장'}하기</p>`;
  infoHTML += `</div>`;
  
  contentEl.innerHTML = infoHTML;
  panel.classList.remove('hidden');
}

// Close info panel
function closeInfoPanel() {
  document.getElementById('node-info-panel').classList.add('hidden');
}

// Reset network view
function resetNetworkView() {
  if (selectedNodeId) {
    loadNodeNetworkData(selectedNodeId);
  } else {
    loadMyNetworkData();
  }
}

// Center network view
function centerNetworkView() {
  if (!networkSvg) return;
  
  const container = document.getElementById('network-container');
  const width = container.clientWidth;
  const height = container.clientHeight;
  
  networkSvg.transition()
    .duration(750)
    .call(
      d3.zoom().transform,
      d3.zoomIdentity.translate(0, 0).scale(1)
    );
  
  // Re-center simulation
  networkSimulation
    .force('center', d3.forceCenter(width / 2, height / 2))
    .alpha(0.3)
    .restart();
}

// Drag behavior
function drag(simulation) {
  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }
  
  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }
  
  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }
  
  return d3.drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended);
}
