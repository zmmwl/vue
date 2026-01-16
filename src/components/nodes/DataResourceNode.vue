<template>
  <div
    :class="['data-resource-node', { selected: isSelected }]"
    :style="{ backgroundColor: participantColor }"
    @click="handleClick"
  >
    <Handle type="source" :position="Position.Bottom" />
    <div class="node-content">
      <div class="node-icon">📊</div>
      <div class="node-label">{{ label }}</div>
      <div v-if="data?.tableName" class="node-sublabel">{{ data.tableName }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { computed } from 'vue'

import type { NodeProps } from '@vue-flow/core'
import type { DataResourceData } from '../../types/nodes'
import { PARTICIPANTS } from '../../data/resources'

interface Props extends NodeProps {
  data?: DataResourceData & { participantId?: string }
}

const props = defineProps<Props>()

const isSelected = computed(() => props.selected || false)

const participantColor = computed(() => {
  const participant = PARTICIPANTS.find(p => p.id === props.data?.participantId)
  return participant?.color || '#e3f2fd'
})

const handleClick = () => {
  // 触发节点选择事件
  console.log('DataResourceNode clicked:', props.id)
}
</script>

<style scoped>
.data-resource-node {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 3px solid #999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: visible;
}

.data-resource-node:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transform: scale(1.05);
}

.data-resource-node.selected {
  border-color: #409eff;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.3);
}

.node-content {
  text-align: center;
  padding: 8px;
}

.node-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.node-label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-sublabel {
  font-size: 11px;
  color: #666;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
