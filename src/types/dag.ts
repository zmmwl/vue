// DAG 节点类型
export type NodeType = 'task' | 'condition' | 'start' | 'end' | 'subflow';

// 节点数据接口
export interface NodeData {
  label: string;
  type: NodeType;
  description?: string;
  config?: Record<string, any>;
}

// 边数据接口
export interface EdgeData {
  label?: string;
  condition?: string;
}

// DAG 图定义
export interface DagGraph {
  nodes: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    data: NodeData;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    type: string;
    data?: EdgeData;
  }>;
}

// 可拖拽的节点模板
export interface NodeTemplate {
  type: NodeType;
  label: string;
  description: string;
  icon?: string;
  defaultConfig?: Record<string, any>;
}
