// @btc/shared-components 入口文件

// 导入全局样式
import './styles/index.scss';

// 初始化全局事件系统
import './utils/resize';

// Basic 基础组件
import BtcButton from './components/basic/btc-button/index.vue';
import { BtcIconButton } from './components/basic/btc-icon-button';
import BtcAvatar from './components/btc-avatar/index.vue';
import BtcCard from './components/basic/btc-card/index.vue';

// Layout 布局组件
import BtcContainer from './components/layout/btc-container/index.vue';
import BtcGridGroup from './components/layout/btc-grid-group/index.vue';

// Navigation 导航组件
import BtcTabs from './components/navigation/btc-tabs/index.vue';
import BtcCascader from './components/navigation/btc-cascader/index.vue';

// Form 表单组件
import BtcForm from './common/form/index.vue';
import BtcFormCard from './common/form/components/form-card.vue';
import BtcFormTabs from './common/form/components/form-tabs.vue';
import BtcSelectButton from './components/form/btc-select-button/index.vue';
import BtcColorPicker from './components/form/btc-color-picker/index.vue';
import BtcUpload from './components/btc-upload/index.vue';

// Data 数据展示组件
import BtcMasterList from './components/data/btc-master-list/index.vue';
import BtcTableGroup from './components/data/btc-table-group/index.vue';
import BtcViewsTabsGroup from './components/data/btc-views-tabs-group/index.vue';

// Feedback 反馈组件
import BtcDialog from './common/dialog/index.vue';
import { BtcMessage } from './components/feedback/btc-message';
import { BtcNotification } from './components/feedback/btc-notification';

// Others 其他组件
import BtcSvg from './components/others/btc-svg/index.vue';
import BtcViewGroup from './common/view-group/index.vue';
import BtcSearch from './components/others/btc-search/index.vue';

// 插件系统
import * as ExcelPlugin from './plugins/excel';
import * as CodePlugin from './plugins/code';

// 导入样式
import './common/dialog/styles/index.scss';
import './common/form/style.scss';
import './components/feedback/btc-message/styles.scss';
import './components/feedback/btc-notification/styles.scss';
import './components/basic/btc-icon-button/index.scss';
import './components/btc-avatar/index.scss';

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
  BtcUpload,
  BtcIconButton,
  BtcAvatar,

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
export { useUpload } from './components/btc-upload/composables/useUpload';

// 导出类型
export type { TableColumn, OpButton } from './crud/table/types';
export type { FormItem, UpsertPlugin, UpsertProps } from './crud/upsert/types';
export type { DialogProps } from './common/dialog/types';
export type { BtcFormItem, BtcFormConfig, BtcFormProps } from './common/form/types';
export type { BtcViewsTabsGroupConfig, TabViewConfig } from './components/data/btc-views-tabs-group/types';
export type { TableGroupProps, TableGroupEmits, TableGroupExpose } from './components/data/btc-table-group/types';
export type { BtcContainerProps } from './components/layout/btc-container/types';
export type { BtcGridGroupProps } from './components/layout/btc-grid-group/types';
export type {
  IconButtonConfig,
  IconButtonDropdown,
  IconButtonDropdownItem,
  IconButtonPopover
} from './components/basic/btc-icon-button';
