# Implementation Plan: 隐私计算任务可视化拖拽编辑器

**Branch**: `001-privacy-computation-dag-editor` | **Date**: 2026-01-16 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-privacy-computation-dag-editor/spec.md`

## Summary

隐私计算任务可视化拖拽编辑器是一个纯前端Web应用，使用Vue 3 + TypeScript + Element Plus构建。用户通过可视化拖拽界面构建隐私计算DAG任务图，支持数据资源、计算任务、模型资源和算力资源的拖拽编排、连线操作、属性编辑以及任务图的导入导出功能。系统采用Vue Flow作为核心图库，Pinia进行状态管理，支持多tab页管理和泳道布局。

## Technical Context

**Language/Version**: TypeScript 5.9+
**Primary Dependencies**: Vue 3.5+, Vue Flow (@vue-flow/core/background/controls/minimap), Pinia 3+, Element Plus, Vite 7+
**Storage**: JSON文件（本地导出/导入），内存（session期间tab状态）
**Testing**: Vitest（单元测试），Vue Test Utils（组件测试），手动视觉验证
**Target Platform**: 现代Web浏览器（Chrome 90+, Firefox 88+, Safari 14+, Edge 90+）
**Project Type**: Web应用（SPA）
**Performance Goals**:
- 画布操作响应时间 ≤ 200ms（SC-006）
- 支持50+元素流畅操作，无明显卡顿（SC-002）
- 任务图导出/导入（100元素）≤ 3秒（SC-003）
- 渲染支持100+节点不掉帧（宪章要求）
- 图操作≤ 16ms（60fps目标）（宪章要求）
**Constraints**:
- 纯前端架构，无后端API依赖（C-001）
- 使用TypeScript严格模式（宪章原则II）
- 组件化架构（宪章原则I）
- 图数据完整性保证（宪章原则V）
**Scale/Scope**: 支持同时管理10个任务图tab（SC-005），4种资源类型（数据、计算任务、模型、算力），2大类计算任务（隐私计算PSI/MPC/PIR/FL，本地计算导入/导出/过滤/拼接）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原则 | 状态 | 检查项 | 结果 |
|------|------|--------|------|
| I. 组件优先架构 | PASS | 所有功能作为可复用Vue组件实现，清晰单一职责 | 计划使用组件化设计 |
| II. TypeScript严格模式 | PASS | 启用严格类型检查，无隐式any | tsconfig已配置strict模式 |
| III. 响应式优先 | PASS | 使用Pinia stores和Vue ref/reactive | dagStore已使用Pinia |
| IV. 视觉验证 | PASS | 视觉更改需验证 | 手动验证计划已纳入 |
| V. 图数据完整性 | PASS | 唯一ID、边引用现有节点、检测循环、原子操作 | dagStore已实现ID生成和引用维护 |
| VI. 中文优先文档 | PASS | 项目文档和注释使用中文 | 本次计划使用中文 |
| VII. 隐私计算任务编排规范 | PASS | 明确标注隐私计算技术、数据源信息、依赖关系、参数验证 | 需求已明确技术类型标注 |

**结果**: 所有门禁已通过，可以进入Phase 0。

## Project Structure

### Documentation (this feature)

```text
specs/001-privacy-computation-dag-editor/
├── spec.md              # 功能规格（已完成）
├── plan.md              # 本文件（实现计划）
├── research.md          # Phase 0输出
├── data-model.md        # Phase 1输出
├── quickstart.md        # Phase 1输出
├── contracts/           # Phase 1输出
│   └── api-types.ts    # TypeScript类型定义（替代OpenAPI，因纯前端）
└── tasks.md             # Phase 2输出（后续/speckit.tasks生成）
```

### Source Code (repository root)

```text
src/
├── components/          # Vue组件
│   ├── nodes/          # 节点组件
│   │   ├── DataResourceNode.vue       # 数据资源节点（圆形）
│   │   ├── ComputeTaskNode.vue       # 计算任务节点（圆角长方形）
│   │   ├── ModelResourceNode.vue     # 模型资源节点（圆角正方形）
│   │   └── ComputeResourceNode.vue  # 算力资源节点（附着点）
│   ├── palette/        # 资源库组件
│   │   ├── NodePalette.vue           # 主调色板（可折叠）
│   │   ├── DataResourcesPanel.vue    # 数据资源面板
│   │   ├── ComputeTasksPanel.vue     # 计算任务面板
│   │   ├── ModelsPanel.vue          # 模型资源面板
│   │   └── ComputeResourcesPanel.vue # 算力资源面板
│   ├── canvas/         # 画布组件
│   │   ├── DagCanvas.vue            # 主画布容器
│   │   └── Swimlane.vue            # 泳道组件（按参与方划分）
│   ├── panels/         # 详情面板组件
│   │   ├── PropertyPanel.vue        # 属性编辑面板
│   │   └── ValidationPanel.vue      # 验证提示面板
│   ├── tabs/           # Tab管理组件
│   │   ├── TabBar.vue              # Tab标签栏
│   │   ├── TabItem.vue             # Tab项
│   │   └── TabContent.vue          # Tab内容容器
│   └── toolbar/        # 工具栏组件
│       ├── ExportButton.vue          # 导出按钮
│       ├── ImportButton.vue          # 导入按钮
│       └── ZoomControls.vue         # 缩放控件
├── stores/             # Pinia状态管理
│   ├── dagStore.ts     # 图状态（节点、边、CRUD操作）
│   ├── tabStore.ts     # Tab管理状态（tab列表、切换、关闭）
│   └── resourceStore.ts # 资源库状态（静态元数据）
├── types/             # TypeScript类型定义
│   ├── dag.ts         # DAG核心类型（节点、边、图）
│   ├── nodes.ts        # 节点类型定义（扩展现有）
│   ├── graph.ts        # 图结构类型
│   └── validation.ts  # 验证类型
├── utils/             # 工具函数
│   ├── graph.ts       # 图操作工具（拓扑排序、循环检测）
│   ├── validation.ts  # 任务验证逻辑
│   ├── export.ts     # JSON导出/导入工具
│   └── layout.ts     # 泳道布局计算
├── data/             # 静态数据（资源库元数据）
│   ├── resources.ts   # 资源库配置（数据资源、任务等）
│   └── participants.ts # 参与方配置
├── assets/           # 静态资源
│   └── images/
│       └── dag-sample.png  # DAG样例参考图
└── main.ts           # 应用入口

tests/
├── unit/             # 单元测试
│   ├── utils/
│   │   ├── graph.test.ts
│   │   ├── validation.test.ts
│   │   └── export.test.ts
│   └── stores/
│       ├── dagStore.test.ts
│       └── tabStore.test.ts
├── component/        # 组件测试
│   ├── nodes/
│   ├── palette/
│   └── canvas/
└── e2e/             # 集成测试
    └── workflow.test.ts
```

**Structure Decision**: 采用Vue 3 + TypeScript + Vite的标准SPA项目结构，基于现有项目骨架扩展。源代码组织遵循宪章规定的组件优先和响应式状态管理原则，资源库数据通过静态配置文件提供（C-001），图状态由Pinia stores管理。

## Phase 0: Outline & Research

### 待研究项

基于Technical Context分析，以下待研究项需要解决：

1. **Vue Flow自定义节点渲染**
   - 研究如何实现不同形状的节点（圆形、圆角长方形、菱形）
   - 研究节点附着点（模型、算力）的实现方式
   - 研究连线端点形状（箭头、梯形）的自定义

2. **泳道布局实现**
   - 研究Vue Flow如何支持泳道布局
   - 研究按参与方横向分域的布局计算
   - 研究数据资源顶端约束、导出任务底端约束的实现

3. **多Tab状态管理**
   - 研究Pinia如何管理多个独立的图状态
   - 研究Tab关闭后的隐藏与恢复机制（session内存留）
   - 研究Tab切换时的状态隔离

4. **JSON导入验证**
   - 研究JSON schema验证的最佳实践（纯前端）
   - 研究如何提供具体的错误详情（缺少字段、类型不匹配）
   - 研究Vue Flow的图数据兼容性

5. **Element Plus集成**
   - 研究与Vue Flow的兼容性
   - 研究表单组件（属性编辑）的使用
   - 研究Tab组件与状态管理的集成

### 研究任务

在Phase 0中将执行以下研究任务：

| 任务ID | 研究内容 | 输出 |
|--------|----------|------|
| R-001 | Vue Flow自定义节点与连线样式 | 节点形状、附着点、连线端点实现方案 |
| R-002 | Vue Flow泳道布局 | 泳道组件设计与实现方案 |
| R-003 | Pinia多图状态管理 | Tab状态隔离与持久化方案 |
| R-004 | JSON验证与错误提示 | 验证库选择与错误格式化方案 |
| R-005 | Element Plus + Vue Flow集成 | UI组件库集成方案 |

### Phase 0输出

研究完成后将生成 `research.md`，包含：
- 每个研究任务的决策
- 决策理由
- 已考虑的替代方案
- 最终技术选择

## Phase 1: Design & Contracts

### 1.1 数据模型设计 (data-model.md)

基于规格的Key Entities，Phase 1将生成完整的数据模型：

**核心实体**:
- 任务图（TaskGraph）- 包含版本、元数据、元素集合
- 画布元素（CanvasElement）- 统一接口，支持4种类型
- 数据资源（DataResource）- 字段定义、主键、规模
- 计算任务（ComputeTask）- 任务类型、配置、输入输出
- 模型资源（ModelResource）- 方法定义、参数类型
- 算力资源（ComputeResource）- 参与方、规格
- 连线（Connection）- 数据流向、端点形状
- 参与方（Participant）- 泳道域定义

**关系**:
- 画布元素归属任务图
- 连线连接两个画布元素
- 计算任务附着模型和算力资源
- 参与方拥有数据资源和算力资源

**验证规则**:
- 所有节点必须有唯一ID
- 连线必须引用现有节点
- 数据源不能作为连线目标
- 导出任务不能作为连线起点

### 1.2 类型定义 (contracts/api-types.ts)

由于纯前端架构，不需要OpenAPI spec，将生成TypeScript类型定义：

```typescript
// 资源库类型
interface ResourceLibrary {
  dataResources: DataResource[];
  computeTasks: ComputeTask[];
  modelResources: ModelResource[];
  computeResources: ComputeResource[];
}

// 任务图类型
interface TaskGraph {
  id: string;
  name: string;
  version: string;
  elements: CanvasElement[];
  connections: Connection[];
  participants: Participant[];
}

// 元素类型（扩展dag.ts）
type ElementType = 'data' | 'compute' | 'model' | 'compute-resource';

// 验证结果类型
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

interface ValidationError {
  path: string;
  message: string;
  code: string;
}
```

### 1.3 快速开始指南 (quickstart.md)

Phase 1将生成开发者快速开始指南：

- 环境设置（Node.js、依赖安装）
- 启动开发服务器
- 创建第一个DAG任务图
- 导出和导入任务图
- 测试运行

### 1.4 Agent上下文更新

完成设计后，运行 `.specify/scripts/bash/update-agent-context.sh claude` 更新agent上下文文件，添加以下新技术：
- Vue Flow (@vue-flow/core)
- Element Plus
- Vitest（测试框架）
