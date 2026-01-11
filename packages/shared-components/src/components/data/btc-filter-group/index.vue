<template>
  <div class="btc-filter-group">
    <BtcSplitLayout
      ref="splitLayoutRef"
      :left-width="props.leftWidth"
      :left-size="props.leftSize"
      :default-expand="props.defaultExpand"
      :auto-collapse-on-mobile="props.autoCollapseOnMobile"
      @expand-change="handleExpandChange"
    >
      <!-- 左侧：BtcFilterList -->
      <template #left="{ isExpand, expand }">
        <slot name="left" :is-expand="isExpand" :expand="expand" :filter-result="filterResult">
          <BtcFilterList
            ref="filterListRef"
            :category="props.filterCategory"
            :service="props.filterService"
            :enable-search="props.enableFilterSearch"
            :default-expanded-count="props.defaultExpandedCount"
            @change="handleFilterChange"
          />
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
import { ref, computed, unref } from 'vue';
import BtcSplitLayout from '../../layout/btc-split-layout/index.vue';
import BtcFilterList from '../btc-filterlist/index.vue';
import type { FilterResult } from '../btc-filterlist/types';
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

// 组件引用
const splitLayoutRef = ref<InstanceType<typeof BtcSplitLayout>>();
const filterListRef = ref<InstanceType<typeof BtcFilterList>>();

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
</style>
