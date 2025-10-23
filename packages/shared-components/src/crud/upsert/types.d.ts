import type { Component } from 'vue';
import type { UseCrudReturn } from '@btc/shared-core';
/**
 * 琛ㄥ崟椤归厤缃紙瀵归綈 cool-admin锛? */
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
  value?: any;
  hidden?: boolean | ((data: { scope: any; mode: string }) => boolean);
  hook?: any;
  _hidden?: boolean;
  [key: string]: any;
}
/**
 * 鎻掍欢閰嶇疆
 */
export interface UpsertPlugin {
  name: string;
  value?: any;
  created?: (options: any) => void;
  onOpen?: () => void | Promise<void>;
  onSubmit?: (data: any) => any | Promise<any>;
  onClose?: (done: () => void) => void;
}
/**
 * Props 閰嶇疆
 */
export interface UpsertProps {
  items?: FormItem[] | (() => FormItem)[];
  width?: string | number;
  padding?: string;
  dialogProps?: Record<string, any>;
  labelWidth?: string | number;
  labelPosition?: 'left' | 'right' | 'top';
  formProps?: Record<string, any>;
  gutter?: number;
  addTitle?: string;
  editTitle?: string;
  infoTitle?: string;
  submitText?: string;
  cancelText?: string;
  sync?: boolean;
  plugins?: UpsertPlugin[];
  enablePlugin?: boolean;
  onOpen?: () => void;
  onInfo?: (
    data: any,
    event: {
      next: (params?: any) => Promise<any>;
      done: (data: any) => void;
    }
  ) => Promise<void> | void;
  onOpened?: (data: any) => void;
  onSubmit?: (
    data: any,
    event: {
      close: () => void;
      done: () => void;
      next: (data: any) => Promise<any>;
    }
  ) => Promise<void> | void;
  onClose?: (action: 'close' | 'save', done: () => void) => void;
  onClosed?: () => void;
}
/**
 * 琛ㄥ崟妯″紡
 */
export type UpsertMode = 'add' | 'update' | 'info';
/**
 * 琛ㄥ崟鏁版嵁涓婁笅鏂? */
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
 * CRUD 涓婁笅鏂? */
export interface CrudContext {
  crud: UseCrudReturn<any>;
}

