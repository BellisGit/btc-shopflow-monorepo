import type { Ref } from 'vue';
interface FieldSubmitContext {
    userInfo: Ref<any>;
}
interface SubmitResult {
    success: boolean;
    message?: string;
}
export declare function submitFieldUpdate(field: string, data: any, context: FieldSubmitContext): Promise<SubmitResult>;
export {};
