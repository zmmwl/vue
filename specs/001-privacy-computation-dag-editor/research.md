# Research Output: 隐私计算任务可视化拖拽编辑器

**Feature**: 001-privacy-computation-dag-editor
**Date**: 2026-01-16

本文档记录Phase 0研究中所有技术决策、理由和替代方案。

## R-001: Vue Flow自定义节点与连线样式

### 决策
使用Vue Flow的自定义节点组件（Custom Nodes）和自定义边（Custom Edges）功能实现差异化样式。

### 技术方案

**节点形状实现**:
- **数据资源节点（圆形）**: 使用CSS `border-radius: 50%` 实现
- **计算任务节点（圆角长方形）**: 使用CSS `border-radius: 8px` 实现
- **模型资源节点（圆角正方形）**: 使用CSS `border-radius: 8px` + `aspect-ratio: 1` 实现
- **算力资源节点（附着点）**: 作为计算任务节点的子组件，使用绝对定位

**连线端点形状**:
- **输入端（箭头）**: 使用Vue Flow的 `markerEnd` 自定义marker
- **输出端（梯形）**: 使用Vue Flow的 `markerEnd` 自定义marker

### 实现代码示例

```typescript
// 自定义节点组件
const nodeTypes = {
  dataResource: DataResourceNode,
  computeTask: ComputeTaskNode,
  modelResource: ModelResourceNode,
}

// 自定义边
const edgeTypes = {
  dataFlow: CustomEdge,
}

// Marker定义
const markerDefs = `
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#555"/>
    </marker>
    <marker id="trapezoid" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
      <polygon points="0 0, 10 2, 10 6, 0 8" fill="#555"/>
    </marker>
  </defs>
`
```

### 理由
Vue Flow支持通过Vue组件完全自定义节点外观，提供了最大的灵活性。CSS border-radius是实现不同形状最简单、性能最好的方式。Marker系统是SVG标准，支持任意形状的线端装饰。

### 替代方案考虑
1. **SVG内联绘制**: 代码复杂度高，维护困难
2. **Canvas渲染**: 难以实现Vue响应式特性，失去组件化优势

---

## R-002: Vue Flow泳道布局

### 决策
使用CSS Grid/Flexbox实现泳道背景，结合Vue Flow的坐标系统约束节点位置。

### 技术方案

**泳道实现**:
- 使用CSS Grid创建水平泳道，按参与方数量分列
- 每列宽度根据参与方平均分配
- 泳道标签置于每列顶部

**节点位置约束**:
- 数据资源节点: 限制y坐标在顶部区域（0-100px）
- 数据导出任务: 限制y坐标在底部区域（画布高度-100px 至画布高度）
- 其他节点: 可自由放置但受泳道x坐标约束

### 实现代码示例

```vue
<template>
  <div class="swimlane-container">
    <div class="swimlane-labels">
      <div v-for="participant in participants" :key="participant.id">
        {{ participant.name }}
      </div>
    </div>
    <VueFlow
      :nodes="nodes"
      :edges="edges"
      :node-types="nodeTypes"
      @node-drag="onNodeDrag"
    >
      <Background />
    </VueFlow>
  </div>
</template>

<style scoped>
.swimlane-container {
  display: flex;
  height: 100%;
}

.swimlane-labels {
  width: 150px;
  border-right: 1px solid #ccc;
  display: flex;
  flex-direction: column;
}

.vue-flow {
  flex: 1;
  background-image:
    linear-gradient(to right, #f0f0f0 1px, transparent 1px);
  background-size: 25% 100%;
}
</style>
```

### 理由
CSS背景渐变是最轻量的泳道实现方式，不增加DOM节点复杂度。Vue Flow的坐标系统保持原生，通过拖拽事件限制坐标范围实现约束。

### 替代方案考虑
1. **Vue Flow Minimap分区**: 功能有限，无法实现真正的泳道约束
2. **独立泳道组件**: 增加状态同步复杂度，拖拽跨泳道困难

---

## R-003: Pinia多图状态管理

### 决策
使用对象Map存储多个图状态，tabStore管理tab列表和当前激活tab。

### 技术方案

**Store结构**:
```typescript
// tabStore.ts
export const useTabStore = defineStore('tab', () => {
  const tabs = ref<Tab[]>([])
  const activeTabId = ref<string>('')
  const closedTabs = ref<Map<string, Tab>>(new Map())

  const openNewTab = () => {
    const newTab: Tab = {
      id: generateId(),
      name: `任务图 ${tabs.value.length + 1}`,
      graphId: generateGraphId(),
      isDirty: false,
    }
    tabs.value.push(newTab)
    activeTabId.value = newTab.id
    // 初始化空的图状态
    initializeGraph(newTab.graphId)
  }

  const closeTab = (tabId: string) => {
    const index = tabs.value.findIndex(t => t.id === tabId)
    if (index !== -1) {
      const tab = tabs.value[index]
      // 保存到关闭tab记录（session期间保留）
      closedTabs.value.set(tabId, tab)
      tabs.value.splice(index, 1)
      // 切换到相邻tab
      if (activeTabId.value === tabId) {
        activeTabId.value = tabs.value[Math.max(0, index - 1)]?.id || ''
      }
    }
  }

  const restoreTab = (tabId: string) => {
    const tab = closedTabs.value.get(tabId)
    if (tab) {
      tabs.value.push(tab)
      activeTabId.value = tab.id
      closedTabs.value.delete(tabId)
    }
  }

  return { tabs, activeTabId, openNewTab, closeTab, restoreTab }
})
```

**多图状态**:
```typescript
// dagStore.ts 扩展
export const useDagStore = defineStore('dag', () => {
  const graphs = ref<Map<string, GraphState>>(new Map())

  const getCurrentGraph = () => {
    const tabStore = useTabStore()
    return graphs.value.get(tabStore.activeTabId)
  }

  const initializeGraph = (graphId: string) => {
    graphs.value.set(graphId, {
      id: graphId,
      nodes: [],
      edges: [],
      nodeIdCounter: 1,
      edgeIdCounter: 1,
    })
  }

  return { graphs, getCurrentGraph, initializeGraph, ... }
})
```

### 理由
Map结构提供O(1)的查找性能，适合管理多个图状态。分离tab管理和图状态，符合单一职责原则。closedTabs使用Map存储，方便恢复。

### 替代方案考虑
1. **Pinia Store嵌套**: Pinia不支持store间的直接引用，增加复杂度
2. **localStorage持久化**: 增加同步开销，违反纯前端快速响应需求

---

## R-004: JSON验证与错误提示

### 决策
使用TypeScript运行时类型检查库（io-ts或zod）进行验证，结合自定义错误格式化提供详细错误信息。

### 技术方案

**选择**: 使用 **zod** 进行schema定义和验证

**验证实现**:
```typescript
import { z } from 'zod'

// 定义验证schema
const NodeSchema = z.object({
  id: z.string(),
  type: z.enum(['data', 'compute', 'model', 'compute-resource']),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: z.object({
    label: z.string(),
    // 根据类型验证不同字段
  }),
})

const EdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  type: z.string(),
})

const TaskGraphSchema = z.object({
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
  version: z.string().optional(),
})

// 验证函数
export const validateTaskGraph = (json: unknown): ValidationResult => {
  const result = TaskGraphSchema.safeParse(json)

  if (result.success) {
    return { valid: true, errors: [] }
  }

  const errors: ValidationError[] = result.error.errors.map(err => ({
    path: err.path.join('.'),
    message: getErrorMessage(err),
    code: err.code,
  }))

  return { valid: false, errors }
}

// 错误消息格式化
const getErrorMessage = (err: z.ZodIssue): string => {
  switch (err.code) {
    case 'invalid_type':
      return `字段类型错误：期望 ${err.expected}，实际得到 ${err.received}`
    case 'invalid_enum':
      return `无效的枚举值：${err.received}，有效值为 ${err.options?.join(', ')}`
    case 'too_small':
      return `值过小：最小值为 ${err.minimum}`
    case 'too_big':
      return `值过大：最大值为 ${err.maximum}`
    case 'invalid_union':
      return `字段格式不匹配：多种格式均验证失败`
    case 'invalid_string':
      return `字符串格式不符合要求`
    default:
      return err.message || '未知错误'
  }
}
```

**验证时机**:
1. 文件选择后立即验证格式
2. 显示错误列表，每个错误包含路径、消息和建议
3. 验证通过后才导入图数据

### 理由
zod提供TypeScript-first的API，类型推断准确，错误信息可定制。相比io-ts，zod的API更简洁，维护性更好。相比手动验证，zod提供完整的schema描述和可复用的验证逻辑。

### 替代方案考虑
1. **io-ts**: FP风格，学习曲线陡峭，错误消息定制困难
2. **ajv**: JSON Schema格式，与TypeScript类型需要额外同步
3. **手动验证**: 代码冗长，难以维护，错误消息不一致

---

## R-005: Element Plus + Vue Flow集成

### 决策
Element Plus用于表单、Tab、弹窗等UI组件，Vue Flow负责画布和节点渲染，通过Pinia store进行状态同步。

### 技术方案

**组件分工**:

| 功能 | 负责组件 | 说明 |
|------|-----------|------|
| 画布渲染 | Vue Flow (@vue-flow/core) | 节点、连线、拖拽 |
| 资源库 | Element Plus (ElCollapse, ElTree) | 可折叠树形资源列表 |
| Tab管理 | Element Plus (ElTabs, ElTabPane) | Tab切换和关闭 |
| 属性表单 | Element Plus (ElForm, ElFormItem) | 元素属性编辑 |
| 工具栏 | Element Plus (ElButton, ElDropdown) | 导出、导入等操作 |
| 消息提示 | Element Plus (ElMessage, ElMessageBox) | 错误和成功提示 |

**集成方式**:
```vue
<template>
  <div class="app-container">
    <!-- 左侧资源库 -->
    <el-collapse v-model="activeResourcePanel" class="resource-panel">
      <el-collapse-item title="数据资源" name="data">
        <DataResourcesPanel @drag-start="handleDragStart" />
      </el-collapse-item>
      <el-collapse-item title="计算任务" name="compute">
        <ComputeTasksPanel @drag-start="handleDragStart" />
      </el-collapse-item>
      <!-- 其他资源面板 -->
    </el-collapse>

    <!-- 中间Tab和画布 -->
    <div class="main-area">
      <el-tabs v-model="activeTabId" type="card" closable @tab-remove="handleTabRemove">
        <el-tab-pane
          v-for="tab in tabs"
          :key="tab.id"
          :label="tab.name"
          :name="tab.id"
        >
          <DagCanvas :graph-id="tab.graphId" />
        </el-tab-pane>
        <template #add-icon>
          <el-button @click="openNewTab" :icon="Plus" circle />
        </template>
      </el-tabs>
    </div>

    <!-- 右侧属性面板 -->
    <div class="property-panel">
      <el-form
        v-if="selectedElement"
        :model="selectedElementData"
        label-width="100px"
        @change="handlePropertyChange"
      >
        <el-form-item label="名称" prop="label">
          <el-input v-model="selectedElementData.label" />
        </el-form-item>
        <!-- 其他表单项 -->
      </el-form>
      <el-empty v-else description="请选择元素以编辑属性" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
</script>
```

**样式适配**:
- Element Plus主题定制以匹配DAG样例视觉风格
- Vue Flow的节点样式与Element Plus保持一致
- 响应式布局确保三栏自适应

### 理由
Element Plus提供完整的Vue 3组件库，文档完善，社区活跃。与Vue Flow不冲突，各自负责不同的UI领域。Pinia store作为单一数据源，确保状态一致性。

### 替代方案考虑
1. **Naive UI**: 组件丰富但生态较小，学习成本较高
2. **Ant Design Vue**: 组件齐全但体积较大，按需引入配置复杂
3. **纯自定义组件**: 开发成本高，缺乏统一的交互体验

---

## 研究总结

所有研究任务已完成，技术决策如下：

| 研究任务 | 技术选择 | 核心理由 |
|----------|----------|----------|
| R-001 | Vue Flow自定义节点 + CSS样式 | 最大灵活性，性能最优 |
| R-002 | CSS Grid/Flex + 坐标约束 | 轻量实现，保持Vue Flow原生能力 |
| R-003 | Pinia Map + 独立tabStore | O(1)查找，职责分离 |
| R-004 | zod验证库 | TypeScript-first，错误定制友好 |
| R-005 | Element Plus + Vue Flow组合 | 组件完整，生态成熟 |

下一步：进入Phase 1，生成数据模型和类型定义。
