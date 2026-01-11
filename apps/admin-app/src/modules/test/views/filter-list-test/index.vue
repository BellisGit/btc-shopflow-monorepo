<template>
  <div class="filter-list-test">
    <BtcFilterGroup
      :filter-category="testCategories"
      :enable-filter-search="true"
      :default-expanded-count="3"
      right-title="数据列表"
      @filter-change="handleFilterChange"
    >
      <template #right="{ filterResult }">
        <div class="test-content">
          <div class="content-body">
            <BtcEmpty v-if="filterResult.length === 0" description="暂无筛选条件" />
            <div v-else class="filter-result-list">
              <div v-for="(item, index) in filterResult" :key="index" class="filter-result-item">
                <div class="filter-result-label">{{ getCategoryName(item.name) }}:</div>
                <div class="filter-result-values">
                  <el-tag
                    v-for="(value, valueIndex) in item.value"
                    :key="valueIndex"
                    class="filter-result-tag"
                  >
                    {{ getOptionLabel(item.name, value) }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </BtcFilterGroup>
  </div>
</template>

<script setup lang="ts">
import { BtcFilterGroup, BtcEmpty } from '@btc/shared-components';
import type { FilterCategory, FilterResult } from '@btc/shared-components';

defineOptions({
  name: 'FilterListTest',
});

// 测试数据
const testCategories: FilterCategory[] = [
  {
    id: 'production',
    name: '产品',
    options: [
      { label: '产品A', value: 'prod_a' },
      { label: '产品B', value: 'prod_b' },
      { label: '产品C', value: 'prod_c' },
      { label: '产品D', value: 'prod_d' },
    ],
  },
  {
    id: 'method',
    name: '方法',
    options: [
      { label: '方法1', value: 'method_1' },
      { label: '方法2', value: 'method_2' },
      { label: '方法3', value: 'method_3' },
    ],
  },
  {
    id: 'status',
    name: '状态',
    options: [
      { label: '启用', value: 'enabled' },
      { label: '禁用', value: 'disabled' },
      { label: '待审核', value: 'pending' },
    ],
  },
  {
    id: 'type',
    name: '类型',
    options: [
      { label: '类型A', value: 'type_a' },
      { label: '类型B', value: 'type_b' },
      { label: '类型C', value: 'type_c' },
      { label: '类型D', value: 'type_d' },
      { label: '类型E', value: 'type_e' },
    ],
  },
  {
    id: 'priority',
    name: '优先级',
    options: [
      { label: '高', value: 'high' },
      { label: '中', value: 'medium' },
      { label: '低', value: 'low' },
    ],
  },
];

// 获取分类名称
const getCategoryName = (categoryId: string): string => {
  const category = testCategories.find(cat => cat.id === categoryId);
  return category?.name || categoryId;
};

// 获取选项标签
const getOptionLabel = (categoryId: string, optionValue: any): string => {
  const category = testCategories.find(cat => cat.id === categoryId);
  const option = category?.options.find(opt => opt.value === optionValue);
  return option?.label || String(optionValue);
};

// 处理筛选变化
const handleFilterChange = (result: FilterResult[]) => {
  console.log('筛选结果:', result);
};
</script>

<style scoped>
.filter-list-test {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.test-content {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.content-body {
  flex: 1;
  overflow: auto;
}


.filter-result-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-result-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.filter-result-label {
  min-width: 80px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.filter-result-values {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-result-tag {
  margin: 0;
}
</style>
