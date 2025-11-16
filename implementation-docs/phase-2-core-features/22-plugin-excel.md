# 13.6 - PDF 导出插件

> **阶段**: Phase 2 | **时间**: 3小时 | **前置**: 13.5

## 🎯 任务目标

开发 PDF 导出插件，支持表格和报表导出为 PDF。

## 📋 执行步骤

### 1. 安装依赖

```bash
pnpm add jspdf jspdf-autotable html2canvas
pnpm add -D @types/jspdf
```

### 2. 创建插件

**packages/main-app/src/plugins/pdf/index.ts**:
```typescript
import type { Plugin } from '@btc/shared-core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

export const PdfPlugin: Plugin = {
  name: 'pdf',
  version: '1.0.0',

  install(app, options) {
    app.config.globalProperties.$exportPdf = exportPdf;
    app.config.globalProperties.$exportTablePdf = exportTablePdf;
    app.config.globalProperties.$exportHtmlPdf = exportHtmlPdf;
  },

  composables: {
    usePdf: () => ({
      exportPdf,
      exportTablePdf,
      exportHtmlPdf,
    }),
  },
};

// 导出表格为 PDF
export function exportTablePdf(
  data: any[],
  columns: Array<{ label: string; prop: string }>,
  filename: string = 'export'
) {
  const doc = new jsPDF();

  // 添加中文字体支持（需要额外配置）
  doc.setFont('Arial', 'normal');

  // 表头
  const head = [columns.map(col => col.label)];

  // 表格数据
  const body = data.map(row =>
    columns.map(col => row[col.prop] || '')
  );

  // 生成表格
  autoTable(doc, {
    head,
    body,
    styles: {
      font: 'Arial',
      fontSize: 10,
    },
    headStyles: {
      fillColor: [64, 158, 255],
      textColor: 255,
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
  });

  doc.save(`${filename}.pdf`);
}

// 导出 HTML 元素为 PDF
export async function exportHtmlPdf(
  element: HTMLElement | string,
  filename: string = 'export'
) {
  const el = typeof element === 'string' 
    ? document.querySelector(element) as HTMLElement
    : element;

  if (!el) {
    throw new Error('Element not found');
  }

  // 将 HTML 转为 Canvas
  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const imgWidth = 210; // A4 宽度（mm）
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const doc = new jsPDF({
    orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  doc.save(`${filename}.pdf`);
}

// 通用 PDF 导出
export function exportPdf(
  content: any,
  type: 'table' | 'html',
  options: any = {}
) {
  if (type === 'table') {
    return exportTablePdf(content.data, content.columns, options.filename);
  } else if (type === 'html') {
    return exportHtmlPdf(content, options.filename);
  }
}
```

### 3. 注册插件

**src/main.ts**:
```typescript
import { PdfPlugin } from './plugins/pdf';

pluginManager.register(PdfPlugin);
```

### 4. 创建导出组件

**packages/shared-components/src/plugins/pdf-export/index.vue**:
```vue
<template>
  <el-dropdown @command="handleCommand">
    <el-button>
      <el-icon><Download /></el-icon>
      导出 PDF
      <el-icon class="el-icon--right"><ArrowDown /></el-icon>
    </el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="table">表格 PDF</el-dropdown-item>
        <el-dropdown-item command="page">页面 PDF</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { exportTablePdf, exportHtmlPdf } from '@/plugins/pdf';

const props = defineProps<{
  data?: any[];
  columns?: Array<{ label: string; prop: string }>;
  elementSelector?: string;
  filename?: string;
}>();

const handleCommand = async (command: string) => {
  const filename = props.filename || 'export';

  try {
    if (command === 'table' && props.data && props.columns) {
      exportTablePdf(props.data, props.columns, filename);
    } else if (command === 'page' && props.elementSelector) {
      await exportHtmlPdf(props.elementSelector, filename);
    }
  } catch (error) {
    console.error('PDF 导出失败', error);
  }
};
</script>
```

### 5. 集成到 CRUD

**在 CRUD 中使用**:
```vue
<template>
  <div ref="tableRef" class="crud-table">
    <div class="toolbar">
      <el-button @click="handleExportPdf">导出 PDF</el-button>
    </div>
    
    <el-table :data="tableData">
      <!-- columns -->
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { exportTablePdf, exportHtmlPdf } from '@/plugins/pdf';

const tableRef = ref();
const tableData = ref([/* ... */]);

const handleExportPdf = () => {
  // 方式1：导出表格数据
  exportTablePdf(
    tableData.value,
    [
      { label: 'ID', prop: 'id' },
      { label: '名称', prop: 'name' },
    ],
    'user-list'
  );

  // 方式2：导出整个页面
  // exportHtmlPdf(tableRef.value, 'user-list');
};
</script>
```

## ✅ 验收标准

### 检查 1: 表格导出

```typescript
const data = [
  { id: 1, name: '张三', age: 20 },
  { id: 2, name: '李四', age: 25 },
];

const columns = [
  { label: 'ID', prop: 'id' },
  { label: '姓名', prop: 'name' },
  { label: '年龄', prop: 'age' },
];

exportTablePdf(data, columns, 'users');
// 预期: 下载 users.pdf，包含表格数据
```

### 检查 2: HTML 导出

```typescript
await exportHtmlPdf('#app', 'page');
// 预期: 下载 page.pdf，包含页面截图
```

## 📝 检查清单

- [ ] jsPDF 安装
- [ ] 插件创建
- [ ] 表格导出功能
- [ ] HTML 导出功能
- [ ] 组件封装
- [ ] CRUD 集成
- [ ] 中文支持
- [ ] 功能正常

## 🎯 高级功能

### 添加中文字体

```typescript
// 1. 下载字体文件（如 NotoSansSC-Regular.ttf）
// 2. 转换为 base64
// 3. 注册字体

import { jsPDF } from 'jspdf';

const doc = new jsPDF();
doc.addFileToVFS('NotoSansSC-Regular.ttf', fontBase64);
doc.addFont('NotoSansSC-Regular.ttf', 'NotoSansSC', 'normal');
doc.setFont('NotoSansSC');
```

### 自定义样式

```typescript
autoTable(doc, {
  head,
  body,
  theme: 'grid', // 'striped', 'grid', 'plain'
  styles: {
    fontSize: 12,
    cellPadding: 3,
  },
  columnStyles: {
    0: { cellWidth: 20 },
    1: { cellWidth: 'auto' },
  },
});
```

## 🔗 下一步

- [13.7 - 文件上传插件](./13.7-plugin-upload.md)

---

**状态**: ✅ 就绪 | **预计时间**: 3小时

