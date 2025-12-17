<template>
  <Teleport to="body">
    <!-- 开发工具面板 -->
    <div
      ref="panelRef"
      class="dev-tools"
      :class="{ 'is-open': visible }"
    >
      <div class="dev-tools__content">
        <el-scrollbar>
          <div class="dev-tools__inner">
            <!-- 只有非操作类型的标签页才显示组件内容 -->
            <component v-if="components[activeTab]" :is="components[activeTab]" />
            <div v-else class="dev-tools__empty">
              <p>点击菜单项进行操作</p>
            </div>
          </div>
        </el-scrollbar>
      </div>

      <!-- 菜单栏 -->
      <div class="dev-tools__menu">
        <el-tooltip
          v-for="item in tabList"
          :key="item.value"
          :content="item.tooltip || item.label"
          placement="right"
          :show-after="300"
          :teleported="true"
        >
          <div
            class="dev-tools__menu-item"
            :class="{ 'is-active': item.value === activeTab }"
            @click="switchTab(item.value)"
          >
            <el-icon :size="18">
              <component :is="item.icon" />
            </el-icon>
          </div>
        </el-tooltip>
      </div>
    </div>

    <!-- 悬浮按钮 -->
    <el-tooltip
      v-if="shouldShowDevTools"
      :content="visible ? '关闭开发工具' : '打开开发工具'"
      placement="left"
    >
      <div
        ref="toggleRef"
        class="dev-tools__toggle"
        :class="{ 'is-hide': visible }"
        @click="toggle"
      >
        <el-icon :size="16">
          <Setting />
        </el-icon>
      </div>
    </el-tooltip>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onClickOutside } from '@vueuse/core';
import { Setting, Lightning, Switch, Document, Monitor, InfoFilled } from '@element-plus/icons-vue';
import ApiSwitch from './ApiSwitch.vue';
import EpsViewer from './EpsViewer.vue';
import EnvInfo from './EnvInfo.vue';

// 简单的 cookie 读取函数（不依赖应用特定的工具）
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const nameEQ = name + '=';
  const ca = document.cookie.split(';');

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1, c.length);
    }
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }

  return null;
}

// 检查是否为开发环境
const isDev = import.meta.env.DEV;

// 使用 ref 缓存允许用户的状态，确保显示稳定
const isAllowedUser = ref(false);

// 检查是否为允许在生产环境显示 DevTools 的用户
function checkAllowedUser(): boolean {
  try {
    const btcUser = getCookie('btc_user');
    if (!btcUser) {
      return false;
    }

    // 尝试解码 cookie 值（可能是 URL 编码的）
    let decodedValue: string;
    try {
      decodedValue = decodeURIComponent(btcUser);
    } catch {
      // 如果解码失败，直接使用原值
      decodedValue = btcUser;
    }

    const userInfo = JSON.parse(decodedValue);
    // 优先使用 username 字段（cookie 中实际存储的字段），如果没有则使用 name 字段
    // 不区分大小写
    const userName = (userInfo?.username || userInfo?.name || '').toLowerCase();
    if (!userName) {
      return false;
    }

    // 检查用户名是否为 moselu（不区分大小写）
    return userName === 'moselu';
  } catch (error) {
    // 仅在开发环境输出错误信息
    if (isDev) {
      console.warn('[DevTools] 检查允许用户时出错:', error);
    }
    return false;
  }
}

// 在组件挂载时检查一次，并缓存结果
onMounted(() => {
  const isAllowed = checkAllowedUser();
  isAllowedUser.value = isAllowed;
  console.log('[DevTools] 组件挂载，isAllowedUser:', isAllowed, 'isDev:', isDev);
});

// 是否显示 DevTools
// 1. 如果是 moselu 用户，无论主应用还是子应用，无论开发环境还是生产环境，都显示
// 2. 开发环境下，始终显示
// 3. 生产环境下，仅允许的用户显示
const shouldShowDevTools = computed(() => {
  // moselu 用户：始终显示（无论环境、无论主应用还是子应用）
  if (isAllowedUser.value) {
    return true;
  }
  // 开发环境：始终显示
  if (isDev) {
    return true;
  }
  // 生产环境：仅允许的用户显示（已经在上面检查过了）
  return false;
});

const components: Record<string, any> = {
  env: EnvInfo,
  api: ApiSwitch,
  eps: EpsViewer,
};

const tabList = [
  {
    label: '系统信息',
    value: 'env',
    icon: InfoFilled,
    tooltip: '系统信息 - 查看当前运行环境和应用信息',
    isAction: false, // 显示组件内容
  },
  {
    label: '环境切换',
    value: 'api',
    icon: Switch,
    tooltip: '环境切换 - 在开发环境（10.80.9.76:8115）和生产环境（api.bellis.com.cn）之间切换',
    isAction: false, // 显示组件内容
  },
  {
    label: 'EPS',
    value: 'eps',
    icon: Lightning,
    tooltip: 'EPS - 查看所有后端 API 端点列表，支持搜索和浏览',
    isAction: false, // 显示组件内容
  },
  {
    label: '文档中心',
    value: 'docs',
    icon: Document,
    tooltip: '文档中心 - 系统使用指南和API文档',
    isAction: true, // 直接跳转
    action: () => {
      // 判断是否为生产环境
      const hostname = window.location.hostname;
      const isProduction = hostname.includes('bellis.com.cn');

      // 生产环境：跳转到子域名（无论是主域名还是子域名，都跳转到 docs.bellis.com.cn）
      // 开发环境：跳转到路径
      // 关键：跳转到子域名时，只跳转到根路径，不包含当前路径
      const targetUrl = isProduction
        ? `${window.location.protocol}//docs.bellis.com.cn/`
        : '/docs';

      window.location.href = targetUrl;
      visible.value = false;
    },
  },
  {
    label: '错误监控',
    value: 'monitor',
    icon: Monitor,
    tooltip: '错误监控 - 实时查看所有应用的错误和警告',
    isAction: true, // 直接跳转
    action: () => {
      // 判断是否为生产环境
      const hostname = window.location.hostname;
      const isProduction = hostname.includes('bellis.com.cn');

      // 生产环境：跳转到子域名（无论是主域名还是子域名，都跳转到 monitor.bellis.com.cn）
      // 开发环境：跳转到路径
      // 关键：跳转到子域名时，只跳转到根路径，不包含当前路径
      const targetUrl = isProduction
        ? `${window.location.protocol}//monitor.bellis.com.cn/`
        : '/monitor';

      window.location.href = targetUrl;
      visible.value = false;
    },
  },
];

const activeTab = ref('env');
const visible = ref(false);
const panelRef = ref<HTMLElement | null>(null);
const toggleRef = ref<HTMLElement | null>(null);

function switchTab(tab: string) {
  const tabItem = tabList.find(item => item.value === tab);
  if (tabItem?.isAction && tabItem.action) {
    // 如果是操作项，执行操作（跳转）
    tabItem.action();
  } else {
    // 否则切换标签页显示内容
    activeTab.value = tab;
  }
}

function toggle() {
  visible.value = !visible.value;
}

// 点击外部区域自动关闭面板
onClickOutside(
  panelRef,
  () => {
    if (visible.value) {
      visible.value = false;
    }
  },
  {
    ignore: [toggleRef], // 忽略悬浮按钮，点击按钮时不会关闭
  }
);
</script>

<style lang="scss" scoped>
.dev-tools {
  position: fixed;
  bottom: 10px;
  right: 10px;
  background-color: var(--el-bg-color);
  border-radius: 12px;
  border: 1px solid var(--el-border-color-light);
  transition: all 0.3s;
  height: 400px;
  width: 600px;
  max-width: calc(100vw - 20px);
  max-height: calc(100vh - 20px);
  display: flex;
  color: var(--el-text-color-primary);
  z-index: 2000;
  opacity: 0;
  transform: translate(calc(100% + 10px), 0);

  &.is-open {
    transform: translate(0, 0);
    opacity: 1;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }

  &__content {
    position: relative;
    flex: 1;
    overflow: hidden;
  }

  &__inner {
    padding: 16px;
  }

  &__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 200px;
    color: var(--el-text-color-secondary);
    font-size: 14px;
  }

  &__menu {
    border-left: 1px solid var(--el-border-color-extra-light);
    padding: 8px 0;
    width: 50px;
    min-width: 50px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    box-sizing: border-box;
  }

  &__menu-item {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 34px;
    width: 34px;
    cursor: pointer;
    border-radius: 8px;
    margin: 5px 0 0 0;
    color: var(--el-text-color-secondary);
    transition: all 0.3s;
    flex-shrink: 0;
    position: relative;
    z-index: 1;

    &:hover {
      background-color: var(--el-fill-color-light);
      color: var(--el-text-color-primary);
    }

    &.is-active {
      background-color: var(--el-fill-color-light);
      color: var(--el-color-primary);
    }
  }

  &__toggle {
    position: fixed;
    right: 17px;
    bottom: 17px;
    z-index: 2001;
    border-radius: 50%;
    background-color: var(--el-color-primary);
    border: none;
    cursor: pointer;
    height: 36px;
    width: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: none;
    transition: all 0.3s;
    color: #fff;

    &:hover {
      background-color: var(--el-color-primary-light-3);
      transform: scale(1.1);
      box-shadow: none;
    }

    &.is-hide {
      opacity: 0.6;

      &:hover {
        opacity: 1;
      }
    }
  }
}
</style>

