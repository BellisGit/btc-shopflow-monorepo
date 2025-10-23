import type { ViewGroupOptions, ViewGroupItem } from '../types';
export declare function useViewGroupMenu(config: ViewGroupOptions, tree: any): {
    onContextMenu: (e: MouseEvent, item: ViewGroupItem) => false | undefined;
    onTreeContextMenu: (e: MouseEvent, data: any) => false | undefined;
};

