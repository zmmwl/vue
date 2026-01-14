import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { DagGraph, NodeData, EdgeData } from '../types/dag';
import type { Edge, Node, Connection } from '@vue-flow/core';

export const useDagStore = defineStore('dag', () => {
  // 节点和边
  const nodes = ref<Node[]>([]);
  const edges = ref<Edge[]>([]);

  // 节点ID计数器
  let nodeIdCounter = 1;
  let edgeIdCounter = 1;

  // 生成唯一ID
  const generateNodeId = () => `node_${nodeIdCounter++}`;
  const generateEdgeId = () => `edge_${edgeIdCounter++}`;

  // 添加节点
  const addNode = (type: string, position: { x: number; y: number }, data: NodeData) => {
    const id = generateNodeId();
    const newNode: Node = {
      id,
      type,
      position,
      data: {
        ...data,
        label: data.label || `Node ${nodeIdCounter - 1}`,
      },
    };
    nodes.value.push(newNode);
    return newNode;
  };

  // 删除节点
  const removeNode = (nodeId: string) => {
    const index = nodes.value.findIndex((n) => n.id === nodeId);
    if (index !== -1) {
      nodes.value.splice(index, 1);
    }
    // 删除相关的边
    edges.value = edges.value.filter((e) => e.source !== nodeId && e.target !== nodeId);
  };

  // 更新节点
  const updateNode = (nodeId: string, data: Partial<NodeData>) => {
    const node = nodes.value.find((n) => n.id === nodeId);
    if (node) {
      node.data = { ...node.data, ...data };
    }
  };

  // 添加连接（边）
  const addConnection = (connection: Connection) => {
    if (!connection.source || !connection.target) return;

    const newEdge: Edge = {
      id: generateEdgeId(),
      source: connection.source,
      target: connection.target,
      type: 'default',
      animated: true,
      data: connection.data as EdgeData,
    };
    edges.value.push(newEdge);
    return newEdge;
  };

  // 删除边
  const removeEdge = (edgeId: string) => {
    const index = edges.value.findIndex((e) => e.id === edgeId);
    if (index !== -1) {
      edges.value.splice(index, 1);
    }
  };

  // 导出为JSON
  const exportToJson = (): DagGraph => {
    return {
      nodes: nodes.value.map((node) => ({
        id: node.id,
        type: node.type || 'default',
        position: node.position,
        data: node.data as NodeData,
      })),
      edges: edges.value.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type || 'default',
        data: edge.data as EdgeData,
      })),
    };
  };

  // 从JSON导入
  const importFromJson = (graph: DagGraph) => {
    nodes.value = graph.nodes.map((node) => ({
      ...node,
      id: node.id,
    }));

    edges.value = graph.edges.map((edge) => ({
      ...edge,
      id: edge.id,
    }));

    // 更新计数器
    const maxNodeId = graph.nodes.reduce((max, node) => {
      const num = parseInt(node.id.replace('node_', ''));
      return num > max ? num : max;
    }, 0);
    nodeIdCounter = maxNodeId + 1;

    const maxEdgeId = graph.edges.reduce((max, edge) => {
      const num = parseInt(edge.id.replace('edge_', ''));
      return num > max ? num : max;
    }, 0);
    edgeIdCounter = maxEdgeId + 1;
  };

  // 清空画布
  const clearCanvas = () => {
    nodes.value = [];
    edges.value = [];
    nodeIdCounter = 1;
    edgeIdCounter = 1;
  };

  // 获取图数据（用于VueFlow）
  const graphData = computed(() => ({
    nodes: nodes.value,
    edges: edges.value,
  }));

  return {
    nodes,
    edges,
    graphData,
    addNode,
    removeNode,
    updateNode,
    addConnection,
    removeEdge,
    exportToJson,
    importFromJson,
    clearCanvas,
  };
});
