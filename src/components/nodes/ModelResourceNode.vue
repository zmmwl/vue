<template>
  <div
    :class="['model-resource-node', { selected: isSelected }]"
    @click="handleClick"
  >
    <div class="node-content">
      <div class="node-icon">🧩</div>
      <div class="node-label">{{ label }}</div>
      <div v-if="data?.methodName" class="node-sublabel">{{ data.methodName }}</div>
      <div v-if="data?.parameters && data.parameters.length > 0" class="param-count">
        {{ data.parameters.length }} 个参数
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { ModelResourceData } from '../../types/nodes'

interface Props {
  id: string
  label?: string
  data: ModelResourceData
  selected?: boolean
  type?: string
}

const props = defineProps<Props>()

const isSelected = computed(() => props.selected || false)

const handleClick = () => {
  console.log('ModelResourceNode clicked:', props.id)
}
</script>

<style scoped>
.model-resource-node {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  border: 2px solid #9b59b6;
  background: linear-gradient(135deg, #f4ecf7, #e8daef);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(155, 89, 182, 0.2);
  aspect-ratio: 1;
}

.model-resource-node:hover {
  box-shadow: 0 4px 8px rgba(155, 89, 182, 0.3);
  transform: scale(1.1);
}

.model-resource-node.selected {
  border-color: #8e44ad;
  box-shadow: 0 0 0 3px rgba(155, 89, 182, 0.3);
}

.node-content {
  text-align: center;
  padding: 6px;
}

.node-icon {
  font-size: 20px;
  margin-bottom: 4px;
}

.node-label {
  font-size: 11px;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-sublabel {
  font-size: 9px;
  color: #666;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.param-count {
  font-size: 8px;
  color: #8e44ad;
  margin-top: 2px;
}
</style>
