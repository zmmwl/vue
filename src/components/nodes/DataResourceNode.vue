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

import type { DataResourceData } from '../../types/nodes'
import { PARTICIPANTS } from '../../data/resources'

interface Props {
  id: string
  label?: string
  data: DataResourceData & { participantId?: string }
  selected?: boolean
  type?: string
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
  width: 110px;
  height: 110px;
  border-radius: 50%;
  border: 3px solid #bbb;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: visible;
  position: relative;
}

.data-resource-node:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08);
  transform: scale(1.05);
}

.data-resource-node.selected {
  border-color: #409eff;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.4), 0 4px 12px rgba(64, 158, 255, 0.2);
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
