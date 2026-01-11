<template>
  <div
    class="btc-view-group"
    :class="[isExpand ? 'is-expand' : 'is-collapse', `is-left-size-${props.leftSize || 'default'}`]"
    :style="viewGroupStyle"
  >
    <div class="btc-view-group__wrap">
      <!-- 左侧 -->
      <div class="btc-view-group__left">
        <slot name="left">
          <BtcMasterList
            :key="`master-list-${masterListKey}`"
            ref="masterListRef"
            v-bind="{
              service: leftService,
              ...(leftTitle !== undefined ? { title: leftTitle } : {}),
              ...(idField !== undefined ? { 'id-field': idField } : {}),
              ...(labelField !== undefined ? { 'label-field': labelField } : {}),
              ...(parentField !== undefined ? { 'parent-field': parentField } : {}),
              ...(enableDrag !== undefined ? { drag: enableDrag } : {}),
              ...(showUnassigned !== undefined ? { 'show-unassigned': showUnassigned } : {}),
              ...(unassignedLabel !== undefined ? { 'unassigned-label': unassignedLabel } : {}),
              ...(enableKeySearch !== undefined ? { 'enable-key-search': enableKeySearch } : {}),
              'hide-expand-icon': props.leftSize === 'small' || props.leftSize === 'middle'
            }"
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

        <div v-if="selectedItem || custom" class="content page" :class="{ 'is-custom': custom }">
          <slot name="right" :selected="selectedItem" :keyword="selectedKeyword" :left-data="leftListData" :right-data="rightData"></slot>
        </div>

        <BtcEmpty v-else :image-size="80" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, provide } from 'vue';
import BtcSvg from '@btc-components/basic/btc-svg/index.vue';
import BtcMasterList from '@btc-components/data/btc-master-list/index.vue';
import BtcEmpty from '@btc-components/basic/btc-empty/index.vue';
// useViewGroupData 和 useViewGroupActions 未使用，已移除导入
import { useContentHeight } from '../../composables/content-height';
import { useI18n } from '@btc/shared-core';

defineOptions({
  name: 'BtcMasterViewGroup',
  components: {
    BtcSvg,
    BtcMasterList,
    BtcEmpty
  }
});

// Helper function (currently unused, but may be needed in the future)
// function isEmpty(value: any): boolean {
//   if (value == null) return true;
//   if (Array.isArray(value) || typeof value === 'string') return value.length === 0;
//   if (typeof value === 'object') return Object.keys(value).length === 0;
//   return false;
// }

const props = withDefaults(defineProps<{
  leftService?: any; // 左侧服务（可选）
  rightService?: any; // 右侧服务（可选）
  leftTitle?: string;
  rightTitle?: string;
  showUnassigned?: boolean;
  unassignedLabel?: string;
  enableDrag?: boolean;
  leftWidth?: string; // 直接指定左侧宽度（优先级最高）
  leftSize?: 'default' | 'small' | 'middle'; // 左侧宽度类型：default（300px）、small（150px）或 middle（225px）
  custom?: boolean;
  idField?: string;
  labelField?: string;
  parentField?: string;
  op?: { buttons?: any[] }; // 操作列配置
  enableKeySearch?: boolean; // 是否启用搜索
}>(), {
  enableKeySearch: false,
  leftSize: 'default',
});

const emit = defineEmits<{
  'update:selected': [value: any];
  'refresh': [params?: any];
  'select': [item: any, keyword?: any];
  'left-data-loaded': [data: any[]];
  'right-data-loaded': [data: any];
  'load': [data: any[]];
}>();

// 定义插槽类型
defineSlots<{
  left?: () => any;
  'left-op'?: () => any;
  right?: (props: { selected?: any; keyword?: any; leftData?: any[]; rightData?: any }) => any;
  'right-op'?: () => any;
  title?: (props: { selected?: any }) => any;
  item?: (props: { item: any; selected?: any; index: number }) => any;
  'item-name'?: (props: { item: any; selected?: any; index: number }) => any;
}>();

// 国际化
const { t } = useI18n();

// const slots = useSlots(); // 未使用

// 响应式数据
const selectedItem = ref<any>(null);
const selectedKeyword = ref<any>(undefined);
const leftListData = ref<any[]>([]); // 存储左侧列表数据
const rightData = ref<any>(null); // 存储右侧数据

const isExpand = ref(true); // 初始状态为展开

  // 计算左侧宽度：如果指定了 leftWidth 则使用，否则根据 leftSize 计算
  const leftPaneWidth = computed(() => {
    // 如果明确指定了 leftWidth，优先使用
    if (props.leftWidth && typeof props.leftWidth === 'string' && props.leftWidth.trim()) {
      return props.leftWidth;
    }
    // 根据 leftSize 计算宽度：default 为 300px，small 为 150px，middle 为 225px
    if (props.leftSize === 'small') {
      return '150px';
    } else if (props.leftSize === 'middle') {
      return '225px';
    }
    return '300px';
  });

const viewGroupStyle = computed(() => {
  const width = leftPaneWidth.value;
  return {
    '--btc-view-group-left-width': width || '300px',
  };
});

const { emit: emitContentResize } = useContentHeight();

const scheduleContentResize = () => {
  nextTick(() => {
    emitContentResize();
  });
};

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
  scheduleContentResize();
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

    // 添加 keyword 参数 - 统一将 ids 处理为数组
    if (selectedKeyword.value !== undefined) {
      const kw = selectedKeyword.value;
      if (kw !== null && kw !== '') {
        if (typeof kw === 'object' && kw !== null && !Array.isArray(kw)) {
          // 如果是对象，统一处理其中的 ids 字段为数组
          if ('ids' in kw) {
            const normalizedIds = Array.isArray(kw.ids) ? kw.ids : (kw.ids !== undefined && kw.ids !== null && kw.ids !== '' ? [kw.ids] : []);
            params.keyword = { ...kw, ids: normalizedIds };
          } else {
            params.keyword = kw;
          }
        } else {
          // 字符串或数组，统一转换为数组格式
          const normalizedIds = Array.isArray(kw) ? kw : (kw !== undefined && kw !== null && kw !== '' ? [kw] : []);
          params.keyword = { ids: normalizedIds };
        }
      }
    }

    const res = await props.rightService.page(params);
    rightData.value = res;

    emit('right-data-loaded', res);
    scheduleContentResize();
  } catch (error) {
    console.error('加载右侧数据失败:', error);
  }
}

// 处理左侧数据加载
function handleLeftLoad(data: any[]) {
  leftListData.value = data;
  emit('left-data-loaded', data);
  scheduleContentResize();
}

// 处理左侧加载完成（当前未使用）
// function handleLeftLoadComplete(_data: any[]) {
//   // 左侧数据加载完成，不需要额外处理
// }

// 收起、展开
function expand(value?: boolean) {
  isExpand.value = value === undefined ? !isExpand.value : value;
  scheduleContentResize();
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
  scheduleContentResize();
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
  scheduleContentResize();
});

// 手动选择方法，供外部调用
const select = (item: any, keyword?: any) => {
  handleLeftSelect(item, keyword);
  scheduleContentResize();
};

// 暴露
defineExpose({
  selectedItem,
  selectedKeyword,
  leftListData,
  rightData,
  refresh, // 修复：使用真正的 refresh 方法，而不是 loadRightData
  loadRightData, // 如果需要单独调用 loadRightData，也暴露出来
  masterListRef,
  isExpand,
  expand,
  select
});
</script>

<style lang="scss" scoped>
@use './styles/index.scss' as *;

$bg: var(--el-bg-color);

.btc-view-group {
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &__wrap {
    height: 100%;
    display: flex;
    overflow: hidden;
    position: relative;
    background-color: $bg;
    border-radius: 4px;
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
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-sizing: border-box;

      &.is-custom {
        height: 100%;
      }
    }
  }

  // 展开状态
  &.is-expand {
    .btc-view-group__right {
      width: calc(100% - var(--btc-view-group-left-width, 300px));
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
