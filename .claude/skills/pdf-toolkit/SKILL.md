---
name: pdf-toolkit
description: PDF 处理工具包，用于生成库存盘点单、报表、打印功能等
---

# PDF 工具包

## 何时使用

当你需要：
- 生成库存盘点单 PDF
- 导出数据报表为 PDF
- 实现打印功能
- 批量生成 PDF 文档

## 项目中的 PDF/打印场景

### 1. 库存盘点单打印

位置: apps/admin-app/src/modules/test/views/inventory-ticket-print/

功能:
  - 生产库存盘点单
  - 非生产库存盘点单
  - 打印预览和打印

组件:
  - BtcInventoryTicketPrintToolbar.vue
  - useInventoryTicketPrint.ts
  - useProductionInventoryTicketPrint.ts
  - useNonProductionInventoryTicketPrint.ts

### 2. 浏览器打印功能

基本打印:
```typescript
const handlePrint = () => {
  window.print()
}
```

打印特定区域:
```typescript
const printContentRef = ref<HTMLElement>()

const handlePrint = () => {
  const printContent = printContentRef.value
  if (!printContent) return
  
  const printWindow = window.open('', '_blank')
  printWindow?.document.write(\
    <html>
      <head>
        <title>打印</title>
        <style>
          @media print {
            @page { size: A4; margin: 10mm; }
            body { margin: 0; }
          }
        </style>
      </head>
      <body>\</body>
    </html>
  \)
  printWindow?.document.close()
  printWindow?.print()
}
```

### 3. 生成 PDF（服务端）

使用 Node.js 库生成 PDF:

方式1 - PDFKit:
```javascript
import PDFDocument from 'pdfkit'
import fs from 'fs'

const generatePDF = (data) => {
  const doc = new PDFDocument()
  doc.pipe(fs.createWriteStream('report.pdf'))
  
  // 添加中文字体
  doc.font('path/to/chinese-font.ttf')
  
  // 添加标题
  doc.fontSize(20).text('库存盘点报表', { align: 'center' })
  doc.moveDown()
  
  // 添加表格
  doc.fontSize(12)
  data.forEach(item => {
    doc.text(\料号: \, 数量: \\)
  })
  
  doc.end()
}
```

方式2 - Puppeteer（HTML转PDF）:
```javascript
import puppeteer from 'puppeteer'

const htmlToPDF = async (html, outputPath) => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  
  await page.setContent(html, { waitUntil: 'networkidle0' })
  
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
  })
  
  await browser.close()
}
```

方式3 - jsPDF（前端生成）:
```typescript
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const generatePDF = (data: any[]) => {
  const doc = new jsPDF()
  
  // 添加中文字体
  doc.addFont('path/to/font.ttf', 'CustomFont', 'normal')
  doc.setFont('CustomFont')
  
  // 添加标题
  doc.setFontSize(16)
  doc.text('库存盘点报表', 105, 20, { align: 'center' })
  
  // 添加表格
  doc.autoTable({
    head: [['料号', '名称', '数量', '差异']],
    body: data.map(item => [
      item.code,
      item.name,
      item.qty,
      item.variance
    ]),
    startY: 30,
    styles: { font: 'CustomFont' }
  })
  
  // 保存
  doc.save('inventory-report.pdf')
}
```

## 推荐方案（针对项目）

### 前端打印（推荐用于盘点单）

使用浏览器原生打印 + CSS:
```vue
<template>
  <div>
    <div ref="printArea" class="print-content">
      <!-- 盘点单内容 -->
    </div>
    <button @click="handlePrint">打印</button>
  </div>
</template>

<style>
@media print {
  /* 隐藏不需要打印的元素 */
  .no-print { display: none !important; }
  
  /* 打印样式 */
  @page {
    size: A4;
    margin: 10mm;
  }
  
  .print-content {
    page-break-inside: avoid;
  }
}
</style>
```

### PDF 报表生成（推荐用于数据报表）

使用 jsPDF + autoTable:
```bash
pnpm add jspdf jspdf-autotable
```

## 常见 PDF 任务

### 任务 1：生成库存盘点单 PDF

1. 准备盘点单数据
2. 使用模板渲染 HTML
3. 浏览器打印或转 PDF
4. 下载保存

### 任务 2：批量生成 PDF 报表

1. 获取报表数据
2. 使用 jsPDF 生成 PDF
3. 添加表格、图表、样式
4. 批量下载或打包

### 任务 3：PDF 预览

1. 生成 PDF Blob
2. 创建 Object URL
3. 在新窗口或 iframe 中预览
4. 用户确认后下载

## 依赖库

前端 PDF 生成:
```bash
pnpm add jspdf jspdf-autotable
pnpm add html2canvas  # 如果需要截图转PDF
```

后端 PDF 生成（Node.js）:
```bash
pnpm add pdfkit
pnpm add puppeteer  # HTML转PDF
```

## 中文字体处理

jsPDF 中文支持:
```typescript
import jsPDF from 'jspdf'

// 需要引入中文字体
// 1. 下载字体文件（如 NotoSansSC.ttf）
// 2. 转换为 base64
// 3. 在 jsPDF 中注册

doc.addFileToVFS('NotoSansSC.ttf', fontBase64)
doc.addFont('NotoSansSC.ttf', 'NotoSansSC', 'normal')
doc.setFont('NotoSansSC')
```

## PDF 最佳实践

1. **打印优先**: 简单场景使用浏览器打印（@media print）
2. **复杂报表**: 使用 jsPDF + autoTable
3. **高质量**: 使用 Puppeteer（HTML转PDF）
4. **性能考虑**: 大量数据分页处理
5. **预览功能**: 生成前先预览

## 项目集成建议

### 方式 1：扩展现有打印功能

在 BtcInventoryTicketPrint 基础上添加 PDF 导出:
```typescript
import jsPDF from 'jspdf'

const exportToPDF = () => {
  const doc = new jsPDF()
  // 使用打印区域的数据生成 PDF
  doc.save('inventory-ticket.pdf')
}
```

### 方式 2：创建通用 PDF 工具

在 @btc/shared-core 中创建:
```typescript
// packages/shared-core/src/utils/pdf.ts
export const generatePDF = (options) => {
  // 通用 PDF 生成逻辑
}

export const printElement = (element: HTMLElement) => {
  // 通用打印逻辑
}
```

## 常见问题

Q: 中文显示为方框?
A: 添加中文字体支持

Q: PDF 样式不对?
A: 检查 CSS，使用 @media print

Q: PDF 文件太大?
A: 压缩图片，减少字体嵌入

Q: 如何添加页眉页脚?
A: 在 @page CSS 中设置，或使用 jsPDF 手动添加

## 下一步

需要 Excel 处理? → 使用 excel-toolkit 技能
需要打印调试? → 使用 troubleshooting 技能
