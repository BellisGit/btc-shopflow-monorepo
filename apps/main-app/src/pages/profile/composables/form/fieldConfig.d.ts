import { type Ref } from 'vue';
import type { PhoneSmsState } from './phoneVerification';
interface FieldConfigContext {
    phoneUpdateSmsCodeState: PhoneSmsState;
    sendUpdateEmailCode: (email: string) => Promise<void>;
    emailUpdateCountdown: Ref<number>;
    emailUpdateSending: Ref<boolean>;
}
interface FieldItemConfig {
    prop: string;
    label: string;
    span: number;
    required?: boolean;
    component: Record<string, any>;
    rules?: any[];
}
interface FieldConfigResult {
    label: string;
    items: FieldItemConfig[];
}
export declare function resolveFieldConfig(field: string, context: FieldConfigContext): FieldConfigResult | null;
export type FieldConfig = FieldConfigResult;
export {};
