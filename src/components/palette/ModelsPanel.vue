<template>
  <div class="models-panel">
    <div
      v-for="model in modelResources"
      :key="model.id"
      class="model-item"
      draggable="true"
      @dragstart="handleDragStart($event, model)"
    >
      <div class="model-icon">🧩</div>
      <div class="model-info">
        <div class="model-name">{{ model.name }}</div>
        <div class="model-method">{{ model.methodName }}</div>
        <div class="model-params">
          <el-tag size="small" type="info">
            {{ model.parameters.length }} 参数
          </el-tag>
          <el-tag size="small" type="warning">TEE</el-tag>
        </div>
      </div>
    </div>

    <el-empty
      v-if="modelResources.length === 0"
      description="暂无模型资源"
      :image-size="80"
    />
  </div>
</template>

<script setup lang="ts">
import { MODEL_RESOURCES } from '../../data/resources'
import type { ModelResource } from '../../types/nodes'
import type { DragStartEvent } from '../../types/graph'

const emit = defineEmits<{
  dragStart: [event: DragStartEvent]
}>()

const modelResources = MODEL_RESOURCES

const handleDragStart = (event: DragEvent, model: ModelResource) => {
  if (!event.dataTransfer) return

  // 设置 Vue Flow 需要的拖拽数据格式
  const nodeTemplate = {
    label: model.name,
    type: 'model-resource',
    description: model.description,
    defaultConfig: {
      modelId: model.id,
      modelName: model.name,
      methodName: model.methodName,
      modelType: model.modelType,
      parameters: model.parameters,
      returnType: model.returnType,
    }
  }

  event.dataTransfer.setData('application/vueflow', JSON.stringify(nodeTemplate))
  event.dataTransfer.effectAllowed = 'move'

  const dragEvent: DragStartEvent = {
    resourceType: 'model',
    resourceId: model.id,
    startPosition: { x: event.clientX, y: event.clientY }
  }
  emit('dragStart', dragEvent)
}
</script>

<style scoped>
.models-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
}

.model-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background: linear-gradient(135deg, #f4ecf7, #e8daef);
  cursor: grab;
  transition: all 0.2s;
}

.model-item:hover {
  border-color: #9b59b6;
  box-shadow: 0 2px 8px rgba(155, 89, 182, 0.2);
  transform: translateY(-1px);
}

.model-item:active {
  cursor: grabbing;
}

.model-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.model-info {
  flex: 1;
  min-width: 0;
}

.model-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.model-method {
  font-size: 12px;
  color: #8e44ad;
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.model-params {
  display: flex;
  gap: 6px;
  margin-top: 6px;
  align-items: center;
}
</style>
