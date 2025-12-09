export {
  // @ts-ignore TS6305 - 类型声明文件可能未构建，但运行时可用
  provideContentHeight,
  // @ts-ignore TS6305 - 类型声明文件可能未构建，但运行时可用
  useContentHeight,
} from '@btc/shared-components';

// 重新导出类型（直接定义，避免导入路径问题）
import type { Ref } from 'vue';

export interface ContentHeightContext {
  height: Ref<number>;
  register: (el: HTMLElement | null) => void;
  emit: () => void;
}


