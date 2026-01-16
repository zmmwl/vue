/**
 * 图结构类型定义
 *
 * 用于节点、边、图数据结构的类型定义
 */

/**
 * 位置坐标
 */
export interface Position {
  x: number
  y: number
}

/**
 * 元素尺寸
 */
export interface Size {
  width: number
  height: number
}

/**
 * 元素状态
 */
export interface ElementState {
  selected: boolean
  disabled: boolean
  showConnectionPoints: boolean
}

/**
 * 泳道信息
 */
export interface Swimlane {
  id: string
  name: string
  width: number
  color?: string
}

/**
 * 图节点（Vue Flow格式）
 */
export interface GraphNode {
  id: string
  type: string
  position: Position
  data: Record<string, unknown>
}

/**
 * 图边（Vue Flow格式）
 */
export interface GraphEdge {
  id: string
  source: string
  target: string
  type?: string
  sourceHandle?: string
  targetHandle?: string
  data?: Record<string, unknown>
}

/**
 * 图数据结构
 */
export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

/**
 * 拖拽开始事件
 */
export interface DragStartEvent {
  resourceType: 'data' | 'compute' | 'model' | 'compute-resource'
  resourceId: string
  startPosition: { x: number; y: number }
}
