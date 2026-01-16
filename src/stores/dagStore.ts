/**
 * DAG状态管理Store
 *
 * 管理多个图的状态、节点和边的CRUD操作
 * 扩展现有dagStore以支持多图和验证
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GraphNode, GraphEdge } from '../types/graph'
import { IdGenerator, addNode, deleteNode, updateNode, addEdge, deleteEdge, findOrphanNodes } from '../utils/graph'
import { validateTaskGraph } from '../types/validation'
import { graphToJson, downloadJsonFile, generateFilename, importGraph } from '../utils/export'

/**
 * 图状态
 */
interface GraphState {
  id: string
  nodes: GraphNode[]
  edges: GraphEdge[]
  name: string
  isDirty: boolean
}

/**
 * DAG Store
 */
export const useDagStore = defineStore('dag', () => {
  // 所有图状态的Map
  const graphs = ref<Map<string, GraphState>>(new Map())

  // ID生成器
  const idGenerator = new IdGenerator()

  // 当前激活的图ID（从tabStore获取）
  const activeGraphId = ref<string>('')

  // 当前选中的节点ID
  const selectedNodeId = ref<string>('')

  /**
   * 获取当前激活的图状态
   */
  const currentGraph = computed<GraphState | null>(() => {
    if (!activeGraphId.value) return null
    return graphs.value.get(activeGraphId.value) || null
  })

  /**
   * 获取当前图的节点
   */
  const nodes = computed<GraphNode[]>(() => {
    return currentGraph.value?.nodes || []
  })

  /**
   * 获取当前图的连线
   */
  const edges = computed<GraphEdge[]>(() => {
    return currentGraph.value?.edges || []
  })

  /**
   * 初始化新图
   */
  const initializeGraph = (graphId: string, name?: string): void => {
    graphs.value.set(graphId, {
      id: graphId,
      name: name || `任务图 ${graphs.value.size + 1}`,
      nodes: [],
      edges: [],
      isDirty: false,
    })
  }

  /**
   * 删除图
   */
  const deleteGraph = (graphId: string): void => {
    graphs.value.delete(graphId)

    // 如果删除的是当前激活的图，清空activeGraphId
    if (activeGraphId.value === graphId) {
      activeGraphId.value = ''
    }
  }

  /**
   * 添加节点
   */
  const addNodeToGraph = (
    type: string,
    position: { x: number; y: number },
    data: Record<string, unknown>,
    graphId?: string,
  ): GraphNode => {
    const targetGraphId = graphId || activeGraphId.value
    const graph = graphs.value.get(targetGraphId)

    if (!graph) {
      throw new Error(`图 ${targetGraphId} 不存在`)
    }

    const newNode: GraphNode = {
      id: idGenerator.generateNodeId(),
      type,
      position,
      data,
    }

    graph.nodes = addNode(graph.nodes, newNode)
    graph.isDirty = true

    return newNode
  }

  /**
   * 删除节点
   */
  const deleteNodeFromGraph = (nodeId: string): void => {
    const graphId = activeGraphId.value
    const graph = graphs.value.get(graphId)

    if (!graph) {
      return
    }

    const { nodes: newNodes, edges: newEdges } = deleteNode(
      graph.nodes,
      graph.edges,
      nodeId,
    )

    graph.nodes = newNodes
    graph.edges = newEdges
    graph.isDirty = true
  }

  /**
   * 更新节点
   */
  const updateNodeInGraph = (
    nodeId: string,
    data: Partial<GraphNode['data']>,
  ): void => {
    const graphId = activeGraphId.value
    const graph = graphs.value.get(graphId)

    if (!graph) {
      return
    }

    graph.nodes = updateNode(graph.nodes, nodeId, data)
    graph.isDirty = true
  }

  /**
   * 添加连线
   */
  const addConnectionToGraph = (
    source: string,
    target: string,
    data?: Record<string, unknown>,
    graphId?: string,
  ): GraphEdge => {
    const targetGraphId = graphId || activeGraphId.value
    const graph = graphs.value.get(targetGraphId)

    if (!graph) {
      throw new Error(`图 ${targetGraphId} 不存在`)
    }

    const newEdge: GraphEdge = {
      id: idGenerator.generateEdgeId(),
      source,
      target,
      data,
    }

    graph.edges = addEdge(graph.edges, newEdge)
    graph.isDirty = true

    return newEdge
  }

  /**
   * 删除连线
   */
  const deleteConnectionFromGraph = (edgeId: string): void => {
    const graphId = activeGraphId.value
    const graph = graphs.value.get(graphId)

    if (!graph) {
      return
    }

    graph.edges = deleteEdge(graph.edges, edgeId)
    graph.isDirty = true
  }

  /**
   * 导出当前图为JSON
   */
  const exportCurrentGraph = (): void => {
    const graph = currentGraph.value

    if (!graph) {
      return
    }

    // 从图中提取参与方（节点数据的participantId）
    const participants = Array.from(
      new Set(graph.nodes.map(n => (n.data as any)?.participantId || '').filter(p => p))
    ).map(p => ({ id: p, name: `参与方${p}` }))

    const json = graphToJson(
      graph.nodes,
      graph.edges,
      participants,
      graph.id,
      graph.name,
    )

    const filename = generateFilename(graph.name)
    downloadJsonFile(json, filename)

    graph.isDirty = false
  }

  /**
   * 导入JSON数据到新图
   */
  const importGraphData = (
    jsonData: unknown,
    newGraphName: string,
  ): { graphId: string; success: boolean; errors?: string[] } => {
    const { validation, graphData } = importGraph(jsonData)

    if (!validation.valid) {
      return {
        graphId: '',
        success: false,
        errors: validation.errors.map(e => `${e.path}: ${e.message}`),
      }
    }

    // 创建新图
    const graphId = idGenerator.generateNodeId().replace('node_', 'graph_')
    const { elements = [], connections = [] } = graphData as any

    graphs.value.set(graphId, {
      id: graphId,
      name: newGraphName,
      nodes: elements,
      edges: connections,
      isDirty: false,
    })

    return {
      graphId,
      success: true,
    }
  }

  /**
   * 验证当前图
   */
  const validateCurrentGraph = () => {
    const graph = currentGraph.value
    if (!graph) return null

    return validateTaskGraph({
      nodes: graph.nodes,
      edges: graph.edges,
    })
  }

  /**
   * 检测孤立节点
   */
  const findOrphanNodesInCurrentGraph = (): string[] => {
    const graph = currentGraph.value
    if (!graph) return []

    return findOrphanNodes(graph.nodes, graph.edges)
  }

  return {
    graphs,
    activeGraphId,
    selectedNodeId,
    currentGraph,
    nodes,
    edges,
    initializeGraph,
    deleteGraph,
    addNodeToGraph,
    deleteNodeFromGraph,
    updateNodeInGraph,
    addConnectionToGraph,
    deleteConnectionFromGraph,
    exportCurrentGraph,
    importGraphData,
    validateCurrentGraph,
    findOrphanNodesInCurrentGraph,
    setActiveGraphId: (id: string) => {
      activeGraphId.value = id
    },
    setSelectedNodeId: (id: string) => {
      selectedNodeId.value = id
    },
  }
})