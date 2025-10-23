/**
 * CRUD Composable 绫诲瀷瀹氫箟
 */
/**
 * CRUD 鏈嶅姟鎺ュ彛
 */
export interface CrudService<T = Record<string, unknown>> {
    page(params: Record<string, unknown>): Promise<{
        list: T[];
        total: number;
    }>;
    add(data: Partial<T>): Promise<T>;
    update(data: Partial<T>): Promise<T>;
    delete(params: {
        ids: (number | string)[];
    }): Promise<void>;
    info?(params: any): Promise<T>;
}
/**
 * CRUD 閰嶇疆閫夐」
 */
export interface CrudOptions<T = Record<string, unknown>> {
    service: CrudService<T>;
    onLoad?: () => void;
    onSuccess?: (message: string) => void;
    onError?: (error: unknown) => void;
    onBeforeRefresh?: (params: Record<string, unknown>) => Record<string, unknown> | void;
    onAfterRefresh?: (data: {
        list: T[];
        total: number;
    }) => void;
    onBeforeDelete?: (rows: T[]) => boolean | Promise<boolean>;
    onAfterDelete?: () => void;
}
/**
 * 鍒嗛〉閰嶇疆
 */
export interface PaginationConfig {
    page: number;
    size: number;
    total: number;
}
/**
 * useCrud 杩斿洖绫诲瀷
 */
export interface UseCrudReturn<T> {
    tableData: import('vue').Ref<T[]>;
    loading: import('vue').Ref<boolean>;
    pagination: PaginationConfig;
    searchParams: import('vue').Ref<Record<string, unknown>>;
    selection: import('vue').Ref<T[]>;
    upsertVisible: import('vue').Ref<boolean>;
    currentRow: import('vue').Ref<T | null>;
    upsertMode: import('vue').Ref<'add' | 'update' | 'info'>;
    viewVisible: import('vue').Ref<boolean>;
    viewRow: import('vue').Ref<T | null>;
    service: CrudService;
    loadData: () => Promise<void>;
    handleSearch: (params: Record<string, unknown>) => void;
    handleReset: () => void;
    handleRefresh: () => void;
    handleAdd: () => void;
    handleEdit: (row: T) => void;
    handleInfo: (row: T) => void;
    handleAppend: (row?: T) => void;
    handleView: (row: T) => void;
    handleViewClose: () => void;
    closeDialog: () => void;
    handleDelete: (row: T & {
        id: number | string;
    }) => Promise<void>;
    handleMultiDelete: () => Promise<void>;
    handleSelectionChange: (rows: T[]) => void;
    clearSelection: () => void;
    toggleSelection: (row: T, selected?: boolean) => void;
    handlePageChange: (page: number) => void;
    handleSizeChange: (size: number) => void;
    getParams: () => Record<string, unknown>;
    setParams: (params: Record<string, unknown>) => void;
}


