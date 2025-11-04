// @btc/shared-components 入口文件

// 导入全局样式
import './styles/index.scss';

// 初始化全局事件系统
import './utils/resize';

// 通用组件
import BtcButton from './common/button/index.vue';
import BtcSvg from './common/svg/index.vue';
import BtcDialog from './common/dialog/index.vue';
import BtcViewGroup from './common/view-group/index.vue';
import BtcForm from './common/form/index.vue';
import BtcFormCard from './common/form/components/form-card.vue';
import BtcFormTabs from './common/form/components/form-tabs.vue';
import BtcSelectButton from './common/select-button/index.vue';
import BtcContainer from './common/container/index.vue';
import BtcGridGroup from './common/grid-group/index.vue';
import BtcSearch from './common/search/index.vue';
// 插件系统
import * as ExcelPlugin from './plugins/excel';
import * as CodePlugin from './plugins/code';
import BtcMasterList from './components/btc-master-list/index.vue';
import BtcCard from './components/btc-card/index.vue';
import BtcTabs from './components/btc-tabs/index.vue';
import BtcViewsTabsGroup from './components/btc-views-tabs-group/index.vue';
import BtcCascader from './components/btc-cascader/index.vue';
import BtcTableGroup from './components/btc-table-group/index.vue';
import BtcColorPicker from './components/btc-color-picker/index.vue';

// 新的消息和通知组件
import { BtcMessage } from './components/btc-message';
import { BtcNotification } from './components/btc-notification';

// 导入样式
import './common/dialog/styles/index.scss';
import './common/form/style.scss';
import './components/btc-message/styles.scss';
import './components/btc-notification/styles.scss';

// CRUD 组件（上下文系统）
import BtcCrud from './crud/context/index.vue';
import BtcTable from './crud/table/index.vue';
// BtcUpsert 组件单独导出，避免循环依赖
import BtcUpsert from './crud/upsert/index.vue';
import BtcPagination from './crud/pagination/index.vue';
import BtcAddBtn from './crud/add-btn/index.vue';
import BtcRefreshBtn from './crud/refresh-btn/index.vue';
import BtcMultiDeleteBtn from './crud/multi-delete-btn/index.vue';
import BtcRow from './crud/row/index.vue';
import BtcFlex1 from './crud/flex1/index.vue';
import BtcSearchKey from './crud/search-key/index.vue';
// 导入导出组件已移动到 excel 插件
import BtcMenuExp from './crud/menu-exp/index.vue';

// 图表组件
export * from './charts';

// 导出语言包供应用使用
export { default as sharedLocalesZhCN } from './locales/zh-CN.json';
export { default as sharedLocalesEnUS } from './locales/en-US.json';

export {
  // 通用
  BtcButton,
  BtcSvg,
  BtcDialog,
  BtcViewGroup,
  BtcForm,
  BtcFormCard,
  BtcFormTabs,
  BtcSelectButton,
  BtcContainer,
  BtcGridGroup,
  BtcSearch,
  // 代码展示组件已移动到 code 插件
  BtcMasterList,
  BtcCard,
  BtcTabs,
  BtcViewsTabsGroup,
  BtcCascader,
  BtcTableGroup,
  BtcColorPicker,

  // 新的消息和通知 API
  BtcMessage,
  BtcNotification,

  // CRUD 系统
  BtcCrud,
  BtcTable,
  BtcUpsert,
  BtcPagination,
  BtcAddBtn,
  BtcRefreshBtn,
  BtcMultiDeleteBtn,
  BtcRow,
  BtcFlex1,
  BtcSearchKey,
  // 导入导出组件已移动到 excel 插件
  BtcMenuExp,
};

// 导出插件
export { ExcelPlugin, CodePlugin };

// 为了向后兼容，直接导出插件中的组件
export const { BtcExportBtn, BtcImportBtn } = ExcelPlugin;
export const { BtcCodeJson } = CodePlugin;

// 导出工具函数
export { CommonColumns } from './crud/table/utils/common-columns';

// 导出类型
export type { TableColumn, OpButton } from './crud/table/types';
export type { FormItem, UpsertPlugin, UpsertProps } from './crud/upsert/types';
export type { DialogProps } from './common/dialog/types';
export type { BtcFormItem, BtcFormConfig, BtcFormProps } from './common/form/types';
export type { BtcViewsTabsGroupConfig, TabViewConfig } from './components/btc-views-tabs-group/types';
export type { TableGroupProps, TableGroupEmits, TableGroupExpose } from './components/btc-table-group/types';
export type { BtcContainerProps } from './common/container/types';
export type { BtcGridGroupProps } from './common/grid-group/types';
