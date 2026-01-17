<template>
  <div class="btc-tabs" :style="{ width: '100%', height: '100%' }">
    <!-- 标题tab区域 -->
    <div class="btc-tabs__header">
      <div class="btc-tabs__nav" ref="navRef">
        <div
          v-for="(tab, index) in tabs"
          :key="tab.name || index"
          class="btc-tabs__item"
          :class="{ 'is-active': activeTab === (tab.name || index) }"
          @click="setActiveTab(tab.name || index)"
          :ref="(el) => setItemRef(el, index)"
        >
          <span class="btc-tabs__label">{{ tab.label }}</span>
        </div>
        <!-- 下划线指示器 -->
        <div
          class="btc-tabs__ink"
          :style="inkStyle"
        ></div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="btc-tabs__content">
      <slot name="content" :activeTab="activeTab" :tabs="tabs">
        <div
          v-for="(tab, index) in tabs"
          :key="tab.name || index"
          class="btc-tabs__panel"
          :class="{ 'is-active': activeTab === (tab.name || index) }"
        >
          <slot
            :name="tab.name || `tab-${index}`"
            :tab="tab"
            :index="index"
          >
            {{ tab.content }}
          </slot>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, type ComponentPublicInstance } from 'vue';
;


export interface BtcTab {
  name?: string | number;
  label: string;
  content?: any;
  disabled?: boolean;
}

const props = withDefaults(defineProps<{
  modelValue?: string | number;
  tabs: BtcTab[];
  defaultTab?: string | number;
}>(), {
  tabs: () => []
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
  'tab-change': [tab: BtcTab, index: number];
}>();

// 当前激活的tab
const activeTab = ref<string | number>('');

// DOM引用
const navRef = ref<HTMLElement>();
const itemRefs = ref<HTMLElement[]>([]);

// 下划线样式
const inkStyle = ref({
  left: '0px',
  width: '0px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
});

// 防抖定时器，避免频繁更新
let updateTimer: number | null = null;

// 设置item引用
const setItemRef = (el: Element | ComponentPublicInstance | null, index: number) => {
  if (el && 'tagName' in el) {
    itemRefs.value[index] = el as HTMLElement;
  }
};

// 初始化activeTab
const initActiveTab = () => {
  if (props.modelValue !== undefined) {
    activeTab.value = props.modelValue;
  } else   if (props.defaultTab !== undefined) {
    activeTab.value = props.defaultTab;
  } else if (props.tabs.length > 0) {
    const firstTab = props.tabs[0];
    if (firstTab) {
      activeTab.value = firstTab.name || 0;
    }
  }
};

// 设置激活的tab
const setActiveTab = async (tabName: string | number) => {
  if (activeTab.value === tabName) return;

  const tabIndex = props.tabs.findIndex(tab => (tab.name || props.tabs.indexOf(tab)) === tabName);
  const tab = props.tabs[tabIndex];

  if (tab?.disabled || !tab) return;

  activeTab.value = tabName;
  emit('update:modelValue', tabName);
  emit('tab-change', tab, tabIndex);

  // 使用setTimeout确保DOM更新完成
  setTimeout(() => {
    updateInkPosition();
  }, 0);
};

// 防抖更新下划线位置
const debouncedUpdateInkPosition = () => {
  // 清除之前的定时器
  if (updateTimer) {
    clearTimeout(updateTimer);
  }

  // 设置新的定时器，延迟执行更新
  updateTimer = window.setTimeout(() => {
    updateInkPosition();
    updateTimer = null;
  }, 16); // 约一帧的时间
};

// 更新下划线位置
const updateInkPosition = () => {
  try {
    if (!navRef.value || !props.tabs.length) return;

    // 找到当前激活的tab索引
    const activeIndex = props.tabs.findIndex(tab => (tab.name || props.tabs.indexOf(tab)) === activeTab.value);

    if (activeIndex === -1) return;

    const activeItem = itemRefs.value[activeIndex];
    if (!activeItem) return;

    const navRect = navRef.value.getBoundingClientRect();
    const itemRect = activeItem.getBoundingClientRect();

    // 计算目标位置和宽度
    const targetLeft = itemRect.left - navRect.left;
    const targetWidth = itemRect.width;

    // 计算中心点
    const centerX = targetLeft + targetWidth / 2;

    // 先设置到中心点，宽度为0
    inkStyle.value = {
      left: `${centerX}px`,
      width: '0px',
      transition: 'none' // 先不添加过渡
    };

    // 使用 requestAnimationFrame 来避免 ResizeObserver 循环问题
    // 同时使用 try-catch 包装来捕获可能的错误
    requestAnimationFrame(() => {
      try {
        // 重新获取最新的位置信息，确保准确性
        const latestNavRect = navRef.value!.getBoundingClientRect();
        const latestItemRect = activeItem.getBoundingClientRect();

        const latestTargetLeft = latestItemRect.left - latestNavRect.left;
        const latestTargetWidth = latestItemRect.width;

        inkStyle.value = {
          left: `${latestTargetLeft}px`,
          width: `${latestTargetWidth}px`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        };
      } catch (error) {
        // 如果出现错误，使用之前计算的值作为降级方案
        inkStyle.value = {
          left: `${targetLeft}px`,
          width: `${targetWidth}px`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        };
        console.warn('Failed to update ink position with latest values, using fallback:', error);
      }
    });
  } catch (error) {
    console.warn('Failed to update ink position:', error);
  }
};

// 监听tabs变化
watch(() => props.tabs, () => {
  initActiveTab();
  // 清空itemRefs数组，让Vue重新设置引用
  itemRefs.value = [];
  // 使用防抖更新避免频繁触发
  debouncedUpdateInkPosition();
}, { immediate: true });

// 监听modelValue变化
watch(() => props.modelValue, (newValue) => {
  if (newValue !== undefined && newValue !== activeTab.value) {
    activeTab.value = newValue;
    debouncedUpdateInkPosition();
  }
});

// 监听activeTab变化
watch(activeTab, () => {
  debouncedUpdateInkPosition();
});

// 组件挂载后初始化
onMounted(() => {
  initActiveTab();
  debouncedUpdateInkPosition();
});

// 暴露方法
defineExpose({
  setActiveTab,
  updateInkPosition: debouncedUpdateInkPosition
});
</script>

<style lang="scss" scoped>
.btc-tabs {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;

  &__header {
    flex-shrink: 0;
    background-color: transparent;
  }

  &__nav {
    position: relative;
    display: flex;
    align-items: center;
    height: 40px;
    padding-left: 0;
  }

  &__item {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    padding: 0 20px;
    margin-right: 0;
    cursor: pointer;
    font-size: 14px;
    color: var(--el-text-color-regular);
    transition: color 0.3s ease;
    user-select: none;

    &:hover {
      color: var(--el-color-primary);
    }

    &.is-active {
      color: var(--el-color-primary);
      font-weight: 500;
    }
  }

  &__label {
    white-space: nowrap;
  }

  &__ink {
    position: absolute;
    bottom: 0;
    height: 2px;
    background-color: var(--el-color-primary);
    border-radius: 1px;
    z-index: 1;
  }

  &__content {
    flex: 1;
    overflow: hidden;
    position: relative;
  }

  &__panel {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s ease, visibility 0.2s ease;

    &.is-active {
      opacity: 1;
      visibility: visible;
    }
  }
}
</style>
