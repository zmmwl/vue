/**
 * 节点类型定义
 *
 * 扩展现有 src/types/dag.ts，增加隐私计算特定的节点类型
 */

import type { Position, Size, ElementState } from './graph'
import type { ElementType, ComputeTaskType, FieldType } from './validation'

// ============================================================================
// 节点基础接口
// ============================================================================

/**
 * 节点基础属性
 */
export interface BaseNodeProps {
  id: string
  type: ElementType
  position: Position
  label: string
  participantId: string
  size: Size
  state: ElementState
}

// ============================================================================
// 数据资源节点
// ============================================================================

/**
 * 字段定义
 */
export interface Field {
  name: string
  type: FieldType
  nullable: boolean
  isPrimaryKey?: boolean
  description?: string
}

/**
 * 数据资源数据
 */
export interface DataResourceData {
  name: string
  source: string
  tableName: string
  primaryKey: string
  rowCount: number
  dataType: 'table' | 'file'
  description?: string
  fields: Field[]
}

/**
 * 数据资源节点数据
 */
export interface DataResourceNodeData extends BaseNodeProps {
  type: ElementType.DATA
  data: DataResourceData
}

// ============================================================================
// 计算任务节点
// ============================================================================

/**
 * 连接端口
 */
export interface Port {
  id: string
  name: string
  dataType?: FieldType
}

/**
 * PSI配置
 */
export interface PSIConfig {
  algorithm: string
  anonymization?: string
}

/**
 * MPC配置
 */
export interface MPCConfig {
  protocol: string
  securityLevel?: number
}

/**
 * FL配置
 */
export interface FLConfig {
  framework: string
  modelType: string
  rounds?: number
}

/**
 * 任务配置
 */
export interface TaskConfig {
  psiConfig?: PSIConfig
  mpcConfig?: MPCConfig
  flConfig?: FLConfig
  genericConfig?: Record<string, unknown>
}

/**
 * 计算任务数据
 */
export interface ComputeTaskData {
  name: string
  taskType: ComputeTaskType
  config: TaskConfig
  attachedModels: string[]
  attachedComputeResource?: string
  inputPorts: Port[]
  outputPorts: Port[]
  description?: string
}

/**
 * 计算任务节点数据
 */
export interface ComputeTaskNodeData extends BaseNodeProps {
  type: ElementType.COMPUTE
  data: ComputeTaskData
}

// ============================================================================
// 模型资源节点
// ============================================================================

/**
 * 方法参数
 */
export interface MethodParameter {
  name: string
  type: FieldType
  required: boolean
  defaultValue?: unknown
  description?: string
}

/**
 * 模型资源数据
 */
export interface ModelResourceData {
  name: string
  methodName: string
  parameters: MethodParameter[]
  returnType: FieldType
  modelType: 'TEE'
  description?: string
}

/**
 * 模型资源节点数据
 */
export interface ModelResourceNodeData extends BaseNodeProps {
  type: ElementType.MODEL
  data: ModelResourceData
}

// ============================================================================
// 算力资源节点
// ============================================================================

/**
 * 算力资源数据
 */
export interface ComputeResourceData {
  name: string
  participantId: string
  resourceType: 'TEE'
  cores: number
  memory: number
  available: boolean
}

/**
 * 算力资源节点数据
 */
export interface ComputeResourceNodeData extends BaseNodeProps {
  type: ElementType.COMPUTE_RESOURCE
  data: ComputeResourceData
}

// ============================================================================
// Vue Flow节点类型映射
// ============================================================================

/**
 * 自定义节点类型
 */
export type CustomNodeType =
  | 'dataResource'
  | 'computeTask'
  | 'modelResource'
  | 'computeResource'

/**
 * 节点类型到自定义类型的映射
 */
export const NODE_TYPE_MAP: Record<ElementType, CustomNodeType> = {
  [ElementType.DATA]: 'dataResource',
  [ElementType.COMPUTE]: 'computeTask',
  [ElementType.MODEL]: 'modelResource',
  [ElementType.COMPUTE_RESOURCE]: 'computeResource',
}

/**
 * 根据元素类型获取自定义节点类型
 */
export const getCustomNodeType = (type: ElementType): CustomNodeType => {
  return NODE_TYPE_MAP[type]
}

// ============================================================================
// 资源类型别名（用于资源库定义）
// ============================================================================

/**
 * 数据资源（资源库使用）
 */
export type DataResource = DataResourceData & { id: string }

/**
 * 计算任务（资源库使用）
 */
export interface ComputeTask {
  id: string
  name: string
  taskType: ComputeTaskType
  category: 'privacy' | 'local'
  description?: string
  defaultConfig?: TaskConfig
}

/**
 * 模型资源（资源库使用）
 */
export type ModelResource = ModelResourceData & { id: string }

/**
 * 算力资源（资源库使用）
 */
export type ComputeResource = ComputeResourceData & { id: string }
