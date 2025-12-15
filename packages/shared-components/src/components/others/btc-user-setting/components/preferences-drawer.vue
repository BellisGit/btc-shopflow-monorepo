<template>
  <!--
    关键：在微前端（qiankun）样式隔离场景下，Teleport 到 body 可能导致样式无法命中（选择器被自动加上容器作用域）。
    因此优先挂载到 layout-app 根容器内，保证样式正常；不存在时再回退到 body。
  -->
  <teleport :to="teleportTarget">
    <transition name="preferences-slide">
      <section
        v-if="visible"
        ref="drawerRef"
        class="user-preferences-panel"
        role="dialog"
        aria-modal="false"
        aria-label="User preferences"
  >
    <div class="preferences-drawer">
      <!-- 头部关闭按钮 -->
      <SettingHeader @close="closeDrawer" />

      <!-- 主题风格（切换深浅主题） -->
      <ThemeStyleSettings />

      <!-- 菜单布局 -->
      <MenuLayoutSettings />

      <!-- 菜单风格 -->
      <MenuStyleSettings />

      <!-- 系统主题色 -->
      <ColorSettings />

      <!-- 按钮风格 -->
      <ButtonStyleSettings />

      <!-- 盒子样式 -->
      <BoxStyleSettings />

      <!-- 容器宽度 -->
      <ContainerWidthSettings />

      <!-- 基础设置 -->
      <BasicSettings />
    </div>
      </section>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import SettingHeader from './shared/SettingHeader.vue';
import MenuLayoutSettings from '../settings/menu-layout/index.vue';
import MenuStyleSettings from '../settings/menu-style/index.vue';
import ThemeStyleSettings from '../settings/theme-style/index.vue';
import ColorSettings from '../settings/color-settings/index.vue';
import ButtonStyleSettings from '../settings/button-style/index.vue';
import BoxStyleSettings from '../settings/box-style/index.vue';
import ContainerWidthSettings from '../settings/container-width/index.vue';
import BasicSettings from '../settings/basic-settings/index.vue';
import '../styles/index.scss';

defineOptions({
  name: 'BtcUserSettingDrawer'
});

interface Props {
  modelValue: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const drawerRef = ref<HTMLElement | null>(null);
const teleportTarget = ref<string>('body');

const closeDrawer = () => {
  visible.value = false;
};

const handleGlobalClick = (event: MouseEvent) => {
  if (!visible.value) {
    return;
  }
  const drawerEl = drawerRef.value;
  if (drawerEl && !drawerEl.contains(event.target as Node)) {
    closeDrawer();
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if (!visible.value) {
    return;
  }
  if (event.key === 'Escape') {
    closeDrawer();
  }
};

onMounted(() => {
  // 关键：优先挂载到 layout-app 容器中，避免 qiankun 样式隔离导致样式丢失
  try {
    if (typeof document !== 'undefined') {
      if (document.querySelector('#layout-app')) {
        teleportTarget.value = '#layout-app';
      } else if (document.querySelector('#app')) {
        teleportTarget.value = '#app';
      }
    }
  } catch {
    teleportTarget.value = 'body';
  }

  document.addEventListener('click', handleGlobalClick);
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('click', handleGlobalClick);
  document.removeEventListener('keydown', handleKeydown);
});
</script>

