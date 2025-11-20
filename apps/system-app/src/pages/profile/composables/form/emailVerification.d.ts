export declare function useEmailVerification(): {
    emailUpdateCountdown: globalThis.Ref<number, number>;
    emailUpdateSending: globalThis.Ref<boolean, boolean>;
    sendUpdateEmailCode: (email: string) => Promise<void>;
    resetEmailUpdateCountdown: () => void;
};
