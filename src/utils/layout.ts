/**
 * 泳道布局计算
 *
 * 用于计算泳道宽度、约束节点位置等布局相关逻辑
 */

import type { Position, Swimlane } from '../types/graph'

// ============================================================================
// 泳道配置
// ============================================================================

/**
 * 应用配置
 */
export const LAYOUT_CONFIG = {
  /** 数据资源节点顶部区域高度 */
  DATA_RESOURCE_TOP_HEIGHT: 100,

  /** 数据导出任务底部区域高度（从底部算起）*/
  EXPORT_TASK_BOTTOM_HEIGHT: 100,

  /** 节点默认宽度 */
  DEFAULT_NODE_WIDTH: 160,

  /** 节点默认高度 */
  DEFAULT_NODE_HEIGHT: 80,

  /** 节点间距 */
  NODE_SPACING: 40,

  /** 泳道间距 */
  SWIMLANE_SPACING: 20,

  /** 泳道标签宽度 */
  SWIMLANE_LABEL_WIDTH: 150,
}

// ============================================================================
// 泳道宽度计算
// ============================================================================

/**
 * 计算泳道宽度
 * @param canvasWidth 画布总宽度
 * @param swimlaneCount 泳道数量
 * @param labelWidth 泳道标签宽度
 * @returns 泳道宽度和标签位置
 */
export const calculateSwimlaneWidths = (
  canvasWidth: number,
  swimlaneCount: number,
  labelWidth: number = LAYOUT_CONFIG.SWIMLANE_LABEL_WIDTH,
): { widths: number[]; labelPositions: Position[] } => {
  const availableWidth = canvasWidth - labelWidth
  const laneWidth = availableWidth / swimlaneCount
  const widths = new Array(swimlaneCount).fill(laneWidth)

  const labelPositions: Position[] = []
  for (let i = 0; i < swimlaneCount; i++) {
    labelPositions.push({
      x: labelWidth / 2,
      y: LAYOUT_CONFIG.NODE_SPACING,
    })
  }

  return { widths, labelPositions }
}

// ============================================================================
// 节点位置约束
// ============================================================================

/**
 * 约束节点位置到泳道内
 * @param node 节点位置
 * @param canvasWidth 画布总宽度
 * @param swimlaneCount 泳道数量
 * @param labelWidth 泳道标签宽度
 * @returns 约束后的位置
 */
export const constrainToSwimlane = (
  node: Position,
  canvasWidth: number,
  swimlaneCount: number,
  labelWidth: number = LAYOUT_CONFIG.SWIMLANE_LABEL_WIDTH,
): Position => {
  const { widths } = calculateSwimlaneWidths(canvasWidth, swimlaneCount, labelWidth)

  // 计算节点应该在哪个泳道（基于participantId）
  // 这里简化为按x坐标划分泳道
  const swimlaneIndex = Math.floor(node.x / (canvasWidth / swimlaneCount))

  // 计算泳道边界
  let minX = labelWidth
  for (let i = 0; i < swimlaneIndex; i++) {
    minX += widths[i] || 0
  }
  const maxX = minX + (widths[swimlaneIndex] || canvasWidth / swimlaneCount)

  // 约束x坐标到泳道范围内
  let constrainedX = node.x
  if (node.x < minX) {
    constrainedX = minX + LAYOUT_CONFIG.NODE_SPACING
  } else if (node.x > maxX) {
    constrainedX = maxX - LAYOUT_CONFIG.DEFAULT_NODE_WIDTH - LAYOUT_CONFIG.NODE_SPACING
  }

  return { x: constrainedX, y: node.y }
}

/**
 * 约束数据资源节点到顶部区域
 * @param node 节点位置
 * @returns 约束后的位置
 */
export const constrainDataResourcePosition = (node: Position): Position => {
  if (node.y < LAYOUT_CONFIG.DATA_RESOURCE_TOP_HEIGHT) {
    return { x: node.x, y: LAYOUT_CONFIG.NODE_SPACING }
  }
  if (node.y > LAYOUT_CONFIG.DATA_RESOURCE_TOP_HEIGHT) {
    return { x: node.x, y: LAYOUT_CONFIG.DATA_RESOURCE_TOP_HEIGHT - LAYOUT_CONFIG.DEFAULT_NODE_HEIGHT / 2 }
  }
  return node
}

/**
 * 约束数据导出任务到底部区域
 * @param node 节点位置
 * @param canvasHeight 画布高度
 * @returns 约束后的位置
 */
export const constrainExportTaskPosition = (
  node: Position,
  canvasHeight: number,
): Position => {
  const bottomBoundary = canvasHeight - LAYOUT_CONFIG.EXPORT_TASK_BOTTOM_HEIGHT

  if (node.y < bottomBoundary) {
    return { x: node.x, y: bottomBoundary - LAYOUT_CONFIG.DEFAULT_NODE_HEIGHT / 2 }
  }
  if (node.y > canvasHeight) {
    return { x: node.x, y: canvasHeight - LAYOUT_CONFIG.DEFAULT_NODE_HEIGHT - LAYOUT_CONFIG.NODE_SPACING }
  }
  return node
}

// ============================================================================
// 泳道生成
// ============================================================================

/**
 * 创建泳道配置
 * @param participants 参与方列表
 * @param canvasWidth 画布宽度
 * @returns 泳道配置
 */
export const createSwimlanes = (
  participants: Array<{ id: string; name: string }>,
  canvasWidth: number,
): Swimlane[] => {
  const { widths } = calculateSwimlaneWidths(canvasWidth, participants.length)

  return participants.map((p, index) => ({
    id: p.id,
    name: p.name,
    width: widths[index] || canvasWidth / participants.length,
  }))
}
