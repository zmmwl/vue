/**
 * 资源库配置数据
 *
 * 提供静态的隐私计算资源数据，包括数据资源、计算任务、模型资源和算力资源
 */

import type { DataResource, ComputeTask, ModelResource, ComputeResource, Field, MethodParameter, PSIConfig, MPCConfig, FLConfig } from '../types/nodes'

/**
 * 参与方配置
 */
export const PARTICIPANTS = [
  {
    id: 'party_a',
    name: '参与方A',
    type: 'data',
    color: '#e3f2fd',
  },
  {
    id: 'party_b',
    name: '参与方B',
    type: 'data',
    color: '#fff3cd',
  },
  {
    id: 'party_c',
    name: '参与方C',
    type: 'compute',
    color: '#f3e5f5',
  },
]

/**
 * 数据资源配置
 */
export const DATA_RESOURCES: DataResource[] = [
  {
    id: 'dr_user',
    name: '用户表',
    source: 'party_a',
    tableName: 'users',
    primaryKey: 'id',
    rowCount: 1000000,
    dataType: 'table',
    description: '用户基本信息表',
    fields: [
      { name: 'id', type: 'number', nullable: false, isPrimaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'age', type: 'number', nullable: true },
      { name: 'email', type: 'string', nullable: true },
      { name: 'phone', type: 'string', nullable: true },
    ] as Field[],
  },
  {
    id: 'dr_order',
    name: '订单表',
    source: 'party_b',
    tableName: 'orders',
    primaryKey: 'id',
    rowCount: 500000,
    dataType: 'table',
    description: '订单信息表',
    fields: [
      { name: 'id', type: 'number', nullable: false, isPrimaryKey: true },
      { name: 'order_no', type: 'string', nullable: false },
      { name: 'user_id', type: 'number', nullable: false },
      { name: 'amount', type: 'number', nullable: false },
    ] as Field[],
  },
  {
    id: 'dr_product',
    name: '商品表',
    source: 'party_a',
    tableName: 'products',
    primaryKey: 'id',
    rowCount: 10000,
    dataType: 'table',
    description: '商品信息表',
    fields: [
      { name: 'id', type: 'number', nullable: false, isPrimaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'price', type: 'number', nullable: false },
    ] as Field[],
  },
]

/**
 * PSI计算任务配置
 */
const PSI_CONFIGS: PSIConfig[] = [
  { algorithm: 'rsa', anonymization: 'none' },
  { algorithm: 'ot', anonymization: 'hash' },
  { algorithm: 'ecc', anonymization: 'random' },
]

/**
 * MPC计算任务配置
 */
const MPC_CONFIGS: MPCConfig[] = [
  { protocol: 'spdz', securityLevel: 128 },
  { protocol: 'yao', securityLevel: 192 },
]

/**
 * FL计算任务配置
 */
const FL_CONFIGS: FLConfig[] = [
  { framework: 'tensorflow', modelType: 'nn' },
  { framework: 'pytorch', modelType: 'lr' },
  { framework: 'xgboost', modelType: 'gbdt' },
]

/**
 * 隐私计算任务
 */
export const PRIVACY_TASKS: ComputeTask[] = [
  {
    id: 'task_psi',
    name: 'PSI计算',
    taskType: 'PSI',
    category: 'privacy',
    description: '隐私集合求交',
    defaultConfig: { psiConfig: PSI_CONFIGS[0] },
  },
  {
    id: 'task_mpc',
    name: 'MPC计算',
    taskType: 'MPC',
    category: 'privacy',
    description: '安全多方计算',
    defaultConfig: { mpcConfig: MPC_CONFIGS[0] },
  },
  {
    id: 'task_pir',
    name: 'PIR查询',
    taskType: 'PIR',
    category: 'privacy',
    description: '私有信息检索',
    defaultConfig: { genericConfig: { queryType: 'keyword' } },
  },
  {
    id: 'task_fl',
    name: '联邦学习',
    taskType: 'FL',
    category: 'privacy',
    description: '联邦学习',
    defaultConfig: { flConfig: FL_CONFIGS[0] },
  },
]

/**
 * 本地计算任务
 */
export const LOCAL_TASKS: ComputeTask[] = [
  {
    id: 'task_import',
    name: '数据导入',
    taskType: 'data-import',
    category: 'local',
    description: '从文件导入数据',
  },
  {
    id: 'task_export',
    name: '数据导出',
    taskType: 'data-export',
    category: 'local',
    description: '导出数据到文件',
  },
  {
    id: 'task_filter',
    name: '数据过滤',
    taskType: 'data-filter',
    category: 'local',
    description: '过滤数据记录',
  },
  {
    id: 'task_join',
    name: '数据拼接',
    taskType: 'data-join',
    category: 'local',
    description: '拼接数据表',
  },
]

/**
 * 模型资源配置
 */
const MODEL_PARAMETERS: MethodParameter[] = [
  { name: 'data', type: 'array', required: true, description: '输入数据' },
  { name: 'epsilon', type: 'number', required: false, defaultValue: 0.1, description: '隐私预算参数' },
]

export const MODEL_RESOURCES: ModelResource[] = [
  {
    id: 'model_tee',
    name: 'TEE模型',
    methodName: 'secure_aggregate',
    parameters: MODEL_PARAMETERS,
    returnType: 'array' as any,
    modelType: 'TEE',
    description: 'TEE安全聚合模型',
  },
]

/**
 * 算力资源配置
 */
export const COMPUTE_RESOURCES: ComputeResource[] = [
  {
    id: 'compute_tee_a',
    name: 'TEE算力A',
    participantId: 'party_a',
    resourceType: 'TEE',
    cores: 4,
    memory: 16,
    available: true,
  },
  {
    id: 'compute_tee_b',
    name: 'TEE算力B',
    participantId: 'party_b',
    resourceType: 'TEE',
    cores: 8,
    memory: 32,
    available: true,
  },
]
