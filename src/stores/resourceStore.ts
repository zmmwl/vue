/**
 * 资源库Store
 *
 * 管理资源库的静态元数据加载和访问
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { DataResource, ComputeTask, ModelResource, ComputeResource } from '../types/nodes'

/**
 * 资源库数据
 */
export interface ResourceLibrary {
  dataResources: DataResource[]
  privacyTasks: ComputeTask[]
  localTasks: ComputeTask[]
  modelResources: ModelResource[]
  computeResources: ComputeResource[]
}

/**
 * 资源库Store
 */
export const useResourceStore = defineStore('resource', () => {
  // 静态资源库数据
  const resourceLibrary = ref<ResourceLibrary>({
    dataResources: [],
    privacyTasks: [],
    localTasks: [],
    modelResources: [],
    computeResources: [],
  })

  /**
   * 初始化资源库数据
   */
  const initializeLibrary = (): void => {
    // 在实际实现中，这里应该从静态文件加载数据
    // 目前使用模拟数据用于测试
    resourceLibrary.value = {
      dataResources: [
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
          ],
        },
        {
          id: 'dr_order',
          name: '订单表',
          source: 'party_a',
          tableName: 'orders',
          primaryKey: 'id',
          rowCount: 500000,
          dataType: 'table',
          description: '订单信息表',
          fields: [
            { name: 'id', type: 'number', nullable: false, isPrimaryKey: true },
            { name: 'order_no', type: 'string', nullable: false },
            { name: 'amount', type: 'number', nullable: false },
          ],
        },
      ],
      privacyTasks: [
        {
          id: 'task_psi',
          name: 'PSI计算',
          taskType: 'PSI',
          category: 'privacy',
          description: '隐私集合求交',
          defaultConfig: { psiConfig: { algorithm: 'rsa' } },
        },
        {
          id: 'task_mpc',
          name: 'MPC计算',
          taskType: 'MPC',
          category: 'privacy',
          description: '安全多方计算',
          defaultConfig: { mpcConfig: { protocol: 'spdz' } },
        },
        {
          id: 'task_fl',
          name: '联邦学习',
          taskType: 'FL',
          category: 'privacy',
          description: '联邦学习',
          defaultConfig: { flConfig: { framework: 'tensorflow' } },
        },
      ],
      localTasks: [
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
      ],
      modelResources: [
        {
          id: 'model_tee',
          name: 'TEE模型',
          methodName: 'secure_aggregate',
          parameters: [
            { name: 'data', type: 'array', required: true },
            { name: 'epsilon', type: 'number', required: false, defaultValue: 0.1 },
          ],
          returnType: 'array',
          modelType: 'TEE',
          description: 'TEE安全聚合模型',
        },
      ],
      computeResources: [
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
      ],
    }
  }

  /**
   * 获取数据资源
   */
  const getDataResources = () => {
    return resourceLibrary.value.dataResources
  }

  /**
   * 获取隐私计算任务
   */
  const getPrivacyTasks = () => {
    return resourceLibrary.value.privacyTasks
  }

  /**
   * 获取本地计算任务
   */
  const getLocalTasks = () => {
    return resourceLibrary.value.localTasks
  }

  /**
   * 获取模型资源
   */
  const getModelResources = () => {
    return resourceLibrary.value.modelResources
  }

  /**
   * 获取算力资源
   */
  const getComputeResources = () => {
    return resourceLibrary.value.computeResources
  }

  return {
    resourceLibrary,
    initializeLibrary,
    getDataResources,
    getPrivacyTasks,
    getLocalTasks,
    getModelResources,
    getComputeResources,
  }
})
