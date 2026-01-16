<template>
  <div
    :class="['compute-task-node', { selected: isSelected }]"
    :style="{ borderColor: getTaskColor() }"
    @click="handleClick"
  >
    <Handle type="target" :position="Position.Top" />
    <Handle type="source" :position="Position.Bottom" />
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
import { Handle, Position } from '@vue-flow/core'
import { computed } from 'vue'

import type { NodeProps } from '@vue-flow/core'
import type { ComputeTaskData } from '../../types/nodes'

interface Props extends NodeProps {
  data?: ComputeTaskData & { description?: string }
}

const props = defineProps<Props>()

const isSelected = computed(() => props.selected || false)
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
  min-height: 100px;
  border-radius: 8px;
  border: 2px solid #999;
  background: linear-gradient(135deg, #f5f7fa, #e4e7ed);
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: visible;
}

.compute-task-node:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transform: translateY(-2px);
}

.compute-task-node.selected {
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.3);
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
</style>
