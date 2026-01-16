/**
 * 图操作工具
 *
 * 用于图数据操作、拓扑排序、循环检测等
 */

import type { GraphNode, GraphEdge } from '../types/graph'

// ============================================================================
// ID生成器
// ============================================================================

/**
 * ID生成器
 */
export class IdGenerator {
  private nodeIdCounter = 1
  private edgeIdCounter = 1

  /**
   * 生成节点ID
   */
  generateNodeId(): string {
    return `node_${this.nodeIdCounter++}`
  }

  /**
   * 生成边ID
   */
  generateEdgeId(): string {
    return `edge_${this.edgeIdCounter++}`
  }

  /**
   * 重置计数器
   * @param maxNodeId 最大节点ID（用于导入时）
   * @param maxEdgeId 最大边ID（用于导入时）
   */
  reset(maxNodeId: number = 0, maxEdgeId: number = 0): void {
    this.nodeIdCounter = maxNodeId + 1
    this.edgeIdCounter = maxEdgeId + 1
  }
}

// ============================================================================
// 图数据操作
// ============================================================================

/**
 * 添加节点到图
 * @param nodes 当前节点数组
 * @param node 要添加的节点
 * @returns 更新后的节点数组
 */
export const addNode = (nodes: GraphNode[], node: GraphNode): GraphNode[] => {
  return [...nodes, node]
}

/**
 * 删除节点及其相关连线
 * @param nodes 当前节点数组
 * @param edges 当前连线数组
 * @param nodeId 要删除的节点ID
 * @returns 更新后的节点和连线数组
 */
export const deleteNode = (
  nodes: GraphNode[],
  edges: GraphEdge[],
  nodeId: string,
): { nodes: GraphNode[]; edges: GraphEdge[] } => {
  // 删除节点
  const filteredNodes = nodes.filter(n => n.id !== nodeId)

  // 删除相关连线
  const filteredEdges = edges.filter(
    e => e.source !== nodeId && e.target !== nodeId
  )

  return { nodes: filteredNodes, edges: filteredEdges }
}

/**
 * 更新节点
 * @param nodes 当前节点数组
 * @param nodeId 节点ID
 * @param data 更新数据
 * @returns 更新后的节点数组
 */
export const updateNode = (
  nodes: GraphNode[],
  nodeId: string,
  data: Partial<GraphNode['data']>,
): GraphNode[] => {
  return nodes.map(n => {
    if (n.id === nodeId) {
      return {
        ...n,
        data: { ...n.data, ...data },
      }
    }
    return n
  })
}

/**
 * 添加连线到图
 * @param edges 当前连线数组
 * @param edge 要添加的连线
 * @returns 更新后的连线数组
 */
export const addEdge = (edges: GraphEdge[], edge: GraphEdge): GraphEdge[] => {
  // 检查是否已存在相同连线
  const exists = edges.some(
    e => e.source === edge.source && e.target === edge.target
  )

  if (exists) {
    return edges
  }

  return [...edges, edge]
}

/**
 * 删除连线
 * @param edges 当前连线数组
 * @param edgeId 要删除的连线ID
 * @returns 更新后的连线数组
 */
export const deleteEdge = (edges: GraphEdge[], edgeId: string): GraphEdge[] => {
  return edges.filter(e => e.id !== edgeId)
}

/**
 * 检测孤立节点（无任何连线的节点）
 * @param nodes 节点数组
 * @param edges 连线数组
 * @returns 孤立节点ID数组
 */
export const findOrphanNodes = (
  nodes: GraphNode[],
  edges: GraphEdge[],
): string[] => {
  const connectedNodeIds = new Set<string>()

  for (const edge of edges) {
    connectedNodeIds.add(edge.source)
    connectedNodeIds.add(edge.target)
  }

  return nodes.filter(n => !connectedNodeIds.has(n.id)).map(n => n.id)
}
