/**
 * ViewGroup 数据管理 Hook
 */
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import type { ViewGroupOptions, ViewGroupItem } from '../types';

export function useViewGroupData(config: ViewGroupOptions, tree: any, isCustom: boolean, selectFn?: (item?: ViewGroupItem) => void) {
  const loading = ref(false);
  const keyWord = ref('');
  const list = ref<ViewGroupItem[]>([]);
  const selected = ref<ViewGroupItem>();
  const loaded = ref(false);

  // 请求参数
  const reqParams = reactive({
    order: 'createTime',
    sort: 'asc',
    page: 1,
    size: 50,
  });

  // 刷新
  async function refresh(params?: any) {
    if (isCustom) {
      return false;
    }

    Object.assign(reqParams, params);

    loading.value = true;

    const data = {
      ...reqParams,
      ...config.data,
      keyWord: keyWord.value
    };

    let req: Promise<void>;

    if (tree.visible) {
      // 树形数据
      req = config.service.list(data).then((res: any) => {
        list.value = res;
      });
    } else {
      // 列表数据
      req = config.service.page(data).then((res: any) => {
        const arr = config.onData?.(res.list) || res.list;

        if (reqParams.page === 1) {
          list.value = arr;
        } else {
          list.value.push(...arr);
        }

        // 兼容不同的响应格式
        const total = res.pagination?.total ?? res.total ?? 0;
        loaded.value = total <= list.value.length;
      });
    }

    await req
      .then(() => {
        // 自动选中第一项（如果当前没有选中项）
        const item = selected.value || list.value[0];
        if (item && selectFn) {
          selectFn(item);
        }
      })
      .catch((err: Error) => {
        ElMessage.error(err.message);
      });

    loading.value = false;
  }

  // 加载更多
  function onMore() {
    refresh({
      page: reqParams.page + 1
    });
  }

  return {
    loading,
    keyWord,
    list,
    selected,
    loaded,
    reqParams,
    refresh,
    onMore,
  };
}

