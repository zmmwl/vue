/**
 * Tab管理Store
 *
 * 管理多个任务图tab的创建、切换、关闭和恢复功能
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * Tab项
 */
export interface Tab {
  id: string
  name: string
  graphId: string
  isDirty: boolean
  createdAt: string
  lastActiveAt: string
}

/**
 * Tab管理Store
 */
export const useTabStore = defineStore('tab', () => {
  // 所有打开的tab列表
  const tabs = ref<Tab[]>([])

  // 当前激活的tab ID
  const activeTabId = ref<string>('')

  // 已关闭但可恢复的tab映射（session期间保留）
  const closedTabs = ref<Map<string, Tab>>(new Map())

  /**
   * 生成唯一ID
   */
  const generateId = (): string => {
    return `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 生成唯一图ID
   */
  const generateGraphId = (): string => {
    return `graph_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 打开新tab
   */
  const openNewTab = (): string => {
    const graphId = generateGraphId()
    const newTab: Tab = {
      id: generateId(),
      name: `任务图 ${tabs.value.length + 1}`,
      graphId,
      isDirty: false,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    }

    tabs.value.push(newTab)
    activeTabId.value = newTab.id
    return graphId
  }

  /**
   * 关闭tab
   */
  const closeTab = (tabId: string): void => {
    const index = tabs.value.findIndex(t => t.id === tabId)
    if (index !== -1) {
      const tab = tabs.value[index]

      // 保存到关闭tab记录（session期间保留）
      closedTabs.value.set(tabId, tab)
      tabs.value.splice(index, 1)

      // 切换到相邻tab
      if (activeTabId.value === tabId) {
        const newIndex = Math.max(0, index - 1)
        activeTabId.value = tabs.value[newIndex]?.id || ''
      }
    }
  }

  /**
   * 恢复tab
   */
  const restoreTab = (tabId: string): void => {
    const tab = closedTabs.value.get(tabId)
    if (tab) {
      tabs.value.push(tab)
      activeTabId.value = tab.id
      closedTabs.value.delete(tabId)
    }
  }

  /**
   * 切换tab
   */
  const switchTab = (tabId: string): void => {
    const tab = tabs.value.find(t => t.id === tabId)
    if (tab) {
      activeTabId.value = tab.id
      tab.lastActiveAt = new Date().toISOString()
    }
  }

  /**
   * 更新tab脏状态
   */
  const markDirty = (tabId: string): void => {
    const tab = tabs.value.find(t => t.id === tabId)
    if (tab && !tab.isDirty) {
      tab.isDirty = true
    }
  }

  /**
   * 清空脏状态
   */
  const markClean = (tabId: string): void => {
    const tab = tabs.value.find(t => t.id === tabId)
    if (tab) {
      tab.isDirty = false
    }
  }

  /**
   * 获取当前激活的tab
   */
  const activeTab = computed<Tab | null>(() => {
    return tabs.value.find(t => t.id === activeTabId.value) || null
  })

  /**
   * 检查tab是否已打开
   */
  const isTabOpen = (tabId: string): boolean => {
    return tabs.value.some(t => t.id === tabId)
  }

  return {
    tabs,
    activeTabId,
    activeTab,
    closedTabs,
    openNewTab,
    closeTab,
    restoreTab,
    switchTab,
    markDirty,
    markClean,
    isTabOpen,
  }
})
