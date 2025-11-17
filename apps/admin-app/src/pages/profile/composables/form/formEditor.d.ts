import type { Ref } from 'vue';
interface FormEditorOptions {
    Form: Ref<any>;
    formItems: Ref<any[]>;
    userInfo: Ref<any>;
    showFullInfo: Ref<boolean>;
    loadUserInfo: (showFull: boolean) => Promise<void>;
    resetEmailUpdateCountdown: () => void;
}
export declare function useFormEditor({ Form, formItems, userInfo, showFullInfo, loadUserInfo, resetEmailUpdateCountdown }: FormEditorOptions): {
    handleEdit: () => Promise<void>;
};
export {};
