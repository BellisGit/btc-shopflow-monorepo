<template>
  <div class="btc-master-list">
    <div class="btc-master-list__header">
      <el-text>{{ title }}</el-text>

      <div class="btc-master-list__op">
        <div class="btcs" v-if="isDrag">
          <div class="item" @click="treeOrder(true)">
            <el-icon><Check /></el-icon>
          </div>
          <div class="item" @click="treeOrder(false)">
            <el-icon><Close /></el-icon>
          </div>
        </div>

        <template v-else>
          <div class="item" @click="refresh()">
            <el-tooltip :content="t('common.button.refresh')">
              <el-icon><Refresh /></el-icon>
            </el-tooltip>
          </div>

          <div class="item" v-if="drag && !browser.isMini" @click="isDrag = true">
            <el-tooltip :content="t('common.button.sort')">
              <BtcSvg name="sort" />
            </el-tooltip>
          </div>
        </template>
      </div>
    </div>

    <div class="btc-master-list__container" v-loading="loading" @contextmenu.stop.prevent="(event) => onContextMenu(event)">
      <el-scrollbar>
        <el-tree
          ref="treeRef"
          node-key="id"
          default-expand-all
          :data="list"
          :props="treeProps"
          highlight-current
          :draggable="isDrag"
          :allow-drag="allowDrag"
          :allow-drop="allowDrop"
          :expand-on-click-node="false"
          @node-contextmenu="onContextMenu"
          @node-click="handleNodeClick"
        >
          <template #default="{ node, data }">
            <div class="btc-master-list__node">
              <span
                class="btc-master-list__node-label"
                :class="{
                  'is-active': data.id == selectedItem?.id
                }"
              >{{ node.label }}</span>
              <span
                v-if="browser.isMini"
                class="btc-master-list__node-icon"
                @click="onContextMenu($event, data, node)"
              >
                <el-icon><MoreFilled /></el-icon>
              </span>
            </div>
          </template>
        </el-tree>
      </el-scrollbar>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { useI18n } from '@btc/shared-core';
import { Check, Close, Refresh, MoreFilled } from '@element-plus/icons-vue';
import BtcSvg from '../../common/svg/index.vue';

// 树形数据处理工具函数
function deepTree(data: any[], parentId = 0, children = 'children'): any[] {
  const result: any[] = [];

  for (const item of data) {
    if (item.parentId === parentId) {
      const childrenData = deepTree(data, item.id, children);
      if (childrenData.length > 0) {
        item[children] = childrenData;
      }
      result.push(item);
    }
  }

  return result;
}

function revDeepTree(data: any[], children = 'children'): any[] {
  const result: any[] = [];

  for (const item of data) {
    result.push(item);
    if (item[children] && item[children].length > 0) {
      result.push(...revDeepTree(item[children], children));
    }
  }

  return result;
}

interface MasterListConfig {
  // 服务配置
  service: {
    list: () => Promise<any[]>;
    add?: (data: any) => Promise<any>;
    update?: (data: any) => Promise<any>;
    delete?: (data: any) => Promise<any>;
  };

  // 显示配置
  title: string;
  labelField?: string;
  idField?: string;
  childrenField?: string;

  // 功能配置
  drag?: boolean;
  level?: number;

  // 事件配置
  onSelect?: (item: any, ids: any[]) => void;
  onAdd?: (item: any) => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
}

const props = withDefaults(defineProps<MasterListConfig>(), {
  labelField: 'name',
  idField: 'id',
  childrenField: 'children',
  drag: true,
  level: 99
});

const emit = defineEmits(['refresh', 'select', 'add', 'edit', 'delete', 'load']);

const { t } = useI18n();

// 响应式数据
const list = ref<any[]>([]);
const loading = ref(false);
const isDrag = ref(false);
const selectedItem = ref<any>(null);
const treeRef = ref();
const isSettingDefault = ref(false); // 标记是否正在设置默认选中

// 计算属性
const treeProps = computed(() => ({
  label: props.labelField,
  children: props.childrenField
}));

// 浏览器信息（简化版）
const browser = ref({ isMini: false });

// 允许拖拽的规则
function allowDrag({ data }: any) {
  return data[props.childrenField] && data[props.childrenField].length > 0;
}

// 允许放置的规则
function allowDrop(_: any, dropNode: any) {
  return dropNode.data[props.childrenField] && dropNode.data[props.childrenField].length > 0;
}

// 刷新数据
async function refresh() {
  loading.value = true;
  isDrag.value = false;

  try {
    const res = await props.service.list();

    // 确保 res 是一个数组
    const dataArray = Array.isArray(res) ? res : ((res as any)?.data || []);

    // 检查数据是否有 parentId 字段，决定是否进行树形处理
    const hasParentId = dataArray.length > 0 && dataArray[0].hasOwnProperty('parentId');
    if (hasParentId) {
      list.value = deepTree(dataArray);
    } else {
      // 平铺数据直接使用，确保是纯数组
      list.value = [...dataArray];
    }

    // 延迟执行默认选中，确保数据已经渲染
    nextTick(() => {
      if (!selectedItem.value && list.value.length > 0) {
        isSettingDefault.value = true;
        rowClick(undefined, true); // 传入 skipEmit=true，不触发 select 事件
        // 延迟重置标记，确保 setCurrentKey 不会触发重复事件
        setTimeout(() => {
          isSettingDefault.value = false;
        }, 100);
      }

      // 触发 load 事件，通知父组件数据已加载完成
      emit('load', list.value, selectedItem.value || (list.value.length > 0 ? list.value[0] : null));
    });
  } catch (error) {
    ElMessage.error('加载数据失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
}

// 处理用户点击节点
function handleNodeClick(data: any) {
  rowClick(data);
}

// 点击节点
function rowClick(item?: any, skipEmit = false) {
  // 如果正在设置默认选中，且是用户点击触发的，则忽略
  if (isSettingDefault.value && item) {
    return;
  }

  if (!item) {
    item = list.value[0];
  }

  if (item) {
    let ids: any[] = [];

    // 检查是否有子节点（树形数据）
    if (item[props.childrenField] && item[props.childrenField].length > 0) {
      ids = revDeepTree(item[props.childrenField]).map((e: any) => e[props.idField]);
      ids.unshift(item[props.idField]);
    } else {
      // 平铺数据，只包含当前项
      ids = [item[props.idField]];
    }

    selectedItem.value = item;

    nextTick(() => {
      // 设置 ElTree 的当前选中节点
      if (treeRef.value) {
        treeRef.value.setCurrentKey(item[props.idField]);
      }

      // 只有在非 skipEmit 时才触发 select 事件
      if (!skipEmit) {
        emit('select', item, ids);
      }
    });
  }
}

// 右键菜单
function onContextMenu(event: MouseEvent, data?: any, node?: any) {
  // 这里可以集成右键菜单组件
  console.log('右键菜单', { event, data, node });
}

// 拖拽排序
function treeOrder(save: boolean) {
  if (save) {
    // 保存排序
    ElMessage.success('排序已保存');
  } else {
    // 取消排序
    ElMessage.info('已取消排序');
  }
  isDrag.value = false;
}

// 组件挂载时刷新数据
onMounted(() => {
  refresh();
});

// 暴露方法
defineExpose({
  refresh,
  rowClick
});
</script>

<style lang="scss" scoped>
.btc-master-list {
  height: 100%;
  width: 100%;

  :deep(.el-tree-node__label) {
    display: block;
    height: 100%;
    width: 100%;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 40px;
    padding: 0 10px;
    border-bottom: 1px solid var(--el-border-color-extra-light);

    .el-text {
      font-weight: 500;
    }
  }

  &__op {
    display: flex;
    align-items: center;

    .item {
      display: flex;
      justify-content: center;
      align-items: center;
      list-style: none;
      margin-left: 5px;
      cursor: pointer;
      border-radius: 6px;
      font-size: 16px;
      height: 26px;
      width: 26px;
      color: var(--el-text-color-primary);

      &:hover {
        background-color: var(--el-fill-color-light);
      }
    }

    .btns {
      display: flex;
      align-items: center;
      justify-content: center;

      .item {
        &:hover {
          &:first-child {
            color: var(--el-color-success);
          }

          &:last-child {
            color: var(--el-color-danger);
          }
        }
      }
    }
  }

  &__container {
    height: calc(100% - 40px);
    padding: 10px;

    :deep(.el-tree-node__content) {
      height: 38px;
      border-radius: 4px;

      .el-tree-node__expand-icon {
        margin-left: 5px;
      }

      &:hover {
        background-color: var(--el-fill-color-light);
      }

      &.is-current {
        background-color: var(--el-color-primary) !important;
        color: #fff !important;

        .el-tree-node__label {
          color: #fff !important;
        }
      }
    }
  }

  &__node {
    display: flex;
    align-items: center;
    height: 100%;
    width: 100%;
    box-sizing: border-box;

    &-label {
      display: flex;
      align-items: center;
      flex: 1;
      height: 100%;
      font-size: 14px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

    }

    &-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #eee;
      height: 26px;
      width: 26px;
      text-align: center;
      margin-right: 5px;
      border-radius: 6px;
    }
  }
}
</style>
