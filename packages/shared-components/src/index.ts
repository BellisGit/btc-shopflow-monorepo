// @btc/shared-components 入口文件

// 导入全局样式
import './styles/index.scss';

// 初始化全局事件系统
import './utils/resize';

// 自动挂载 DevTools（拦截 Vue App 的 mount 方法）
import { setupAutoMountDevTools } from './utils/auto-mount-dev-tools';
setupAutoMountDevTools();

// 插件系统
import * as ExcelPlugin from './plugins/excel';
import * as CodePlugin from './plugins/code';

// 导入样式
import './common/dialog/styles/index.scss';
import './common/form/style.scss';
import './common/view-group/styles/index.scss'; // btc-view-group 样式（btc-table-group 依赖）
import './components/feedback/btc-message/styles.scss';
import './components/feedback/btc-notification/styles.scss';
import './components/basic/btc-icon-button/index.scss';
import './components/basic/btc-table-button/index.scss';
import './components/basic/btc-avatar/index.scss';

// 图表组件
export * from './charts';

// 导入图表组件样式（必须在导出后导入，确保样式被正确提取）
// 注意：由于 cssCodeSplit: false，所有 CSS 会被合并到一个 style.css 文件中
import './charts/line/basic/styles/index.scss';
import './charts/bar/basic/styles/index.scss';
import './charts/bar/horizontal/styles/index.scss';
import './charts/bar/dual-compare/styles/index.scss';
import './charts/pie/basic/styles/index.scss';
import './charts/pie/ring/styles/index.scss';
import './charts/radar/basic/styles/index.scss';
import './charts/scatter/basic/styles/index.scss';
import './charts/kline/basic/styles/index.scss';

// 导出语言包供应用使用
export { default as sharedLocalesZhCN } from './locales/zh-CN.json';
export { default as sharedLocalesEnUS } from './locales/en-US.json';

// Basic 基础组件
export { default as BtcButton } from './components/basic/btc-button/index.vue';
export { BtcIconButton } from './components/basic/btc-icon-button';
export { default as BtcTableButton } from './components/basic/btc-table-button/index.vue';
export { default as BtcAvatar } from './components/basic/btc-avatar';
export { default as BtcCard } from './components/basic/btc-card/index.vue';

// Layout 布局组件
export { default as BtcContainer } from './components/layout/btc-container/index.vue';
export { default as BtcGridGroup } from './components/layout/btc-grid-group/index.vue';
export { default as AppLayout } from './components/layout/app-layout/index.vue';
export { default as AppSkeleton } from './components/basic/app-skeleton/index.vue';

// Navigation 导航组件
export { default as BtcTabs } from './components/navigation/btc-tabs/index.vue';
export { default as BtcCascader } from './components/navigation/btc-cascader/index.vue';

// Form 表单组件
export { default as BtcForm } from './common/form/index.vue';
export { default as BtcFormCard } from './common/form/components/form-card.vue';
export { default as BtcFormTabs } from './common/form/components/form-tabs.vue';
export { default as BtcSelectButton } from './components/form/btc-select-button/index.vue';
export { default as BtcColorPicker } from './components/form/btc-color-picker/index.vue';
export { default as BtcUpload } from './components/form/btc-upload/index.vue';

// Data 数据展示组件
export { default as BtcMasterList } from './components/data/btc-master-list/index.vue';
export { default as BtcTableGroup } from './components/data/btc-table-group/index.vue';
export { default as BtcDoubleGroup } from './components/data/btc-double-group/index.vue';
export { default as BtcViewsTabsGroup } from './components/data/btc-views-tabs-group/index.vue';
export { default as BtcTransferPanel } from './components/data/btc-transfer-panel/index.vue';
export { default as BtcTransferDrawer } from './components/data/btc-transfer-drawer/index.vue';
export { default as BtcChartDemo } from './components/data/btc-chart-demo/index.vue';

// Process 流程组件
export { default as BtcProcessCountdown } from './components/process/btc-process-countdown/index.vue';
export { default as BtcProcessCard } from './components/process/btc-process-card/index.vue';

// Feedback 反馈组件
export { default as BtcDialog } from './common/dialog/index.vue';
export { BtcMessage } from './components/feedback/btc-message';
export { BtcNotification } from './components/feedback/btc-notification';
export { BtcIdentityVerify } from './components/feedback/btc-identity-verify';
export { BtcBindingDialog } from './components/feedback/btc-binding-dialog';
export { BtcMessageBox, BtcConfirm, BtcAlert, BtcPrompt } from './components/feedback/btc-message-box';

// Others 其他组件
export { default as BtcSvg } from './components/others/btc-svg/index.vue';
export { default as BtcViewGroup } from './common/view-group/index.vue';
export { default as BtcSearch } from './components/others/btc-search/index.vue';
export { default as BtcDevTools } from './components/others/btc-dev-tools/index.vue';
// 用户设置组件
export { BtcUserSettingDrawer } from './components/others/btc-user-setting';

// CRUD 组件（上下文系统）
export { default as BtcCrud } from './crud/context/index.vue';
export { IMPORT_FILENAME_KEY, IMPORT_FORBIDDEN_KEYWORDS_KEY } from './crud/btc-import-btn/keys';
export { default as BtcTable } from './crud/table/index.vue';
// BtcUpsert 组件单独导出，避免循环依赖
export { default as BtcUpsert } from './crud/upsert/index.vue';
export { default as BtcPagination } from './crud/pagination/index.vue';
export { default as BtcAddBtn } from './crud/add-btn/index.vue';
export { default as BtcRefreshBtn } from './crud/refresh-btn/index.vue';
export { default as BtcMultiDeleteBtn } from './crud/multi-delete-btn/index.vue';
export { default as BtcMultiUnbindBtn } from './crud/multi-unbind-btn/index.vue';
export { default as BtcBindTransferBtn } from './crud/bind-transfer-btn/index.vue';
export { default as BtcRow } from './crud/row/index.vue';
export { default as BtcFlex1 } from './crud/flex1/index.vue';
export { default as BtcSearchKey } from './crud/search-key/index.vue';
export { default as BtcCrudActions } from './crud/actions/index.vue';
export { default as BtcTableToolbar } from './crud/toolbar/inline.vue';
// 导入导出组件已移动到 excel 插件
export { default as BtcMenuExp } from './crud/menu-exp/index.vue';

// 导出插件
export { ExcelPlugin, CodePlugin };

// 为了向后兼容，直接导出插件中的组件
export const { BtcExportBtn, BtcImportBtn } = ExcelPlugin;
export const { BtcCodeJson } = CodePlugin;

// 导入导出套装组件
export { default as BtcImportExportGroup } from './crud/btc-import-export-group/index.vue';
export type { BtcImportExportGroupProps } from './crud/btc-import-export-group/types';

// 常量导出
export { DEFAULT_OPERATION_WIDTH } from './crud/context/layout';

// 导出工具函数
export { CommonColumns } from './crud/table/utils/common-columns';
export { useUpload } from './components/form/btc-upload/composables/useUpload';
export { addClass, removeClass } from './utils/dom';
export { provideContentHeight, useContentHeight, type ContentHeightContext } from './composables/content-height';
export { useBrowser } from './composables/useBrowser';
export { useUser, type UserInfo } from './composables/useUser';
export { useCurrentApp } from './composables/useCurrentApp';
export { useProcessStore, getCurrentAppFromPath, type ProcessItem } from './store/process';
export { registerMenus, clearMenus, clearMenusExcept, getMenusForApp, getMenuRegistry, type MenuItem } from './store/menuRegistry';
export { useFormRenderer } from './common/form/composables/useFormRenderer';
export { mountDevTools, unmountDevTools } from './utils/mount-dev-tools';
export { autoMountDevTools } from './utils/auto-mount-dev-tools';
export { default as mitt, globalMitt, Mitt } from './utils/mitt';
// 导出 app-layout 工具函数
export { setIsMainAppFn, getIsMainAppFn } from './components/layout/app-layout/utils';

// 导出用户设置相关的枚举类型（显式导出以避免moduleResolution: "bundler"解析问题）
export { MenuThemeEnum, SystemThemeEnum, MenuTypeEnum, ContainerWidthEnum, BoxStyleType } from './components/others/btc-user-setting/config/enums';

// 导出类型
export type { VerifyPhoneApi, VerifyEmailApi } from './components/feedback/btc-identity-verify/types';
export type { SaveBindingApi } from './components/feedback/btc-binding-dialog/types';
export type { TableColumn, OpButton, OpConfig } from './crud/table/types';
export type { FormItem, UpsertPlugin, UpsertProps } from './crud/upsert/types';
export type { DialogProps } from './common/dialog/types';
export type { BtcFormItem, BtcFormConfig, BtcFormProps } from './common/form/types';
export type { BtcViewsTabsGroupConfig, TabViewConfig } from './components/data/btc-views-tabs-group/types';
export type { TableGroupProps, TableGroupEmits, TableGroupExpose } from './components/data/btc-table-group/types';
export type { DoubleGroupProps, DoubleGroupEmits, DoubleGroupExpose } from './components/data/btc-double-group/types';
export type {
  TransferKey,
  TransferPanelProps,
  TransferPanelColumn,
  TransferPanelEmits,
  TransferPanelExpose,
  SelectedItemDisplay,
  TransferPanelChangePayload,
  TransferPanelRemovePayload,
} from './components/data/btc-transfer-panel/types';
export type { BtcContainerProps } from './components/layout/btc-container/types';
export type { BtcGridGroupProps } from './components/layout/btc-grid-group/types';
export type {
  IconButtonConfig,
  IconButtonDropdown,
  IconButtonDropdownItem,
  IconButtonPopover
} from './components/basic/btc-icon-button';
export type { BtcTableButtonConfig } from './components/basic/btc-table-button/types';
export type {
  ProcessManagementItem,
  ProcessPauseRecord
} from './components/process/types';
