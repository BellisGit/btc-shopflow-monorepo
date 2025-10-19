import type { UseCrudReturn } from '@btc/shared-core';
import type { UpsertProps } from '../types';
/**
 * 表单初始化逻辑
 */
export declare function useFormInit(props: UpsertProps, crud: UseCrudReturn<any>, formDataContext: any, pluginContext: any): {
    initFormData: () => Promise<void>;
    bindFormData: () => void;
    append: (data: any) => Promise<void>;
};
