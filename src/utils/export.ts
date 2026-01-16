/**
 * JSON导出/导入工具
 *
 * 用于任务图的JSON序列化和反序列化
 */

import type { ValidationResult } from '../types/validation'
import { validateTaskGraph } from '../types/validation'

// ============================================================================
// 导出配置
// ============================================================================

/**
 * 导出配置
 */
export const EXPORT_CONFIG = {
  /** 文件名前缀 */
  FILENAME_PREFIX: 'task-graph-',

  /** 文件扩展名 */
  FILE_EXTENSION: '.json',

  /** 缩进空格数 */
  INDENT_SPACES: 2,
}

// ============================================================================
// 图数据导出
// ============================================================================

/**
 * 将图数据转换为可导出的JSON格式
 * @param nodes 节点数组
 * @param edges 连线数组
 * @param participants 参与方数组
 * @param graphId 图ID
 * @param graphName 图名称
 * @returns JSON格式的任务图对象
 */
export const graphToJson = (
  nodes: any[],
  edges: any[],
  participants: any[],
  graphId: string,
  graphName: string,
): object => {
  return {
    id: graphId,
    name: graphName,
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    elements: nodes,
    connections: edges,
    participants: participants,
    viewport: {
      x: 0,
      y: 0,
      zoom: 1,
    },
  }
}

/**
 * 触发文件下载
 * @param data 要下载的JSON数据
 * @param filename 文件名（不含扩展名）
 */
export const downloadJsonFile = (data: object, filename: string): void => {
  const jsonString = JSON.stringify(data, null, EXPORT_CONFIG.INDENT_SPACES)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}${EXPORT_CONFIG.FILE_EXTENSION}`
  document.body.appendChild(link)
  link.click()

  // 清理
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 生成默认文件名
 * @param graphName 图名称
 * @returns 文件名
 */
export const generateFilename = (graphName: string): string => {
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .split('T')[0]
    .slice(0, 10) || ''

  return `${EXPORT_CONFIG.FILENAME_PREFIX}${graphName}-${timestamp}`
}

// ============================================================================
// 图数据导入
// ============================================================================

/**
 * 读取JSON文件
 * @param file 文件对象
 * @returns 解析后的JSON对象
 */
export const readFileAsJson = async (file: File): Promise<unknown> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string)
        resolve(json)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }

    reader.readAsText(file)
  })
}

/**
 * 导入并验证任务图
 * @param jsonData JSON数据
 * @returns 验证结果和图数据
 */
export const importGraph = (
  jsonData: unknown,
): { validation: ValidationResult; graphData: any | null } => {
  const validation = validateTaskGraph(jsonData)

  return {
    validation,
    graphData: validation.valid ? jsonData : null,
  }
}
