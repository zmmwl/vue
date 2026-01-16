<template>
  <div class="dag-editor">
    <el-container class="editor-container">
      <!-- 头部工具栏 -->
      <el-header class="editor-header">
        <div class="header-left">
          <h1 class="header-title">隐私计算任务编排编辑器</h1>
          <el-tag type="info" size="small" effect="plain">v1.0.0</el-tag>
        </div>
        <div class="header-actions">
          <el-button
            type="primary"
            :icon="Plus"
            @click="handleNewGraph"
          >
            新建任务图
          </el-button>
          <el-button
            :icon="Download"
            @click="handleExport"
          >
            导出
          </el-button>
          <el-button
            :icon="Upload"
            @click="handleImport"
          >
            导入
          </el-button>
          <input
            ref="fileInputRef"
            type="file"
            accept=".json"
            style="display: none"
            @change="onFileSelect"
          />
        </div>
      </el-header>

      <el-container class="editor-body">
        <!-- 左侧：Tab标签栏 + 资源库 -->
        <el-aside width="300px" class="editor-sidebar">
          <!-- Tab管理 -->
          <el-tabs v-model="activeTab" type="card" class="tab-manager">
            <el-tab-pane name="resources" label="资源库">
              <NodePalette @drag-start="handleDragStart" />
            </el-tab-pane>
            <el-tab-pane name="tasks" label="任务图">
              <div class="graph-list">
                <div
                  v-for="tab in tabs"
                  :key="tab.id"
                  class="graph-item"
                  :class="{ active: activeTabId === tab.id }"
                  @click="handleSwitchTab(tab.id)"
                >
                  <div class="graph-info">
                    <span class="graph-name">{{ tab.name }}</span>
                    <el-tag v-if="tab.isDirty" size="small" type="warning">未保存</el-tag>
                  </div>
                  <el-button
                    type="danger"
                    :icon="Close"
                    size="small"
                    circle
                    @click.stop="handleCloseTab(tab.id)"
                  />
                </div>
                <el-empty v-if="tabs.length === 0" description="暂无任务图" :image-size="60" />
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-aside>

        <!-- 中间：画布 -->
        <el-main class="editor-main">
          <div v-if="activeGraphId" class="canvas-container">
            <DagCanvas :graph-id="activeGraphId" />
          </div>
          <el-empty v-else description="请创建或打开一个任务图" :image-size="120" />
        </el-main>

        <!-- 右侧：属性面板 -->
        <el-aside width="320px" class="editor-right-panel">
          <el-tabs v-model="rightTab" class="right-tabs">
            <el-tab-pane name="property" label="属性">
              <PropertyPanel :graph-id="activeGraphId" />
            </el-tab-pane>
            <el-tab-pane name="validation" label="验证">
              <ValidationPanel :graph-id="activeGraphId" />
            </el-tab-pane>
          </el-tabs>
        </el-aside>
      </el-container>
    </el-container>

    <!-- 导入错误提示 -->
    <el-dialog
      v-model="showImportError"
      title="导入错误"
      width="500px"
    >
      <div class="import-errors">
        <el-alert
          title="JSON 文件验证失败"
          type="error"
          :closable="false"
          show-icon
          style="margin-bottom: 16px"
        >
          发现 {{ importErrors.length }} 个错误，请检查文件内容
        </el-alert>
        <div class="error-list">
          <div
            v-for="(error, index) in importErrors"
            :key="index"
            class="error-item"
          >
            <div class="error-path">{{ error.path }}</div>
            <div class="error-message">{{ error.message }}</div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="showImportError = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Download, Upload, Close } from '@element-plus/icons-vue'
import NodePalette from './palette/NodePalette.vue'
import DagCanvas from './canvas/DagCanvas.vue'
import PropertyPanel from './panels/PropertyPanel.vue'
import ValidationPanel from './panels/ValidationPanel.vue'
import { useTabStore } from '../stores/tabStore'
import { useDagStore } from '../stores/dagStore'
import { readFileAsJson } from '../utils/export'
import { ElMessage } from 'element-plus'

const tabStore = useTabStore()
const dagStore = useDagStore()

const activeTab = ref('resources')
const rightTab = ref('property')
const fileInputRef = ref<HTMLInputElement | null>(null)
const showImportError = ref(false)
const importErrors = ref<Array<{ path: string; message: string }>>([])

const tabs = computed(() => tabStore.tabs)
const activeTabId = computed(() => tabStore.activeTabId)
const activeGraphId = computed(() => tabStore.activeTab?.graphId || '')

const handleNewGraph = () => {
  const graphId = tabStore.openNewTab()
  dagStore.initializeGraph(graphId)
  dagStore.setActiveGraphId(graphId)
  ElMessage.success('已创建新任务图')
}

const handleSwitchTab = (tabId: string) => {
  tabStore.switchTab(tabId)
  const tab = tabStore.tabs.find(t => t.id === tabId)
  if (tab) {
    dagStore.setActiveGraphId(tab.graphId)
  }
}

const handleCloseTab = (tabId: string) => {
  const tab = tabStore.tabs.find(t => t.id === tabId)
  const graphId = tab?.graphId
  tabStore.closeTab(tabId)
  if (graphId) {
    dagStore.deleteGraph(graphId)
  }
  ElMessage.info('已关闭任务图')
}

const handleExport = () => {
  if (!activeGraphId.value) {
    ElMessage.warning('请先选择一个任务图')
    return
  }

  const graph = dagStore.graphs.get(activeGraphId.value)
  if (!graph) {
    ElMessage.warning('任务图不存在')
    return
  }

  dagStore.exportCurrentGraph()
  ElMessage.success('导出成功')
}

const handleImport = () => {
  fileInputRef.value?.click()
}

const onFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  try {
    const json = await readFileAsJson(file)
    const result = dagStore.importGraphData(json, '导入的任务图')

    if (!result.success) {
      importErrors.value = (result.errors || []).map(e => ({
        path: 'unknown',
        message: e
      }))
      showImportError.value = true
      return
    }

    // 导入成功，创建新tab并关联graphId
    tabStore.openNewTab()
    // Since the tab creates its own graphId, we need to use the one from import
    // For now, let's just set the active graph to the imported one
    dagStore.setActiveGraphId(result.graphId)
    ElMessage.success('导入成功')
  } catch (error) {
    ElMessage.error('文件读取失败')
  }

  input.value = ''
}

const handleDragStart = (event: any) => {
  console.log('Drag start:', event)
  // TODO: 处理拖拽开始，设置dragState
}
</script>

<style scoped>
.dag-editor {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.editor-container {
  height: 100%;
}

.editor-header {
  background: white;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 60px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.editor-body {
  height: calc(100vh - 60px);
}

.editor-sidebar {
  background: white;
  border-right: 1px solid #e4e7ed;
}

.tab-manager {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.el-tabs__content) {
  height: calc(100% - 55px);
  overflow: hidden;
}

:deep(.el-tab-pane) {
  height: 100%;
}

.graph-list {
  height: 100%;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.graph-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.graph-item:hover {
  border-color: #409eff;
  background: #f0f9ff;
}

.graph-item.active {
  border-color: #409eff;
  background: #ecf5ff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.graph-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.graph-name {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.editor-main {
  background: #fafafa;
  padding: 0;
}

.canvas-container {
  height: 100%;
  position: relative;
  overflow: visible;
}

.editor-right-panel {
  background: white;
  border-left: 1px solid #e4e7ed;
}

.right-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.el-tabs__header) {
  margin: 0;
}

.import-errors {
  padding: 8px 0;
}

.error-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.error-item {
  padding: 10px;
  background: #fef0f0;
  border-radius: 4px;
  border-left: 3px solid #f56c6c;
}

.error-path {
  font-size: 11px;
  color: #909399;
  font-family: monospace;
  margin-bottom: 4px;
}

.error-message {
  font-size: 13px;
  color: #303133;
}
</style>
