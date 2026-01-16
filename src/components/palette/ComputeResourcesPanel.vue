<template>
  <div class="compute-resources-panel">
    <div
      v-for="resource in computeResources"
      :key="resource.id"
      class="resource-item"
      :class="{ 'not-available': !resource.available }"
      draggable="true"
      @dragstart="handleDragStart($event, resource)"
    >
      <div class="resource-icon">
        {{ resource.available ? '⚡' : '💤' }}
      </div>
      <div class="resource-info">
        <div class="resource-name">{{ resource.name }}</div>
        <div class="resource-spec">
          <el-tag size="small" type="success">{{ resource.cores }} 核</el-tag>
          <el-tag size="small" type="info">{{ resource.memory }}GB</el-tag>
        </div>
        <div class="resource-status">
          <el-tag
            :type="resource.available ? 'success' : 'info'"
            size="small"
            effect="plain"
          >
            {{ resource.available ? '可用' : '已占用' }}
          </el-tag>
        </div>
      </div>
    </div>

    <el-empty
      v-if="computeResources.length === 0"
      description="暂无算力资源"
      :image-size="80"
    />
  </div>
</template>

<script setup lang="ts">
import { COMPUTE_RESOURCES } from '../../data/resources'
import type { ComputeResource } from '../../types/nodes'
import type { DragStartEvent } from '../../types/graph'

const emit = defineEmits<{
  dragStart: [event: DragStartEvent]
}>()

const computeResources = COMPUTE_RESOURCES

const handleDragStart = (event: DragEvent, resource: ComputeResource) => {
  if (!event.dataTransfer) return

  // 设置 Vue Flow 需要的拖拽数据格式
  const nodeTemplate = {
    label: resource.name,
    type: 'compute-resource',
    description: `${resource.cores}核 ${resource.memory}GB ${resource.resourceType}`,
    defaultConfig: {
      computeResourceId: resource.id,
      computeResourceName: resource.name,
      participantId: resource.participantId,
      resourceType: resource.resourceType,
      cores: resource.cores,
      memory: resource.memory,
      available: resource.available,
    }
  }

  event.dataTransfer.setData('application/vueflow', JSON.stringify(nodeTemplate))
  event.dataTransfer.effectAllowed = 'move'

  const dragEvent: DragStartEvent = {
    resourceType: 'compute-resource',
    resourceId: resource.id,
    startPosition: { x: event.clientX, y: event.clientY }
  }
  emit('dragStart', dragEvent)
}
</script>

<style scoped>
.compute-resources-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
}

.resource-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background: linear-gradient(135deg, #fef5e7, #f6ddcc);
  cursor: grab;
  transition: all 0.2s;
}

.resource-item:hover {
  border-color: #f39c12;
  box-shadow: 0 2px 8px rgba(243, 156, 18, 0.2);
  transform: translateY(-1px);
}

.resource-item:active {
  cursor: grabbing;
}

.resource-item.not-available {
  opacity: 0.6;
  background: linear-gradient(135deg, #f4f4f4, #e0e0e0);
}

.resource-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.resource-info {
  flex: 1;
  min-width: 0;
}

.resource-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.resource-spec {
  display: flex;
  gap: 6px;
  margin-top: 6px;
}

.resource-status {
  margin-top: 6px;
}
</style>
