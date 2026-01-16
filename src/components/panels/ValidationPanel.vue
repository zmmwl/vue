<template>
  <div class="validation-panel">
    <div class="panel-header">
      <h3 class="panel-title">图验证</h3>
      <el-button
        type="primary"
        size="small"
        :icon="RefreshRight"
        @click="runValidation"
      >
        验证图
      </el-button>
    </div>

    <div class="panel-content">
      <div v-if="!hasRunValidation" class="empty-state">
        <div class="empty-icon">✅</div>
        <div class="empty-description">
          点击"验证图"按钮检查任务图的有效性
        </div>
      </div>

      <div v-else-if="isValid" class="success-state">
        <el-result
          icon="success"
          title="验证通过"
          sub-title="任务图符合所有规则要求，可以正常执行"
        >
          <template #extra>
            <div class="statistic-group">
              <div class="statistic-item">
                <div class="statistic-value">{{ nodeCount }}</div>
                <div class="statistic-label">节点数量</div>
              </div>
              <div class="statistic-item">
                <div class="statistic-value">{{ edgeCount }}</div>
                <div class="statistic-label">连线数量</div>
              </div>
              <div class="statistic-item">
                <div class="statistic-value">{{ participantCount }}</div>
                <div class="statistic-label">参与方</div>
              </div>
            </div>
          </template>
        </el-result>
      </div>

      <div v-else class="error-state">
        <el-alert
          title="验证失败"
          type="error"
          :closable="false"
          show-icon
        >
          发现 {{ errors.length }} 个问题，请修复后重试
        </el-alert>

        <div class="error-list">
          <div
            v-for="(error, index) in errors"
            :key="index"
            class="error-item"
            :class="getErrorClass(error.code)"
          >
            <div class="error-header">
              <span class="error-code">{{ error.code }}</span>
              <span class="error-path">{{ error.path }}</span>
            </div>
            <div class="error-message">{{ error.message }}</div>
            <div v-if="error.details" class="error-details">
              详情: {{ error.details }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RefreshRight } from '@element-plus/icons-vue'
import { useDagStore } from '../../stores/dagStore'

interface Props {
  graphId?: string
}

const props = withDefaults(defineProps<Props>(), {
  graphId: '',
})

const dagStore = useDagStore()

const hasRunValidation = ref(false)
const isValid = ref(false)
const errors = ref<Array<{ path: string; message: string; code: string; details?: any }>>([])

const currentGraph = computed(() => {
  if (props.graphId) {
    return dagStore.graphs.get(props.graphId)
  }
  return dagStore.currentGraph
})

const nodeCount = computed(() => currentGraph.value?.nodes.length || 0)
const edgeCount = computed(() => currentGraph.value?.edges.length || 0)
const participantCount = computed(() => {
  const participantIds = new Set(currentGraph.value?.nodes.map(n => n.data?.participantId) || [])
  return participantIds.size
})

const runValidation = () => {
  if (!currentGraph.value) return

  const result = dagStore.validateCurrentGraph()
  hasRunValidation.value = true
  isValid.value = result.valid
  errors.value = result.errors
}

const getErrorClass = (code: string) => {
  if (code.includes('MISSING') || code.includes('REQUIRED')) {
    return 'error-critical'
  }
  if (code.includes('INVALID') || code.includes('DUPLICATE')) {
    return 'error-warning'
  }
  return 'error-info'
}
</script>

<style scoped>
.validation-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  border-top: 1px solid #e4e7ed;
}

.panel-header {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e4e7ed;
  background: #f5f7fa;
}

.panel-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-description {
  font-size: 13px;
  color: #909399;
  line-height: 1.6;
}

.success-state {
  padding: 20px 0;
}

.statistic-group {
  display: flex;
  gap: 40px;
  margin-top: 24px;
}

.statistic-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.statistic-value {
  font-size: 28px;
  font-weight: 600;
  color: #409eff;
}

.statistic-label {
  font-size: 13px;
  color: #606266;
}

.error-state {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.error-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.error-item {
  padding: 12px;
  border-radius: 6px;
  border-left: 4px solid;
  background: #fef0f0;
}

.error-item.error-critical {
  border-left-color: #f56c6c;
  background: #fef0f0;
}

.error-item.error-warning {
  border-left-color: #e6a23c;
  background: #fdf6ec;
}

.error-item.error-info {
  border-left-color: #909399;
  background: #f4f4f5;
}

.error-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.error-code {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
}

.error-path {
  font-size: 11px;
  color: #606266;
  font-family: monospace;
  flex: 1;
}

.error-message {
  font-size: 13px;
  color: #333;
  margin-bottom: 4px;
  line-height: 1.4;
}

.error-details {
  font-size: 11px;
  color: #909399;
  margin-top: 4px;
}
</style>
