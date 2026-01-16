<template>
  <div class="zoom-controls">
    <el-button-group>
      <el-button :icon="ZoomOut" size="small" @click="handleZoomOut" />
      <el-button size="small" @click="handleFitView">
        {{ Math.round(currentZoom * 100) }}%
      </el-button>
      <el-button :icon="ZoomIn" size="small" @click="handleZoomIn" />
    </el-button-group>
    <el-button :icon="Refresh" size="small" @click="handleReset" circle />
  </div>
</template>

<script setup lang="ts">
import { ZoomIn, ZoomOut, Refresh } from '@element-plus/icons-vue'

interface Props {
  currentZoom?: number
  onZoomIn?: () => void
  onZoomOut?: () => void
  onFitView?: () => void
  onReset?: () => void
}

withDefaults(defineProps<Props>(), {
  currentZoom: 1,
  onZoomIn: () => {},
  onZoomOut: () => {},
  onFitView: () => {},
  onReset: () => {},
})
</script>

<style scoped>
.zoom-controls {
  position: absolute;
  bottom: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  padding: 8px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
}
</style>
