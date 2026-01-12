<template>
  <div class="filter-list-test">
    <BtcFilterTableGroup
      ref="filterTableGroupRef"
      :filter-category="testCategories"
      :enable-filter-search="true"
      :default-expanded-count="3"
      :right-service="testService"
      :table-columns="tableColumns"
      :form-items="formItems"
      :category-column-map="categoryColumnMap"
      :enable-auto-width="false"
      right-title="数据列表"
      search-placeholder="搜索数据..."
      :upsert-width="600"
      storage-key="filter-list-test"
      @filter-change="handleFilterChange"
      @column-change="handleColumnChange"
      @width-change="handleWidthChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { BtcFilterTableGroup } from '@btc/shared-components';
import type { FilterCategory, FilterResult } from '@btc/shared-components';
import type { CrudService } from '@btc/shared-core';
import type { TableColumn, FormItem } from '@btc/shared-components';

defineOptions({
  name: 'FilterListTest',
});

// BtcFilterTableGroup 组件引用
const filterTableGroupRef = ref<InstanceType<typeof BtcFilterTableGroup> | null>(null);

// 当前筛选条件
const currentFilters = ref<FilterResult[]>([]);

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

// 分类到列的映射配置（用于列优先级功能）
const categoryColumnMap = {
  production: ['production'], // 选中"产品"分类时，优先显示产品列
  method: ['method'], // 选中"方法"分类时，优先显示方法列
  status: ['status'], // 选中"状态"分类时，优先显示状态列
  type: ['type'], // 选中"类型"分类时，优先显示类型列
  priority: ['priority'], // 选中"优先级"分类时，优先显示优先级列
};

// 处理筛选变化
const handleFilterChange = (result: FilterResult[]) => {
  currentFilters.value = result;
  console.log('筛选结果变化:', result);
  // BtcFilterTableGroup 会自动处理筛选结果的转换和刷新
};

// 处理列变化
const handleColumnChange = (columns: TableColumn[]) => {
  console.log('列变化:', columns);
};

// 处理宽度变化
const handleWidthChange = (width: string) => {
  console.log('左侧宽度变化:', width);
};

// 测试数据
const testData = ref([
  { id: 1, name: '测试数据1', production: 'prod_a', method: 'method_1', status: 'enabled', type: 'type_a', priority: 'high', createTime: '2024-01-01 10:00:00' },
  { id: 2, name: '测试数据2', production: 'prod_b', method: 'method_2', status: 'disabled', type: 'type_b', priority: 'medium', createTime: '2024-01-02 11:00:00' },
  { id: 3, name: '测试数据3', production: 'prod_a', method: 'method_3', status: 'pending', type: 'type_c', priority: 'low', createTime: '2024-01-03 12:00:00' },
  { id: 4, name: '测试数据4', production: 'prod_c', method: 'method_1', status: 'enabled', type: 'type_d', priority: 'high', createTime: '2024-01-04 13:00:00' },
  { id: 5, name: '测试数据5', production: 'prod_d', method: 'method_2', status: 'enabled', type: 'type_e', priority: 'medium', createTime: '2024-01-05 14:00:00' },
  { id: 6, name: '测试数据6', production: 'prod_a', method: 'method_1', status: 'disabled', type: 'type_a', priority: 'low', createTime: '2024-01-06 15:00:00' },
  { id: 7, name: '测试数据7', production: 'prod_b', method: 'method_3', status: 'pending', type: 'type_b', priority: 'high', createTime: '2024-01-07 16:00:00' },
  { id: 8, name: '测试数据8', production: 'prod_c', method: 'method_2', status: 'enabled', type: 'type_c', priority: 'medium', createTime: '2024-01-08 17:00:00' },
  { id: 9, name: '测试数据9', production: 'prod_d', method: 'method_1', status: 'enabled', type: 'type_d', priority: 'low', createTime: '2024-01-09 18:00:00' },
  { id: 10, name: '测试数据10', production: 'prod_a', method: 'method_3', status: 'disabled', type: 'type_e', priority: 'high', createTime: '2024-01-10 19:00:00' },
]);

// 根据筛选条件过滤数据
const getFilteredData = (data: any[], filters: FilterResult[]) => {
  if (filters.length === 0) {
    return data;
  }

  return data.filter(item => {
    return filters.every(filter => {
      const filterValues = filter.value || [];
      if (filterValues.length === 0) return true;

      // 根据分类ID匹配对应的字段
      const fieldMap: Record<string, string> = {
        production: 'production',
        method: 'method',
        status: 'status',
        type: 'type',
        priority: 'priority',
      };

      const fieldName = fieldMap[filter.name];
      if (!fieldName) return true;

      return filterValues.includes(item[fieldName]);
    });
  });
};

// 创建测试服务
const testService: CrudService = {
  page: async (params: Record<string, unknown>) => {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 300));

    let filtered = getFilteredData(testData.value, currentFilters.value);

    // 处理搜索关键词
    if (params?.keyword) {
      const keywordObj = params.keyword as Record<string, any>;
      const searchKeyword = keywordObj.keyword || keywordObj.search || params.keyword;
      if (searchKeyword && typeof searchKeyword === 'string') {
        const keyword = searchKeyword.toLowerCase();
        filtered = filtered.filter(item =>
          item.name.toLowerCase().includes(keyword)
        );
      }

      // 处理筛选条件（BtcFilterTableGroup 会自动将筛选结果转换为 keyword 对象）
      // 例如：keyword.production = ['prod_a', 'prod_b']
      Object.keys(keywordObj).forEach(key => {
        if (key !== 'keyword' && key !== 'search' && Array.isArray(keywordObj[key])) {
          const filterValues = keywordObj[key];
          if (filterValues.length > 0) {
            filtered = filtered.filter(item => {
              // 根据字段名匹配
              const fieldMap: Record<string, string> = {
                production: 'production',
                method: 'method',
                status: 'status',
                type: 'type',
                priority: 'priority',
              };
              const fieldName = fieldMap[key];
              if (!fieldName) return true;
              return filterValues.includes(item[fieldName]);
            });
          }
        }
      });
    }

    // 处理分页
    const page = Number(params?.page || params?.pageNumber || 1);
    const pageSize = Number(params?.pageSize || params?.size || 10);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const list = filtered.slice(start, end);

    return {
      list,
      total: filtered.length,
    };
  },

  add: async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newId = testData.value.length > 0
      ? Math.max(...testData.value.map(d => d.id)) + 1
      : 1;
    const newItem = {
      ...data,
      id: newId,
      createTime: new Date().toLocaleString('zh-CN'),
    };
    testData.value.push(newItem);
  },

  update: async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = testData.value.findIndex(item => item.id === data.id);
    if (index !== -1) {
      testData.value[index] = { ...testData.value[index], ...data };
    } else {
      throw new Error('数据不存在');
    }
  },

  delete: async (id: string | number) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = testData.value.findIndex(item => item.id === id);
    if (index !== -1) {
      testData.value.splice(index, 1);
    } else {
      throw new Error('数据不存在');
    }
  },

  deleteBatch: async (ids: (string | number)[]) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    testData.value = testData.value.filter(item => !ids.includes(item.id));
  },
};

// 注意：BtcFilterTableGroup 会自动处理筛选结果到查询参数的转换
// 不需要手动实现 handleBeforeRefresh

// 表格列定义
const tableColumns: TableColumn[] = [
  { prop: 'id', label: '序号', width: 80, fixed: 'left' },
  { prop: 'name', label: '名称', minWidth: 150, fixed: 'left' },
  {
    prop: 'production',
    label: '产品',
    width: 120,
    formatter: (row: any) => getOptionLabel('production', row.production),
  },
  {
    prop: 'method',
    label: '方法',
    width: 120,
    formatter: (row: any) => getOptionLabel('method', row.method),
  },
  {
    prop: 'status',
    label: '状态',
    width: 100,
    formatter: (row: any) => getOptionLabel('status', row.status),
  },
  {
    prop: 'type',
    label: '类型',
    width: 120,
    formatter: (row: any) => getOptionLabel('type', row.type),
  },
  {
    prop: 'priority',
    label: '优先级',
    width: 100,
    formatter: (row: any) => getOptionLabel('priority', row.priority),
  },
  { prop: 'createTime', label: '创建时间', width: 180, fixed: 'right' },
];

// 表单字段定义
const formItems: FormItem[] = [
  {
    prop: 'name',
    label: '名称',
    component: 'el-input',
    required: true,
  },
  {
    prop: 'production',
    label: '产品',
    component: 'el-select',
    options: testCategories.find(c => c.id === 'production')?.options || [],
    required: true,
  },
  {
    prop: 'method',
    label: '方法',
    component: 'el-select',
    options: testCategories.find(c => c.id === 'method')?.options || [],
    required: true,
  },
  {
    prop: 'status',
    label: '状态',
    component: 'el-select',
    options: testCategories.find(c => c.id === 'status')?.options || [],
    required: true,
  },
  {
    prop: 'type',
    label: '类型',
    component: 'el-select',
    options: testCategories.find(c => c.id === 'type')?.options || [],
    required: true,
  },
  {
    prop: 'priority',
    label: '优先级',
    component: 'el-select',
    options: testCategories.find(c => c.id === 'priority')?.options || [],
    required: true,
  },
];
</script>

<style scoped lang="scss">
.filter-list-test {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
