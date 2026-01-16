<template>
  <div class="compute-tasks-panel">
    <!-- 隐私计算任务 -->
    <div class="task-section">
      <div class="section-header">
        <span class="section-icon">🔐</span>
        <span class="section-title">隐私计算</span>
      </div>
      <div class="tasks-list">
        <div
          v-for="task in privacyTasks"
          :key="task.id"
          class="task-item"
          :class="`task-${task.taskType.toLowerCase()}`"
          draggable="true"
          @dragstart="handleDragStart($event, task)"
        >
          <div class="task-icon">{{ getTaskIcon(task.taskType) }}</div>
          <div class="task-info">
            <div class="task-name">{{ task.name }}</div>
            <div class="task-description">{{ task.description }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 本地计算任务 -->
    <div class="task-section">
      <div class="section-header">
        <span class="section-icon">🔧</span>
        <span class="section-title">本地计算</span>
      </div>
      <div class="tasks-list">
        <div
          v-for="task in localTasks"
          :key="task.id"
          class="task-item task-local"
          draggable="true"
          @dragstart="handleDragStart($event, task)"
        >
          <div class="task-icon">⚙️</div>
          <div class="task-info">
            <div class="task-name">{{ task.name }}</div>
            <div class="task-description">{{ task.description }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PRIVACY_TASKS, LOCAL_TASKS } from '../../data/resources'
import type { ComputeTask } from '../../types/nodes'
import type { DragStartEvent } from '../../types/graph'

const emit = defineEmits<{
  dragStart: [event: DragStartEvent]
}>()

const privacyTasks = PRIVACY_TASKS
const localTasks = LOCAL_TASKS

const getTaskIcon = (taskType: string) => {
  const iconMap: Record<string, string> = {
    PSI: '🔐',
    MPC: '🛡️',
    PIR: '🔍',
    FL: '🤝',
  }
  return iconMap[taskType] || '⚙️'
}

const handleDragStart = (event: DragEvent, task: ComputeTask) => {
  if (!event.dataTransfer) return

  // 设置 Vue Flow 需要的拖拽数据格式
  const nodeTemplate = {
    label: task.name,
    type: 'compute-task',
    description: task.description,
    defaultConfig: {
      taskId: task.id,
      taskName: task.name,
      taskType: task.taskType,
      category: task.category,
      config: task.defaultConfig || {},
    }
  }

  event.dataTransfer.setData('application/vueflow', JSON.stringify(nodeTemplate))
  event.dataTransfer.effectAllowed = 'move'

  const dragEvent: DragStartEvent = {
    resourceType: 'compute',
    resourceId: task.id,
    startPosition: { x: event.clientX, y: event.clientY }
  }
  emit('dragStart', dragEvent)
}
</script>

<style scoped>
.compute-tasks-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px;
}

.task-section {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;
}

.section-header {
  padding: 8px 12px;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #606266;
}

.section-icon {
  font-size: 14px;
}

.section-title {
  flex: 1;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  background: white;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  cursor: grab;
  transition: all 0.2s;
}

.task-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 4px rgba(64, 158, 255, 0.1);
}

.task-item:active {
  cursor: grabbing;
}

.task-item.task-psi {
  border-left: 3px solid #409eff;
}

.task-item.task-mpc {
  border-left: 3px solid #67c23a;
}

.task-item.task-pir {
  border-left: 3px solid #e6a23c;
}

.task-item.task-fl {
  border-left: 3px solid #f56c6c;
}

.task-item.task-local {
  border-left: 3px solid #909399;
}

.task-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.task-info {
  flex: 1;
  min-width: 0;
}

.task-name {
  font-size: 13px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-description {
  font-size: 11px;
  color: #909399;
  margin-top: 2px;
  line-height: 1.3;
}
</style>
