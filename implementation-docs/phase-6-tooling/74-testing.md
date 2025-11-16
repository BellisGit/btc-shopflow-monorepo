# 41.5 - 测试指南

> **阶段**: Phase 6 | **时间**: 4小时 | **前置**: 41

## 🎯 任务目标

建立完整的测试体系，包括单元测试、组件测试和 E2E 测试。

## 📋 执行步骤

### 1. 安装测试工具

```bash
# Vitest + Vue Test Utils
pnpm add -Dw vitest @vue/test-utils happy-dom

# E2E 测试
pnpm add -Dw playwright @playwright/test
```

### 2. 配置 Vitest

**vitest.config.ts**:
```typescript
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
      ],
    },
  },
});
```

### 3. 单元测试示例

**packages/shared-utils/src/__tests__/format.test.ts**:
```typescript
import { describe, it, expect } from 'vitest';
import { formatMoney, formatNumber } from '../format';

describe('formatMoney', () => {
  it('should format number to money string', () => {
    expect(formatMoney(1234.56)).toBe('¥1,234.56');
    expect(formatMoney(1000)).toBe('¥1,000.00');
  });

  it('should support custom currency', () => {
    expect(formatMoney(100, '$')).toBe('$100.00');
  });
});

describe('formatNumber', () => {
  it('should format number with commas', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
    expect(formatNumber(100)).toBe('100');
  });
});
```

### 4. 组件测试示例

**packages/shared-components/src/__tests__/BtcButton.test.ts**:
```typescript
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import BtcButton from '../common/button/index.vue';

describe('BtcButton', () => {
  it('renders correctly', () => {
    const wrapper = mount(BtcButton, {
      slots: { default: 'Click me' },
    });
    
    expect(wrapper.text()).toBe('Click me');
    expect(wrapper.classes()).toContain('btc-button');
  });

  it('emits click event', async () => {
    const wrapper = mount(BtcButton);
    
    await wrapper.trigger('click');
    
    expect(wrapper.emitted('click')).toBeTruthy();
    expect(wrapper.emitted('click')?.length).toBe(1);
  });

  it('applies type class', () => {
    const wrapper = mount(BtcButton, {
      props: { type: 'primary' },
    });
    
    expect(wrapper.classes()).toContain('btc-button--primary');
  });
});
```

### 5. CRUD 测试示例

**src/__tests__/crud.test.ts**:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { useCrud } from '@btc/shared-core';

describe('useCrud', () => {
  it('loads data on mount', async () => {
    const mockService = {
      page: vi.fn().mockResolvedValue({
        list: [{ id: 1, name: 'Test' }],
        total: 1,
      }),
      add: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const { tableData, loadData } = useCrud({
      service: mockService,
    });

    await loadData();

    expect(mockService.page).toHaveBeenCalledWith({
      page: 1,
      size: 20,
    });
    expect(tableData.value).toEqual([{ id: 1, name: 'Test' }]);
  });

  it('handles search', async () => {
    const mockService = {
      page: vi.fn().mockResolvedValue({ list: [], total: 0 }),
      add: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const { handleSearch } = useCrud({ service: mockService });

    await handleSearch({ keyword: 'test' });

    expect(mockService.page).toHaveBeenCalledWith({
      page: 1,
      size: 20,
      keyword: 'test',
    });
  });
});
```

### 6. E2E 测试配置

**playwright.config.ts**:
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  
  use: {
    baseURL: 'http://localhost:5000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
});
```

### 7. E2E 测试示例

**e2e/login.spec.ts**:
```typescript
import { test, expect } from '@playwright/test';

test('login flow', async ({ page }) => {
  await page.goto('/login');

  // 填写表单
  await page.fill('input[type="text"]', 'admin');
  await page.fill('input[type="password"]', '123456');

  // 提交
  await page.click('button[type="submit"]');

  // 验证跳转
  await expect(page).toHaveURL('/dashboard');
  
  // 验证用户信息显示
  await expect(page.locator('.user-info')).toContainText('admin');
});

test('CRUD operations', async ({ page }) => {
  await page.goto('/system/user');

  // 新增
  await page.click('button:has-text("新增")');
  await page.fill('input[name="username"]', 'testuser');
  await page.click('button:has-text("确定")');

  // 验证
  await expect(page.locator('table')).toContainText('testuser');

  // 编辑
  await page.click('tr:has-text("testuser") button:has-text("编辑")');
  await page.fill('input[name="username"]', 'testuser2');
  await page.click('button:has-text("确定")');

  // 删除
  await page.click('tr:has-text("testuser2") button:has-text("删除")');
  await page.click('button:has-text("确定")');
});
```

### 8. 添加测试脚本

**package.json**:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

## ✅ 验收标准

### 检查 1: 单元测试

```bash
pnpm test

# 预期: 所有测试通过
# ✓ formatMoney
# ✓ formatNumber
# ✓ useCrud
```

### 检查 2: 覆盖率

```bash
pnpm test:coverage

# 预期: 覆盖率报告生成
# Statements: 80%+
# Branches: 75%+
# Functions: 80%+
```

### 检查 3: E2E 测试

```bash
pnpm test:e2e

# 预期: E2E 测试通过
# ✓ login flow
# ✓ CRUD operations
```

## 📝 检查清单

- [ ] Vitest 配置
- [ ] 单元测试编写
- [ ] 组件测试编写
- [ ] CRUD 测试编写
- [ ] E2E 测试配置
- [ ] E2E 测试编写
- [ ] CI 集成测试
- [ ] 覆盖率达标

## 📚 测试最佳实践

### 1. 测试金字塔
```
        E2E (10%)
      /         \
    集成测试 (20%)
   /             \
  单元测试 (70%)
```

### 2. 命名规范
```typescript
describe('ComponentName', () => {
  it('should do something', () => {
    // Given (准备)
    // When (执行)
    // Then (断言)
  });
});
```

### 3. Mock 策略
```typescript
// 外部依赖 Mock
vi.mock('axios');

// 组件 Mock
vi.mock('@/components/Heavy', () => ({
  default: { template: '<div>Mocked</div>' },
}));
```

## 🔗 下一步

- [42 - 团队培训](./42-team-training.md)

---

**状态**: ✅ 就绪 | **预计时间**: 4小时

