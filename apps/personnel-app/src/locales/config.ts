/**
 * 应用级国际化配置
 * 只包含基础的应用信息和菜单配置，作为父级模板
 * 详细的页面配置应该在页面级 config.ts 中
 */

import type { LocaleConfig } from '../../../../types/locale';

export default {
  'zh-CN': {
    app: {
      name: '人事管理系统',
      title: '人事管理系统',
      description: '员工管理、考勤管理、薪资管理',
      version: '版本 1.0.0',
      welcome: '欢迎使用人事管理系统',
      slogan: '拜里斯：智慧验币・安全储存，因你而精彩！',
      loading: {
        title: '正在加载资源',
        subtitle: '部分资源可能加载时间较长，请耐心等待',
      },
    },
    menu: {
      personnel: {
        overview: '人事概览',
        employee: '员工管理',
        attendance: '考勤管理',
        salary: '薪资管理',
      },
    },
  },
  'en-US': {
    app: {
      name: 'Personnel Management System',
      title: 'Personnel Management System',
      description: 'Employee management, attendance management, salary management',
      version: 'Version 1.0.0',
      welcome: 'Welcome to Personnel Management System',
      slogan: 'Bellis Technology: Intelligent Currency Verification, Secure Storage, Brilliance with You!',
      loading: {
        title: 'Loading resources',
        subtitle: 'Some resources may take longer to load, please wait patiently',
      },
    },
    menu: {
      personnel: {
        overview: 'Personnel Overview',
        employee: 'Employee Management',
        attendance: 'Attendance Management',
        salary: 'Salary Management',
      },
    },
    page: {
      // 应用级页面配置（可选）
    },
  },
} satisfies LocaleConfig;
