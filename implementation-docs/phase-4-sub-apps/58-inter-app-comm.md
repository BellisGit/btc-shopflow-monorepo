# 32 - 跨应用事件通信

> **阶段**: Phase 4 | **时间**: 2小时 | **前置**: 31

## 🎯 任务目标

实现子应用间的事件通信机制。

## 📋 执行步骤

### 1. 创建事件总线

**packages/shared-utils/src/event-bus/index.ts**:
```typescript
import mitt from 'mitt';

type Events = {
  'order-created': { id: number };
  'inventory-updated': { sku: string; quantity: number };
};

export const eventBus = mitt<Events>();
```

### 2. 在子应用中使用

**物流应用-发送事件**:
```typescript
// src/modules/procurement/index.vue
import { eventBus } from '@btc/shared-utils';

const handleOrderCreated = () => {
  eventBus.emit('order-created', { id: 123 });
};
```

**生产应用-接收事件**:
```typescript
// src/modules/production-plan/index.vue
import { onMounted, onUnmounted } from 'vue';
import { eventBus } from '@btc/shared-utils';

onMounted(() => {
  eventBus.on('order-created', (data) => {
    console.log('收到订单创建通知', data.id);
  });
});

onUnmounted(() => {
  eventBus.off('order-created');
});
```

### 3. 安装 mitt

```bash
cd packages/shared-utils
pnpm add mitt
```

## ✅ 验收标准

### 检查：事件通信

```bash
# 1. 打开物流应用
# 2. 创建订单
# 3. 切换到生产应用
# 预期: 控制台输出"收到订单创建通知"
```

## 📝 检查清单

- [ ] mitt 安装
- [ ] 事件总线创建
- [ ] 发送事件
- [ ] 接收事件
- [ ] 通信成功

## 🎉 里程碑 M4 完成

恭喜！完成阶段四，业务模块已完成：
- ✅ 子应用模板
- ✅ 物流应用（采购+仓储）
- ✅ 生产应用（生产计划）
- ✅ 跨应用通信

## 🔗 下一步

- [33 - Vite 构建优化](../phase-5-deployment/33-vite-build-optimize.md)

