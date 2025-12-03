<template>
  <teleport to="body">
    <transition name="preferences-slide">
      <section
        v-if="visible"
        ref="drawerRef"
        class="user-preferences-panel"
        role="dialog"
        aria-modal="true"
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
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
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
  set: (value: boolean) => emit('update:modelValue', value)
});

const drawerRef = ref<HTMLElement | null>(null);

const closeDrawer = () => {
  visible.value = false;
};

const handleClickOutside = (event: MouseEvent) => {
  if (!props.modelValue) return;

  // 使用 document.querySelector 查找抽屉元素，与汉堡菜单抽屉保持一致
  const drawer = document.querySelector('.user-preferences-panel');
  if (!drawer) return;

  const target = event.target as HTMLElement;
  
  // 检查点击是否在抽屉内部
  if (drawer.contains(target)) {
    return; // 点击在抽屉内部，不关闭
  }

  // 检查点击是否来自工具栏按钮（避免点击按钮时立即关闭）
  const toolbarButton = target.closest('.btc-user-setting-toolbar');
  if (toolbarButton) {
    return; // 点击工具栏按钮，不关闭
  }

  // 点击在抽屉外部且不是工具栏按钮，关闭抽屉并阻止事件传播
  event.preventDefault();
  event.stopPropagation();
  closeDrawer();
};

const handleKeydown = (event: KeyboardEvent) => {
  if (!props.modelValue) return;
  if (event.key === 'Escape') {
    closeDrawer();
  }
};

// 监听 visible 变化，控制 body 滚动
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    // 阻止 body 滚动
    document.body.style.overflow = 'hidden';
  } else {
    // 恢复 body 滚动
    document.body.style.overflow = '';
  }
}, { immediate: true });

onMounted(() => {
  // 在组件挂载时添加事件监听器，与汉堡菜单抽屉保持一致
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = '';
});
</script>
