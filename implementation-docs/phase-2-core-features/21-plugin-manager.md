# 13.5 - Excel 插件

> **阶段**: Phase 2 | **时间**: 3小时 | **前置**: 13

## 🎯 任务目标

开发 Excel 导入导出插件，支持 CRUD 数据导出。

## 📋 执行步骤

### 1. 安装依赖

```bash
pnpm add xlsx file-saver
pnpm add -D @types/file-saver
```

### 2. 创建插件

**packages/main-app/src/plugins/excel/index.ts**:
```typescript
import type { Plugin } from '@btc/shared-core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const ExcelPlugin: Plugin = {
  name: 'excel',
  version: '1.0.0',

  install(app, options) {
    // 全局导出方法
    app.config.globalProperties.$exportExcel = exportExcel;
    app.config.globalProperties.$importExcel = importExcel;
  },

  composables: {
    useExcel: () => ({
      exportExcel,
      importExcel,
    }),
  },
};

// 导出 Excel
export function exportExcel(
  data: any[], 
  filename: string = 'export', 
  sheetName: string = 'Sheet1'
) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(
    new Blob([wbout], { type: 'application/octet-stream' }),
    `${filename}.xlsx`
  );
}

// 导入 Excel
export function importExcel(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = reject;
    reader.readAsBinaryString(file);
  });
}
```

### 3. 注册插件

**src/main.ts**:
```typescript
import { pluginManager } from '@btc/shared-core';
import { ExcelPlugin } from './plugins/excel';

pluginManager.register(ExcelPlugin);
```

### 4. 创建导出组件

**packages/shared-components/src/plugins/excel-export/index.vue**:
```vue
<template>
  <el-button @click="handleExport" :loading="loading">
    <el-icon><Download /></el-icon>
    导出 Excel
  </el-button>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { exportExcel } from '@btc/shared-core';

const props = defineProps<{
  data: any[];
  filename?: string;
  columns?: Array<{ prop: string; label: string }>;
}>();

const loading = ref(false);

const handleExport = async () => {
  loading.value = true;
  
  try {
    // 如果指定了列，只导出这些列
    let exportData = props.data;
    
    if (props.columns) {
      exportData = props.data.map(row => {
        const newRow: any = {};
        props.columns!.forEach(col => {
          newRow[col.label] = row[col.prop];
        });
        return newRow;
      });
    }
    
    exportExcel(exportData, props.filename || 'export');
  } finally {
    loading.value = false;
  }
};
</script>
```

### 5. 集成到 CRUD

**在 CRUD 配置中添加导出**:
```typescript
export default {
  table: {
    columns: [...],
    toolbar: {
      export: true, // 启用导出
      exportColumns: ['id', 'name', 'status'], // 指定导出列
    },
  },
} as CrudConfig;
```

## ✅ 验收标准

### 检查：导出功能

```vue
<script setup lang="ts">
import { useExcel } from '@/plugins/excel';

const { exportExcel } = useExcel();

const data = [
  { id: 1, name: '张三', age: 20 },
  { id: 2, name: '李四', age: 25 },
];

// 导出
exportExcel(data, 'users');
// 预期: 下载 users.xlsx 文件
</script>
```

### 检查：导入功能

```vue
<template>
  <input type="file" @change="handleImport" accept=".xlsx,.xls" />
</template>

<script setup lang="ts">
import { importExcel } from '@/plugins/excel';

const handleImport = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) {
    const data = await importExcel(file);
    console.log(data);
  }
};
</script>
```

## 📝 检查清单

- [ ] xlsx 安装
- [ ] 插件创建
- [ ] 导出功能
- [ ] 导入功能
- [ ] 组件封装
- [ ] CRUD 集成
- [ ] 功能正常

## 🔗 下一步

- [13.6 - PDF 插件](./13.6-plugin-pdf.md)

---

**状态**: ✅ 就绪 | **预计时间**: 3小时

