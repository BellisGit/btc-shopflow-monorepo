<template>
  <div class="btc-view-group" :class="[isExpand ? 'is-expand' : 'is-collapse']">
    <div class="btc-view-group__wrap">
      <!-- 左侧 -->
      <div class="btc-view-group__left">
        <slot name="left">
          <div class="scope">
            <!-- 头部 -->
            <div class="head">
              <el-text class="label">{{ config.label }}</el-text>

              <template v-if="isDrag">
                <el-tooltip content="确认">
                  <div class="icon" @click="treeOrder(true)">
                    <btc-svg name="success" />
                  </div>
                </el-tooltip>

                <el-tooltip content="取消">
                  <div class="icon" @click="treeOrder(false)">
                    <btc-svg name="fail" />
                  </div>
                </el-tooltip>
              </template>

              <template v-else>
                <el-tooltip v-if="config.enableRefresh" content="刷新">
                  <div class="icon" @click="refresh()">
                    <btc-svg name="refresh" />
                  </div>
                </el-tooltip>

                <el-tooltip v-if="config.enableDrag && tree.visible" content="拖动排序">
                  <div class="icon" @click="isDrag = true">
                    <btc-svg name="sort" />
                  </div>
                </el-tooltip>

                <slot name="left-op"></slot>
              </template>
            </div>

            <!-- 搜索框 -->
            <div v-if="config.enableKeySearch" class="search">
              <el-input
                v-model="keyWord"
                placeholder="搜索关键字"
                clearable
                :prefix-icon="Search"
                @change="refresh({ page: 1 })"
              />
            </div>

            <!-- 数据区域 -->
            <div class="data">
              <el-scrollbar>
                <!-- 树类型 -->
                <template v-if="tree.visible">
                  <el-tree
                    ref="treeRef"
                    class="tree"
                    :node-key="tree.props.id"
                    highlight-current
                    auto-expand-parent
                    :expand-on-click-node="false"
                    :lazy="tree.lazy"
                    :data="list"
                    :props="tree.props"
                    :load="tree.onLoad"
                    :draggable="isDrag"
                    :allow-drag="tree.allowDrag"
                    :allow-drop="tree.allowDrop"
                    @node-click="select"
                    @node-drop="handleDrop"
                    @node-contextmenu="onTreeContextMenu"
                  >
                    <template #default="{ data }">
                      <div class="item" :class="{ 'is-active': getItemId(selected) === getItemId(data) }">
                        <component :is="data.icon" v-if="data.icon" />

                        <slot name="item-name" :item="data" :selected="selected">
                          <el-text truncated>
                            {{ data[tree.props.label] }}
                            {{ isEmpty(data[tree.props.children]) ? '' : `（${data[tree.props.children]?.length}）` }}
                          </el-text>
                        </slot>
                      </div>
                    </template>
                  </el-tree>
                </template>

                <!-- 列表类型 -->
                <template v-else>
                  <ul
                    v-infinite-scroll="onMore"
                    class="list"
                    :infinite-scroll-immediate="false"
                    :infinite-scroll-disabled="loaded"
                  >
                    <li
                      v-for="(item, index) in list"
                      :key="index"
                      @click="select(item)"
                      @contextmenu="(e) => onContextMenu(e, item)"
                    >
                      <slot name="item" :item="item" :selected="selected" :index="index">
                        <div class="item" :class="{ 'is-active': getItemId(selected) === getItemId(item) }">
                          <slot name="item-name" :item="item" :selected="selected" :index="index">
                            <span class="text-ellipsis overflow-hidden mr-2">
                              {{ item[tree.props.label] || item.name }}
                            </span>
                          </slot>

                          <btc-svg
                            name="right"
                            class="ml-auto"
                            v-show="getItemId(selected) === getItemId(item)"
                          />
                        </div>
                      </slot>
                    </li>

                    <el-empty v-if="list.length === 0" :image-size="80" />
                  </ul>
                </template>
              </el-scrollbar>
            </div>
          </div>
        </slot>

        <!-- 收起按钮（移动端） -->
        <div v-if="isMobile" class="collapse-btn" @click="expand(false)">
          <btc-svg name="right" />
        </div>
      </div>

      <!-- 右侧 -->
      <div class="btc-view-group__right">
        <div class="head">
          <div
            class="icon is-bg absolute left-[10px]"
            :class="{ 'is-fold': !isExpand }"
            @click="expand()"
          >
            <btc-svg name="back" />
          </div>

          <slot name="title" :selected="selected">
            <span class="title">
              {{ config.title }}（{{ selected ? (selected[tree.props.label] || selected.name) : '未选择' }}）
            </span>
          </slot>

          <div class="absolute right-[10px]">
            <slot name="right-op"></slot>
          </div>
        </div>

        <div v-if="selected || config.custom" class="content">
          <slot name="right"></slot>
        </div>

        <el-empty v-else :image-size="80" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, inject, onMounted, useSlots } from 'vue';
import { Search } from '@element-plus/icons-vue';
import BtcSvg from '../svg/index.vue';
import type { ViewGroupOptions } from './types';
import { useViewGroupData, useViewGroupActions, useViewGroupDrag, useViewGroupMenu } from './composables';

defineOptions({
  name: 'BtcViewGroup',
  components: {
    BtcSvg
  }
});

// Helper function
function isEmpty(value: any): boolean {
  if (value == null) return true;
  if (Array.isArray(value) || typeof value === 'string') return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

const props = defineProps<{
  options?: ViewGroupOptions;
}>();

const emit = defineEmits<{
  'update:selected': [value: any];
  'refresh': [params?: any];
}>();

const slots = useSlots();

// 配置
const config = reactive<ViewGroupOptions>({
  label: '组',
  title: '列表',
  leftWidth: '300px',
  data: {},
  service: {},
  enableContextMenu: true,
  enableRefresh: true,
  enableKeySearch: true,
  enableDrag: false,
  enableEdit: true,
  enableDelete: true,
  custom: false,
  ...inject('btc-view-group__options', {}),
  ...props.options,
});

// 左侧内容是否自定义
const isCustom = !!slots.left;

// 检查必要配置
if (isEmpty(config.service) && !isCustom) {
  console.error('[btc-view-group] service is required');
}

const isExpand = ref(true);

// 检测移动端
const isMobile = computed(() => window.innerWidth <= 768);

// 树配置
const tree = reactive({
  visible: !!config.tree?.visible,
  lazy: config.tree?.lazy || false,
  props: {
    label: 'name',
    children: 'children',
    disabled: 'disabled',
    isLeaf: 'isLeaf',
    id: 'id',
    ...config.tree?.props,
  },
  onLoad: config.tree?.onLoad,
  allowDrag: config.tree?.allowDrag,
  allowDrop: config.tree?.allowDrop,
});

// 使用操作 Hook（需要先定义，因为 useViewGroupData 需要 select 函数）
const operationsPlaceholder = {
  getItemId: (item: any) => item?.id,
  expand: () => {},
  select: (_data?: any) => {},
  edit: () => {},
  remove: () => {},
};

// 使用数据管理 Hook（传入 select 函数引用）
const dataHook = useViewGroupData(config, tree, isCustom, (item) => operationsPlaceholder.select(item));
const { loading, keyWord, list, selected, loaded, refresh, onMore } = dataHook;

// 真正的操作 Hook
const treeRef = ref();
const operations = useViewGroupActions(
  config,
  tree,
  list,
  selected,
  isMobile,
  isExpand,
  refresh,
  treeRef
);
const { getItemId, expand, select, edit, remove } = operations;

// 更新 placeholder 的引用
Object.assign(operationsPlaceholder, operations);

// 使用拖拽 Hook
const { isDrag, treeOrder, handleDrop } = useViewGroupDrag(config, list, refresh);

// 使用菜单 Hook
const { onContextMenu, onTreeContextMenu } = useViewGroupMenu(config, tree);

// 刷新后的选择逻辑
watch(list, () => {
  const item = selected.value || list.value[0];

  if (item) {
    if (tree.visible && treeRef.value) {
      const node = treeRef.value.getNode(item);
      node?.expand();
    }

    select(item);
  }
}, { deep: true });

// 监听屏幕尺寸变化
watch(isMobile, (val) => {
  expand(!val);
});

// 刷新时触发 emit
watch(() => loading.value, () => {
  if (!loading.value) {
    emit('refresh');
  }
});

// 选中时触发 emit
watch(selected, (val) => {
  emit('update:selected', val);
});

onMounted(() => {
  refresh();
});

// 暴露方法
defineExpose({
  list,
  selected,
  isExpand,
  expand,
  select,
  edit,
  remove,
  refresh,
  isMobile,
});
</script>

<style lang="scss" scoped>
// 动态变量必须在组件内定义
$left-width: v-bind('config.leftWidth');
$bg: var(--el-bg-color);

// 左侧面板宽度（使用动态变量）
.btc-view-group__left {
  width: $left-width;
}

// 右侧面板宽度（使用动态变量）
.btc-view-group.is-expand .btc-view-group__right {
  width: calc(100% - $left-width);
  border-left: 1px solid var(--el-border-color-extra-light);
}

// 引入其他样式
@import './styles/index.scss';
</style>
