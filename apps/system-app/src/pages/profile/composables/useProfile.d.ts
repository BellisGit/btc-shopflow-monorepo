/**
 * 个人信息页面业务逻辑
 */
/**
 * 个人信息 composable
 */
export declare function useProfile(): {
    userInfo: globalThis.Ref<any, any>;
    loading: globalThis.Ref<boolean, boolean>;
    showFullInfo: globalThis.Ref<boolean, boolean>;
    loadUserInfo: (showFull?: boolean) => Promise<void>;
    handleToggleShowFull: () => void;
};
