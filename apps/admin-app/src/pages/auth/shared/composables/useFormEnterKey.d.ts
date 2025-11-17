/**
 * 表单 Enter 键处理 Composable
 * 提供通用的 Enter 键处理逻辑：
 * - 按 Enter 键时聚焦下一个表单项
 * - 如果是最后一个表单项，则提交表单
 */
import { type Ref } from 'vue';
import type { FormInstance } from 'element-plus';
export interface UseFormEnterKeyOptions {
    /**
     * 表单实例引用
     */
    formRef: Ref<FormInstance | undefined>;
    /**
     * 提交表单的回调函数
     */
    onSubmit: () => void | Promise<void>;
    /**
     * 自定义输入元素选择器（默认查找所有可聚焦的输入元素）
     */
    inputSelector?: string;
    /**
     * 是否跳过禁用的输入框（默认：true）
     */
    skipDisabled?: boolean;
}
/**
 * 表单 Enter 键处理 Composable
 * @param options 配置选项
 * @returns 处理 Enter 键的方法
 */
export declare function useFormEnterKey(options: UseFormEnterKeyOptions): {
    handleEnterKey: (event: KeyboardEvent, currentElement?: HTMLElement) => Promise<void>;
    getInputElements: () => HTMLElement[];
};
