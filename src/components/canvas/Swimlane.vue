<template>
  <div class="swimlane-container">
    <div class="swimlane-labels">
      <div
        v-for="(swimlane, index) in swimlanes"
        :key="swimlane.id"
        class="swimlane-label"
        :style="{ height: `${swimlaneHeight}px`, borderTopColor: swimlane.color || '#e4e7ed' }"
      >
        <span class="participant-name">{{ swimlane.name }}</span>
        <span v-if="swimlane.type" class="participant-type">{{ swimlane.type }}</span>
      </div>
    </div>
    <div class="swimlane-grid">
      <div
        v-for="(swimlane, index) in swimlanes"
        :key="swimlane.id"
        class="swimlane"
        :style="{ width: `${swimlane.width}px`, height: `${swimlaneHeight}px`, backgroundColor: `${swimlane.color}15` }"
      >
        <!-- 顶部数据资源区域 -->
        <div class="top-zone">
          <span class="zone-label">数据资源</span>
        </div>

        <!-- 底部导出任务区域 -->
        <div class="bottom-zone">
          <span class="zone-label">导出任务</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { PARTICIPANTS } from '../../data/resources'
import { LAYOUT_CONFIG } from '../../utils/layout'

interface Props {
  height?: number
  width?: number
}

const props = withDefaults(defineProps<Props>(), {
  height: 800,
  width: 1200,
})

const swimlanes = computed(() => {
  const availableWidth = props.width - LAYOUT_CONFIG.SWIMLANE_LABEL_WIDTH
  const laneWidth = availableWidth / PARTICIPANTS.length

  return PARTICIPANTS.map((participant, index) => ({
    id: participant.id,
    name: participant.name,
    type: participant.type === 'data' ? '数据' : participant.type === 'compute' ? '算力' : '结果',
    color: participant.color || '#e4e7ed',
    width: laneWidth,
  }))
})

const swimlaneHeight = computed(() => props.height)
</script>

<style scoped>
.swimlane-container {
  display: flex;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  pointer-events: none;
}

.swimlane-labels {
  width: 150px;
  background: white;
  border-right: 1px solid #e4e7ed;
  z-index: 1;
}

.swimlane-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-top: 2px solid #e4e7ed;
  padding: 12px 8px;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  position: relative;
}

.participant-name {
  font-size: 14px;
  margin-bottom: 4px;
}

.participant-type {
  font-size: 11px;
  color: #909399;
  font-weight: 400;
}

.swimlane-grid {
  flex: 1;
  display: flex;
  position: relative;
}

.swimlane {
  border-right: 1px solid #e4e7ed;
  position: relative;
}

.swimlane:last-child {
  border-right: none;
}

.top-zone {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 120px;
  border-bottom: 2px dashed #409eff;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, rgba(64, 158, 255, 0.08) 0%, rgba(64, 158, 255, 0.02) 100%);
}

.bottom-zone {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120px;
  border-top: 2px dashed #67c23a;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(0deg, rgba(103, 194, 58, 0.08) 0%, rgba(103, 194, 58, 0.02) 100%);
}

.zone-label {
  font-size: 11px;
  color: #909399;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  background: white;
  padding: 2px 8px;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>
