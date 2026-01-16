<template>
  <div class="dag-canvas" @drop="onDrop" @dragover="onDragOver">
    <VueFlow
      v-model:nodes="store.nodes"
      v-model:edges="store.edges"
      :default-viewport="{ zoom: 1, x: 0, y: 0 }"
      :min-zoom="0.2"
      :max-zoom="2"
      fit-view-on-init
      @connect="onConnect"
      @node-click="onNodeClick"
    >
      <Background />
      <Controls />
      <MiniMap />

      <!-- 自定义节点 -->
      <template #node-custom="props">
        <CustomNode v-bind="props" @delete="onDeleteNode" />
      </template>
    </VueFlow>
  </div>
</template>

<script setup lang="ts">
import { VueFlow } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { Controls } from '@vue-flow/controls';
import { MiniMap } from '@vue-flow/minimap';
import { useDagStore } from '../stores/dagStore';
import CustomNode from './CustomNode.vue';
import type { NodeTemplate } from '../types/dag';
import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';
import '@vue-flow/background/dist/style.css';
import '@vue-flow/controls/dist/style.css';
import '@vue-flow/minimap/dist/style.css';

const store = useDagStore();

const emit = defineEmits<{
  (e: 'node-click', node: any): void;
}>();

// 拖拽放置节点
const onDrop = (event: DragEvent) => {
  const templateData = event.dataTransfer?.getData('application/vueflow');
  if (!templateData) return;

  const template: NodeTemplate = JSON.parse(templateData);

  store.addNodeToGraph('custom', {
    x: event.offsetX,
    y: event.offsetY,
  }, {
    label: template.label,
    type: template.type,
    description: template.description,
    config: template.defaultConfig || {},
  });
};

const onDragOver = (event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
};

// 连接节点
const onConnect = (connection: any) => {
  store.addConnectionToGraph(connection.source, connection.target, connection.data);
};

// 点击节点
const onNodeClick = (event: any) => {
  emit('node-click', event.node);
};

// 删除节点
const onDeleteNode = (nodeId: string) => {
  store.deleteNodeFromGraph(nodeId);
};
</script>

<style scoped>
.dag-canvas {
  flex: 1;
  height: 100%;
  background: #11111b;
  position: relative;
}

.dag-canvas :deep(.vue-flow) {
  background: #11111b;
}

.dag-canvas :deep(.vue-flow__node) {
  border-radius: 8px;
}

.dag-canvas :deep(.vue-flow__edge-path) {
  stroke: #585b70;
}

.dag-canvas :deep(.vue-flow__edge.selected .vue-flow__edge-path) {
  stroke: #89b4fa;
}

.dag-canvas :deep(.vue-flow__edge.animated .vue-flow__edge-path) {
  stroke-dasharray: 5;
  animation: dashdraw 0.5s linear infinite;
}

@keyframes dashdraw {
  from {
    stroke-dashoffset: 10;
  }
  to {
    stroke-dashoffset: 0;
  }
}
</style>
