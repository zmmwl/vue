<template>
  <div
    :class="['compute-task-node', { selected: isSelected }]"
    :style="{ borderColor: getTaskColor() }"
    @click="handleClick"
  >
    <!-- 多个输入端点（上边缘，箭头形状） -->
    <template v-for="i in inputHandleCount" :key="`input-${i}`">
      <Handle
        :id="`input-${i}`"
        type="target"
        :position="Position.Top"
        :style="{ left: getInputHandlePosition(i) }"
        class="handle-input"
      />
    </template>

    <!-- 多个输出端点（下边缘，圆形） -->
    <template v-for="i in outputHandleCount" :key="`output-${i}`">
      <Handle
        :id="`output-${i}`"
        type="source"
        :position="Position.Bottom"
        :style="{ left: getOutputHandlePosition(i) }"
        class="handle-output"
      />
    </template>

    <div class="node-content">
      <div class="node-icon">{{ getTaskIcon() }}</div>
      <div class="node-label">{{ label }}</div>
      <div v-if="description" class="node-sublabel">{{ description }}</div>

      <!-- 附着的算力资源 -->
      <div v-if="data?.attachedComputeResource" class="compute-resource-attachment">
        ⚡ 算力
      </div>

      <!-- 附着的模型资源 -->
      <div v-if="data?.attachedModels && data.attachedModels.length > 0" class="model-attachments">
        <div v-for="modelId in data.attachedModels" :key="modelId" class="model-badge">
          🧩 {{ modelId }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Handle, Position, useVueFlow } from '@vue-flow/core'
import { computed, watchEffect } from 'vue'

import type { ComputeTaskData } from '../../types/nodes'

// Vue Flow 的 NodeProps 要求 data 是必需的
interface Props {
  id: string
  label?: string
  data: ComputeTaskData & { description?: string }
  selected?: boolean
  type?: string
}

const props = defineProps<Props>()
const { edges } = useVueFlow()

const isSelected = computed(() => props.selected || false)

// 动态计算输入端点数量（基于现有连线，至少显示 2 个）
const inputHandleCount = computed(() => {
  const incomingEdges = edges.value.filter(e => e.target === props.id)
  return Math.max(2, incomingEdges.length + 1)
})

// 动态计算输出端点数量（基于现有连线，至少显示 2 个）
const outputHandleCount = computed(() => {
  const outgoingEdges = edges.value.filter(e => e.source === props.id)
  return Math.max(2, outgoingEdges.length + 1)
})

// 调试：输出端点数量
watchEffect(() => {
  console.log('[ComputeTaskNode]', props.id, 'input:', inputHandleCount.value, 'output:', outputHandleCount.value)
})

// 获取输入端点位置（水平分布在上边缘）
const getInputHandlePosition = (index: number) => {
  const nodeWidth = 160
  const margin = 20
  const availableWidth = nodeWidth - 2 * margin

  if (inputHandleCount.value === 1) {
    return '50%'
  }

  const step = availableWidth / (inputHandleCount.value - 1)
  const position = margin + step * (index - 1)
  return `${position}px`
}

// 获取输出端点位置（水平分布在下边缘）
const getOutputHandlePosition = (index: number) => {
  const nodeWidth = 160
  const margin = 20
  const availableWidth = nodeWidth - 2 * margin

  if (outputHandleCount.value === 1) {
    return '50%'
  }

  const step = availableWidth / (outputHandleCount.value - 1)
  const position = margin + step * (index - 1)
  return `${position}px`
}

const description = computed(() => props.data?.description)

const getTaskIcon = () => {
  const taskType = props.data?.taskType
  const iconMap: Record<string, string> = {
    PSI: '🔐',
    MPC: '🛡️',
    PIR: '🔍',
    FL: '🤝',
    'data-import': '📥',
    'data-export': '📤',
    'data-filter': '🔧',
    'data-join': '🔗',
  }
  return iconMap[taskType || ''] || '⚙️'
}

const getTaskColor = () => {
  const taskType = props.data?.taskType
  const colorMap: Record<string, string> = {
    PSI: '#409eff',
    MPC: '#67c23a',
    PIR: '#e6a23c',
    FL: '#f56c6c',
    'data-import': '#909399',
    'data-export': '#909399',
    'data-filter': '#909399',
    'data-join': '#909399',
  }
  return colorMap[taskType || ''] || '#999'
}

const handleClick = () => {
  console.log('ComputeTaskNode clicked:', props.id)
}
</script>

<style scoped>
.compute-task-node {
  width: 160px;
  min-height: 80px;
  border-radius: 12px;
  border: 2px solid #ddd;
  background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: visible;
}

.compute-task-node:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.compute-task-node.selected {
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.4), 0 4px 12px rgba(64, 158, 255, 0.2);
  border-color: #409eff;
}

.node-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px;
}

.node-icon {
  font-size: 28px;
  margin-bottom: 6px;
}

.node-label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.node-sublabel {
  font-size: 11px;
  color: #666;
  text-align: center;
  margin-top: 4px;
  line-height: 1.3;
}

.compute-resource-attachment {
  position: absolute;
  right: -30px;
  top: 50%;
  transform: translateY(-50%);
  background: #f39c12;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  white-space: nowrap;
}

.model-attachments {
  position: absolute;
  right: -30px;
  top: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.model-badge {
  background: #9b59b6;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 9px;
  white-space: nowrap;
}

/* 输入端点样式 - 上边缘，箭头形状，灰色 */
.compute-task-node :deep(.vue-flow__handle.handle-input) {
  width: 0 !important;
  height: 0 !important;
  background: transparent !important;
  border: none !important;
  border-left: 8px solid transparent !important;
  border-right: 8px solid transparent !important;
  border-top: 10px solid #888 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  transform: translateY(2px) !important;
  transition: all 0.2s ease !important;
}

.compute-task-node :deep(.vue-flow__handle.handle-input:hover) {
  border-top: 12px solid #555 !important;
  border-left: 10px solid transparent !important;
  border-right: 10px solid transparent !important;
  transform: translateY(1px) !important;
}

/* 输出端点样式 - 下边缘，圆形，灰色 */
.compute-task-node :deep(.vue-flow__handle.handle-output) {
  width: 10px !important;
  height: 10px !important;
  background: #888 !important;
  border: 2px solid #fff !important;
  border-radius: 50% !important;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1) !important;
  transition: all 0.2s ease !important;
}

.compute-task-node :deep(.vue-flow__handle.handle-output:hover) {
  width: 14px !important;
  height: 14px !important;
  background: #555 !important;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.2) !important;
}
</style>
