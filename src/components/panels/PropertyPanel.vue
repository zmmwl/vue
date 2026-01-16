<template>
  <div class="property-panel">
    <div class="panel-header">
      <h3 class="panel-title">属性编辑</h3>
    </div>

    <div v-if="selectedElement" class="panel-content">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        label-position="right"
        @change="handleChange"
      >
        <!-- 通用字段 -->
        <el-form-item label="ID" prop="id">
          <el-input v-model="formData.id" disabled />
        </el-form-item>

        <el-form-item label="名称" prop="label">
          <el-input v-model="formData.label" placeholder="请输入名称" />
        </el-form-item>

        <el-form-item label="类型" prop="type">
          <el-input :value="getTypeLabel(formData.type)" disabled />
        </el-form-item>

        <!-- 根据元素类型显示不同的表单字段 -->
        <template v-if="formData.type === 'data'">
          <el-divider content-position="left">数据资源属性</el-divider>
          <el-form-item label="表名" prop="data.tableName">
            <el-input v-model="formData.data.tableName" placeholder="请输入表名" />
          </el-form-item>
          <el-form-item label="主键" prop="data.primaryKey">
            <el-input v-model="formData.data.primaryKey" placeholder="请输入主键字段" />
          </el-form-item>
          <el-form-item label="行数" prop="data.rowCount">
            <el-input-number
              v-model="formData.data.rowCount"
              :min="0"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item label="数据类型" prop="data.dataType">
            <el-select v-model="formData.data.dataType" placeholder="请选择">
              <el-option label="表" value="table" />
              <el-option label="文件" value="file" />
            </el-select>
          </el-form-item>
          <el-form-item label="描述" prop="data.description">
            <el-input
              v-model="formData.data.description"
              type="textarea"
              :rows="3"
              placeholder="请输入描述"
            />
          </el-form-item>
        </template>

        <template v-if="formData.type === 'compute'">
          <el-divider content-position="left">计算任务属性</el-divider>
          <el-form-item label="任务类型" prop="data.taskType">
            <el-select v-model="formData.data.taskType" placeholder="请选择">
              <el-option label="PSI计算" value="PSI" />
              <el-option label="MPC计算" value="MPC" />
              <el-option label="PIR查询" value="PIR" />
              <el-option label="联邦学习" value="FL" />
              <el-option label="数据导入" value="data-import" />
              <el-option label="数据导出" value="data-export" />
              <el-option label="数据过滤" value="data-filter" />
              <el-option label="数据拼接" value="data-join" />
            </el-select>
          </el-form-item>
          <el-form-item label="描述" prop="data.description">
            <el-input
              v-model="formData.data.description"
              type="textarea"
              :rows="3"
              placeholder="请输入描述"
            />
          </el-form-item>
        </template>

        <template v-if="formData.type === 'model'">
          <el-divider content-position="left">模型资源属性</el-divider>
          <el-form-item label="方法名" prop="data.methodName">
            <el-input v-model="formData.data.methodName" placeholder="请输入方法名" />
          </el-form-item>
          <el-form-item label="返回类型" prop="data.returnType">
            <el-select v-model="formData.data.returnType" placeholder="请选择">
              <el-option label="字符串" value="string" />
              <el-option label="数字" value="number" />
              <el-option label="数组" value="array" />
              <el-option label="对象" value="object" />
            </el-select>
          </el-form-item>
          <el-form-item label="描述" prop="data.description">
            <el-input
              v-model="formData.data.description"
              type="textarea"
              :rows="3"
              placeholder="请输入描述"
            />
          </el-form-item>
        </template>

        <template v-if="formData.type === 'compute-resource'">
          <el-divider content-position="left">算力资源属性</el-divider>
          <el-form-item label="核心数" prop="data.cores">
            <el-input-number
              v-model="formData.data.cores"
              :min="1"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item label="内存(GB)" prop="data.memory">
            <el-input-number
              v-model="formData.data.memory"
              :min="0"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item label="可用状态" prop="data.available">
            <el-switch v-model="formData.data.available" />
          </el-form-item>
        </template>
      </el-form>
    </div>

    <el-empty v-else description="请选择元素以编辑属性" :image-size="80" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useDagStore } from '../../stores/dagStore'

interface Props {
  graphId?: string
}

const props = withDefaults(defineProps<Props>(), {
  graphId: '',
})

const dagStore = useDagStore()
const formRef = ref<FormInstance>()

const selectedElement = computed(() => {
  const graph = props.graphId ? dagStore.graphs.get(props.graphId) : dagStore.currentGraph
  if (!graph || !dagStore.selectedNodeId) return null
  return graph.nodes.find(n => n.id === dagStore.selectedNodeId) || null
})

const formData = ref<any>({
  id: '',
  type: 'data',
  label: '',
  data: {},
})

const formRules = computed<FormRules>(() => ({
  label: [
    { required: true, message: '请输入名称', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' },
  ],
  'data.tableName': [
    { required: true, message: '请输入表名', trigger: 'blur' },
  ],
  'data.primaryKey': [
    { required: true, message: '请输入主键字段', trigger: 'blur' },
  ],
  'data.taskType': [
    { required: true, message: '请选择任务类型', trigger: 'change' },
  ],
  'data.methodName': [
    { required: true, message: '请输入方法名', trigger: 'blur' },
  ],
  'data.cores': [
    { required: true, message: '请输入核心数', trigger: 'blur' },
    { type: 'number', min: 1, message: '核心数必须大于0', trigger: 'blur' },
  ],
  'data.memory': [
    { required: true, message: '请输入内存大小', trigger: 'blur' },
    { type: 'number', min: 0, message: '内存必须大于等于0', trigger: 'blur' },
  ],
}))

const getTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    data: '数据资源',
    compute: '计算任务',
    model: '模型资源',
    'compute-resource': '算力资源',
  }
  return typeMap[type] || type
}

const handleChange = () => {
  if (!selectedElement.value || !props.graphId) return

  // 更新节点数据
  dagStore.updateNodeInGraph(props.graphId, formData.value.id, {
    label: formData.value.label,
    data: formData.value.data,
  })
}

// 监听选中元素变化
watch(selectedElement, (element) => {
  if (element) {
    formData.value = {
      id: element.id,
      type: element.type,
      label: (element.data as any).label || '',
      data: { ...element.data },
    }
  } else {
    formData.value = {
      id: '',
      type: 'data',
      label: '',
      data: {},
    }
  }
}, { deep: true })
</script>

<style scoped>
.property-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  border-left: 1px solid #e4e7ed;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
  background: #f5f7fa;
}

.panel-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}

:deep(.el-divider) {
  margin: 20px 0 16px;
}

:deep(.el-divider__text) {
  font-size: 12px;
  font-weight: 600;
  color: #606266;
}
</style>
