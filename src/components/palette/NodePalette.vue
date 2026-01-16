<template>
  <div class="node-palette">
    <el-collapse v-model="activePanels">
      <el-collapse-item name="data">
        <template #title>
          <div class="panel-title">
            <span class="panel-icon">📊</span>
            <span>数据资源</span>
          </div>
        </template>
        <DataResourcesPanel @drag-start="handleDragStart" />
      </el-collapse-item>

      <el-collapse-item name="compute">
        <template #title>
          <div class="panel-title">
            <span class="panel-icon">⚙️</span>
            <span>计算任务</span>
          </div>
        </template>
        <ComputeTasksPanel @drag-start="handleDragStart" />
      </el-collapse-item>

      <el-collapse-item name="model">
        <template #title>
          <div class="panel-title">
            <span class="panel-icon">🧩</span>
            <span>模型资源</span>
          </div>
        </template>
        <ModelsPanel @drag-start="handleDragStart" />
      </el-collapse-item>

      <el-collapse-item name="compute-resource">
        <template #title>
          <div class="panel-title">
            <span class="panel-icon">⚡</span>
            <span>算力资源</span>
          </div>
        </template>
        <ComputeResourcesPanel @drag-start="handleDragStart" />
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import DataResourcesPanel from './DataResourcesPanel.vue'
import ComputeTasksPanel from './ComputeTasksPanel.vue'
import ModelsPanel from './ModelsPanel.vue'
import ComputeResourcesPanel from './ComputeResourcesPanel.vue'
import type { DragStartEvent } from '../../types/graph'

const activePanels = ref(['data', 'compute', 'model'])

const emit = defineEmits<{
  dragStart: [event: DragStartEvent]
}>()

const handleDragStart = (event: DragStartEvent) => {
  emit('dragStart', event)
}
</script>

<style scoped>
.node-palette {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.panel-icon {
  font-size: 18px;
}

:deep(.el-collapse-item__header) {
  padding: 12px 16px;
}

:deep(.el-collapse-item__wrap) {
  border-bottom: none;
}

:deep(.el-collapse-item__content) {
  padding: 8px 0;
}
</style>
