/**
 * 类型定义 - 隐私计算任务可视化拖拽编辑器
 *
 * 本文件定义应用中使用的核心类型接口，作为API契约文档。
 * 纯前端架构，这些类型在前后端之间共享（同一进程）。
 *
 * @module types
 */

// ============================================================================
// 元素类型枚举
// ============================================================================

/**
 * 画布元素类型
 */
export enum ElementType {
  /** 数据资源 - 圆形显示 */
  DATA = 'data',
  /** 计算任务 - 圆角长方形显示 */
  COMPUTE = 'compute',
  /** 模型资源 - 圆角正方形显示 */
  MODEL = 'model',
  /** 算力资源 - 附着点显示 */
  COMPUTE_RESOURCE = 'compute-resource',
}

/**
 * 计算任务类型
 */
export enum ComputeTaskType {
  /** 隐私集合求交 */
  PSI = 'PSI',
  /** 安全多方计算 */
  MPC = 'MPC',
  /** 私有信息检索 */
  PIR = 'PIR',
  /** 联邦学习 */
  FL = 'FL',
  /** 数据导入 */
  DATA_IMPORT = 'data-import',
  /** 数据导出 */
  DATA_EXPORT = 'data-export',
  /** 数据过滤 */
  DATA_FILTER = 'data-filter',
  /** 数据拼接 */
  DATA_JOIN = 'data-join',
}

/**
 * 数据类型枚举
 */
export enum FieldType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  DATE = 'date',
  DATETIME = 'datetime',
  ARRAY = 'array',
  OBJECT = 'object',
}

/**
 * 连线端点形状
 */
export enum EdgeMarkerType {
  /** 箭头 - 输入端 */
  ARROW = 'arrow',
  /** 梯形 - 输出端 */
  TRAPEZOID = 'trapezoid',
}

// ============================================================================
// 基础类型
// ============================================================================

/**
 * 位置坐标
 */
export interface Position {
  /** x轴坐标 */
  x: number;
  /** y轴坐标 */
  y: number;
}

/**
 * 元素尺寸
 */
export interface Size {
  /** 宽度（像素） */
  width: number;
  /** 高度（像素） */
  height: number;
}

/**
 * 元素状态
 */
export interface ElementState {
  /** 是否被选中 */
  selected: boolean;
  /** 是否被禁用 */
  disabled: boolean;
  /** 是否显示连接点 */
  showConnectionPoints: boolean;
}

// ============================================================================
// 资源库类型
// ============================================================================

/**
 * 字段定义
 */
export interface Field {
  /** 字段名 */
  name: string;
  /** 数据类型 */
  type: FieldType;
  /** 是否可为空 */
  nullable: boolean;
  /** 是否是主键 */
  isPrimaryKey?: boolean;
  /** 字段描述 */
  description?: string;
}

/**
 * 数据资源
 */
export interface DataResource {
  /** 唯一标识符 */
  id: string;
  /** 资源名称 */
  name: string;
  /** 来源参与方 */
  source: string;
  /** 数据库表名或文件路径 */
  tableName: string;
  /** 字段定义 */
  fields: Field[];
  /** 主键字段名 */
  primaryKey: string;
  /** 数据规模（行数） */
  rowCount: number;
  /** 数据类型（表/文件） */
  dataType: 'table' | 'file';
  /** 描述信息 */
  description?: string;
}

/**
 * 方法参数
 */
export interface MethodParameter {
  /** 参数名 */
  name: string;
  /** 参数类型 */
  type: FieldType;
  /** 是否必填 */
  required: boolean;
  /** 默认值 */
  defaultValue?: unknown;
  /** 参数描述 */
  description?: string;
}

/**
 * 模型资源
 */
export interface ModelResource {
  /** 唯一标识符 */
  id: string;
  /** 模型名称 */
  name: string;
  /** 方法名称 */
  methodName: string;
  /** 方法参数 */
  parameters: MethodParameter[];
  /** 返回参数类型 */
  returnType: FieldType;
  /** 模型类型（TEE） */
  modelType: 'TEE';
  /** 模型描述 */
  description?: string;
}

/**
 * 算力资源
 */
export interface ComputeResource {
  /** 唯一标识符 */
  id: string;
  /** 资源名称 */
  name: string;
  /** 所属参与方 */
  participantId: string;
  /** 算力类型（TEE） */
  resourceType: 'TEE';
  /** 核心数 */
  cores: number;
  /** 内存大小（GB） */
  memory: number;
  /** 可用状态 */
  available: boolean;
}

/**
 * 计算任务模板
 */
export interface ComputeTaskTemplate {
  /** 唯一标识符 */
  id: string;
  /** 任务名称 */
  name: string;
  /** 任务类型 */
  taskType: ComputeTaskType;
  /** 任务分类（隐私计算/本地计算） */
  category: 'privacy' | 'local';
  /** 任务描述 */
  description?: string;
  /** 默认配置 */
  defaultConfig?: Record<string, unknown>;
}

/**
 * 资源库
 */
export interface ResourceLibrary {
  /** 数据资源列表 */
  dataResources: DataResource[];
  /** 隐私计算任务模板 */
  privacyTasks: ComputeTaskTemplate[];
  /** 本地计算任务模板 */
  localTasks: ComputeTaskTemplate[];
  /** 模型资源列表 */
  modelResources: ModelResource[];
  /** 算力资源列表 */
  computeResources: ComputeResource[];
}

// ============================================================================
// 参与方类型
// ============================================================================

/**
 * 参与方类型
 */
export interface Participant {
  /** 唯一标识符 */
  id: string;
  /** 参与方名称 */
  name: string;
  /** 参与方类型 */
  type: 'data' | 'compute' | 'result';
  /** 泳道颜色标识 */
  color?: string;
  /** 描述信息 */
  description?: string;
}

// ============================================================================
// 任务图类型
// ============================================================================

/**
 * 任务配置
 */
export interface TaskConfig {
  /** PSI配置 */
  psiConfig?: PSIConfig;
  /** MPC配置 */
  mpcConfig?: MPCConfig;
  /** FL配置 */
  flConfig?: FLConfig;
  /** 通用配置 */
  genericConfig?: Record<string, unknown>;
}

/**
 * PSI配置
 */
export interface PSIConfig {
  /** PSI算法类型 */
  algorithm: string;
  /** 数据脱敏方式 */
  anonymization?: string;
}

/**
 * MPC配置
 */
export interface MPCConfig {
  /** MPC协议类型 */
  protocol: string;
  /** 安全参数 */
  securityLevel?: number;
}

/**
 * FL配置
 */
export interface FLConfig {
  /** 联邦学习框架 */
  framework: string;
  /** 模型类型 */
  modelType: string;
  /** 训练轮次 */
  rounds?: number;
}

/**
 * 连接端口
 */
export interface Port {
  /** 端口ID */
  id: string;
  /** 端口名称 */
  name: string;
  /** 数据类型 */
  dataType?: FieldType;
}

/**
 * 计算任务数据
 */
export interface ComputeTaskData {
  /** 任务名称 */
  name: string;
  /** 任务类型 */
  taskType: ComputeTaskType;
  /** 任务配置 */
  config: TaskConfig;
  /** 附着的模型资源ID列表 */
  attachedModels: string[];
  /** 附着的算力资源ID */
  attachedComputeResource?: string;
  /** 输入连接点 */
  inputPorts: Port[];
  /** 输出连接点 */
  outputPorts: Port[];
  /** 任务描述 */
  description?: string;
}

/**
 * 画布元素
 */
export interface CanvasElement {
  /** 唯一标识符 */
  id: string;
  /** 元素类型 */
  type: ElementType;
  /** 画布中的位置 */
  position: Position;
  /** 元素显示标签 */
  label: string;
  /** 元素关联的参与方ID */
  participantId: string;
  /** 元素数据（根据类型包含不同属性） */
  data:
    | DataResourceData
    | ComputeTaskData
    | ModelResourceData
    | ComputeResourceData;
  /** 元素尺寸 */
  size: Size;
  /** 元素状态 */
  state: ElementState;
}

/**
 * 数据资源数据
 */
export interface DataResourceData extends DataResource {}

/**
 * 模型资源数据
 */
export interface ModelResourceData extends ModelResource {}

/**
 * 算力资源数据
 */
export interface ComputeResourceData extends ComputeResource {}

/**
 * 连线数据
 */
export interface ConnectionData {
  /** 连线标签 */
  label?: string;
  /** 起点端点形状 */
  sourceMarker: EdgeMarkerType;
  /** 终点端点形状 */
  targetMarker: EdgeMarkerType;
  /** 连线类型 */
  connectionType: 'data' | 'control';
  /** 是否激活（动画效果） */
  animated?: boolean;
}

/**
 * 连线
 */
export interface Connection {
  /** 唯一标识符 */
  id: string;
  /** 起点元素ID */
  source: string;
  /** 终点元素ID */
  target: string;
  /** 连线类型（Vue Flow） */
  type?: string;
  /** 起点端口ID */
  sourceHandle?: string;
  /** 终点端口ID */
  targetHandle?: string;
  /** 连线数据 */
  data?: ConnectionData;
}

/**
 * 画布视口状态
 */
export interface ViewportState {
  /** x轴平移量 */
  x: number;
  /** y轴平移量 */
  y: number;
  /** 缩放比例 */
  zoom: number;
}

/**
 * 任务图 - 完整的DAG图定义
 */
export interface TaskGraph {
  /** 唯一标识符 */
  id: string;
  /** 任务图名称 */
  name: string;
  /** 版本号 */
  version: string;
  /** 创建时间（ISO 8601） */
  createdAt: string;
  /** 最后修改时间（ISO 8601） */
  updatedAt: string;
  /** 画布中的所有元素 */
  elements: CanvasElement[];
  /** 元素之间的连线 */
  connections: Connection[];
  /** 参与该隐私计算的参与方 */
  participants: Participant[];
  /** 画布视口状态 */
  viewport: ViewportState;
}

// ============================================================================
// Tab管理类型
// ============================================================================

/**
 * Tab项
 */
export interface Tab {
  /** Tab唯一标识符 */
  id: string;
  /** Tab显示名称 */
  name: string;
  /** 关联的任务图ID */
  graphId: string;
  /** 是否有未保存的更改 */
  isDirty: boolean;
  /** 创建时间 */
  createdAt: string;
  /** 最后活动时间 */
  lastActiveAt: string;
}

/**
 * Tab状态
 */
export interface TabState {
  /** 所有打开的tab列表 */
  tabs: Tab[];
  /** 当前激活的tab ID */
  activeTabId: string;
  /** 已关闭但可恢复的tab映射 */
  closedTabs: Map<string, Tab>;
}

// ============================================================================
// 验证类型
// ============================================================================

/**
 * 验证结果
 */
export interface ValidationResult {
  /** 是否验证通过 */
  valid: boolean;
  /** 错误列表 */
  errors: ValidationError[];
}

/**
 * 验证错误
 */
export interface ValidationError {
  /** 错误路径（JSON path格式） */
  path: string;
  /** 错误消息 */
  message: string;
  /** 错误代码 */
  code: string;
  /** 错误详情（可选） */
  details?: Record<string, unknown>;
}

/**
 * 图验证结果
 */
export interface GraphValidationResult extends ValidationResult {
  /** 是否有循环依赖 */
  hasCycles: boolean;
  /** 是否有孤立节点 */
  hasOrphanNodes: boolean;
  /** 拓扑排序结果（如果无环） */
  topologicalOrder?: string[];
}

// ============================================================================
// 事件类型
// ============================================================================

/**
 * 拖拽开始事件
 */
export interface DragStartEvent {
  /** 被拖拽的资源类型 */
  resourceType: ElementType;
  /** 资源ID */
  resourceId: string;
  /** 鼠标初始位置 */
  startPosition: Position;
}

/**
 * 拖拽结束事件
 */
export interface DragEndEvent {
  /** 最终位置 */
  position: Position;
  /** 是否放置在有效区域 */
  dropped: boolean;
  /** 目标任务图ID */
  targetGraphId?: string;
}

/**
 * 节点选择事件
 */
export interface NodeSelectEvent {
  /** 节点ID */
  nodeId: string;
  /** 是否被选中 */
  selected: boolean;
  /** 事件触发时按下的修饰键 */
  modifiers?: {
    ctrl: boolean;
    shift: boolean;
    alt: boolean;
  };
}

/**
 * 连线创建事件
 */
export interface ConnectionCreateEvent {
  /** 起点节点ID */
  sourceNodeId: string;
  /** 终点节点ID */
  targetNodeId: string;
  /** 起点端口ID */
  sourceHandle?: string;
  /** 终点端口ID */
  targetHandle?: string;
}

/**
 * 属性变更事件
 */
export interface PropertyChangeEvent {
  /** 元素ID */
  elementId: string;
  /** 变更的属性路径 */
  propertyPath: string;
  /** 旧值 */
  oldValue: unknown;
  /** 新值 */
  newValue: unknown;
}

// ============================================================================
// 常量类型
// ============================================================================

/**
 * 应用配置
 */
export interface AppConfig {
  /** 支持的schema版本 */
  supportedVersions: string[];
  /** 当前schema版本 */
  currentVersion: string;
  /** 最大tab数量 */
  maxTabs: number;
  /** 元素位置边界 */
  bounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
  /** 性能配置 */
  performance: {
    maxNodes: number;
    maxEdges: number;
    renderTimeout: number;
  };
}

/**
 * 默认应用配置
 */
export const DEFAULT_APP_CONFIG: AppConfig = {
  supportedVersions: ['1.0.0'],
  currentVersion: '1.0.0',
  maxTabs: 10,
  bounds: {
    minX: 0,
    minY: 0,
    maxX: 10000,
    maxY: 10000,
  },
  performance: {
    maxNodes: 100,
    maxEdges: 200,
    renderTimeout: 200,
  },
};

// ============================================================================
// 类型守卫
// ============================================================================

/**
 * 判断元素数据是否为数据资源
 */
export function isDataResourceData(
  data: unknown
): data is DataResourceData {
  const d = data as Record<string, unknown>;
  return typeof d === 'object' && d !== null && 'tableName' in d && 'primaryKey' in d;
}

/**
 * 判断元素数据是否为计算任务
 */
export function isComputeTaskData(
  data: unknown
): data is ComputeTaskData {
  const d = data as Record<string, unknown>;
  return (
    typeof d === 'object' &&
    d !== null &&
    'taskType' in d &&
    'inputPorts' in d &&
    'outputPorts' in d
  );
}

/**
 * 判断元素数据是否为模型资源
 */
export function isModelResourceData(
  data: unknown
): data is ModelResourceData {
  const d = data as Record<string, unknown>;
  return typeof d === 'object' && d !== null && 'methodName' in d && 'parameters' in d;
}

/**
 * 判断元素数据是否为算力资源
 */
export function isComputeResourceData(
  data: unknown
): data is ComputeResourceData {
  const d = data as Record<string, unknown>;
  return (
    typeof d === 'object' &&
    d !== null &&
    'resourceType' in d &&
    'cores' in d
  );
}
