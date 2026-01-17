<template>
  <div
    class="dag-canvas"
    @drop="onDrop"
    @dragover="onDragOver"
  >
    <!-- 泳道背景 -->
    <Swimlane :height="canvasHeight" :width="canvasWidth" />

    <!-- Vue Flow 画布 -->
    <VueFlow
      v-model:nodes="nodes"
      v-model:edges="edges"
      :node-types="nodeTypes"
      :edge-types="edgeTypes"
      :default-viewport="defaultViewport"
      :min-zoom="0.1"
      :max-zoom="2"
      :fit-view-on-init="false"
      :nodes-connectable="true"
      :nodes-draggable="true"
      :elements-selectable="true"
      :pan-on-scroll="false"
      :selection-pan-on-drag="true"
      @node-click="onNodeClick"
      @connect="onConnect"
      @nodes-change="onNodesChange"
      @edges-change="onEdgesChange"
    >
      <!-- 背景网格 -->
      <Background pattern="dots" :gap="24" :size="1" />

      <!-- 连线箭头定义 -->
      <svg style="position: absolute; width: 0; height: 0; overflow: hidden;">
        <defs>
          <!-- 箭头标记（用于输出） -->
          <marker
            id="arrowhead"
            markerWidth="12"
            markerHeight="12"
            refX="10"
            refY="6"
            orient="auto"
          >
            <polygon points="0 0, 12 6, 0 12" fill="#555" />
          </marker>
          <!-- 梯形标记（用于输入） -->
          <marker
            id="trapezoid"
            markerWidth="14"
            markerHeight="12"
            refX="12"
            refY="6"
            orient="auto"
          >
            <polygon points="0 0, 14 3, 14 9, 0 12" fill="#555" />
          </marker>
        </defs>
      </svg>

      <!-- 控制面板（缩放等） -->
      <Controls />
    </VueFlow>

    <!-- 空状态提示 -->
    <div v-if="nodes.length === 0" class="empty-state">
      <div class="empty-icon">📊</div>
      <div class="empty-title">开始创建任务图</div>
      <div class="empty-description">
        从左侧资源库拖拽元素到画布中开始编排
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VueFlow, type Node, type Edge, type NodeChange, type EdgeChange, useVueFlow, Position } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import type { Connection } from '@vue-flow/core'
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useDagStore } from '../../stores/dagStore'
import Swimlane from './Swimlane.vue'
import DataResourceNode from '../nodes/DataResourceNode.vue'
import ComputeTaskNode from '../nodes/ComputeTaskNode.vue'
import ModelResourceNode from '../nodes/ModelResourceNode.vue'
import ComputeResourceNode from '../nodes/ComputeResourceNode.vue'

// 导入 VueFlow 样式
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'

interface Props {
  graphId?: string
}

const props = withDefaults(defineProps<Props>(), {
  graphId: '',
})

const dagStore = useDagStore()
const { viewport } = useVueFlow()

const canvasWidth = ref(1200)
const canvasHeight = ref(800)

// 自定义节点类型（使用 as any 来绕过类型检查）
const nodeTypes = {
  dataResource: DataResourceNode as any,
  computeTask: ComputeTaskNode as any,
  modelResource: ModelResourceNode as any,
  computeResource: ComputeResourceNode as any,
}

// 自定义边类型（目前使用默认类型）
const edgeTypes = {}

// 默认视口
const defaultViewport = { x: 0, y: 0, zoom: 1 }

// 当前图的节点和边
const currentGraph = computed(() => {
  if (props.graphId) {
    return dagStore.graphs.get(props.graphId)
  }
  return dagStore.currentGraph
})

const nodes = computed<Node[]>(() => {
  const graph = currentGraph.value
  if (!graph) return []
  return graph.nodes.map(n => {
    const nodeType = getNodeType(n.type)
    const isComputeTask = nodeType === 'computeTask'

    return {
      id: n.id,
      type: nodeType,
      position: { x: n.position.x, y: n.position.y },
      data: n.data,
      // 为计算任务节点设置默认的连接点位置
      targetPosition: isComputeTask ? Position.Top : undefined,
      sourcePosition: isComputeTask ? Position.Bottom : undefined,
    }
  })
})

const edges = computed<Edge[]>(() => {
  const graph = currentGraph.value
  if (!graph) return []
  return graph.edges.map(e => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: 'default',
    markerEnd: getMarkerEnd((e.data?.sourceMarker as string) || 'arrow'),
    animated: Boolean(e.data?.animated),
  }))
})

// 节点类型映射
const getNodeType = (type: string) => {
  const typeMap: Record<string, string> = {
    data: 'dataResource',
    compute: 'computeTask',
    model: 'modelResource',
    'compute-resource': 'computeResource',
  }
  return typeMap[type] || 'default'
}

// 获取连线端点标记
const getMarkerEnd = (markerType?: string): string => {
  if (!markerType) return 'url(#arrowhead)'
  return markerType === 'trapezoid' ? 'url(#trapezoid)' : 'url(#arrowhead)'
}

// 节点点击
const onNodeClick = (event: { node: Node }) => {
  console.log('Node clicked:', event.node)
  // 设置选中的节点ID，属性面板会自动更新
  dagStore.setSelectedNodeId(event.node.id)
}

// 创建连线
const onConnect = (connection: Connection) => {
  console.log('onConnect triggered:', connection)

  if (!connection.source || !connection.target) {
    console.warn('Invalid connection: missing source or target')
    return
  }

  // 验证连线规则
  const targetNode = nodes.value.find(n => n.id === connection.target)
  console.log('Target node:', targetNode)

  // 不能连接到自身
  if (connection.source === connection.target) {
    console.warn('不能连接到自身')
    return
  }

  // 数据资源不能作为目标
  if (targetNode?.type === 'dataResource') {
    console.warn('数据资源不能作为连线目标')
    return
  }

  // 添加连线
  console.log('Adding connection:', {
    source: connection.source,
    target: connection.target,
    graphId: props.graphId
  })

  dagStore.addConnectionToGraph(
    connection.source,
    connection.target,
    {
      sourceMarker: 'arrow',
      targetMarker: 'trapezoid',
      connectionType: 'data',
      animated: true,
    },
    props.graphId
  )
}

// 节点变化
const onNodesChange = (changes: NodeChange[]) => {
  for (const change of changes) {
    if (change.type === 'remove') {
      dagStore.deleteNodeFromGraph(change.id, props.graphId)
    } else if (change.type === 'position' && change.position) {
      // 更新节点位置到 store
      const targetGraphId = props.graphId || dagStore.activeGraphId
      const graph = targetGraphId ? dagStore.graphs.get(targetGraphId) : null
      if (graph) {
        const node = graph.nodes.find(n => n.id === change.id)
        if (node) {
          node.position = { x: change.position.x, y: change.position.y }
          graph.isDirty = true
        }
      }
    }
  }
}

// 边变化
const onEdgesChange = (changes: EdgeChange[]) => {
  for (const change of changes) {
    if (change.type === 'remove') {
      dagStore.deleteConnectionFromGraph(change.id)
    }
  }
}

// 拖拽放置（从资源库拖拽到画布）
const onDrop = (event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()

  console.log('DagCanvas - Drop event triggered')

  // 获取当前图的 ID
  const targetGraphId = props.graphId || dagStore.activeGraphId

  // 检查是否有活动的图
  if (!targetGraphId) {
    console.warn('DagCanvas - No active graph, please create a task graph first')
    ElMessage.warning('请先创建任务图再拖拽节点')
    return
  }

  // 从 dataTransfer 获取节点模板数据
  const templateData = event.dataTransfer?.getData('application/vueflow')
  console.log('DagCanvas - Template data:', templateData)

  if (!templateData) {
    console.warn('DagCanvas - No drag data found')
    return
  }

  try {
    const template = JSON.parse(templateData)
    console.log('DagCanvas - Parsed template:', template)

    // 获取画布位置并计算相对于 VueFlow 的坐标
    // 需要考虑 viewport 的变换（平移和缩放）
    const canvasRect = (event.currentTarget as HTMLElement).getBoundingClientRect()

    // 考虑 viewport 的平移和缩放
    const position = {
      x: (event.clientX - canvasRect.left - viewport.value.x) / viewport.value.zoom,
      y: (event.clientY - canvasRect.top - viewport.value.y) / viewport.value.zoom,
    }

    console.log('DagCanvas - Position:', {
      x: position.x,
      y: position.y,
      clientX: event.clientX,
      clientY: event.clientY,
      canvasLeft: canvasRect.left,
      canvasTop: canvasRect.top
    }, 'GraphId:', targetGraphId)

    // 根据节点类型映射到自定义节点类型
    const nodeTypeMap: Record<string, string> = {
      'data-resource': 'data',
      'compute-task': 'compute',
      'model-resource': 'model',
      'compute-resource': 'compute-resource',
    }

    const nodeType = nodeTypeMap[template.type] || 'custom'

    console.log('DagCanvas - Adding node:', { nodeType, position, template })

    // 添加节点到图中
    const newNode = dagStore.addNodeToGraph(
      nodeType,
      position,
      {
        label: template.label,
        nodeType: template.type,
        description: template.description,
        ...template.defaultConfig,
      },
      targetGraphId
    )

    console.log('DagCanvas - Node added:', newNode)
  } catch (error) {
    console.error('DagCanvas - Failed to parse drag data:', error)
  }
}

// 拖拽经过
const onDragOver = (event: DragEvent) => {
  // 必须阻止默认行为和事件冒泡才能允许 drop
  event.preventDefault()
  event.stopPropagation()
  // 设置拖拽效果
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

// 监听资源库拖拽事件
watch(() => props.graphId, () => {
  // 刷新当前图
})
</script>

<style scoped>
.dag-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eaed 100%);
}

:deep(.vue-flow) {
  background: transparent;
}

:deep(.vue-flow__node) {
  cursor: grab;
}

:deep(.vue-flow__node:active) {
  cursor: grabbing;
}

:deep(.vue-flow__handle) {
  cursor: crosshair;
  transition: all 0.2s ease;
}

/* 通用端点基础样式（会被组件特定的样式覆盖） */
:deep(.vue-flow__handle:not(.handle-input):not(.handle-output):not(.input-handle):not(.output-handle)) {
  width: 12px;
  height: 12px;
  background: #ff6d5a;
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
}

:deep(.vue-flow__handle:not(.handle-input):not(.handle-output):not(.input-handle):not(.output-handle):hover) {
  width: 16px;
  height: 16px;
  box-shadow: 0 0 0 3px rgba(255, 109, 90, 0.3);
}

:deep(.vue-flow__handle:not(.handle-input):not(.handle-output):not(.input-handle):not(.output-handle).connecting) {
  background: #00f2a6;
}

:deep(.vue-flow__edge) {
  stroke: #666;
  stroke-width: 2.5;
}

:deep(.vue-flow__edge.selected) {
  stroke: #409eff;
  stroke-width: 3;
}

:deep(.vue-flow__edge-path) {
  stroke: #666;
  stroke-width: 2.5;
}

:deep(.vue-flow__edge-path.selected) {
  stroke: #409eff;
}

.empty-state {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.empty-description {
  font-size: 14px;
  color: #909399;
  max-width: 300px;
  line-height: 1.6;
}
</style>
