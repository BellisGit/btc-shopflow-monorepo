/**
 * 用于测试的 EPS Mock 数据
 */
export declare const mockEpsData: {
    user: {
        path: string;
        method: string;
        name: string;
        summary: string;
    }[];
    order: {
        path: string;
        method: string;
        name: string;
        summary: string;
    }[];
    product: {
        path: string;
        method: string;
        name: string;
        summary: string;
    }[];
};
/**
 * 模拟 EPS API 响应
 */
export declare function createMockEpsResponse(): {
    code: number;
    data: {
        user: {
            path: string;
            method: string;
            name: string;
            summary: string;
        }[];
        order: {
            path: string;
            method: string;
            name: string;
            summary: string;
        }[];
        product: {
            path: string;
            method: string;
            name: string;
            summary: string;
        }[];
    };
    message: string;
};
