<template>
  <div class="Layout" :class="{ 'dark': isDark }">
    <!-- 使用VitePress默认布局的内容，但完全控制主题 -->
    <component :is="defaultLayout" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, h } from 'vue';
import DefaultTheme from 'vitepress/theme';

// 使用VitePress默认主题的布局组件
const defaultLayout = () => h(DefaultTheme.Layout);

// 主题状态
const isDark = ref(false);

// 从主应用同步主题
function syncThemeFromMainApp() {
  // 从主应用的localStorage读取主题状态
  if (typeof window !== 'undefined') {
    try {
      // 通过postMessage向父窗口请求主题状态
      if (window.parent !== window) {
        window.parent.postMessage({
          type: 'request-theme-sync'
        }, '*');
      }
    } catch (e) {
      console.error('[CustomLayout] Failed to request theme sync:', e);
    }
  }
}

// 应用主题
function applyTheme(dark: boolean) {
  isDark.value = dark;

  if (typeof window !== 'undefined') {
    const html = document.documentElement;
    if (dark) {
      html.classList.add('dark');
      html.classList.remove('light');
      html.setAttribute('data-theme', 'dark');
      html.style.setProperty('color-scheme', 'dark');
    } else {
      html.classList.remove('dark');
      html.classList.add('light');
      html.setAttribute('data-theme', 'light');
      html.style.setProperty('color-scheme', 'light');
    }

    // 清理VitePress的localStorage，使用自定义key落盘
    localStorage.removeItem('vitepress-theme-appearance');
    localStorage.removeItem('vitepress-theme');
    localStorage.removeItem('vitepress-theme-color-scheme');
    localStorage.removeItem('isDark');

    // 落盘到自定义key，为下次刷新做准备
    localStorage.setItem('parent-theme', dark ? 'dark' : 'light');
  }
}

// 监听来自主应用的主题同步消息
function handleMessage(event: MessageEvent) {
  if (event.data?.type === 'host:theme') {
    const { value } = event.data;
    const dark = value === 'dark';
    applyTheme(dark);
  } else if (event.data?.type === 'update-parent-theme') {
    // 接收主应用的parent-theme更新
    const { value } = event.data;
    localStorage.setItem('parent-theme', value);
  }
}

// 监听storage事件（跨标签页同步）
function handleStorage(event: StorageEvent) {
  if (event.key === 'isDark') {
    const dark = event.newValue ? JSON.parse(event.newValue) : false;
    applyTheme(dark);
  }
}

onMounted(() => {
  // 立即设置为浅色主题作为默认
  applyTheme(false);

  // 请求主应用同步主题状态
  syncThemeFromMainApp();

  // 监听消息
  window.addEventListener('message', handleMessage);
  window.addEventListener('storage', handleStorage);
});

onUnmounted(() => {
  window.removeEventListener('message', handleMessage);
  window.removeEventListener('storage', handleStorage);
});

// 主题状态完全由我们控制，不依赖VitePress的默认行为
</script>

<style scoped>
/* 使用VitePress原生的CSS变量和类名 */
.Layout {
  min-height: 100vh;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

/* 确保主题类正确应用 */
.Layout.dark {
  color-scheme: dark;
}

.Layout:not(.dark) {
  color-scheme: light;
}
</style>
