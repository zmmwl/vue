<template>
  <div class="dag-editor">
    <header class="editor-header">
      <h1>DAG 任务编排编辑器</h1>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="exportJson">导出 JSON</button>
        <button class="btn btn-secondary" @click="triggerImport">导入 JSON</button>
        <button class="btn btn-danger" @click="clearCanvas">清空画布</button>
        <input
          ref="fileInputRef"
          type="file"
          accept=".json"
          style="display: none"
          @change="onFileSelect"
        />
      </div>
    </header>

    <main class="editor-main">
      <NodePalette class="palette" />
      <DagCanvas class="canvas" @node-click="onNodeClick" />

      <!-- JSON 导出弹窗 -->
      <div v-if="showJsonExport" class="modal-overlay" @click="showJsonExport = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>导出的 DAG JSON</h2>
            <button class="close-btn" @click="showJsonExport = false">×</button>
          </div>
          <div class="modal-body">
            <pre class="json-output">{{ formattedJson }}</pre>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="copyJson">复制到剪贴板</button>
            <button class="btn btn-primary" @click="downloadJson">下载文件</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import NodePalette from './NodePalette.vue';
import DagCanvas from './DagCanvas.vue';
import { useDagStore } from '../stores/dagStore';

const store = useDagStore();
const fileInputRef = ref<HTMLInputElement | null>(null);
const showJsonExport = ref(false);

const formattedJson = computed(() => {
  return JSON.stringify(store.exportToJson(), null, 2);
});

const exportJson = () => {
  showJsonExport.value = true;
};

const copyJson = async () => {
  try {
    await navigator.clipboard.writeText(formattedJson.value);
    alert('已复制到剪贴板');
  } catch {
    alert('复制失败');
  }
};

const downloadJson = () => {
  const blob = new Blob([formattedJson.value], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dag-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const triggerImport = () => {
  fileInputRef.value?.click();
};

const onFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const json = JSON.parse(e.target?.result as string);
      store.importFromJson(json);
      alert('导入成功');
    } catch {
      alert('导入失败：无效的 JSON 文件');
    }
  };
  reader.readAsText(file);
  input.value = '';
};

const clearCanvas = () => {
  if (confirm('确定要清空画布吗？')) {
    store.clearCanvas();
  }
};

const onNodeClick = (node: any) => {
  console.log('Node clicked:', node);
};
</script>

<style scoped>
.dag-editor {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #11111b;
  color: #cdd6f4;
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: #1e1e2e;
  border-bottom: 1px solid #313244;
}

.editor-header h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #89b4fa;
  color: #1e1e2e;
}

.btn-primary:hover {
  background: #b4befe;
}

.btn-secondary {
  background: #45475a;
  color: #cdd6f4;
}

.btn-secondary:hover {
  background: #585b70;
}

.btn-danger {
  background: #f38ba8;
  color: #1e1e2e;
}

.btn-danger:hover {
  background: #eba0ac;
}

.editor-main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.palette {
  flex-shrink: 0;
}

.canvas {
  flex: 1;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #1e1e2e;
  border-radius: 12px;
  width: 80%;
  max-width: 800px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #313244;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #45475a;
  color: #cdd6f4;
  border-radius: 6px;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #585b70;
}

.modal-body {
  padding: 24px;
  overflow: auto;
  flex: 1;
}

.json-output {
  background: #11111b;
  padding: 16px;
  border-radius: 8px;
  overflow: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  line-height: 1.6;
  color: #a6e3a1;
  margin: 0;
  max-height: 400px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 16px 24px;
  border-top: 1px solid #313244;
}
</style>
