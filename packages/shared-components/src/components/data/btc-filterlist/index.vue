<template>
  <div class="btc-filter-list">
    <!-- 顶部区域：搜索和已选标签 -->
    <div class="btc-filter-list__header">
      <!-- 搜索框 -->
      <div v-if="enableSearch" class="btc-filter-list__search">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索分类..."
          clearable
          :prefix-icon="Search"
          id="btc-filter-list-search"
          name="btc-filter-list-search"
        />
      </div>

      <!-- 已选标签展示区 -->
      <div class="btc-filter-list__tags" ref="tagsContainerRef">
        <template v-if="selectedTags.length > 0">
          <template v-for="tag in visibleTags" :key="`${tag.categoryId}-${tag.optionValue}`">
            <BtcTag
              :type="getTagType(tag.categoryId)"
              closable
              @close="handleTagClose(tag)"
            >
              {{ tag.categoryName }}: {{ tag.optionLabel }}
            </BtcTag>
          </template>
          <ElPopover
            v-if="overflowCount > 0"
            placement="top"
            trigger="hover"
            :width="200"
          >
            <template #reference>
              <BtcTag type="info" class="btc-filter-list__overflow-tag">
                +{{ overflowCount }}
              </BtcTag>
            </template>
            <div class="btc-filter-list__overflow-content">
              <BtcTag
                v-for="tag in overflowTags"
                :key="`${tag.categoryId}-${tag.optionValue}`"
                :type="getTagType(tag.categoryId)"
                closable
                class="btc-filter-list__overflow-tag-item"
                @close="handleTagClose(tag)"
              >
                {{ tag.categoryName }}: {{ tag.optionLabel }}
              </BtcTag>
            </div>
          </ElPopover>
        </template>
      </div>
    </div>

    <!-- 内容区域：分类卡片列表 -->
    <div class="btc-filter-list__container" v-loading="loading">
      <el-scrollbar>
        <el-collapse v-model="activeCategories">
          <el-collapse-item
            v-for="category in filteredCategories"
            :key="category.id"
            :name="category.id"
          >
            <template #title>
              <div class="btc-filter-list__category-title">
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
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { useI18n } from '@btc/shared-core';
import { Search } from '@element-plus/icons-vue';
import { BtcTag } from '@btc/shared-components';
import { ElPopover } from 'element-plus';
import type { FilterCategory, FilterResult, BtcFilterListProps, BtcFilterListEmits } from './types';

defineOptions({
  name: 'BtcFilterList'
});

const props = withDefaults(defineProps<BtcFilterListProps>(), {
  title: '',
  enableSearch: true,
  defaultExpandedCount: 3,
  multiple: true,
});

const emit = defineEmits<BtcFilterListEmits>();

const { t } = useI18n();

// 数据状态
const loading = ref(false);
const categories = ref<FilterCategory[]>([]);
const searchKeyword = ref('');

// 选择状态：{ categoryId: [optionValue1, optionValue2, ...] }
const selectedValues = ref<Record<string, any[]>>({});

// 展开的分类列表
const activeCategories = ref<string[]>([]);

// Tag 容器引用
const tagsContainerRef = ref<HTMLElement | null>(null);

// 固定的可见标签数量（3排，每排约 5-6 个标签）
const MAX_VISIBLE_TAGS = 15;

// 已选标签数据
interface SelectedTag {
  categoryId: string;
  categoryName: string;
  optionValue: any;
  optionLabel: string;
}

const selectedTags = computed<SelectedTag[]>(() => {
  const tags: SelectedTag[] = [];
  Object.keys(selectedValues.value).forEach(categoryId => {
    const category = categories.value.find(c => c.id === categoryId);
    if (!category) return;

    const values = selectedValues.value[categoryId] || [];
    values.forEach(value => {
      const option = category.options.find(opt => opt.value === value);
      if (option) {
        tags.push({
          categoryId,
          categoryName: category.name,
          optionValue: value,
          optionLabel: option.label,
        });
      }
    });
  });
  return tags;
});

// 可见的标签（最多显示 MAX_VISIBLE_TAGS 个）
const visibleTags = computed(() => {
  return selectedTags.value.slice(0, MAX_VISIBLE_TAGS);
});

// 溢出的标签
const overflowTags = computed(() => {
  return selectedTags.value.slice(MAX_VISIBLE_TAGS);
});

// 溢出数量
const overflowCount = computed(() => {
  return Math.max(0, selectedTags.value.length - MAX_VISIBLE_TAGS);
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
  // 如果选择了选项，自动展开该分类
  const hasSelection = (selectedValues.value[categoryId] || []).length > 0;
  if (hasSelection && !activeCategories.value.includes(categoryId)) {
    activeCategories.value.push(categoryId);
  }

  // 输出结果
  emitChange();
};

// 处理标签关闭
const handleTagClose = (tag: SelectedTag) => {
  const values = selectedValues.value[tag.categoryId] || [];
  const index = values.indexOf(tag.optionValue);
  if (index > -1) {
    values.splice(index, 1);
    selectedValues.value[tag.categoryId] = values;
    emitChange();
  }
};

// 输出结果
const emitChange = () => {
  const result: FilterResult[] = [];
  Object.keys(selectedValues.value).forEach(categoryId => {
    const values = selectedValues.value[categoryId];
    if (values && values.length > 0) {
      result.push({
        name: categoryId,
        value: values,
      });
    }
  });
  emit('change', result);
  emit('update:modelValue', result);
};

// 加载数据
const loadData = async () => {
  if (props.category) {
    categories.value = props.category;
    initDefaultExpanded();
    return;
  }

  if (props.service) {
    loading.value = true;
    try {
      const data = await props.service.list();
      categories.value = Array.isArray(data) ? data : [];
      initDefaultExpanded();
    } catch (error) {
      console.error('[BtcFilterList] Failed to load data:', error);
      categories.value = [];
    } finally {
      loading.value = false;
    }
  }
};

// 初始化默认展开的分类
const initDefaultExpanded = () => {
  const count = Math.min(props.defaultExpandedCount || 3, categories.value.length);
  activeCategories.value = categories.value.slice(0, count).map(c => c.id);
};

// 监听数据变化
watch(() => props.category, (newVal) => {
  if (newVal) {
    categories.value = newVal;
    initDefaultExpanded();
  }
}, { immediate: true, deep: true });

// 组件挂载
onMounted(() => {
  loadData();
});
</script>

<style lang="scss" scoped>
.btc-filter-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--el-bg-color);
  padding: 10px;

  &__header {
    flex-shrink: 0;
    border-bottom: none;
    background-color: var(--el-bg-color);
    margin-bottom: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 0;
  }

  &__tags-wrapper {
    flex-shrink: 0;
    margin-bottom: 10px;
  }

  &__search {
    margin-bottom: 0;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    border: 1px solid var(--el-border-color-light);
    border-radius: var(--el-border-radius-base);
    padding: 10px;
    margin-bottom: 0;
    min-height: 96px; // 固定最小高度：3排标签（el-tag 约 24px，gap 10px，3排 = 24*3 + 10*2 = 92px，取 96px）
    height: 96px; // 固定高度：3排标签
    overflow: hidden;
    align-content: flex-start;
    box-sizing: border-box;
    background-color: var(--el-bg-color);
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
    gap: 10px;
    font-weight: 500;
  }

  &__category-count {
    color: var(--el-text-color-secondary);
    font-size: 12px;
    font-weight: normal;
  }

  &__options {
    padding: 10px 0;
  }

  &__option {
    display: block;
    margin-bottom: 10px;

    &:last-child {
      margin-bottom: 0;
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
  padding: 10px;
  padding-bottom: 0;
  background-color: var(--el-bg-color);
  border: none;
}
</style>
