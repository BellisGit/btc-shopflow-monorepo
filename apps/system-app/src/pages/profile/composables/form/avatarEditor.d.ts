import type { Ref } from 'vue';
interface AvatarEditorOptions {
    Form: Ref<any>;
    userInfo: Ref<any>;
    showFullInfo: Ref<boolean>;
    loadUserInfo: (showFull: boolean) => Promise<void>;
}
export declare function useAvatarEditor({ Form, userInfo, showFullInfo, loadUserInfo }: AvatarEditorOptions): {
    handleEditAvatar: () => Promise<void>;
};
export {};
