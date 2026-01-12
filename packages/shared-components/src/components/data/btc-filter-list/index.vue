<template>
  <div class="btc-filter-list" :class="`is-size-${currentSize}`">
    <!-- 顶部区域：搜索和已选标签 -->
    <div class="btc-filter-list__header">
      <!-- 搜索框和设置按钮（如果提供了 header-actions 插槽，则不显示，由父级渲染） -->
      <div v-if="enableSearch && !hasHeaderActionsSlot" class="btc-filter-list__search-wrapper">
        <div class="btc-filter-list__search">
          <BtcInput
            v-model="searchKeyword"
            placeholder="搜索分类..."
            clearable
            id="btc-filter-list-search"
            name="btc-filter-list-search"
          >
            <template #prefix>
              <BtcSvg name="search" :size="16" />
            </template>
          </BtcInput>
        </div>
        <!-- 设置按钮 -->
        <el-dropdown
          trigger="click"
          @command="handleSizeChange"
          placement="bottom-end"
        >
          <template #default>
            <div class="btc-filter-list__settings-btn btc-comm__icon" :title="t('btc.filterList.tooltip.settings')">
              <BtcSvg name="set" :size="16" />
            </div>
          </template>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="sizeOption in sizeOptions"
                :key="sizeOption.value"
                :command="sizeOption.value"
              >
                <div
                  class="btc-filter-list__size-item"
                  :class="{ 'is-active': sizeOption.value === currentSize }"
                >
                  <span class="btc-filter-list__size-item-label">{{ sizeOption.label }}</span>
                  <span v-if="sizeOption.value === currentSize" class="btc-filter-list__size-item-dot"></span>
                </div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <!-- 已选标签展示区 -->
      <el-scrollbar
        v-if="hasScrollingRow"
        ref="tagsScrollbarRef"
        class="btc-filter-list__tags-scrollbar"
        :style="{ height: tagsContainerHeight > 0 ? `${tagsContainerHeight}px` : 'auto', minHeight: tagsContainerHeight > 0 ? `${tagsContainerHeight}px` : '0', maxHeight: tagsContainerHeight > 0 ? `${tagsContainerHeight}px` : 'none' }"
      >
        <div
          class="btc-filter-list__tags"
          ref="tagsContainerRef"
        >
          <div
            v-for="row in categoryTagRows"
            :key="row.categoryId"
            ref="(el) => setRowRef(row.categoryId, el as HTMLElement)"
            class="btc-filter-list__tag-row"
            :data-category-id="row.categoryId"
            :data-scrolling="scrollingRows.has(row.categoryId)"
          >
            <!-- 内部内容容器，用于承载所有标签 -->
            <div class="btc-filter-list__tag-row-content">
              <!-- 分类提示标签（固定，每排第一个，展开状态下隐藏） -->
              <BtcTag
                v-if="!scrollingRows.has(row.categoryId)"
                :type="getTagType(row.categoryId)"
                :disable-transitions="true"
                class="btc-filter-list__category-tag"
              >
                {{ row.categoryName }}
              </BtcTag>

              <!-- 收起按钮（展开状态下显示，取代分类标签位置） -->
              <el-icon
                v-if="scrollingRows.has(row.categoryId)"
                :class="['btc-filter-list__collapse-btn', `btc-filter-list__collapse-btn--${getTagType(row.categoryId)}`]"
                @click.stop="handleCollapseBtnClick(row.categoryId)"
              >
                <ArrowLeft />
              </el-icon>

              <!-- 所有标签（包括可见和溢出，通过样式控制显示/隐藏） -->
              <template v-for="tag in row.tags" :key="`${row.categoryId}-${tag.optionValue}`">
                <BtcTag
                  :type="getTagType(row.categoryId)"
                  closable
                  :disable-transitions="hasScrollingRow"
                  :class="[
                    'btc-filter-list__overflow-tag-item',
                    {
                      'btc-filter-list__tag-hidden': !scrollingRows.has(row.categoryId) && !row.visibleTags.some(t => t.optionValue === tag.optionValue)
                    }
                  ]"
                  @close="handleTagClose(row.categoryId, tag.optionValue)"
                >
                  {{ tag.optionLabel }}
                </BtcTag>
              </template>

              <!-- 折叠标签（当有溢出时显示，但在滚动状态下隐藏） -->
              <BtcTag
                v-if="row.overflowCount > 0"
                :type="getTagType(row.categoryId)"
                :disable-transitions="true"
                :class="[
                  'btc-filter-list__collapse-tag',
                  {
                    'btc-filter-list__tag-last': !rowRemainingSpaceMap[row.categoryId],
                    'btc-filter-list__tag-hidden': scrollingRows.has(row.categoryId)
                  }
                ]"
                @click.stop="handleCollapseTagClick(row.categoryId)"
              >
                +{{ row.overflowCount }}
              </BtcTag>
            </div>
          </div>
        </div>
      </el-scrollbar>

      <!-- 非滚动状态：普通显示 -->
      <div
        v-else
        class="btc-filter-list__tags"
        ref="tagsContainerRef"
        :style="{ height: tagsContainerHeight > 0 ? `${tagsContainerHeight}px` : 'auto', minHeight: tagsContainerHeight > 0 ? `${tagsContainerHeight}px` : '0', maxHeight: tagsContainerHeight > 0 ? `${tagsContainerHeight}px` : 'none' }"
      >
        <div
          v-for="row in categoryTagRows"
          :key="row.categoryId"
          ref="(el) => setRowRef(row.categoryId, el as HTMLElement)"
          class="btc-filter-list__tag-row"
          :data-category-id="row.categoryId"
          :data-scrolling="false"
        >
          <!-- 内部内容容器，用于承载所有标签 -->
          <div class="btc-filter-list__tag-row-content">
            <!-- 分类提示标签（固定，每排第一个） -->
            <BtcTag
              :type="getTagType(row.categoryId)"
              :disable-transitions="true"
              class="btc-filter-list__category-tag"
            >
              {{ row.categoryName }}
            </BtcTag>

            <!-- 所有标签（包括可见和溢出，通过样式控制显示/隐藏） -->
            <template v-for="(tag, index) in row.tags" :key="`${row.categoryId}-${tag.optionValue}`">
              <BtcTag
                :type="getTagType(row.categoryId)"
                closable
                :disable-transitions="true"
                :class="[
                  'btc-filter-list__overflow-tag-item',
                  {
                    'btc-filter-list__tag-last': index === row.tags.length - 1 && row.overflowCount === 0 && rowRemainingSpaceMap[row.categoryId] === true,
                    'btc-filter-list__tag-hidden': !row.visibleTags.some(t => t.optionValue === tag.optionValue)
                  }
                ]"
                @close="handleTagClose(row.categoryId, tag.optionValue)"
              >
                {{ tag.optionLabel }}
              </BtcTag>
            </template>

            <!-- 折叠标签（当有溢出时显示） -->
            <BtcTag
              v-if="row.overflowCount > 0"
              :type="getTagType(row.categoryId)"
              :disable-transitions="true"
              :class="[
                'btc-filter-list__collapse-tag',
                { 'btc-filter-list__tag-last': !rowRemainingSpaceMap[row.categoryId] }
              ]"
              @click.stop="handleCollapseTagClick(row.categoryId)"
            >
              +{{ row.overflowCount }}
            </BtcTag>
          </div>
          <!-- 收起按钮（展开状态下显示，非滚动状态下不显示） -->
        </div>
      </div>
    </div>

    <!-- 内容区域：分类卡片列表 -->
    <div class="btc-filter-list__container" ref="containerRef" v-loading="loading">
      <el-scrollbar>
        <el-collapse v-model="activeCategories" @change="handleCollapseChange">
          <el-collapse-item
            v-for="category in filteredCategories"
            :key="category.id"
            :name="category.id"
            class="btc-filter-list__collapse-item"
          >
            <template #title>
              <div class="btc-filter-list__category-title" @click.stop>
                <el-checkbox
                  :model-value="isCategoryAllSelected(category.id)"
                  :indeterminate="isCategoryIndeterminate(category.id)"
                  @change="handleCategorySelectAll(category.id, $event)"
                  @click.stop
                  class="btc-filter-list__category-checkbox"
                />
                <span>{{ category.name }}</span>
                <span class="btc-filter-list__category-count">
                  ({{ getSelectedCount(category.id) }}/{{ category.options.length }})
                </span>
              </div>
            </template>

            <div class="btc-filter-list__options">
              <el-checkbox-group
                v-model="selectedValues[category.id]"
                @change="handleSelectionChange(category.id)"
                :name="`btc-filter-list-${category.id}`"
              >
                <el-checkbox
                  v-for="option in category.options"
                  :key="option.value"
                  :value="option.value"
                  :id="`btc-filter-list-${category.id}-${option.value}`"
                  :name="`btc-filter-list-${category.id}`"
                  class="btc-filter-list__option"
                >
                  {{ option.label }}
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch, useSlots } from 'vue';
import { ArrowLeft } from '@element-plus/icons-vue';
import { useResizeObserver } from '@vueuse/core';
import { BtcTag, BtcInput, BtcSvg } from '@btc/shared-components';
import { useI18n, storage } from '@btc/shared-core';
import type { FilterCategory, FilterResult, BtcFilterListProps, BtcFilterListEmits, BtcFilterListSize } from './types';

defineOptions({
  name: 'BtcFilterList'
});

const props = withDefaults(defineProps<BtcFilterListProps>(), {
  title: '',
  enableSearch: true,
  defaultExpandedCount: 3,
  multiple: true,
  size: 'default',
  storageKey: '',
});

const emit = defineEmits<BtcFilterListEmits>();

// 插槽
const slots = useSlots();

// 是否提供了 header-actions 插槽
const hasHeaderActionsSlot = computed(() => !!slots['header-actions']);

// 国际化
const { t } = useI18n();

// 获取存储 key（如果提供了 storageKey，使用它；否则不存储）
const getStorageKey = (): string | null => {
  if (!props.storageKey) {
    return null;
  }
  return `btc-filter-list-size-${props.storageKey}`;
};

// 从存储中读取尺寸
const getStoredSize = (): BtcFilterListSize | null => {
  const key = getStorageKey();
  if (!key) {
    return null;
  }
  try {
    const stored = storage.get<BtcFilterListSize>(key);
    if (stored && ['small', 'default', 'large'].includes(stored)) {
      return stored;
    }
  } catch (error) {
    console.warn('[BtcFilterList] 读取存储的尺寸失败:', error);
  }
  return null;
};

// 保存尺寸到存储
const saveSizeToStorage = (size: BtcFilterListSize) => {
  const key = getStorageKey();
  if (!key) {
    return;
  }
  try {
    storage.set(key, size);
  } catch (error) {
    console.warn('[BtcFilterList] 保存尺寸到存储失败:', error);
  }
};

// 当前尺寸（内部状态，支持 v-model）
// 优先使用 props.size，如果没有则从存储中读取，最后使用默认值
// 注意：如果 props.size 有值，优先使用 props.size（外部控制）
// 如果 props.size 没有值，则从存储中读取
const initialSize = props.size || getStoredSize() || 'default';
const currentSize = ref<BtcFilterListSize>(initialSize);

// 如果初始时从存储中读取到了尺寸，且 props.size 没有值，则同步到 props
if (!props.size && initialSize !== 'default') {
  // 触发 update:size 事件，让父组件知道当前尺寸
  nextTick(() => {
    emit('update:size', initialSize);
  });
}

// 尺寸选项
const sizeOptions = computed(() => [
  { label: t('btc.filterList.size.small'), value: 'small' as BtcFilterListSize },
  { label: t('btc.filterList.size.default'), value: 'default' as BtcFilterListSize },
  { label: t('btc.filterList.size.large'), value: 'large' as BtcFilterListSize },
]);

// 处理尺寸切换
const handleSizeChange = (size: BtcFilterListSize) => {
  currentSize.value = size;
  emit('update:size', size);
  // 保存到存储
  saveSizeToStorage(size);
  // 尺寸变化时，清空 maxTagsPerRowMap，让 categoryTagRows 先使用默认估算值
  // 然后 triggerCalculateRemainingSpace 会重新计算实际的 maxTagsPerRowMap
  maxTagsPerRowMap.value = {};
  // 尺寸变化时，容器宽度会改变，需要重新计算标签溢出
  triggerCalculateRemainingSpace();
};

// 注意：props.size 的 watch 移动到 triggerCalculateRemainingSpace 定义之后

// 数据状态
const loading = ref(false);
const categories = ref<FilterCategory[]>([]);
const searchKeyword = ref('');

// 选择状态：{ categoryId: [optionValue1, optionValue2, ...] }
const selectedValues = ref<Record<string, any[]>>({});

// 展开的分类列表
const activeCategories = ref<string[]>([]);

// 记录用户手动操作过的面板及其状态
// key: categoryId, value: true=用户手动展开, false=用户手动折叠
// 这些面板的状态应该被保留，不会被自动计算覆盖
const userManualCategories = ref<Map<string, boolean>>(new Map());

// Tag 容器引用
const tagsContainerRef = ref<HTMLElement | null>(null);
// el-scrollbar 引用
const tagsScrollbarRef = ref<any>(null);
// 内容容器引用（用于计算可用高度）
const containerRef = ref<HTMLElement | null>(null);

// 每行可以显示的标签数量（动态计算，根据容器宽度）
// 使用 ref 存储每行的最大标签数，在 calculateRowRemainingSpace 中动态更新
const maxTagsPerRowMap = ref<Record<string, number>>({});

// 根据尺寸估算每行可以显示的标签数量（初始估算值）
const estimateMaxTagsPerRow = (size: BtcFilterListSize): number => {
  // 基于尺寸估算容器宽度（需要考虑 padding、border 等）
  // small: 200px，实际可用宽度约 180px
  // default: 通常 300px，实际可用宽度约 280px
  // large: 450px，实际可用宽度约 430px
  let availableWidth: number;
  switch (size) {
    case 'small':
      availableWidth = 180; // 200px - padding(10px * 2) - border(1px * 2) - gap
      break;
    case 'large':
      availableWidth = 430; // 450px - padding(10px * 2) - border(1px * 2) - gap
      break;
    case 'default':
    default:
      availableWidth = 280; // 300px（估算） - padding(10px * 2) - border(1px * 2) - gap
      break;
  }

  // 分类标签宽度约 50px
  const categoryTagWidth = 50;
  const tagGap = 6; // gap 间距
  const avgTagWidth = 80; // 平均标签宽度（估算）

  // 计算可以显示的正常标签数量（不包括折叠标签）
  // 可用宽度 = 容器宽度 - 分类标签宽度
  // availableWidth = categoryTagWidth + visibleTags * (avgTagWidth + tagGap)
  // 所以：visibleTags = (availableWidth - categoryTagWidth) / (avgTagWidth + tagGap)
  const maxVisibleTags = Math.floor((availableWidth - categoryTagWidth) / (avgTagWidth + tagGap));

  // 至少显示 0 个标签（如果宽度很小，可能显示 0 个），最多显示 20 个
  return Math.max(0, Math.min(20, maxVisibleTags));
};

// 计算默认的最大标签数（基于当前尺寸）
const defaultMaxTagsPerRow = computed(() => estimateMaxTagsPerRow(currentSize.value));

// 记录哪些分类的行正在滚动状态（点击折叠标签后）
const scrollingRows = ref<Set<string>>(new Set());

// 计算是否有任何行处于滚动状态
const hasScrollingRow = computed(() => scrollingRows.value.size > 0);

// 记录每行的剩余空间是否明显大于一个标签（用于判断是否让最后一个标签占据剩余宽度）
// 使用普通对象而不是 Map，避免响应式循环引用问题
const rowRemainingSpaceMap = ref<Record<string, boolean>>({});

// 已选标签数据（按分类分组）
interface CategoryTagRow {
  categoryId: string;
  categoryName: string;
  tags: Array<{
    optionValue: any;
    optionLabel: string;
  }>;
  visibleTags: Array<{
    optionValue: any;
    optionLabel: string;
  }>;
  overflowCount: number;
  overflowTags: Array<{
    optionValue: any;
    optionLabel: string;
  }>;
}

// 按分类分组标签数据
const categoryTagRows = computed<CategoryTagRow[]>(() => {
  const rows: CategoryTagRow[] = [];

  // 遍历所有分类（按原始顺序）
  categories.value.forEach(category => {
    const values = selectedValues.value[category.id] || [];
    if (values.length === 0) {
      // 即使没有选中，也创建一行（用于显示分类提示标签）
      rows.push({
        categoryId: String(category.id),
        categoryName: String(category.name || ''),
        tags: [],
        visibleTags: [],
        overflowCount: 0,
        overflowTags: [],
      });
      return;
    }

    // 收集该分类的所有标签
    // 重要：创建全新的纯对象，只提取 value 和 label，避免循环引用
    const tags = values.map(value => {
      const option = category.options.find(opt => opt.value === value);
      if (!option) {
        return null;
      }
      // 创建全新的纯对象，只包含需要的属性，避免循环引用
      return {
        optionValue: value,
        optionLabel: String(option.label || ''),
      };
    }).filter(Boolean) as Array<{ optionValue: any; optionLabel: string }>;

    // 计算可见标签和溢出标签
    // 动态获取该分类的最大正常标签数（如果已计算，使用计算值；否则使用默认估算值）
    // 注意：maxTagsForRow 表示能显示的正常标签数量（不包括折叠标签）
    const maxTagsForRow = maxTagsPerRowMap.value[category.id] ?? defaultMaxTagsPerRow.value;

    // 如果标签数量超过 maxTagsForRow，说明有溢出，需要显示折叠标签
    // 可见标签数量就是 maxTagsForRow（能显示多少就显示多少）
    const hasOverflow = tags.length > maxTagsForRow;
    const visibleTagCount = maxTagsForRow; // 直接使用 maxTagsForRow，不减去 1
    // 创建全新的数组，避免引用原始数组
    const visibleTags = tags.slice(0, visibleTagCount).map(tag => ({
      optionValue: tag.optionValue,
      optionLabel: tag.optionLabel,
    }));
    const overflowTags = tags.slice(visibleTagCount).map(tag => ({
      optionValue: tag.optionValue,
      optionLabel: tag.optionLabel,
    }));
    const overflowCount = overflowTags.length;

    rows.push({
      categoryId: String(category.id),
      categoryName: String(category.name || ''),
      tags,
      visibleTags,
      overflowCount,
      overflowTags,
    });
  });

  return rows;
});

// 测量标签行的实际高度（考虑垂直居中和间距）
// 由于标签使用 align-items: center 垂直居中，且标签并不贴着分隔线，
// 实际标签行高度可能大于标签本身的高度（24px）
// 另外，标签行内容容器有 padding-bottom: 5px，增加了底部分隔线的间距
// 注意：标签行使用 box-sizing: border-box，所以 offsetHeight 已经包含了 border 和 padding
const measureActualRowHeight = (): number => {
  // 如果DOM未准备好，使用估算值
  if (!tagsContainerRef.value || rowRefs.value.size === 0) {
    // 估算值计算：
    // - 标签高度：24px（el-tag 默认高度）
    // - 垂直居中间距：约1px（上下各0.5px，确保标签不贴着边框）
    // - 内容容器 padding-bottom：5px（标签内容和底部分隔线之间的间距）
    // 总计：24 + 1 + 5 = 30px
    return 30;
  }

  // 尝试从DOM中测量第一行的实际高度
  // offsetHeight 会包含：内容高度 + padding + border（因为 box-sizing: border-box）
  const firstRow = Array.from(rowRefs.value.values())[0];
  if (firstRow) {
    const actualHeight = firstRow.offsetHeight;
    // 如果测量到有效高度，使用它；否则使用估算值
    // 实际高度应该已经包含了内容容器的 padding-bottom: 5px
    if (actualHeight > 0) {
      return actualHeight;
    }
  }

  // 默认估算值：24px标签高度 + 1px垂直居中间距 + 5px底部分隔线间距 = 30px
  return 30;
};

// 动态计算标签容器高度（根据分类总数，不管是否选中都会预留空间）
// 计算公式：高度 = 标签行数 * 实际行高度 + (行数 - 1) * gap + 上下内边距 + 上下边框
// 每个分类占一行，所以行数 = 分类总数
// 注意：由于使用了 box-sizing: border-box，高度需要包含边框和padding
const tagsContainerHeight = computed(() => {
  const categoryCount = categories.value.length;
  if (categoryCount === 0) {
    return 0; // 没有分类时，高度为0
  }

  // 测量实际的标签行高度（考虑垂直居中和间距）
  const actualRowHeight = measureActualRowHeight();
  // 行间距（gap）：6px（CSS flex gap，在flex容器中，gap不会影响box-sizing的计算）
  const gap = 6;
  // 容器内边距：上5px，下0px（底部间距由标签行内容容器的padding-bottom: 5px提供）
  const paddingTop = 5; // 顶部内边距
  const paddingBottom = 0; // 底部内边距（0，因为标签行内容容器已有padding-bottom: 5px）
  const padding = paddingTop + paddingBottom; // 总内边距：5px
  // 容器上下边框：1px * 2 = 2px（由于 box-sizing: border-box，需要包含边框）
  const border = 1 * 2; // 上下各1px

  // 计算总高度：实际行高度 * 行数 + 行间距 * (行数 - 1) + 上下内边距 + 上下边框
  // 在 box-sizing: border-box 下，height 属性包含 content + padding + border
  // 所以总高度 = 内容高度 + padding + border
  // 注意：flex gap 是行间距，不会影响 box-sizing 的计算，它是在内容区域外部添加的间距
  const contentHeight = actualRowHeight * categoryCount + gap * (categoryCount - 1);
  const height = contentHeight + padding + border;

  return height;
});

// 过滤后的分类列表
const filteredCategories = computed(() => {
  if (!searchKeyword.value) {
    return categories.value;
  }
  const keyword = searchKeyword.value.toLowerCase();
  return categories.value.filter(category =>
    category.name.toLowerCase().includes(keyword) ||
    category.options.some(opt => opt.label.toLowerCase().includes(keyword))
  );
});

// 获取分类的已选数量
const getSelectedCount = (categoryId: string) => {
  return (selectedValues.value[categoryId] || []).length;
};

// 判断分类是否全选
const isCategoryAllSelected = (categoryId: string): boolean => {
  const category = categories.value.find(c => c.id === categoryId);
  if (!category || category.options.length === 0) {
    return false;
  }
  const selected = selectedValues.value[categoryId] || [];
  return selected.length === category.options.length && selected.length > 0;
};

// 判断分类是否部分选中（indeterminate状态）
const isCategoryIndeterminate = (categoryId: string): boolean => {
  const category = categories.value.find(c => c.id === categoryId);
  if (!category || category.options.length === 0) {
    return false;
  }
  const selected = selectedValues.value[categoryId] || [];
  return selected.length > 0 && selected.length < category.options.length;
};

// 处理分类全选/取消全选
const handleCategorySelectAll = (categoryId: string, checked: boolean) => {
  const category = categories.value.find(c => c.id === categoryId);
  if (!category) {
    return;
  }

  if (checked) {
    // 全选：选中该分类下的所有选项
    // 重要：只提取原始值，避免循环引用
    selectedValues.value[categoryId] = category.options.map(opt => {
      const value = opt.value;
      // 如果是对象，尝试提取可序列化的值；否则直接使用原始值
      if (value && typeof value === 'object') {
        // 如果是对象，尝试提取 id 或其他标识符
        if ('id' in value) {
          return value.id;
        }
        // 否则尝试 JSON 序列化（如果可能）
        try {
          return JSON.parse(JSON.stringify(value));
        } catch {
          // 如果序列化失败，使用 String 转换
          return String(value);
        }
      }
      return value;
    });
  } else {
    // 取消全选：清空该分类下的所有选项
    selectedValues.value[categoryId] = [];
  }

  // 输出结果
  emitChange();
  // 手动触发剩余空间计算
  triggerCalculateRemainingSpace();

  // 如果选择了选项，检查是否可以展开（避免高度不足时先展开再折叠的闪烁）
  if (checked && !activeCategories.value.includes(categoryId)) {
    // 延迟检查，等待 DOM 更新后，通过 recalculateExpandedCategories 来决定是否可以展开
    // 这样可以避免在高度不足时先展开再被折叠的闪烁
    nextTick(() => {
      recalculateExpandedCategories();
    });
  }
};

// 根据分类 ID 获取对应的 tag 类型
const getTagType = (categoryId: string): 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'pink' | 'cyan' | 'teal' | 'indigo' | 'orange' | 'brown' | 'gray' | 'lime' | 'olive' | 'navy' | 'maroon' => {
  const typeList = [
    'primary',
    'success',
    'warning',
    'danger',
    'info',
    'purple',
    'pink',
    'cyan',
    'teal',
    'indigo',
    'orange',
    'brown',
    'gray',
    'lime',
    'olive',
    'navy',
    'maroon',
  ] as const;

  // 根据分类在列表中的索引来确定类型
  const categoryIndex = categories.value.findIndex(c => c.id === categoryId);
  if (categoryIndex === -1) {
    return 'primary';
  }

  const index = categoryIndex % typeList.length;
  return typeList[index] || 'primary';
};

// 处理选择变化
const handleSelectionChange = (categoryId: string) => {
  // 如果选择了选项，自动展开该分类（但不要覆盖用户手动折叠的状态）
  const hasSelection = (selectedValues.value[categoryId] || []).length > 0;
  if (hasSelection && !activeCategories.value.includes(categoryId)) {
    // 检查用户是否手动折叠了这个面板
    const userManualState = userManualCategories.value.get(categoryId);
    if (userManualState !== false) {
      // 用户没有手动折叠，可以自动展开
      isAutoUpdating = true;
      activeCategories.value.push(categoryId);
      nextTick(() => {
        isAutoUpdating = false;
      });
    }
  }

  // 输出结果
  emitChange();
  // 手动触发剩余空间计算
  triggerCalculateRemainingSpace();
};

// 处理标签关闭
const handleTagClose = (categoryId: string, optionValue: any) => {
  const values = selectedValues.value[categoryId] || [];
  const index = values.indexOf(optionValue);
  if (index > -1) {
    values.splice(index, 1);
    selectedValues.value[categoryId] = values;
    emitChange();
    // 手动触发剩余空间计算
    triggerCalculateRemainingSpace();
  }
};

// 统一恢复折叠状态的函数（核心恢复逻辑）
const restoreCollapseState = (categoryId: string) => {
  if (!scrollingRows.value.has(categoryId)) {
    return; // 如果该分类未展开，直接返回
  }

  // 移除展开状态
  scrollingRows.value.delete(categoryId);

  // 重新计算剩余空间，确保布局正确
  nextTick(() => {
    triggerCalculateRemainingSpace();
  });
};

// 处理折叠标签点击（展开）
const handleCollapseTagClick = (categoryId: string) => {
  scrollingRows.value.add(categoryId);

  // 等待 DOM 更新后，滚动到该行的末尾
  nextTick(() => {
    requestAnimationFrame(() => {
      // 使用父级容器的 el-scrollbar 来滚动
      if (tagsScrollbarRef.value?.wrapRef) {
        const wrapEl = tagsScrollbarRef.value.wrapRef as HTMLElement;
        // 找到目标行的位置
        const rowElement = rowRefs.value.get(categoryId);
        if (rowElement && tagsContainerRef.value) {
          // 计算该行相对于容器的位置
          const containerRect = tagsContainerRef.value.getBoundingClientRect();
          const rowRect = rowElement.getBoundingClientRect();
          // 滚动到该行的位置
          wrapEl.scrollLeft = rowRect.left - containerRect.left + wrapEl.scrollLeft;
        }
      }
    });
  });
};

// 处理收起按钮点击（主恢复条件）
const handleCollapseBtnClick = (categoryId: string) => {
  restoreCollapseState(categoryId);
};

// 处理点击容器外空白区域恢复（辅助恢复条件1）
const handleClickOutside = (event: MouseEvent) => {
  if (!tagsContainerRef.value && !tagsScrollbarRef.value) {
    return;
  }

  // 检查点击目标是否在标签容器内
  const target = event.target as HTMLElement;
  const container = tagsContainerRef.value || (tagsScrollbarRef.value?.$el as HTMLElement);

  if (!container) {
    return;
  }

  // 如果点击在容器外，恢复所有展开的分类
  if (!container.contains(target)) {
    // 获取所有展开的分类ID
    const expandedCategoryIds = Array.from(scrollingRows.value);
    // 逐个恢复
    expandedCategoryIds.forEach(categoryId => {
      restoreCollapseState(categoryId);
    });
  }
};

// 处理窗口尺寸变化自动恢复（辅助恢复条件2）
const handleWindowResize = () => {
  // 窗口尺寸变化时，检查所有展开的分类是否还需要展开
  const expandedCategoryIds = Array.from(scrollingRows.value);

  expandedCategoryIds.forEach(categoryId => {
    const rowElement = rowRefs.value.get(categoryId);
    if (!rowElement) {
      return;
    }

    // 获取内容容器
    const contentElement = rowElement.querySelector('.btc-filter-list__tag-row-content') as HTMLElement;
    if (!contentElement) {
      return;
    }

    // 检查是否还有溢出（窗口放大后可能不再溢出）
    const totalWidth = contentElement.scrollWidth;
    const visibleWidth = contentElement.clientWidth;

    // 如果不再溢出，自动恢复折叠状态
    if (totalWidth <= visibleWidth) {
      restoreCollapseState(categoryId);
    } else {
      // 如果仍然溢出，重新计算溢出数量
      nextTick(() => {
        triggerCalculateRemainingSpace();
      });
    }
  });

  // 窗口尺寸变化时，重新计算展开逻辑
  // 使用 recalculateExpandedCategories 而不是 initDefaultExpanded
  // 因为此时容器已经渲染，不需要重试机制
  nextTick(() => {
    recalculateExpandedCategories();
  });
};

// 输出结果
const emitChange = () => {
  const result: FilterResult[] = [];
  Object.keys(selectedValues.value).forEach(categoryId => {
    const values = selectedValues.value[categoryId];
    if (values && values.length > 0) {
      // 重要：创建全新的数组，避免循环引用
      // 确保 value 数组中的元素都是可序列化的原始值
      const cleanValues = values.map(v => {
        // 如果是对象，尝试提取可序列化的值
        if (v && typeof v === 'object') {
          try {
            // 尝试 JSON 序列化/反序列化，去除循环引用
            return JSON.parse(JSON.stringify(v));
          } catch {
            // 如果序列化失败，尝试提取 id
            if ('id' in v) {
              return v.id;
            }
            // 最后尝试 String 转换
            return String(v);
          }
        }
        return v;
      });
      result.push({
        name: categoryId,
        value: cleanValues,
      });
    }
  });
  emit('change', result);
  emit('update:modelValue', result);
};

// 加载数据
const loadData = async () => {
  if (props.category) {
    // 直接使用 props.category，Vue 的响应式系统会自动处理
    // 但在使用时（如 handleCategorySelectAll）会清理循环引用
    categories.value = Array.isArray(props.category) ? props.category : [];
    initDefaultExpanded();
    // 数据加载完成后触发计算
    triggerCalculateRemainingSpace();
    return;
  }

  if (props.service) {
    loading.value = true;
    try {
      const data = await props.service.list();
      categories.value = Array.isArray(data) ? data : [];
      initDefaultExpanded();
      // 数据加载完成后触发计算
      triggerCalculateRemainingSpace();
    } catch (error) {
      console.error('[BtcFilterList] Failed to load data:', error);
      categories.value = [];
    } finally {
      loading.value = false;
    }
  }
};

// 计算展开分类的函数（根据容器高度动态计算）
// 核心思路：预留最后一个面板的收起高度，从前往后逐步展开，确保最后一个面板不溢出
// 返回：string[] 表示应该展开的分类ID列表，null 表示计算失败（DOM未准备好）
const calculateExpandedCategories = (): string[] | null => {
  const categoryCount = categories.value.length;
  if (categoryCount === 0) {
    return [];
  }

  if (!containerRef.value) {
    return null;
  }

  // 如果容器没有足够的尺寸（宽度 < 50px），跳过计算
  // 这样可以避免在折叠过程中触发不必要的计算，造成卡顿
  const width = containerRef.value.offsetWidth;
  if (width < 50) {
    return null;
  }

  // 获取父级容器的可用高度
  // 由于 container 使用了 flex: 1，它的 clientHeight 已经自动减去了 header 的高度
  // 直接使用 container 的高度，这是实际可用的高度
  const parentHeight = containerRef.value.clientHeight;

  if (parentHeight <= 0) {
    return null;
  }

  // 获取所有 collapse-item 元素（用于测量实际高度）
  const collapseItems = containerRef.value.querySelectorAll('.el-collapse-item');
  if (collapseItems.length === 0 || collapseItems.length !== categoryCount) {
    return null;
  }

  // 获取最后一个面板的元素（v-for 顺序与 DOM 顺序一致）
  const lastItem = collapseItems[collapseItems.length - 1] as HTMLElement;
  if (!lastItem) {
    return null;
  }

  // 获取最后一个面板的收起高度（header 高度）
  const lastItemHeader = lastItem.querySelector('.el-collapse-item__header') as HTMLElement;
  if (!lastItemHeader) {
    return null;
  }

  // 测量最后一个面板的收起高度（header 的实际高度）
  const lastItemCollapsedHeight = lastItemHeader.offsetHeight;

  // 获取最后一个面板的 margin-bottom（如果有）
  const lastItemStyle = window.getComputedStyle(lastItem);
  const lastItemMarginBottom = parseFloat(lastItemStyle.marginBottom) || 0;

  // 预留最后一个面板的收起高度 + margin，计算剩余可用高度
  const availableHeight = parentHeight - lastItemCollapsedHeight - lastItemMarginBottom;

  if (availableHeight <= 0) {
    // 如果剩余高度不足，不展开任何面板
    return [];
  }

  // 从前往后遍历除最后一个外的所有面板，计算可展开的数量
  // 使用实际测量的高度，而不是估算
  const expandedIds: string[] = [];
  let usedHeight = 0;

  // 遍历除最后一个外的所有分类（v-for 顺序与 DOM 顺序一致，可以直接使用索引）
  for (let i = 0; i < categoryCount - 1; i++) {
    const category = categories.value[i];
    if (!category) continue;

    const categoryId = String(category.id || '');

    // 直接使用索引获取对应的 DOM 元素（v-for 顺序与 DOM 顺序一致）
    const itemElement = collapseItems[i] as HTMLElement;
    if (!itemElement) {
      continue;
    }

    // 获取内容区域（用于测量展开后的实际高度）
    const itemContent = itemElement.querySelector('.el-collapse-item__content') as HTMLElement;
    if (!itemContent) {
      continue;
    }

    // 检查当前是否已展开
    const isCurrentlyExpanded = itemElement.classList.contains('is-active');

    // 测量展开后的实际高度
    let expandedHeight = 0;

    if (isCurrentlyExpanded) {
      // 如果已经展开，直接测量当前高度
      expandedHeight = itemElement.offsetHeight;
    } else {
      // 如果未展开，临时展开测量实际高度
      // 保存原始状态
      const originalDisplay = itemContent.style.display;
      const originalClass = itemElement.className;

      // 临时展开
      itemElement.classList.add('is-active');
      itemContent.style.display = '';

      // 强制浏览器重排以获取准确高度
      void itemElement.offsetHeight; // 触发重排

      // 测量展开后的高度
      expandedHeight = itemElement.offsetHeight;

      // 恢复原状
      itemElement.className = originalClass;
      itemContent.style.display = originalDisplay;
    }

    // 获取当前面板的 margin-bottom（如果有）
    const itemStyle = window.getComputedStyle(itemElement);
    const itemMarginBottom = parseFloat(itemStyle.marginBottom) || 0;

    // 计算这个面板展开后的总高度（包括 margin）
    const totalExpandedHeight = expandedHeight + itemMarginBottom;

    // 检查加上这个面板的展开高度后，是否超出剩余可用高度
    // 添加一些缓冲（15px），确保最后一个面板不会溢出
    if (usedHeight + totalExpandedHeight <= availableHeight - 15) {
      // 不超出，可以展开
      usedHeight += totalExpandedHeight;
      expandedIds.push(categoryId);
    } else {
      // 超出，停止展开
      break;
    }
  }

  // 最后一个面板始终不展开（已预留其收起高度）
  return expandedIds;
};

// 初始化默认展开的分类（根据容器高度动态计算）
// 首次初始化时使用，包含重试机制
const initDefaultExpanded = () => {
  const categoryCount = categories.value.length;
  if (categoryCount === 0) {
    activeCategories.value = [];
    return;
  }

  // 初始时不设置任何展开的分类，等待 DOM 渲染后再计算
  activeCategories.value = [];

  // 重试机制：最多重试 10 次，每次间隔 100ms
  let retryCount = 0;
  const maxRetries = 10;

  const tryCalculate = () => {
    const expandedIds = calculateExpandedCategories();

    if (expandedIds !== null) {
      // 计算成功，更新展开的分类列表（即使为空数组也是有效的）
      // 初始化时，用户还没有手动操作，所以直接使用自动计算的结果
      isAutoUpdating = true;
      activeCategories.value = expandedIds;
      // 清空用户手动操作记录（初始化时）
      userManualCategories.value.clear();
      // 更新 previousActiveState
      previousActiveState = [...expandedIds];
      nextTick(() => {
        isAutoUpdating = false;
      });
    } else if (retryCount < maxRetries) {
      // 计算失败，重试
      retryCount++;
      setTimeout(() => {
        requestAnimationFrame(tryCalculate);
      }, 100);
    } else {
      // 重试次数用完，使用默认值作为后备
      const defaultCount = Math.min(props.defaultExpandedCount || 3, categoryCount);
      const defaultIds: string[] = [];
      // 默认展开时，也要排除最后一个面板
      const maxIndex = Math.min(defaultCount, categoryCount - 1);
      for (let i = 0; i < maxIndex; i++) {
        const category = categories.value[i];
        if (category && category.id) {
          defaultIds.push(String(category.id));
        }
      }
      activeCategories.value = defaultIds;
    }
  };

  // 等待 DOM 渲染完成后再计算
  // 使用多次 nextTick 确保 DOM 完全渲染
  nextTick(() => {
    nextTick(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          tryCalculate();
        });
      });
    });
  });
};

// 标记是否正在自动更新（避免在自动更新时触发用户操作记录）
let isAutoUpdating = false;

// 上一次的展开状态（用于检测用户操作）
let previousActiveState: string[] = [];

// 处理 el-collapse 的 change 事件，记录用户手动操作
const handleCollapseChange = (activeNames: string | string[]) => {
  // 如果正在自动更新，不记录为用户操作，但更新 previousActiveState
  if (isAutoUpdating) {
    const activeArray = Array.isArray(activeNames) ? activeNames : [activeNames];
    previousActiveState = activeArray.map(id => String(id));
    return;
  }

  const activeArray = Array.isArray(activeNames) ? activeNames : [activeNames];
  const currentActive = activeArray.map(id => String(id));

  // 找出变化的面板（用户手动操作的面板）
  // 找出新增的（用户手动展开的）
  currentActive.forEach(categoryId => {
    if (!previousActiveState.includes(categoryId)) {
      // 用户手动展开了这个面板
      userManualCategories.value.set(categoryId, true);
    }
  });

  // 找出移除的（用户手动折叠的）
  previousActiveState.forEach(categoryId => {
    if (!currentActive.includes(categoryId)) {
      // 用户手动折叠了这个面板
      userManualCategories.value.set(categoryId, false);
    }
  });

  // 更新 previousActiveState
  previousActiveState = [...currentActive];
};

// 防抖计算展开分类的定时器
let recalculateTimer: ReturnType<typeof setTimeout> | null = null;

// 重新计算展开分类（用于容器大小变化时调用，带防抖）
// 注意：保留用户手动操作的面板状态
const recalculateExpandedCategories = () => {
  // 如果容器没有足够的尺寸（宽度 < 50px），跳过计算
  // 这样可以避免在折叠过程中触发不必要的计算，造成卡顿
  if (containerRef.value) {
    const width = containerRef.value.offsetWidth;
    if (width < 50) {
      return;
    }
  }

  // 清除之前的定时器
  if (recalculateTimer) {
    clearTimeout(recalculateTimer);
  }

  // 防抖：延迟计算，避免频繁触发（150ms）
  recalculateTimer = setTimeout(() => {
    nextTick(() => {
      requestAnimationFrame(() => {
        // 再次检查容器尺寸（可能在防抖延迟期间容器已经被折叠）
        if (containerRef.value && containerRef.value.offsetWidth < 50) {
          return;
        }

        const autoExpandedIds = calculateExpandedCategories();
        if (autoExpandedIds !== null) {
          // 合并自动展开的面板和用户手动操作的面板
          const finalExpandedIds = new Set<string>(autoExpandedIds);

          // 保留用户手动操作的面板状态
          userManualCategories.value.forEach((isExpanded, categoryId) => {
            if (isExpanded) {
              // 用户手动展开了这个面板，保留它（即使不在自动展开列表中）
              finalExpandedIds.add(categoryId);
            } else {
              // 用户手动折叠了这个面板，从列表中移除（即使它在自动展开列表中）
              finalExpandedIds.delete(categoryId);
            }
          });

          // 标记正在自动更新，避免触发用户操作记录
          isAutoUpdating = true;

          // 更新展开的分类列表
          activeCategories.value = Array.from(finalExpandedIds);

          // 更新 previousActiveState
          previousActiveState = [...finalExpandedIds];

          // 恢复标记
          nextTick(() => {
            isAutoUpdating = false;
          });
        }
        // 如果计算失败（DOM未准备好），不更新，等待下次触发
      });
    });
  }, 150);
};

// 监听数据变化 - 使用 shallowRef 和手动同步，避免深度比较导致的循环引用
// 注意：完全移除 watch，改为在 loadData 中处理，避免循环引用

// 存储每行的 ref，用于计算剩余空间
const rowRefs = ref<Map<string, HTMLElement>>(new Map());

// 设置行 ref（在模板中使用，TypeScript 可能无法检测到）
// @ts-ignore - 函数在模板中被使用（第26行），但 TypeScript 无法检测到
const setRowRef = (categoryId: string, el: HTMLElement | null) => {
  if (el) {
    rowRefs.value.set(categoryId, el);
  } else {
    rowRefs.value.delete(categoryId);
  }
};

// 计算每行的剩余空间和最大标签数（用于判断是否让最后一个标签占据剩余宽度，以及动态计算最大标签数）
// 注意：此函数不访问 computed 值，避免循环引用
// 使用浅拷贝更新，避免触发深度响应式更新
const calculateRowRemainingSpace = () => {
  if (!tagsContainerRef.value) return;

  // 创建新的 map 对象，避免直接修改导致循环更新
  const newRemainingSpaceMap: Record<string, boolean> = { ...rowRemainingSpaceMap.value };
  const newMaxTagsMap: Record<string, number> = { ...maxTagsPerRowMap.value };

  // 直接遍历 rowRefs，不访问 categoryTagRows computed 值，避免循环引用
  rowRefs.value.forEach((rowElement, categoryId) => {
    // 获取内容容器
    const contentElement = rowElement.querySelector('.btc-filter-list__tag-row-content') as HTMLElement;
    if (!contentElement) return;

    // 获取分类提示标签的宽度（作为参考）
    const categoryTag = contentElement.querySelector('.btc-filter-list__category-tag') as HTMLElement;
    if (!categoryTag) return;

    const categoryTagWidth = categoryTag.offsetWidth;
    const rowWidth = rowElement.offsetWidth;

    // 动态计算该行可以显示的最大正常标签数（不包括折叠标签）
    // 先计算可以显示多少正常标签，如果还有标签没显示，才需要显示折叠标签
    // 可用宽度 = 行宽 - 分类标签宽度
    // 平均标签宽度估算：80px（包括内容 + padding + gap）
    const tagGap = 6; // 标签间距
    const avgTagWidth = 80; // 平均标签宽度

    // 计算可以显示的正常标签数量（不包括折叠标签）
    // availableWidth = rowWidth - categoryTagWidth
    // maxTags = Math.floor(availableWidth / (avgTagWidth + tagGap))
    const availableWidth = rowWidth - categoryTagWidth;
    const calculatedMaxTags = Math.max(0, Math.floor(availableWidth / (avgTagWidth + tagGap)));

    // 更新最大正常标签数（至少 0 个，最多 20 个）
    // 注意：这里是正常标签的数量，不包括折叠标签
    newMaxTagsMap[categoryId] = Math.max(0, Math.min(20, calculatedMaxTags));

    // 计算已使用的宽度（分类提示标签 + 可见标签 + gap）
    let usedWidth = categoryTagWidth;
    const visibleTags = contentElement.querySelectorAll('.el-tag:not(.btc-filter-list__category-tag):not(.btc-filter-list__collapse-tag)');
    visibleTags.forEach((tag: Element) => {
      usedWidth += (tag as HTMLElement).offsetWidth + tagGap;
    });

    // 如果有折叠标签，也要计算它的宽度
    const collapseTag = contentElement.querySelector('.btc-filter-list__collapse-tag') as HTMLElement;
    if (collapseTag) {
      usedWidth += collapseTag.offsetWidth + tagGap;
    }

    // 计算剩余空间
    const remainingSpace = rowWidth - usedWidth;

    // 如果剩余空间明显大于一个标签的宽度（大于1.5倍标签宽度），则不占据剩余宽度
    // 只有当剩余空间较小（<= 1.5倍标签宽度）时，才让最后一个标签占据剩余宽度
    const shouldOccupyRemaining = remainingSpace > 0 && remainingSpace <= categoryTagWidth * 1.5;
    newRemainingSpaceMap[categoryId] = shouldOccupyRemaining;
  });

  // 一次性更新，避免多次触发响应式更新
  rowRemainingSpaceMap.value = newRemainingSpaceMap;
  maxTagsPerRowMap.value = newMaxTagsMap;
};

// 防抖计算剩余空间的定时器
let calculateTimer: ReturnType<typeof setTimeout> | null = null;

// 触发剩余空间计算的函数（带防抖，避免频繁触发和循环引用）
const triggerCalculateRemainingSpace = () => {
  // 清除之前的定时器
  if (calculateTimer) {
    clearTimeout(calculateTimer);
  }

  // 防抖：延迟计算，避免频繁触发
  calculateTimer = setTimeout(() => {
    nextTick(() => {
      requestAnimationFrame(() => {
        calculateRowRemainingSpace();
      });
    });
  }, 100);
};

// 监听 props.size 的变化（移动到 triggerCalculateRemainingSpace 定义之后）
watch(() => props.size, (newSize) => {
  // 如果 props.size 有值，优先使用 props.size（外部控制）
  // 否则保持当前值（可能是从存储中读取的）
  if (newSize) {
    currentSize.value = newSize;
    // 如果提供了 storageKey，同步保存到存储
    if (props.storageKey) {
      saveSizeToStorage(newSize);
    }
  }
  // 尺寸变化时，清空 maxTagsPerRowMap，让 categoryTagRows 先使用默认估算值
  // 然后 triggerCalculateRemainingSpace 会重新计算实际的 maxTagsPerRowMap
  maxTagsPerRowMap.value = {};
  // 尺寸变化时，容器宽度会改变，需要重新计算标签溢出
  triggerCalculateRemainingSpace();
}, { immediate: true });

// 注意：完全移除 watch 监听，改为在特定时机手动触发，避免循环引用
// 触发时机：
// 1. 组件挂载后
// 2. 选择变化时（handleSelectionChange）
// 3. 标签关闭时（handleTagClose）
// 4. 数据加载完成后（loadData）
// 5. 尺寸变化时（watch props.size）

// 使用 useResizeObserver 监听容器高度变化
// 当容器高度变化时，重新计算展开逻辑
// VueUse 的 composables 会在组件卸载时自动清理，无需手动清理
useResizeObserver(containerRef, () => {
  // 直接调用重新计算，函数内部会检查容器尺寸，如果宽度不足则跳过
  recalculateExpandedCategories();
});

// 组件挂载
onMounted(() => {
  loadData();
  // 延迟计算，确保 DOM 已渲染
  triggerCalculateRemainingSpace();

  // 绑定全局事件：点击容器外空白区域恢复
  document.addEventListener('click', handleClickOutside);

  // 绑定窗口尺寸变化事件
  window.addEventListener('resize', handleWindowResize);
});

// 组件卸载
onUnmounted(() => {
  // 移除事件监听
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('resize', handleWindowResize);
});

// 暴露方法和状态供父组件使用
defineExpose({
  searchKeyword,
  currentSize,
  handleSizeChange,
  sizeOptions,
});
</script>

<style lang="scss" scoped>
.btc-filter-list {
  display: flex;
  flex-direction: column;
  background-color: var(--el-bg-color);
  padding: 10px;
  width: 100%;
  min-width: 0; // 允许 flex 子元素收缩
  box-sizing: border-box;

  // 尺寸选项
  &.is-size-small {
    width: 200px !important;
    min-width: 200px !important; // 确保至少能显示全选和折叠按钮
    max-width: 200px !important; // 限制最大宽度

    // small 尺寸下优化布局，确保功能正常
    .btc-filter-list__category-title {
      font-size: 13px; // 稍微缩小字体
      gap: 8px; // 减小间距
    }

    .btc-filter-list__category-count {
      font-size: 11px; // 缩小计数文字
    }
  }

  &.is-size-large {
    width: 450px !important;
    min-width: 450px !important;
    max-width: 450px !important;
  }

  &.is-size-default {
    // 默认尺寸，不设置固定宽度，由父容器控制
  }

  &__header {
    flex-shrink: 0;
    border-bottom: none;
    background-color: var(--el-bg-color);
    margin-bottom: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 0;
    width: 100%;
    min-width: 0; // 允许 flex 子元素收缩
    box-sizing: border-box;
  }

  &__tags-wrapper {
    flex-shrink: 0;
    margin-bottom: 10px;
  }

  &__search-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 0;
    width: 100%;
    min-width: 0; // 允许 flex 子元素收缩
    box-sizing: border-box;
  }

  &__search {
    flex: 1;
    margin-bottom: 0;
    min-width: 0; // 允许 flex 子元素收缩，防止超出容器
    overflow: hidden; // 防止内容溢出
  }

  &__settings-btn {
    // 使用 btc-comm__icon 样式，只需要覆盖特定属性
    // 移除旋转动画，保持简洁
    transition: all 0.2s ease-in-out;

    // 移除额外的背景色（btc-comm__icon 已经处理了背景）
    // hover 和 active 状态由 btc-comm__icon 统一处理
  }

  // 下拉菜单样式（与国际化切换样式一致）
  :deep(.el-dropdown-menu) {
    .el-dropdown-menu__item {
      padding: 0;
    }
  }

  // 尺寸选择项样式（与国际化切换样式一致）
  &__size-item {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px; // 文本和点之间的间距
    padding: 4px 0;

    &-label {
      font-size: 14px;
    }

    &-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(--el-color-primary);
      flex-shrink: 0;
    }

    // 选中状态的样式（与国际化切换样式一致）
    &.is-active {
      .btc-filter-list__size-item-label {
        color: var(--el-color-primary);
        font-weight: 500;
      }

      .btc-filter-list__size-item-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: var(--el-color-primary);
      }
    }

    // hover 状态
    &:hover {
      .btc-filter-list__size-item-label {
        color: var(--el-color-primary);
      }
    }
  }

  // el-scrollbar 容器样式（父级容器，滚动条显示在底部）
  &__tags-scrollbar {
    border: 1px solid var(--el-border-color-light);
    border-radius: var(--el-border-radius-base);
    margin-bottom: 0;
    box-sizing: border-box;
    background-color: var(--el-bg-color);

    // el-scrollbar 组件样式覆盖 - 滚动条覆盖在内容上，不占空间
    :deep(.el-scrollbar__wrap) {
      overflow-x: auto;
      overflow-y: hidden;
      padding-bottom: 0 !important; // 移除底部 padding，滚动条不占空间
      margin-bottom: 0 !important;
    }

    :deep(.el-scrollbar__view) {
      padding-bottom: 0;
      margin-bottom: 0;
    }

    :deep(.el-scrollbar__bar) {
      // 滚动条覆盖在内容上，不占空间
      &.is-horizontal {
        bottom: 0;
        height: 6px; // 滚动条高度
        z-index: 1; // 确保滚动条在内容之上

        .el-scrollbar__thumb {
          background-color: var(--el-border-color);
          border-radius: 3px;

          &:hover {
            background-color: var(--el-border-color-dark);
          }
        }
      }

      // 隐藏垂直滚动条
      &.is-vertical {
        display: none;
      }
    }
  }

  &__tags {
    display: flex;
    flex-direction: column; // 改为纵向布局，每排一个分类
    gap: 6px; // 行间距
    border: 1px solid var(--el-border-color-light); // 添加边框
    border-radius: var(--el-border-radius-base);
    padding: 5px 5px 0 5px; // 上左右5px，底部0px（因为标签行内容容器已有padding-bottom: 5px）
    margin-bottom: 0;
    // 高度由 JavaScript 动态计算（根据分类数量）
    // 计算公式：高度 = 标签行数 * 24px + (行数 - 1) * 6px + 10px（上下内边距）+ 2px（上下边框）
    // 每个分类占一行
    box-sizing: border-box;
    background-color: var(--el-bg-color);

    // 在滚动状态下，容器宽度可以超出父容器
    .btc-filter-list__tags-scrollbar & {
      border: none; // 滚动状态下，边框由 scrollbar 容器提供
      border-radius: 0;
      width: max-content; // 内容宽度自适应，可以超出父容器
      min-width: 100%; // 最小宽度为父容器宽度
    }
  }

  // 标签行样式
  &__tag-row {
    min-height: 24px; // 标签高度
    width: 100%; // 确保行元素占满容器宽度
    box-sizing: border-box;
    flex-shrink: 0; // 不允许收缩
    border-bottom: 1px solid var(--el-border-color-lighter); // 添加分隔线

    // 最后一行不需要分隔线
    &:last-child {
      border-bottom: none;
    }
  }

  // 标签行内容容器（承载所有标签）
  &__tag-row-content {
    display: flex; // 使用 flex 布局
    align-items: center;
    gap: 6px; // 标签之间的间距
    flex-wrap: nowrap; // 不允许换行，确保标签在一行显示
    width: 100%; // 占满行宽度
    overflow: hidden; // 折叠状态下隐藏溢出内容
    padding-bottom: 5px; // 标签内容和底部分隔线之间的间距

    // 在滚动状态下，只有处于滚动状态的行才使用 max-content，其他行保持 100%
    // 这样只有展开的行会超出容器宽度，触发父级容器的水平滚动
    .btc-filter-list__tags-scrollbar & {
      // 默认保持 100% 宽度，避免未展开的行也超出容器
      width: 100%;
      min-width: 100%;
      overflow: visible; // 滚动状态下允许溢出

      // 只有处于滚动状态的行才使用 max-content
      .btc-filter-list__tag-row[data-scrolling="true"] & {
        width: max-content; // 内容宽度自适应，可以超出父容器
        min-width: 100%; // 最小宽度为父容器宽度

        :deep(.el-tag) {
          flex: 0 0 auto !important; // 强制不占据剩余空间，不允许收缩或扩展
          min-width: auto !important; // 使用标签的自然宽度
          flex-shrink: 0 !important; // 不允许收缩
          flex-grow: 0 !important; // 不允许扩展
          width: auto !important; // 使用标签的自然宽度
        }
      }
    }
  }

  // 分类提示标签（固定，不可关闭）
  &__category-tag {
    flex-shrink: 0; // 不允许收缩
    white-space: nowrap; // 不换行
  }

  // 折叠标签
  &__collapse-tag {
    cursor: pointer; // 可点击
    white-space: nowrap; // 不换行

    &:hover {
      opacity: 0.8;
    }
  }

  // 收起按钮（展开状态下显示，取代分类标签位置）
  &__collapse-btn {
    cursor: pointer; // 可点击
    flex-shrink: 0; // 不允许收缩，与分类标签保持一致
    display: inline-flex; // 确保正确显示
    align-items: center; // 垂直居中
    justify-content: center; // 水平居中
    width: 24px; // 圆形图标大小，与标签高度一致
    height: 24px;
    border-radius: 50%; // 圆形
    font-size: 14px; // 图标大小
    transition: background-color 0.2s, border-color 0.2s; // 过渡效果
    background-color: var(--el-fill-color-lighter); // 默认背景色
    border: 1px solid; // 描边，颜色通过具体类型设置

    &:hover {
      background-color: var(--el-fill-color-light); // 悬停时背景色加深
    }

    // 根据标签类型设置颜色（包括图标颜色和描边颜色）
    &--primary {
      color: var(--el-color-primary);
      border-color: var(--el-color-primary);
    }
    &--success {
      color: var(--el-color-success);
      border-color: var(--el-color-success);
    }
    &--warning {
      color: var(--el-color-warning);
      border-color: var(--el-color-warning);
    }
    &--danger {
      color: var(--el-color-danger);
      border-color: var(--el-color-danger);
    }
    &--info {
      color: var(--el-color-info);
      border-color: var(--el-color-info);
    }
    &--purple {
      color: var(--el-color-purple);
      border-color: var(--el-color-purple);
    }
    &--pink {
      color: var(--el-color-pink);
      border-color: var(--el-color-pink);
    }
    &--cyan {
      color: var(--el-color-cyan);
      border-color: var(--el-color-cyan);
    }
    &--teal {
      color: var(--el-color-teal);
      border-color: var(--el-color-teal);
    }
    &--indigo {
      color: var(--el-color-indigo);
      border-color: var(--el-color-indigo);
    }
    &--orange {
      color: var(--el-color-orange);
      border-color: var(--el-color-orange);
    }
    &--brown {
      color: var(--el-color-brown);
      border-color: var(--el-color-brown);
    }
    &--gray {
      color: var(--el-color-gray);
      border-color: var(--el-color-gray);
    }
    &--lime {
      color: var(--el-color-lime);
      border-color: var(--el-color-lime);
    }
    &--olive {
      color: var(--el-color-olive);
      border-color: var(--el-color-olive);
    }
    &--navy {
      color: var(--el-color-navy);
      border-color: var(--el-color-navy);
    }
    &--maroon {
      color: var(--el-color-maroon);
      border-color: var(--el-color-maroon);
    }
  }

  // 溢出标签项
  &__overflow-tag-item {
    white-space: nowrap; // 不换行
    flex-shrink: 0; // 不允许收缩
    flex-grow: 0; // 不允许扩展
  }

  // 隐藏的标签（溢出标签在折叠状态下隐藏）
  &__tag-hidden {
    display: none !important;
  }

  // 最后一个标签占据剩余宽度
  &__tag-last {
    flex: 1; // 占据剩余空间
    min-width: 0; // 允许收缩到最小
    max-width: 100%; // 不超过容器宽度
  }

  // 确保所有标签都不换行
  &__tag-row :deep(.el-tag) {
    white-space: nowrap; // 标签内容不换行

    // 除了最后一个标签，其他标签不允许收缩
    &:not(.btc-filter-list__tag-last) {
      flex-shrink: 0;
      flex-grow: 0; // 不允许扩展
    }
  }

  &__overflow-tag {
    flex-shrink: 0;
  }

  &__overflow-content {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    max-height: 300px;
    overflow-y: auto;
  }

  &__overflow-tag-item {
    margin: 0;
  }

  &__container {
    flex: 1;
    overflow: hidden;
    padding: 0;
    min-width: 0;
  }

  :deep(.el-scrollbar) {
    padding: 0;
    height: 100%;
    width: 100%;
  }

  :deep(.el-scrollbar__wrap) {
    overflow-x: hidden;
    width: 100%;
  }

  :deep(.el-scrollbar__view) {
    width: 100%;
  }

  &__category-title {
    display: flex;
    align-items: center;
    gap: 12px; // 增加间距，避免误点
    font-weight: 500;
    flex: 1;
    padding: 4px 0; // 增加垂直内边距，扩大点击区域
  }

  &__category-checkbox {
    flex-shrink: 0;
    margin-right: 0;
    cursor: pointer; // 明确显示可点击

    // 标题区全选框样式：使用 primary-dark-3，视觉更醒目
    :deep(.el-checkbox__input) {
      .el-checkbox__inner {
        transition: border-color 0.2s ease, background-color 0.2s ease;

        &:hover {
          border-color: var(--el-color-primary-dark-3) !important;
        }
      }
    }

    // 选中状态：使用 primary-dark-3
    :deep(.el-checkbox__input.is-checked) {
      .el-checkbox__inner {
        border-color: var(--el-color-primary) !important;
        background-color: var(--el-color-primary) !important;
        color: var(--el-color-white) !important;

        // 确保对勾图标清晰可见（白色对勾）
        &::after {
          border-color: var(--el-color-white) !important;
        }

        &:hover {
          border-color: var(--el-color-primary) !important;
          background-color: var(--el-color-primary) !important;
        }
      }
    }

    // 半选状态：使用 primary-dark-3
    :deep(.el-checkbox__input.is-indeterminate) {
      .el-checkbox__inner {
        border-color: var(--el-color-primary) !important;
        background-color: var(--el-color-primary) !important;

        &:hover {
          border-color: var(--el-color-primary) !important;
          background-color: var(--el-color-primary) !important;
        }
      }
    }
  }

  &__category-count {
    color: var(--el-text-color-secondary);
    font-size: 12px;
    font-weight: normal;
    margin-left: auto; // 靠右对齐
  }

  &__options {
    padding: 0; // 移除上下内边距，减少与标题的间距

    // 让 checkbox-group 使用 flex 布局，实现水平排列
    :deep(.el-checkbox-group) {
      display: flex;
      flex-wrap: wrap;
      gap: 10px; // 统一控制水平和垂直间距
    }
  }

  &__option {
    // 使用 flex 布局时，选项会自动水平排列，无需设置 display: block
    // margin 由父容器的 gap 统一控制，无需单独设置

    // 内容区选项框样式：使用正常主题色（primary），视觉权重正常
    :deep(.el-checkbox__input) {
      .el-checkbox__inner {
        transition: border-color 0.2s ease, background-color 0.2s ease;

        &:hover {
          border-color: var(--el-color-primary-light-4) !important;
        }
      }
    }

    // 选中状态：使用正常主题色（primary）
    :deep(.el-checkbox__input.is-checked) {
      .el-checkbox__inner {
        border-color: var(--el-color-primary-light-4) !important;
        background-color: var(--el-color-primary-light-4) !important;
        color: var(--el-color-white) !important;

        // 确保选中图标（对勾）是白色，清晰可见
        &::after {
          border-color: var(--el-color-white) !important;
        }

        &:hover {
          border-color: var(--el-color-primary-dark-3) !important;
          background-color: var(--el-color-primary-dark-3) !important;
        }
      }
    }
  }
}

:deep(.el-collapse-item) {
  margin-bottom: 10px;
  border: 1px solid var(--el-border-color-light);
  border-radius: var(--el-border-radius-base);
  overflow: hidden;
  background-color: var(--el-bg-color);

  &:last-child {
    margin-bottom: 0;
  }
}

:deep(.el-collapse-item__header) {
  padding: 8px 10px;
  font-size: 14px;
  overflow: visible;
  width: 100%;
  box-sizing: border-box;
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
  height: auto;
  min-height: auto;
  line-height: 1.5;
  // 阻止 header 的点击事件，只有箭头按钮可以触发折叠
  pointer-events: none;

  // 只允许箭头按钮可以点击
  .el-collapse-item__arrow {
    pointer-events: auto;
    cursor: pointer;
  }

  // 允许 checkbox 可以点击（已经有 @click.stop 阻止冒泡）
  .btc-filter-list__category-checkbox {
    pointer-events: auto;
  }
}

:deep(.el-collapse-item__arrow) {
  margin-right: 8px;
  flex-shrink: 0;
}

:deep(.el-collapse) {
  border: none;
  background-color: transparent;
}

:deep(.el-collapse-item__content) {
  padding: 4px 10px; // 减少上下内边距，从10px改为8px
  padding-bottom: 0;
  background-color: var(--el-bg-color);
  border: none;
}
</style>
