<template>
  <div class="btc-filter-group">
    <BtcSplitLayout
      ref="splitLayoutRef"
      :left-width="dynamicLeftWidth || props.leftWidth"
      :left-size="props.leftSize"
      :default-expand="props.defaultExpand"
      :auto-collapse-on-mobile="props.autoCollapseOnMobile"
      @expand-change="handleExpandChange"
    >
      <!-- 左侧头部：默认渲染搜索框和设置按钮，通过父子组件通信实现功能 -->
      <template #left-header="{ isExpand, expand }">
        <slot name="left-header" :is-expand="isExpand" :expand="expand" :filter-result="filterResult">
          <!-- 默认：使用 filterListRef 的 expose 内容渲染搜索框和设置按钮 -->
          <template v-if="props.enableFilterSearch">
            <div class="btc-filter-group__left-header-content">
              <div class="btc-filter-group__search">
                <BtcInput
                  :model-value="filterListRef?.searchKeyword || ''"
                  @update:model-value="handleSearchKeywordChange"
                  placeholder="搜索分类..."
                  clearable
                  id="btc-filter-group-search"
                  name="btc-filter-group-search"
                >
                  <template #prefix>
                    <BtcSvg name="search" :size="16" />
                  </template>
                </BtcInput>
              </div>
              <!-- 设置按钮 -->
              <el-dropdown
                v-if="filterListRef"
                trigger="click"
                @command="handleSizeChange"
                placement="bottom-end"
              >
                <template #default>
                  <div class="btc-filter-group__settings-btn btc-comm__icon" :title="t('btc.filterList.tooltip.settings')">
                    <BtcSvg name="set" :size="16" />
                  </div>
                </template>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item
                      v-for="sizeOption in (filterListRef.sizeOptions || [])"
                      :key="sizeOption.value"
                      :command="sizeOption.value"
                    >
                      <div
                        class="btc-filter-group__size-item"
                        :class="{ 'is-active': sizeOption.value === filterListRef.currentSize }"
                      >
                        <span class="btc-filter-group__size-item-label">{{ sizeOption.label }}</span>
                        <span v-if="sizeOption.value === filterListRef.currentSize" class="btc-filter-group__size-item-dot"></span>
                      </div>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </slot>
      </template>

      <!-- 左侧：BtcFilterList（只包含分类列表内容） -->
      <template #left="{ isExpand, expand }">
        <slot name="left" :is-expand="isExpand" :expand="expand" :filter-result="filterResult">
          <BtcFilterList
            ref="filterListRef"
            :category="props.filterCategory"
            :service="props.filterService"
            :enable-search="props.enableFilterSearch"
            :default-expanded-count="props.defaultExpandedCount"
            :storage-key="props.storageKey"
            @change="handleFilterChange"
            @update:size="handleFilterListSizeChange"
          >
            <!-- 提供 header-actions 插槽，让 btc-filter-list 隐藏内部的搜索框和设置按钮 -->
            <template #header-actions>
              <!-- 插槽内容为空，搜索框和设置在父级的 left-header 中渲染 -->
            </template>
          </BtcFilterList>
        </slot>
      </template>

      <!-- 右侧头部（可选） -->
      <template #title="{ isExpand }">
        <slot name="title" :is-expand="isExpand" :filter-result="filterResult">
          <span v-if="props.rightTitle">{{ props.rightTitle }}</span>
        </slot>
      </template>

      <template #actions="{ isExpand }">
        <slot name="actions" :is-expand="isExpand" :filter-result="filterResult" />
      </template>

      <!-- 右侧内容 -->
      <template #right="{ isExpand }">
        <slot name="right" :is-expand="isExpand" :filter-result="filterResult" />
      </template>
    </BtcSplitLayout>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, unref, watch } from 'vue';
import BtcSplitLayout from '../../layout/btc-split-layout/index.vue';
import BtcFilterList from '../btc-filter-list/index.vue';
import { BtcInput, BtcSvg } from '@btc/shared-components';
import { useI18n } from '@btc/shared-core';
import type { FilterResult, BtcFilterListSize } from '../btc-filter-list/types';
import type { BtcFilterGroupProps, BtcFilterGroupEmits, BtcFilterGroupExpose } from './types';

defineOptions({
  name: 'BtcFilterGroup',
  inheritAttrs: false,
  components: {
    BtcSplitLayout,
    BtcFilterList,
  },
});

const props = withDefaults(defineProps<BtcFilterGroupProps>(), {
  enableFilterSearch: true,
  defaultExpandedCount: 3,
  leftSize: 'default',
  defaultExpand: true,
  autoCollapseOnMobile: true,
});

const emit = defineEmits<BtcFilterGroupEmits>();

// 国际化
const { t } = useI18n();

// 组件引用
const splitLayoutRef = ref<InstanceType<typeof BtcSplitLayout>>();
const filterListRef = ref<InstanceType<typeof BtcFilterList>>();

// 动态左侧宽度（根据 BtcFilterList 的尺寸自动计算）
const dynamicLeftWidth = ref<string | undefined>(props.leftWidth);

// 筛选结果
const filterResult = ref<FilterResult[]>([]);

// 处理筛选变化
const handleFilterChange = (result: FilterResult[]) => {
  filterResult.value = result;
  emit('filter-change', result);
};

// 处理展开/收起变化
const handleExpandChange = (isExpand: boolean) => {
  emit('expand-change', isExpand);
};

// 处理搜索关键词变化（父子组件通信）
const handleSearchKeywordChange = (val: string) => {
  if (filterListRef.value) {
    filterListRef.value.searchKeyword = val;
  }
};

// 处理尺寸切换（父子组件通信）
const handleSizeChange = (size: BtcFilterListSize) => {
  if (filterListRef.value) {
    filterListRef.value.handleSizeChange(size);
  }
};

// 处理 BtcFilterList 尺寸变化
const handleFilterListSizeChange = (size: BtcFilterListSize) => {
  // 根据尺寸计算对应的宽度
  let width: string;
  switch (size) {
    case 'small':
      width = '200px';
      break;
    case 'large':
      width = '450px';
      break;
    case 'default':
    default:
      // default 尺寸使用 props.leftWidth 或根据 leftSize 计算
      if (props.leftWidth) {
        width = props.leftWidth;
      } else if (props.leftSize === 'small') {
        width = '150px';
      } else if (props.leftSize === 'middle') {
        width = '225px';
      } else {
        width = '300px';
      }
      break;
  }
  dynamicLeftWidth.value = width;
};

// 监听 props.leftWidth 的变化
watch(() => props.leftWidth, (newWidth) => {
  // 如果外部明确指定了 leftWidth，使用外部值
  // 但如果 BtcFilterList 的尺寸不是 default，则优先使用尺寸对应的宽度
  if (newWidth) {
    dynamicLeftWidth.value = newWidth;
  }
});

// 暴露
defineExpose<BtcFilterGroupExpose>({
  filterResult: computed(() => filterResult.value),
  isExpand: computed(() => {
    const expand = splitLayoutRef.value?.isExpand;
    return expand ? unref(expand) : false;
  }),
  isMobile: computed(() => {
    const mobile = splitLayoutRef.value?.isMobile;
    return mobile ? unref(mobile) : false;
  }),
  expand: (value?: boolean) => {
    splitLayoutRef.value?.expand(value);
  },
  filterListRef,
});
</script>

<style lang="scss" scoped>
.btc-filter-group {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

:deep(.btc-split-layout) {
  height: 100%;
  width: 100%;
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.btc-filter-group__left-header-content {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.btc-filter-group__search {
  flex: 1;
  min-width: 0;

  :deep(.el-input) {
    .el-input__wrapper {
      border-radius: 6px;
    }
  }
}

.btc-filter-group__settings-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--el-fill-color-light);
  }
}

.btc-filter-group__size-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  &.is-active {
    color: var(--el-color-primary);
  }

  &-label {
    flex: 1;
  }

  &-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: var(--el-color-primary);
    margin-left: 8px;
  }
}
</style>
