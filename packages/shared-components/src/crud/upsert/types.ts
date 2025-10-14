import type { Component } from 'vue';
import type { UseCrudReturn } from '@btc/shared-core';

/**
 * 表单项配置（对齐 cool-admin）
 */
export interface FormItem {
  prop: string;
  label: string;
  component?: {
    name: string | Component;
    props?: Record<string, any>;
    options?: any[];
  };
  rules?: any | any[];
  required?: boolean;
  span?: number;
  value?: any;  // 默认值
  hidden?: boolean | ((data: { scope: any; mode: string }) => boolean); // 动态隐藏
  hook?: any; // form-hook 转换
  _hidden?: boolean; // 内部使用
  [key: string]: any;
}

/**
 * 插件配置
 */
export interface UpsertPlugin {
  name: string;
  value?: any;
  created?: (options: any) => void;
  onOpen?: () => void | Promise<void>;
  onSubmit?: (data: any) => any | Promise<any>;
  onClose?: (done: Function) => void;
}

/**
 * Props 配置
 */
export interface UpsertProps {
  items?: FormItem[] | (() => FormItem)[]; // 支持函数返回

  // Dialog 配置
  width?: string | number;
  padding?: string;
  dialogProps?: Record<string, any>;

  // Form 配置
  labelWidth?: string | number;
  labelPosition?: 'left' | 'right' | 'top';
  formProps?: Record<string, any>;
  gutter?: number;

  // 文本
  addTitle?: string;
  editTitle?: string;
  infoTitle?: string; // 详情标题
  submitText?: string;
  cancelText?: string;

  // 高级参数（对标 cl-upsert）
  sync?: boolean; // 编辑时是否同步打开弹窗（先显示弹窗再加载数据）
  plugins?: UpsertPlugin[]; // 插件系统
  enablePlugin?: boolean; // 是否启用插件

  // 生命周期钩子（对标 cl-upsert）
  onOpen?: () => void;  // 打开时（无数据）
  onInfo?: (data: any, event: { next: (params?: any) => Promise<any>; done: (data: any) => void }) => Promise<void> | void; // 获取详情
  onOpened?: (data: any) => void; // 打开后（有数据）
  onSubmit?: (data: any, event: { close: () => void; done: () => void; next: (data: any) => Promise<any> }) => Promise<void> | void; // 提交
  onClose?: (action: 'close' | 'save', done: () => void) => void; // 关闭前
  onClosed?: () => void; // 关闭后
}

/**
 * 表单模式
 */
export type UpsertMode = 'add' | 'update' | 'info';

/**
 * 表单数据上下文
 */
export interface FormDataContext {
  formRef: any;
  formData: any;
  mode: any;
  computedItems: any;
  formRules: any;
  loadingData: any;
  submitting: any;
}

/**
 * CRUD 上下文
 */
export interface CrudContext {
  crud: UseCrudReturn<any>;
}

