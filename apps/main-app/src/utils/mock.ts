/**
 * Mock 数据服务
 * 用于模拟后端API，数据存储在 localStorage
 */

export interface MockConfig<T = any> {
  storageKey: string;
  defaultData?: T[];
  idField?: string;
}

/**
 * 创建 Mock CRUD 服务
 */
export function createMockCrudService<T extends Record<string, any>>(
  storageKey: string,
  config: Partial<MockConfig<T>> = {}
) {
  const { defaultData = [], idField = 'id' } = config;

  // 初始化数据
  const initData = () => {
    const existing = localStorage.getItem(storageKey);
    if (!existing && defaultData.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(defaultData));
    }
  };

  // 获取所有数据
  const getData = (): T[] => {
    initData();
    const data = localStorage.getItem(storageKey);
    return data ? JSON.parse(data) : [];
  };

  // 保存数据
  const saveData = (data: T[]) => {
    localStorage.setItem(storageKey, JSON.stringify(data));
  };

  // 生成新ID
  const generateId = (): number => {
    const data = getData();
    if (data.length === 0) return 1;
    const maxId = Math.max(...data.map(item => Number(item[idField]) || 0));
    return maxId + 1;
  };

  return {
    // 分页查询
    page: async (params: { page: number; size: number; [key: string]: any }) => {
      await delay(300); // 模拟网络延迟

      let data = getData();

      // 简单的关键字搜索
      if (params.keyword) {
        const keyword = String(params.keyword).toLowerCase();
        data = data.filter(item =>
          Object.values(item).some(val =>
            String(val).toLowerCase().includes(keyword)
          )
        );
      }

      // 分页
      const start = (params.page - 1) * params.size;
      const end = start + params.size;
      const list = data.slice(start, end);

      return {
        list,
        total: data.length,
        page: params.page,
        size: params.size,
      };
    },

    // 新增
    add: async (data: Partial<T>) => {
      await delay(300);

      const allData = getData();
      const newItem = {
        ...data,
        [idField]: generateId(),
        createTime: new Date().toISOString(),
      } as T;

      allData.push(newItem);
      saveData(allData);

      return newItem;
    },

    // 更新
    update: async (data: T) => {
      await delay(300);

      const allData = getData();
      const index = allData.findIndex(item => item[idField] === data[idField]);

      if (index === -1) {
        throw new Error('数据不存在');
      }

      allData[index] = {
        ...allData[index],
        ...data,
        updateTime: new Date().toISOString(),
      };

      saveData(allData);
      return allData[index];
    },

    // 删除
    delete: async ({ ids }: { ids: (string | number)[] }) => {
      await delay(300);

      const allData = getData();
      const filtered = allData.filter(item => !ids.includes(item[idField]));
      saveData(filtered);

      return { success: true };
    },

    // 详情
    info: async (params: any) => {
      await delay(200);

      const allData = getData();
      const id = params[idField] || params.id;
      const item = allData.find(item => item[idField] === id);

      if (!item) {
        throw new Error('数据不存在');
      }

      return item;
    },

    // 获取所有数据（用于下拉列表等）
    list: async () => {
      await delay(200);
      return getData();
    },
  };
}

/**
 * 延迟函数
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 生成Mock数据辅助函数
 */
export const mockHelpers = {
  // 随机用户名
  randomName: () => {
    const surnames = ['张', '李', '王', '刘', '陈', '杨', '赵', '黄', '周', '吴'];
    const names = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军'];
    return surnames[Math.floor(Math.random() * surnames.length)] +
           names[Math.floor(Math.random() * names.length)];
  },

  // 随机日期
  randomDate: (start: Date = new Date(2020, 0, 1), end: Date = new Date()) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
  },

  // 随机选择
  randomChoice: <T>(arr: T[]): T => {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  // 随机布尔
  randomBoolean: () => Math.random() > 0.5,

  // 随机数字
  randomNumber: (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
};

