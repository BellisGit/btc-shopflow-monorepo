import type { ViewGroupOptions, ViewGroupItem } from '../types';
export declare function useViewGroupActions(config: ViewGroupOptions, tree: any, list: any, selected: any, isMobile: any, isExpand: any, refresh: any, treeRef?: any): {
    getItemId: (item: any) => any;
    expand: (value?: boolean) => void;
    select: (data?: ViewGroupItem) => void;
    edit: (item?: ViewGroupItem) => void;
    remove: (item: ViewGroupItem) => void;
};

