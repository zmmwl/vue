/**
 * 验证类型定义
 *
 * 用于任务图导入验证和表单验证
 */

import { z } from 'zod'

// ============================================================================
// 元素类型枚举
// ============================================================================

/**
 * 画布元素类型
 */
export const ELEMENT_TYPES = {
  DATA: 'data',
  COMPUTE: 'compute',
  MODEL: 'model',
  COMPUTE_RESOURCE: 'compute-resource',
} as const

export type ElementType = typeof ELEMENT_TYPES[keyof typeof ELEMENT_TYPES]

/**
 * 计算任务类型
 */
export const COMPUTE_TASK_TYPES = {
  PSI: 'PSI',
  MPC: 'MPC',
  PIR: 'PIR',
  FL: 'FL',
  DATA_IMPORT: 'data-import',
  DATA_EXPORT: 'data-export',
  DATA_FILTER: 'data-filter',
  DATA_JOIN: 'data-join',
} as const

export type ComputeTaskType = typeof COMPUTE_TASK_TYPES[keyof typeof COMPUTE_TASK_TYPES]

/**
 * 数据类型枚举
 */
export const FIELD_TYPES = {
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  DATE: 'date',
  DATETIME: 'datetime',
  ARRAY: 'array',
  OBJECT: 'object',
} as const

export type FieldType = typeof FIELD_TYPES[keyof typeof FIELD_TYPES]

/**
 * 连线端点形状
 */
export const EDGE_MARKER_TYPES = {
  ARROW: 'arrow',
  TRAPEZOID: 'trapezoid',
} as const

export type EdgeMarkerType = typeof EDGE_MARKER_TYPES[keyof typeof EDGE_MARKER_TYPES]

// ============================================================================
// Schema定义
// ============================================================================

/**
 * 位置坐标
 */
export const PositionSchema = z.object({
  x: z.number(),
  y: z.number(),
})

/**
 * 元素尺寸
 */
export const SizeSchema = z.object({
  width: z.number().positive(),
  height: z.number().positive(),
})

/**
 * 元素状态
 */
export const ElementStateSchema = z.object({
  selected: z.boolean(),
  disabled: z.boolean(),
  showConnectionPoints: z.boolean(),
})

/**
 * 字段定义
 */
export const FieldSchema = z.object({
  name: z.string(),
  type: z.nativeEnum(FIELD_TYPES),
  nullable: z.boolean(),
  isPrimaryKey: z.boolean().optional(),
  description: z.string().optional(),
})

/**
 * 方法参数
 */
export const MethodParameterSchema = z.object({
  name: z.string(),
  type: z.nativeEnum(FIELD_TYPES),
  required: z.boolean(),
  defaultValue: z.any().optional(),
  description: z.string().optional(),
})

/**
 * PSI配置
 */
export const PSIConfigSchema = z.object({
  algorithm: z.string(),
  anonymization: z.string().optional(),
})

/**
 * MPC配置
 */
export const MPCConfigSchema = z.object({
  protocol: z.string(),
  securityLevel: z.number().int().optional(),
})

/**
 * FL配置
 */
export const FLConfigSchema = z.object({
  framework: z.string(),
  modelType: z.string(),
  rounds: z.number().int().optional(),
})

/**
 * 任务配置
 */
export const TaskConfigSchema = z.object({
  psiConfig: PSIConfigSchema.optional(),
  mpcConfig: MPCConfigSchema.optional(),
  flConfig: FLConfigSchema.optional(),
  genericConfig: z.record(z.any()).optional(),
})

/**
 * 连接端口
 */
export const PortSchema = z.object({
  id: z.string(),
  name: z.string(),
  dataType: z.nativeEnum(FIELD_TYPES).optional(),
})

/**
 * 数据资源数据
 */
export const DataResourceDataSchema = z.object({
  name: z.string(),
  source: z.string(),
  tableName: z.string(),
  primaryKey: z.string(),
  rowCount: z.number().int().min(0),
  dataType: z.enum(['table', 'file']),
  description: z.string().optional(),
})

/**
 * 计算任务数据
 */
export const ComputeTaskDataSchema = z.object({
  name: z.string(),
  taskType: z.nativeEnum(COMPUTE_TASK_TYPES),
  config: TaskConfigSchema,
  attachedModels: z.array(z.string()),
  attachedComputeResource: z.string().optional(),
  inputPorts: z.array(PortSchema),
  outputPorts: z.array(PortSchema),
  description: z.string().optional(),
})

/**
 * 模型资源数据
 */
export const ModelResourceDataSchema = z.object({
  name: z.string(),
  methodName: z.string(),
  parameters: z.array(MethodParameterSchema),
  returnType: z.nativeEnum(FIELD_TYPES),
  modelType: z.literal('TEE'),
  description: z.string().optional(),
})

/**
 * 算力资源数据
 */
export const ComputeResourceDataSchema = z.object({
  name: z.string(),
  participantId: z.string(),
  resourceType: z.literal('TEE'),
  cores: z.number().int().min(1),
  memory: z.number().min(0),
  available: z.boolean(),
})

/**
 * 画布元素数据联合类型
 */
export const ElementDataSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal(ELEMENT_TYPES.DATA),
    ...DataResourceDataSchema.shape,
  }),
  z.object({
    type: z.literal(ELEMENT_TYPES.COMPUTE),
    ...ComputeTaskDataSchema.shape,
  }),
  z.object({
    type: z.literal(ELEMENT_TYPES.MODEL),
    ...ModelResourceDataSchema.shape,
  }),
  z.object({
    type: z.literal(ELEMENT_TYPES.COMPUTE_RESOURCE),
    ...ComputeResourceDataSchema.shape,
  }),
])

/**
 * 画布元素
 */
export const CanvasElementSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(ELEMENT_TYPES),
  position: PositionSchema,
  label: z.string(),
  participantId: z.string(),
  data: ElementDataSchema,
  size: SizeSchema,
  state: ElementStateSchema,
})

/**
 * 连线数据
 */
export const ConnectionDataSchema = z.object({
  label: z.string().optional(),
  sourceMarker: z.nativeEnum(EDGE_MARKER_TYPES),
  targetMarker: z.nativeEnum(EDGE_MARKER_TYPES),
  connectionType: z.enum(['data', 'control']),
  animated: z.boolean().optional(),
})

/**
 * 连线
 */
export const ConnectionSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  type: z.string().optional(),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
  data: ConnectionDataSchema.optional(),
})

/**
 * 画布视口状态
 */
export const ViewportStateSchema = z.object({
  x: z.number(),
  y: z.number(),
  zoom: z.number().min(0.1).max(5),
})

/**
 * 任务图
 */
export const TaskGraphSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  elements: z.array(CanvasElementSchema),
  connections: z.array(ConnectionSchema),
  viewport: ViewportStateSchema.optional(),
})

// ============================================================================
// 验证函数
// ============================================================================

/**
 * 验证错误
 */
export interface ValidationError {
  path: string
  message: string
  code: string
}

/**
 * 验证结果
 */
export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

/**
 * 图验证结果
 */
export interface GraphValidationResult extends ValidationResult {
  hasCycles: boolean
  hasOrphanNodes: boolean
  topologicalOrder?: string[]
}

/**
 * 错误代码枚举
 */
export const ERROR_CODES = {
  DUPLICATE_NODE_ID: 'DUPLICATE_NODE_ID',
  INVALID_NODE_ID_FORMAT: 'INVALID_NODE_ID_FORMAT',
  MISSING_DATA_RESOURCE_FIELDS: 'MISSING_DATA_RESOURCE_FIELDS',
  INVALID_TASK_PORTS: 'INVALID_TASK_PORTS',
  INVALID_NODE_POSITION: 'INVALID_NODE_POSITION',
  INVALID_DATA_RESOURCE_POSITION: 'INVALID_DATA_RESOURCE_POSITION',
  INVALID_EXPORT_TASK_POSITION: 'INVALID_EXPORT_TASK_POSITION',
  INVALID_PARTICIPANT_ID: 'INVALID_PARTICIPANT_ID',
  DUPLICATE_EDGE_ID: 'DUPLICATE_EDGE_ID',
  SOURCE_NODE_NOT_FOUND: 'SOURCE_NODE_NOT_FOUND',
  TARGET_NODE_NOT_FOUND: 'TARGET_NODE_NOT_FOUND',
  SELF_CONNECTION: 'SELF_CONNECTION',
  INVALID_DATA_RESOURCE_TARGET: 'INVALID_DATA_RESOURCE_TARGET',
  INVALID_EXPORT_TASK_SOURCE: 'INVALID_EXPORT_TASK_SOURCE',
  CIRCULAR_DEPENDENCY: 'CIRCULAR_DEPENDENCY',
  INCOMPATIBLE_TASK_CONNECTION: 'INCOMPATIBLE_TASK_CONNECTION',
  MISSING_DATA_RESOURCE: 'MISSING_DATA_RESOURCE',
  MISSING_COMPUTE_TASK: 'MISSING_COMPUTE_TASK',
  ORPHAN_PARTICIPANT: 'ORPHAN_PARTICIPANT',
  GRAPH_HAS_CYCLES: 'GRAPH_HAS_CYCLES',
  INCOMPATIBLE_VERSION: 'INCOMPATIBLE_VERSION',
} as const

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES]

/**
 * 获取错误消息
 */
export const getErrorMessage = (error: z.ZodIssue): string => {
  switch (error.code) {
    case 'invalid_type':
      return `字段类型错误：期望 ${(error as any).expected}，实际得到 ${(error as any).received}`
    case 'invalid_enum':
      return `无效的枚举值：${(error as any).received}，有效值为 ${(error as any).options?.join(', ') || '无'}`
    case 'too_small':
      return `值过小：最小值为 ${(error as any).minimum}`
    case 'too_big':
      return `值过大：最大值为 ${(error as any).maximum}`
    case 'invalid_union':
      return `字段格式不匹配：多种格式均验证失败`
    case 'invalid_string':
      return `字符串格式不符合要求`
    default:
      return error.message || '未知错误'
  }
}

/**
 * 验证任务图
 */
export const validateTaskGraph = (json: unknown): ValidationResult => {
  const result = TaskGraphSchema.safeParse(json)

  if (result.success) {
    return { valid: true, errors: [] }
  }

  const errors: ValidationError[] = result.error.issues.map((err: z.ZodIssue) => ({
    path: err.path.join('.'),
    message: getErrorMessage(err),
    code: ERROR_CODES.INCOMPATIBLE_VERSION,
  }))

  return { valid: false, errors }
}
