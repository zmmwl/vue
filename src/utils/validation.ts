/**
 * 任务图验证逻辑
 *
 * 用于JSON导入验证、图数据完整性检查、连接规则验证
 */

import type {
  TaskGraphSchema,
  CanvasElementSchema,
  ConnectionSchema,
  ValidationResult,
  ErrorCode,
} from '../types/validation'
import { ERROR_CODES, getErrorMessage } from '../types/validation'

import type { GraphNode, GraphEdge } from '../types/graph'

// ============================================================================
// 拓扑排序和循环检测
// ============================================================================

/**
 * 拓扑排序结果
 */
interface TopologicalSortResult {
  order: string[]
  hasCycle: boolean
  cycle?: string[]
}

/**
 * 执行拓扑排序
 * 基于Kahn算法
 */
export const topologicalSort = (edges: GraphEdge[]): TopologicalSortResult => {
  const adjacency = new Map<string, string[]>()
  const inDegree = new Map<string, number>()
  const nodes = new Set<string>()

  for (const edge of edges) {
    nodes.add(edge.source)
    nodes.add(edge.target)

    if (!adjacency.has(edge.source)) {
      adjacency.set(edge.source, [])
    }
    adjacency.get(edge.source)!.push(edge.target)

    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1)
    if (!inDegree.has(edge.source)) {
      inDegree.set(edge.source, 0)
    }
  }

  const queue: string[] = []
  inDegree.forEach((deg, nodeId) => {
    if (deg === 0) {
      queue.push(nodeId)
    }
  })

  const order: string[] = []
  const visited = new Set<string>()

  while (queue.length > 0) {
    const node = queue.shift()!
    if (visited.has(node)) {
      continue
    }

    visited.add(node)
    order.push(node)

    const neighbors = adjacency.get(node) || []
    for (const neighbor of neighbors) {
      const newDegree = (inDegree.get(neighbor) || 0) - 1
      inDegree.set(neighbor, newDegree)

      if (newDegree === 0) {
        queue.push(neighbor)
      }
    }
  }

  const hasCycle = order.length !== nodes.size

  const cycle: string[] = []
  if (hasCycle) {
    const candidates: string[] = []
    inDegree.forEach((deg, nodeId) => {
      const outDegree = adjacency.get(nodeId)?.length || 0
      if (deg === outDegree && outDegree > 0) {
        candidates.push(nodeId)
      }
    })

    if (candidates.length > 0) {
      cycle.push(candidates[0])
    }
  }

  return { order, hasCycle, cycle }
}

// ============================================================================
// 连接规则验证
// ============================================================================

/**
 * 验证连线规则
 */
export const validateConnections = (
  nodes: GraphNode[],
  edges: GraphEdge[]
): ValidationResult => {
  const errors: Array<{ path: string; message: string; code: string }> = []

  const nodeMap = new Map(nodes.map(n => [n.id, n]))

  for (const edge of edges) {
    if (!nodeMap.has(edge.source)) {
      errors.push({
        path: `edges.${edge.id}.source`,
        message: `源节点 ${edge.source} 不存在`,
        code: ERROR_CODES.SOURCE_NODE_NOT_FOUND,
      })
    }

    if (!nodeMap.has(edge.target)) {
      errors.push({
        path: `edges.${edge.id}.target`,
        message: `目标节点 ${edge.target} 不存在`,
        code: ERROR_CODES.TARGET_NODE_NOT_FOUND,
      })
    }
  }

  for (const edge of edges) {
    if (edge.source === edge.target) {
      errors.push({
        path: `edges.${edge.id}`,
        message: '连线不能连接到自身',
        code: ERROR_CODES.SELF_CONNECTION,
      })
    }
  }

  for (const edge of edges) {
    const sourceNode = nodeMap.get(edge.source)
    const targetNode = nodeMap.get(edge.target)

    if (sourceNode?.type === 'data' && targetNode?.type === 'data') {
      errors.push({
        path: `edges.${edge.id}`,
        message: '数据资源节点不能作为连线目标',
        code: ERROR_CODES.INVALID_DATA_RESOURCE_TARGET,
      })
    }
  }

  for (const edge of edges) {
    const sourceNode = nodeMap.get(edge.source)
    const targetNode = nodeMap.get(edge.target)

    if (sourceNode?.data?.taskType === 'data-export' && targetNode?.data?.taskType === 'data-export') {
      errors.push({
        path: `edges.${edge.id}`,
        message: '数据导出任务不能作为连线起点',
        code: ERROR_CODES.INVALID_EXPORT_TASK_SOURCE,
      })
    }
  }

  const { hasCycle } = topologicalSort(edges)
  if (hasCycle) {
    errors.push({
      path: 'edges',
      message: '图中存在循环依赖',
      code: ERROR_CODES.CIRCULAR_DEPENDENCY,
    })
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// ============================================================================
// 节点验证
// ============================================================================

/**
 * 验证节点规则
 */
export const validateNodes = (nodes: GraphNode[]): ValidationResult => {
  const errors: Array<{ path: string; message: string; code: string }> = []

  const nodeIds = new Set<string>()
  for (const node of nodes) {
    if (nodeIds.has(node.id)) {
      errors.push({
        path: `nodes.${node.id}.id`,
        message: `节点ID ${node.id} 重复`,
        code: ERROR_CODES.DUPLICATE_NODE_ID,
      })
    }
    nodeIds.add(node.id)
  }

  const nodeIdPattern = /^node_\d+|^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i
  for (const node of nodes) {
    if (!nodeIdPattern.test(node.id)) {
      errors.push({
        path: `nodes.${node.id}.id`,
        message: `节点ID格式无效：${node.id}`,
        code: ERROR_CODES.INVALID_NODE_ID_FORMAT,
      })
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// ============================================================================
// 完整图验证
// ============================================================================

/**
 * 验证任务图的完整性
 */
export const validateGraph = (
  nodes: GraphNode[],
  edges: GraphEdge[]
): ValidationResult => {
  const errors: Array<{ path: string; message: string; code: string }> = []

  const hasDataResource = nodes.some(n => n.type === 'data')
  if (!hasDataResource) {
    errors.push({
      path: 'nodes',
      message: '任务图必须包含至少一个数据资源',
      code: ERROR_CODES.MISSING_DATA_RESOURCE,
    })
  }

  const hasComputeTask = nodes.some(n => n.type === 'compute')
  if (!hasComputeTask) {
    errors.push({
      path: 'nodes',
      message: '任务图必须包含至少一个计算任务',
      code: ERROR_CODES.MISSING_COMPUTE_TASK,
    })
  }

  const nodeParticipants = new Set(nodes.map(n => n.data?.participantId || '').filter(p => p))
  const requiredParticipants = new Set<string>()

  nodes.forEach(n => {
    if (n.type === 'data') {
      requiredParticipants.add((n.data as any)?.source || '')
    }
    if (n.type === 'compute-resource') {
      requiredParticipants.add((n.data as any)?.participantId || '')
    }
  })

  requiredParticipants.forEach(p => {
    if (p && !nodeParticipants.has(p)) {
      errors.push({
        path: 'nodes',
        message: `孤立参与方：${p}`,
        code: ERROR_CODES.ORPHAN_PARTICIPANT,
      })
    }
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}
