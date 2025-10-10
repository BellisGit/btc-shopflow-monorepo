<template>
  <div class="app">
    <h1>BTC Vite Plugin 测试</h1>

    <!-- 测试 SVG 插件 -->
    <section class="test-section">
      <h2>1. SVG 插件测试</h2>
      <div class="icon-list">
        <div class="icon-item">
          <svg class="icon">
            <use href="#icon-icon-home"></use>
          </svg>
          <span>icon-home</span>
        </div>
        <div class="icon-item">
          <svg class="icon">
            <use href="#icon-user-avatar"></use>
          </svg>
          <span>user-avatar</span>
        </div>
        <div class="icon-item">
          <svg class="icon">
            <use href="#icon-order-cart"></use>
          </svg>
          <span>order-cart</span>
        </div>
      </div>
    </section>

    <!-- 测试 Ctx 插件 -->
    <section class="test-section">
      <h2>2. Ctx 插件测试</h2>
      <pre>{{ ctxInfo }}</pre>
    </section>

    <!-- 测试 Tag 插件 -->
    <section class="test-section">
      <h2>3. Tag 插件测试</h2>
      <p>在 Vue DevTools 中查看组件名称</p>
      <TestComponent />
    </section>

    <!-- 测试 EPS 虚拟模块 -->
    <section class="test-section">
      <h2>4. EPS 虚拟模块测试</h2>
      <div v-if="epsInfo">
        <p>模块数量: {{ Object.keys(epsInfo).length }}</p>
        <details v-for="(apis, moduleName) in epsInfo" :key="moduleName">
          <summary>
            <strong>{{ moduleName }}</strong> ({{ apis.length }} 个 API)
          </summary>
          <ul>
            <li v-for="api in apis" :key="api.name">
              <code>{{ api.method }}</code> {{ api.path }} - {{ api.name }}
            </li>
          </ul>
        </details>
      </div>
      <p v-else class="loading">加载中...</p>
    </section>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ref, onMounted } from 'vue';
import TestComponent from './components/TestComponent.vue';

const ctxInfo = ref<any>(null);
const epsInfo = ref<any>(null);

onMounted(async () => {
  // 加载 Ctx 信息
  try {
    const ctx = await import('virtual:ctx');
    ctxInfo.value = ctx.default;
  } catch (err) {
    ctxInfo.value = { error: 'Failed to load ctx', message: String(err) };
  }

  // 加载 EPS 信息
  try {
    const eps = await import('virtual:eps');
    epsInfo.value = eps.default;
    console.log('[EPS Test] 虚拟模块数据:', eps.default);
  } catch (err) {
    epsInfo.value = { error: 'Failed to load EPS', message: String(err) };
    console.error('[EPS Test] 加载失败:', err);
  }
});
</script>

<style scoped>
.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

h1 {
  color: #333;
  border-bottom: 2px solid #42b883;
  padding-bottom: 0.5rem;
}

.test-section {
  margin-top: 2rem;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
}

h2 {
  color: #42b883;
  margin-top: 0;
}

.icon-list {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.icon {
  width: 48px;
  height: 48px;
  stroke: #42b883;
}

pre {
  background: white;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
}

details {
  margin: 0.5rem 0;
  padding: 0.5rem;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

summary {
  font-weight: bold;
  color: #42b883;
  padding: 0.5rem;
  user-select: none;
}

details ul {
  margin: 0.5rem 0;
  padding-left: 2rem;
}

details li {
  padding: 0.25rem 0;
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

details code {
  background: #42b883;
  color: white;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-weight: bold;
  margin-right: 0.5rem;
}

.loading {
  color: #999;
  font-style: italic;
}
</style>
