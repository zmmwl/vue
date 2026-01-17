<template>
  <div
    :class="['compute-resource-node', { selected: isSelected, available: isAvailable }]"
    @click="handleClick"
  >
    <div class="node-content">
      <div class="node-icon">{{ isAvailable ? '⚡' : '💤' }}</div>
      <div class="node-label">{{ label }}</div>
      <div class="resource-spec">
        {{ data?.cores }}核 / {{ data?.memory }}GB
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { ComputeResourceData } from '../../types/nodes'

interface Props {
  id: string
  label?: string
  data: ComputeResourceData
  selected?: boolean
  type?: string
}

const props = defineProps<Props>()

const isSelected = computed(() => props.selected || false)
const isAvailable = computed(() => props.data?.available ?? true)

const handleClick = () => {
  console.log('ComputeResourceNode clicked:', props.id)
}
</script>

<style scoped>
.compute-resource-node {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid #666;
  background: linear-gradient(135deg, #fef5e7, #f6ddcc);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: absolute;
}

.compute-resource-node:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transform: scale(1.1);
}

.compute-resource-node.selected {
  border-color: #f39c12;
  box-shadow: 0 0 0 3px rgba(243, 156, 18, 0.3);
}

.compute-resource-node.available {
  border-color: #27ae60;
  background: linear-gradient(135deg, #e8f8f5, #d5f5e3);
}

.compute-resource-node:not(.available) {
  border-color: #999;
  background: linear-gradient(135deg, #f4f4f4, #e0e0e0);
  opacity: 0.7;
}

.node-content {
  text-align: center;
  padding: 4px;
}

.node-icon {
  font-size: 16px;
  margin-bottom: 2px;
}

.node-label {
  font-size: 9px;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.resource-spec {
  font-size: 7px;
  color: #666;
  margin-top: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
