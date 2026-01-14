<template>
  <div class="node-palette">
    <h3>节点类型</h3>
    <div class="node-list">
      <div
        v-for="template in nodeTemplates"
        :key="template.type"
        class="node-template"
        :class="`node-${template.type}`"
        draggable="true"
        @dragstart="onDragStart($event, template)"
      >
        <span class="node-icon">{{ getIcon(template.type) }}</span>
        <div class="node-info">
          <span class="node-label">{{ template.label }}</span>
          <span class="node-description">{{ template.description }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { NodeTemplate } from '../types/dag';

const emit = defineEmits<{
  (e: 'drag-start', template: NodeTemplate): void;
}>();

const nodeTemplates = ref<NodeTemplate[]>([
  {
    type: 'start',
    label: '开始',
    description: '流程开始节点',
  },
  {
    type: 'task',
    label: '任务',
    description: '执行具体任务',
  },
  {
    type: 'condition',
    label: '条件',
    description: '条件判断分支',
  },
  {
    type: 'subflow',
    label: '子流程',
    description: '嵌套子流程',
  },
  {
    type: 'end',
    label: '结束',
    description: '流程结束节点',
  },
]);

const getIcon = (type: string): string => {
  const icons: Record<string, string> = {
    start: '▶',
    task: '⚙',
    condition: '◇',
    subflow: '☷',
    end: '■',
  };
  return icons[type] || '●';
};

const onDragStart = (event: DragEvent, template: NodeTemplate) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/vueflow', JSON.stringify(template));
    event.dataTransfer.effectAllowed = 'move';
  }
  emit('drag-start', template);
};
</script>

<style scoped>
.node-palette {
  width: 240px;
  background: #1e1e2e;
  border-right: 1px solid #313244;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.node-palette h3 {
  color: #cdd6f4;
  padding: 16px;
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  border-bottom: 1px solid #313244;
}

.node-list {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
}

.node-template {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #313244;
  border-radius: 8px;
  cursor: grab;
  transition: all 0.2s;
  user-select: none;
}

.node-template:hover {
  background: #45475a;
  transform: translateX(4px);
}

.node-template:active {
  cursor: grabbing;
}

.node-template.node-start {
  border-left: 3px solid #a6e3a1;
}

.node-template.node-task {
  border-left: 3px solid #89b4fa;
}

.node-template.node-condition {
  border-left: 3px solid #f9e2af;
}

.node-template.node-subflow {
  border-left: 3px solid #cba6f7;
}

.node-template.node-end {
  border-left: 3px solid #f38ba8;
}

.node-icon {
  font-size: 20px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.node-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.node-label {
  color: #cdd6f4;
  font-size: 13px;
  font-weight: 500;
}

.node-description {
  color: #a6adc8;
  font-size: 11px;
}
</style>
