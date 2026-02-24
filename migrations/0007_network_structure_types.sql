-- Migration: Network Structure Types (관계망 구조 타입)
-- 4가지 관계망 유형: 가계도, 일반 네트워크, 위계적 수직, 계층적 수직

-- 1. 관계망 구조 타입 테이블
CREATE TABLE IF NOT EXISTS network_structure_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  name_ko TEXT NOT NULL,
  description TEXT,
  graph_type TEXT NOT NULL CHECK(graph_type IN ('tree', 'dag', 'graph')),
  
  -- 구조 특성
  is_directed INTEGER DEFAULT 1,  -- 방향성 (1: 단방향, 0: 양방향)
  allows_cycles INTEGER DEFAULT 0,  -- 사이클 허용 여부
  max_parents INTEGER DEFAULT 1,  -- 최대 부모 노드 수 (-1: 무제한)
  requires_root INTEGER DEFAULT 0,  -- 루트 노드 필수 여부
  
  -- 연결 규칙
  connection_rule TEXT,  -- JSON: 연결 규칙 설명
  validation_rules TEXT,  -- JSON: 검증 규칙
  
  -- UI 설정
  visualization_type TEXT DEFAULT 'hierarchical' CHECK(visualization_type IN ('hierarchical', 'network', 'radial', 'tree')),
  default_layout TEXT,  -- JSON: 기본 레이아웃 설정
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. 기본 네트워크 구조 타입 삽입
INSERT OR IGNORE INTO network_structure_types 
  (id, name, name_ko, description, graph_type, is_directed, allows_cycles, max_parents, requires_root, connection_rule, visualization_type) 
VALUES
  -- 01. 가계도 (Family Tree)
  (1, 'family_tree', '가계도', 
   '혈연 관계 중심의 세대별 수직 구조. 부모→자녀 단방향 연결, 사이클 없음',
   'tree', 1, 0, 2, 1,
   '{"rule": "parent_to_child", "direction": "top_to_bottom", "max_parents": 2, "allows_siblings": true}',
   'tree'),
   
  -- 02. 일반 네트워크 (Social Network)
  (2, 'social_network', '일반 네트워크',
   '지인의 지인으로 확장되는 자유로운 수평 연결. 양방향 자유 연결',
   'graph', 0, 1, -1, 0,
   '{"rule": "free_connection", "direction": "bidirectional", "max_connections": -1}',
   'network'),
   
  -- 03. 위계적 수직 관계도 (School Network)
  (3, 'hub_network', '위계적 수직 관계도',
   '중심 인물을 통한 수직적 연결. 중심→모든 말단 연결',
   'dag', 1, 0, 1, 1,
   '{"rule": "hub_to_spoke", "direction": "center_to_edge", "requires_hub": true, "max_depth": 2}',
   'radial'),
   
  -- 04. 계층적 수직 관계도 (Organization Chart)
  (4, 'org_chart', '계층적 수직 관계도',
   '명확한 계층과 권한 체계를 가진 수직 구조. 상위→하위 단방향, 부모 1개',
   'tree', 1, 0, 1, 1,
   '{"rule": "hierarchical", "direction": "top_to_bottom", "max_parents": 1, "strict_levels": true}',
   'hierarchical');

-- 3. nodes 테이블에 network_structure_type_id 추가
ALTER TABLE nodes ADD COLUMN network_structure_type_id INTEGER DEFAULT 2;

-- 4. 기존 노드 타입과 네트워크 구조 매핑
UPDATE nodes SET network_structure_type_id = 1 WHERE node_type_id = 1;  -- family → family_tree
UPDATE nodes SET network_structure_type_id = 3 WHERE node_type_id = 2;  -- school → hub_network
UPDATE nodes SET network_structure_type_id = 4 WHERE node_type_id = 3;  -- company → org_chart
UPDATE nodes SET network_structure_type_id = 2 WHERE node_type_id IN (4, 5, 6);  -- club, community, fanclub → social_network

-- 5. 관계 연결 제약 검증 함수용 테이블
CREATE TABLE IF NOT EXISTS node_connection_validations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_node_id INTEGER NOT NULL,
  to_node_id INTEGER NOT NULL,
  connection_type TEXT NOT NULL,
  is_valid INTEGER DEFAULT 1,
  validation_errors TEXT,  -- JSON: 검증 오류 목록
  validated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (from_node_id) REFERENCES nodes(id) ON DELETE CASCADE,
  FOREIGN KEY (to_node_id) REFERENCES nodes(id) ON DELETE CASCADE
);

-- 6. 노드 레벨/계층 정보 테이블
CREATE TABLE IF NOT EXISTS node_hierarchy_levels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  node_id INTEGER NOT NULL,
  membership_id INTEGER NOT NULL,
  level INTEGER NOT NULL DEFAULT 0,  -- 0: root, 1: level 1, ...
  parent_membership_id INTEGER,
  path TEXT,  -- 예: "/1/3/7" (루트부터 현재까지의 경로)
  depth INTEGER DEFAULT 0,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE,
  FOREIGN KEY (membership_id) REFERENCES node_memberships(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_membership_id) REFERENCES node_memberships(id) ON DELETE SET NULL,
  
  UNIQUE(node_id, membership_id)
);

-- 7. 관계망 연결 규칙 로그
CREATE TABLE IF NOT EXISTS network_connection_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  node_id INTEGER NOT NULL,
  structure_type_id INTEGER NOT NULL,
  action TEXT NOT NULL,  -- 'connect', 'disconnect', 'validate', 'reject'
  from_user_id INTEGER,
  to_user_id INTEGER,
  connection_data TEXT,  -- JSON: 연결 상세 정보
  is_valid INTEGER DEFAULT 1,
  error_message TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE,
  FOREIGN KEY (structure_type_id) REFERENCES network_structure_types(id),
  FOREIGN KEY (from_user_id) REFERENCES users(id),
  FOREIGN KEY (to_user_id) REFERENCES users(id)
);

-- 8. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_nodes_structure_type ON nodes(network_structure_type_id);
CREATE INDEX IF NOT EXISTS idx_node_hierarchy_node ON node_hierarchy_levels(node_id);
CREATE INDEX IF NOT EXISTS idx_node_hierarchy_membership ON node_hierarchy_levels(membership_id);
CREATE INDEX IF NOT EXISTS idx_node_hierarchy_parent ON node_hierarchy_levels(parent_membership_id);
CREATE INDEX IF NOT EXISTS idx_network_logs_node ON network_connection_logs(node_id);
CREATE INDEX IF NOT EXISTS idx_network_logs_structure ON network_connection_logs(structure_type_id);
