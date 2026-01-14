<template>
  <div :class="['custom-node', `node-${nodeType}`]">
    <div class="node-header">
      <span class="node-icon">{{ icon }}</span>
      <span class="node-label">{{ data.label }}</span>
      <button class="delete-btn" @click.stop="$emit('delete', id)" title="删除节点">×</button>
    </div>
    <div v-if="data.description" class="node-description">
      {{ data.description }}
    </div>
    <Handle type="target" :position="Position.Left" class="handle handle-target" />
    <Handle type="source" :position="Position.Right" class="handle handle-source" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Handle, Position } from '@vue-flow/core';
import type { NodeProps } from '@vue-flow/core';

interface CustomNodeData {
  label: string;
  type: string;
  description?: string;
  config?: Record<string, any>;
}

const props = defineProps<NodeProps<CustomNodeData>>();

defineEmits<{
  (e: 'delete', nodeId: string): void;
}>();

const nodeType = computed(() => props.data.type || 'task');

const icon = computed(() => {
  const icons: Record<string, string> = {
    start: '▶',
    task: '⚙',
    condition: '◇',
    subflow: '☷',
    end: '■',
  };
  return icons[nodeType.value] || '●';
});
</script>

<style scoped>
.custom-node {
  min-width: 140px;
  border-radius: 8px;
  padding: 0;
  background: #1e1e2e;
  border: 2px solid #45475a;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  transition: all 0.2s;
}

.custom-node:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
}

.custom-node.node-start {
  border-color: #a6e3a1;
  background: linear-gradient(135deg, #1e1e2e 0%, #1e3a2e 100%);
}

.custom-node.node-task {
  border-color: #89b4fa;
  background: linear-gradient(135deg, #1e1e2e 0%, #1e2a3e 100%);
}

.custom-node.node-condition {
  border-color: #f9e2af;
  background: linear-gradient(135deg, #1e1e2e 0%, #3a3220 100%);
}

.custom-node.node-subflow {
  border-color: #cba6f7;
  background: linear-gradient(135deg, #1e1e2e 0%, #2e1e3a 100%);
}

.custom-node.node-end {
  border-color: #f38ba8;
  background: linear-gradient(135deg, #1e1e2e 0%, #3e1e2e 100%);
}

.node-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.node-icon {
  font-size: 18px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.node-label {
  flex: 1;
  color: #cdd6f4;
  font-size: 13px;
  font-weight: 500;
}

.delete-btn {
  width: 20px;
  height: 20px;
  border: none;
  background: rgba(243, 139, 168, 0.2);
  color: #f38ba8;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  line-height: 1;
  transition: all 0.2s;
  opacity: 0;
}

.custom-node:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  background: #f38ba8;
  color: #1e1e2e;
}

.node-description {
  padding: 8px 12px;
  color: #a6adc8;
  font-size: 11px;
  line-height: 1.4;
}

.handle {
  width: 12px;
  height: 12px;
  border: 2px solid #585b70;
  background: #1e1e2e;
}

.handle-target {
  left: -7px;
}

.handle-source {
  right: -7px;
}

.handle:hover {
  border-color: #89b4fa;
  background: #89b4fa;
}
</style>
