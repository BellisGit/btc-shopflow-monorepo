import type { ViewGroupOptions } from '../types';
export declare function useViewGroupDrag(config: ViewGroupOptions, list: any, refresh: any): {
    isDrag: globalThis.Ref<boolean, boolean>;
    treeOrder: (confirm: boolean) => void;
    handleDrop: (draggingNode: any, dropNode: any, dropType: string) => void;
};
