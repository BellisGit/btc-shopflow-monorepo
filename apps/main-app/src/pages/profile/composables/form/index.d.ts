import type { Ref } from 'vue';
export declare function useProfileForm(userInfo: Ref<any>, showFullInfo: Ref<boolean>, loadUserInfo: (showFull: boolean) => Promise<void>, onRequestVerify?: (field: string) => void, onSetVerifyCallback?: (callback: () => void) => void): {
    Form: any;
    formItems: any;
    handleEdit: any;
    handleEditField: any;
    handleBindField: any;
    handleEditAvatar: any;
};
