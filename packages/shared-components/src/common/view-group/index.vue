<template>
  <div class="btc-view-group" :class="[isExpand ? 'is-expand' : 'is-collapse']">
    <div class="btc-view-group__wrap">
      <!-- 左侧 -->
      <div class="btc-view-group__left">
        <slot name="left">
          <BtcMasterList
            :key="`master-list-${masterListKey}`"
            ref="masterListRef"
            :title="leftTitle"
            :service="leftService"
            :id-field="idField"
            :label-field="labelField"
            :parent-field="parentField"
            :drag="enableDrag"
            :show-unassigned="showUnassigned"
            :unassigned-label="unassignedLabel"
            :enable-key-search="enableKeySearch"
            @select="handleLeftSelect"
            @load="handleLeftLoad"
          />
        </slot>

        <!-- 收起按钮（移动端） -->
        <div v-if="isMobile" class="collapse-btn" @click="expand(false)">
          <btc-svg name="right" />
        </div>
      </div>

      <!-- 右侧 -->
      <div class="btc-view-group__right">
        <div v-if="!custom" class="head">
          <div
            class="icon is-bg absolute left-[10px]"
            :class="{ 'is-fold': !isExpand }"
            @click="expand()"
          >
            <btc-svg name="back" />
          </div>

          <slot name="title" :selected="selectedItem">
            <span class="title">
              {{ rightTitle }}（{{ selectedItem ? selectedItem[labelField || 'name'] || selectedItem.name : t('common.not_selected') }}）
            </span>
          </slot>

          <div class="absolute right-[10px]">
            <slot name="right-op"></slot>
          </div>
        </div>

        <div v-if="selectedItem || custom" class="content" :class="{ 'is-custom': custom }">
          <slot name="right" :selected="selectedItem" :keyword="selectedKeyword" :left-data="leftListData" :right-data="rightData"></slot>
        </div>

        <el-empty v-else :image-size="80" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, inject, useSlots, nextTick, provide } from 'vue';
import BtcSvg from '../svg/index.vue';
import BtcMasterList from '@btc-components/btc-master-list/index.vue';
import type { ViewGroupOptions } from './types';
import { useViewGroupData, useViewGroupActions } from './composables';
import { useI18n } from '@btc/shared-core';

defineOptions({
  name: 'BtcViewGroup',
  components: {
    BtcSvg,
    BtcMasterList
  }
});

// Helper function
function isEmpty(value: any): boolean {
  if (value == null) return true;
  if (Array.isArray(value) || typeof value === 'string') return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

const props = withDefaults(defineProps<{
  leftService?: any; // 左侧服务（可选）
  rightService?: any; // 右侧服务（可选）
  leftTitle?: string;
  rightTitle?: string;
  showUnassigned?: boolean;
  unassignedLabel?: string;
  enableDrag?: boolean;
  leftWidth?: string;
  custom?: boolean;
  idField?: string;
  labelField?: string;
  parentField?: string;
  op?: { buttons?: any[] }; // 操作列配置
  enableKeySearch?: boolean; // 是否启用搜索
}>(), {
  op: undefined,
  enableKeySearch: false,
});

const emit = defineEmits<{
  'update:selected': [value: any];
  'refresh': [params?: any];
  'select': [item: any, keyword?: any];
  'left-data-loaded': [data: any[]];
  'right-data-loaded': [data: any];
  'load': [data: any[]];
}>();

// 国际化
const { t } = useI18n();

const slots = useSlots();

// 响应式数据
const selectedItem = ref<any>(null);
const selectedKeyword = ref<any>(undefined);
const leftListData = ref<any[]>([]); // 存储左侧列表数据
const rightData = ref<any>(null); // 存储右侧数据

const isExpand = ref(true); // 初始状态为展开

// 检测移动端
const isMobile = computed(() => window.innerWidth <= 768);

// 强制重新渲染的key
const masterListKey = ref(0);

// 组件引用
const masterListRef = ref<any>(null);

// 处理左侧选择
function handleLeftSelect(item: any, keyword: any) {
  selectedItem.value = item;
  selectedKeyword.value = keyword;

  // 注意：不自动加载右侧数据，让父组件（如 BtcTableGroup）来处理
  // 这样可以避免重复调用接口

  // 触发事件
  emit('select', item, keyword);
  emit('update:selected', item);
}

// 加载右侧数据
async function loadRightData() {
  if (!props.rightService || !props.rightService.page) return;

  try {
    const params: any = {
      order: 'asc',  // 修正：order 应该是排序方向，不是字段名
      page: 1,
      size: 20
    };

    // 添加 keyword 参数
    if (selectedKeyword.value !== undefined) {
      params.keyword = selectedKeyword.value;
    }

    const res = await props.rightService.page(params);
    rightData.value = res;

    emit('right-data-loaded', res);
  } catch (error) {
    console.error('加载右侧数据失败:', error);
  }
}

// 处理左侧数据加载
function handleLeftLoad(data: any[]) {
  leftListData.value = data;
  emit('left-data-loaded', data);
}

// 处理左侧加载完成
function handleLeftLoadComplete(_data: any[]) {
  // 左侧数据加载完成，不需要额外处理
}

// 收起、展开
function expand(value?: boolean) {
  isExpand.value = value === undefined ? !isExpand.value : value;
}

// 刷新方法
const refresh = async (params?: any) => {
  // 只有在必要时才重新渲染BtcMasterList
  if (masterListRef.value && typeof masterListRef.value.refresh === 'function') {
    await masterListRef.value.refresh(params);
  } else {
    // 强制重新渲染BtcMasterList
    masterListKey.value++;
    await nextTick();
  }

  emit('refresh', params);
};

// Provide 数据供右侧组件使用
provide('btc-view-group', {
  selectedItem: computed(() => selectedItem.value),
  selectedKeyword: computed(() => selectedKeyword.value),
  leftListData: computed(() => leftListData.value),
  rightData: computed(() => rightData.value),
  rightService: props.rightService,
  refresh: loadRightData
});

// 监听屏幕变化 - 只在移动端自动收起
watch(isMobile, (val) => {
  // 移动端时自动收起左侧面板
  if (val) {
    expand(false);
  }
});

// 手动选择方法，供外部调用
const select = (item: any, keyword?: any) => {
  handleLeftSelect(item, keyword);
};

// 暴露
defineExpose({
  selectedItem,
  selectedKeyword,
  leftListData,
  rightData,
  refresh: loadRightData,
  masterListRef,
  isExpand,
  expand,
  select
});
</script>

<style lang="scss" scoped>
@use './styles/index.scss' as *;

// 动态变量必须在组件内定义
$left-width: v-bind('props.leftWidth || "300px"');
$bg: var(--el-bg-color);

.btc-view-group {
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &__wrap {
    flex: 1;
    display: flex;
    overflow: hidden;
    position: relative;
    background-color: $bg;
    border-radius: 4px;
  }

  &__left {
    position: relative;
    height: 100%;
    width: $left-width;
    background-color: $bg;
    overflow: hidden;
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: width;
    flex-shrink: 0;
  }

  &__right {
    display: flex;
    flex-direction: column;
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
    width: 100%;
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    background-color: $bg;
    will-change: width;

    .head {
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      border-bottom: 1px solid var(--el-border-color-extra-light);
      flex-shrink: 0;

      .title {
        font-size: 15px;
        font-weight: 500;
      }

      .icon {
        height: 28px;
        width: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border-radius: 50%;
        transition: transform 0.2s ease-in-out;

        &:hover {
          background-color: var(--el-fill-color-light);
        }

        &.is-fold {
          transform: rotate(180deg);
        }
      }
    }

    .content {
      height: calc(100% - 40px);
      overflow: hidden;

      &.is-custom {
        height: 100%;
      }
    }
  }

  // 展开状态
  &.is-expand {
    .btc-view-group__right {
      width: calc(100% - $left-width);
      border-left: 1px solid var(--el-border-color-extra-light);
    }
  }

  // 折叠状态
  &.is-collapse {
    .btc-view-group__left {
      width: 0;
    }

    .btc-view-group__right {
      width: 100%;
    }
  }
}

// 移动端适配
@media screen and (max-width: 768px) {
  .btc-view-group {
    &__left {
      overflow: hidden;
      transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      width: 0;
      z-index: 20;
      will-change: width;
    }

    &__right {
      width: 100% !important;
    }

    &.is-expand {
      .btc-view-group__left {
        width: 100%;
      }
    }
  }
}
</style>
