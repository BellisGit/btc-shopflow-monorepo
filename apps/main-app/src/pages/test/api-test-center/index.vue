<template>
  <div class="api-test-center">
    <BtcRow>
      <BtcFlex1 />
      <el-input
        v-model="searchKeyword"
        placeholder="搜索错误码..."
        clearable
        class="search-input"
        style="width: 240px"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </BtcRow>

    <div class="test-table">
      <el-table
        :data="paginatedTestCases"
        v-loading="loading"
        border
        style="width: 100%"
        highlight-current-row
        @current-change="handleCurrentChange"
      >
        <el-table-column prop="code" label="错误码" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="primary" size="small">{{ row.code }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="name" label="接口名称" min-width="200" align="center" />

        <el-table-column label="返回代码" width="180" align="center">
          <template #default="{ row }">
            <div v-if="row.result">
              <el-tag
                :type="row.success ? 'success' : 'danger'"
                size="small"
              >
                {{ row.success ? '200' : (row.result.code || 'Error') }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="返回信息" min-width="300" align="center">
          <template #default="{ row }">
            <div v-if="row.result">
              <el-tag
                :type="row.success ? 'success' : 'danger'"
                size="small"
              >
                {{ row.success ? '请求成功' : (row.result.msg || row.result.error || '请求失败') }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="耗时" width="120" align="center">
          <template #default="{ row }">
            <span v-if="row.duration">{{ row.duration }}ms</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              :loading="row.loading"
              @click="runTest(row)"
            >
              {{ row.loading ? '测试中...' : '开始测试' }}
            </el-button>
          </template>
        </el-table-column>
        </el-table>

      <!-- 分页组件 -->
      <BtcRow>
        <BtcFlex1 />
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredTestCases.length"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </BtcRow>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { useMessage } from '@/utils/use-message';
import { service } from '@/services/eps';
import eps from 'virtual:eps';

const message = useMessage();

// 搜索关键词
const searchKeyword = ref('');

// 加载状态
const loading = ref(false);

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);

// 过滤后的测试用例
const filteredTestCases = computed(() => {
  if (!searchKeyword.value) {
    return testCases.value;
  }

  const keyword = searchKeyword.value.toLowerCase();
  return testCases.value.filter(test =>
    test.code.toString().includes(keyword) ||
    test.name.toLowerCase().includes(keyword) ||
    test.description.toLowerCase().includes(keyword)
  );
});

// 分页后的测试用例
const paginatedTestCases = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredTestCases.value.slice(start, end);
});

// 从EPS数据动态生成测试用例
const testCases = ref([]);

// 生成测试用例的函数
function generateTestCases() {
  const cases = [];

  // 从EPS数据中获取test服务的API信息
  if (eps?.list && Array.isArray(eps.list)) {
    const testEntity = eps.list.find(entity => entity.name === 'TestEntity');

    if (testEntity && testEntity.api && Array.isArray(testEntity.api)) {
      testEntity.api.forEach(api => {
        // 从API路径中提取错误码
        const codeMatch = api.path.match(/\/(\d+)$/);
        const code = codeMatch ? parseInt(codeMatch[1]) : null;

        if (code && api.name) {
          cases.push({
            code: code,
            name: api.summary || api.name, // 使用summary作为标题，如果没有则使用name
            description: `测试${code}错误码处理`,
            method: api.name,
            loading: false,
            success: false,
            error: false,
            result: null,
            duration: 0
          });
        }
      });
    }
  }

  // 添加404错误码测试用例（模拟404错误，后端没有这个接口）
  cases.push({
    code: 404,
    name: '404测试接口',
    description: '测试404错误处理（后端不存在此接口）',
    method: 'test404', // 这个方法在后端不存在
    isCustomRequest: true, // 标记为自定义请求
    customPath: '/admin/system/test/404', // 自定义请求路径
    loading: false,
    success: false,
    error: false,
    result: null,
    duration: 0
  });


  // 添加一个已知存在的接口测试（用于验证响应拦截器是否正常工作）
  cases.push({
    code: 999,
    name: '响应拦截器测试',
    description: '测试响应拦截器是否正常工作（请求已知存在的接口）',
    method: 'testInterceptor', // 这个方法在后端不存在
    isCustomRequest: true, // 标记为自定义请求
    customPath: '/admin/system/user/page', // 请求一个已知存在的接口
    loading: false,
    success: false,
    error: false,
    result: null,
    duration: 0
  });

  // 按错误码排序
  cases.sort((a, b) => a.code - b.code);

  return cases;
}

// 处理行选中事件
const handleCurrentChange = (currentRow: any, oldCurrentRow: any) => {
  // 行选中处理逻辑
};

// 运行单个测试
const runTest = async (test: any) => {
  test.loading = true;
  test.success = false;
  test.error = false;
  test.result = null;

  const startTime = Date.now();


  try {
    let result;

    if (test.isCustomRequest) {
      // 自定义请求，直接使用HTTP工具请求指定路径
      const { http } = await import('@/utils/http');

      // 重新创建响应拦截器
      http.recreateResponseInterceptor();

      result = await http.get(test.customPath);
    } else {
      // 检查服务是否存在 - 根据EPS结构，test服务直接在根级别
      if (!service.test) {
        throw new Error('test服务不存在');
      }
      if (!service.test[test.method]) {
        throw new Error(`方法 ${test.method} 不存在`);
      }

      result = await service.test[test.method]();
    }

    const duration = Date.now() - startTime;

    test.duration = duration;
    test.result = result;
    test.success = true;

    message.success(`测试 ${test.name} 完成`);
  } catch (error: any) {
    const duration = Date.now() - startTime;


    test.duration = duration;
    test.result = {
      error: error.message,
      code: error.code || (error.response?.status),
      msg: error.response?.data?.msg || error.message,
      response: error.response?.data
    };
    test.error = true;

    // 对于404错误，显示特定的错误信息
    if (error.message === '请求的资源不存在' || error.response?.status === 404 || error.code === 404) {
      test.result.msg = '请求的资源不存在，请检查访问路径是否正确';
      test.result.code = 404;
    }

    // 对于业务错误（code: 200但包含错误消息），显示原始错误信息
    if (error.response?.data?.code === 200 && error.response?.data?.msg) {
      test.result.msg = error.response.data.msg;
      test.result.code = 200; // 显示原始的业务状态码
    }

    // 不显示错误消息，因为这是预期的错误测试
  } finally {
    test.loading = false;
  }
};

// 获取标签类型
const getTagType = (test: any) => {
  if (test.loading) return 'warning';
  if (test.success) return 'success';
  if (test.error) return 'danger';
  return 'info';
};


onMounted(() => {
  // 接口测试中心已加载
  // 生成测试用例
  testCases.value = generateTestCases();
});
</script>

<style scoped>
.api-test-center {
}

.search-input {
  width: 300px;
}

.test-table {
  margin-top: 20px;
}

</style>
