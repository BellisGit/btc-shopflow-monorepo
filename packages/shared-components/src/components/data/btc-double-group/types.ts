import type { TableColumn } from '../../../crud/table/types';
import type { FormItem } from '../../../crud/upsert/types';

type CrudOp = {
  buttons?: any[];
};

type ServiceLike = {
  list?: (params?: any) => Promise<any>;
  page?: (params?: any) => Promise<any>;
};

export interface DoubleGroupProps {
  primaryService: {
    list: (params?: any) => Promise<any[]>;
  };
  secondaryService: ServiceLike;
  rightService: any;
  tableColumns?: TableColumn[];
  formItems?: FormItem[];
  primaryTitle?: string;
  secondaryTitle?: string;
  rightTitle?: string;
  showPrimaryUnassigned?: boolean;
  showSecondaryUnassigned?: boolean;
  primaryUnassignedLabel?: string;
  secondaryUnassignedLabel?: string;
  enablePrimarySearch?: boolean;
  enableSecondarySearch?: boolean;
  secondaryFilterKey?: string;
  primaryIdField?: string;
  leftColumnWidth?: number;
  columnGap?: number;
  upsertWidth?: number | string;
  searchPlaceholder?: string;
  showAddBtn?: boolean;
  showMultiDeleteBtn?: boolean;
  showSearchKey?: boolean;
  showToolbar?: boolean;
  showCreateTime?: boolean;
  showUpdateTime?: boolean;
  op?: CrudOp;
  resolveSecondaryParams?: (primary: any, params?: any) => Record<string, any>;
  secondaryKeywordStrategy?: 'inherit' | 'override' | 'ignore';
}

export interface DoubleGroupExpose {
  refresh: (params?: any) => Promise<void>;
  crudRef: any;
  primaryListRef: any;
  secondaryListRef: any;
}

export interface DoubleGroupEmits {
  (e: 'primary-select', item: any, keyword?: any): void;
  (e: 'secondary-select', item: any, keyword?: any): void;
  (e: 'select', item: any, keyword?: any): void;
  (e: 'form-submit', data: any, event: any): void;
  (e: 'refresh', params?: any): void;
  (e: 'load', data: any[]): void;
}

