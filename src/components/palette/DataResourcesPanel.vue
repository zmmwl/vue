<template>
  <div class="data-resources-panel">
    <div v-for="participant in participants" :key="participant.id" class="participant-group">
      <div class="participant-header" :style="{ backgroundColor: participant.color }">
        <span class="participant-name">{{ participant.name }}</span>
        <span class="participant-count">{{ getResourceCount(participant.id) }}</span>
      </div>
      <div class="resources-list">
        <div
          v-for="resource in getResourcesByParticipant(participant.id)"
          :key="resource.id"
          class="resource-item"
          draggable="true"
          @dragstart="handleDragStart($event, resource)"
        >
          <div class="resource-icon">📊</div>
          <div class="resource-info">
            <div class="resource-name">{{ resource.name }}</div>
            <div class="resource-detail">{{ resource.tableName }} · {{ formatRowCount(resource.rowCount) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { PARTICIPANTS, DATA_RESOURCES } from '../../data/resources'
import type { DataResource } from '../../types/nodes'
import type { DragStartEvent } from '../../types/graph'

const emit = defineEmits<{
  dragStart: [event: DragStartEvent]
}>()

const participants = computed(() => PARTICIPANTS)

const getResourceCount = (participantId: string) => {
  return DATA_RESOURCES.filter(r => r.source === participantId).length
}

const getResourcesByParticipant = (participantId: string) => {
  return DATA_RESOURCES.filter(r => r.source === participantId)
}

const formatRowCount = (count: number) => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(0)}K`
  }
  return count.toString()
}

const handleDragStart = (event: DragEvent, resource: DataResource) => {
  if (!event.dataTransfer) return

  console.log('DataResourcesPanel - Drag start:', resource)

  // 设置 Vue Flow 需要的拖拽数据格式
  const nodeTemplate = {
    label: resource.name,
    type: 'data-resource',
    description: resource.description,
    defaultConfig: {
      resourceId: (resource as any).id || resource.tableName,
      resourceName: resource.name,
      source: resource.source,
      tableName: resource.tableName,
      rowCount: resource.rowCount,
      dataType: resource.dataType,
    }
  }

  console.log('DataResourcesPanel - Node template:', nodeTemplate)

  event.dataTransfer.setData('application/vueflow', JSON.stringify(nodeTemplate))
  event.dataTransfer.effectAllowed = 'move'

  const dragEvent: DragStartEvent = {
    resourceType: 'data',
    resourceId: (resource as any).id || resource.tableName,
    startPosition: { x: event.clientX, y: event.clientY }
  }
  emit('dragStart', dragEvent)
}
</script>

<style scoped>
.data-resources-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px;
}

.participant-group {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;
}

.participant-header {
  padding: 8px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.participant-name {
  flex: 1;
}

.participant-count {
  background: rgba(255, 255, 255, 0.6);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.resources-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  background: #fafafa;
}

.resource-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  cursor: grab;
  transition: all 0.2s;
}

.resource-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 4px rgba(64, 158, 255, 0.1);
}

.resource-item:active {
  cursor: grabbing;
}

.resource-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.resource-info {
  flex: 1;
  min-width: 0;
}

.resource-name {
  font-size: 13px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.resource-detail {
  font-size: 11px;
  color: #909399;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
