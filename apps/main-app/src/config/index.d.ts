/**
 * 全局配置文件
 * 参考：cool-admin-vue-8.x/src/config/index.ts
 */
export declare const isDev: boolean;
export declare const env: {
    MODE: string;
    DEV: boolean;
    PROD: boolean;
    SSR: boolean;
};
export declare const config: {
    app: {
        name: string;
        shortName: string;
        enName: string;
        version: string;
        logo: string;
        favicon: string;
        company: {
            name: string;
            fullName: string;
            fullNameCn: string;
            fullNameEn: string;
            website: string;
            sloganKey: string;
        };
        copyright: {
            year: number;
            text: string;
        };
        contact: {
            email: string;
            phone: string;
            address: string;
        };
        loading: {
            title: string;
            subTitle: string;
        };
        router: {
            mode: string;
            transition: string;
        };
        layout: {
            sidebarWidth: number;
            sidebarCollapseWidth: number;
            topbarHeight: number;
            tabbarHeight: number;
        };
    };
    api: {
        baseURL: any;
        timeout: number;
    };
    i18n: {
        locale: string;
        languages: {
            label: string;
            value: string;
        }[];
    };
    theme: {
        mode: string;
        primaryColor: string;
    };
    ignore: {
        NProgress: string[];
        token: string[];
    };
    microApp: {
        enabled: boolean;
        apps: {
            name: string;
            entry: string;
            activeRule: string;
        }[];
    };
};
export default config;
