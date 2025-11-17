export type LoginMode = 'password' | 'sms' | 'qr';
export declare function useAuthTabs(initialMode?: LoginMode): {
    currentLoginMode: globalThis.Ref<LoginMode, LoginMode>;
    isQrMode: globalThis.Ref<boolean, boolean>;
    switchLoginMode: (mode: LoginMode) => void;
    toggleQrLogin: () => void;
    getToggleInfo: () => {
        icon: "pc";
        label: string;
    } | {
        icon: "qr";
        label: string;
    };
};
