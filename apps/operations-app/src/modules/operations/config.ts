/**
 * 运维模块配置
 */

import type { ModuleConfig } from '@btc/shared-core/types/module';

export default {
  // ModuleConfig 字段
  name: 'operations',
  label: 'common.module.operations.label',
  order: 100,

  // 路由配置
  views: [
    {
      path: '/',
      name: 'Home',
      component: () => import('./views/Home.vue'),
      meta: {
        isHome: true,
        titleKey: 'menu.operations.overview',
        tabLabelKey: 'menu.operations.overview',
        isPage: true,
      },
    },
    {
      path: '/ops/error',
      name: 'ErrorMonitor',
      component: () => import('./views/ErrorMonitor.vue'),
      meta: {
        isHome: false,
        titleKey: 'menu.operations.error',
        tabLabelKey: 'menu.operations.error',
        isPage: true,
      },
    },
    {
      path: '/ops/deployment-test',
      name: 'DeploymentTest',
      component: () => import('./views/DeploymentTest.vue'),
      meta: {
        isHome: false,
        titleKey: 'menu.operations.deploymentTest',
        tabLabelKey: 'menu.operations.deploymentTest',
        isPage: true,
      },
    },
  ],
  // 页面路由配置（pages 目录下的页面）
  pages: [
    {
      path: '/ops/log-query',
      name: 'LogQuery',
      component: () => import('@/pages/log-query/index.vue'),
      meta: {
        isHome: false,
        titleKey: 'menu.log_query',
        tabLabelKey: 'menu.log_query',
        isPage: true,
      },
    },
    {
      path: '/ops/log-reporter-test',
      name: 'LogReporterTest',
      component: () => import('@/pages/log-reporter-test/index.vue'),
      meta: {
        isHome: false,
        titleKey: 'menu.log_reporter_test',
        tabLabelKey: 'menu.log_reporter_test',
        isPage: true,
      },
    },
  ],

  // PageConfig 字段（保留）
  locale: {
    'zh-CN': {
      // 菜单配置
      'menu.operations.name': '运维应用',
      'menu.operations.overview': '运维概览',
      'menu.operations.error': '错误监控',
      'menu.operations.deploymentTest': '部署测试',
      'menu.log_query': '日志查询',
      'menu.log_reporter_test': '日志上报测试',
      // 日志查询字段
      'log.query.fields.index': '序号',
      'log.query.fields.app_name': '应用名称',
      'log.query.fields.app_id': '应用ID',
      'log.query.fields.log_level': '级别',
      'log.query.fields.logger_name': '日志名称',
      'log.query.fields.message': '消息',
      'log.query.fields.timestamp': '时间',
      'log.query.fields.micro_app_name': '微应用',
      'log.query.fields.micro_app_type': '微应用类型',
      'log.query.fields.micro_app_instance_id': '实例ID',
      'log.query.fields.micro_app_lifecycle': '生命周期',
    },
    'en-US': {
      // 菜单配置
      'menu.operations.name': 'Operations App',
      'menu.operations.overview': 'Operations Overview',
      'menu.operations.error': 'Error Monitoring',
      'menu.operations.deploymentTest': 'Deployment Test',
      'menu.log_query': 'Log Query',
      'menu.log_reporter_test': 'Log Reporter Test',
      // 日志查询字段
      'log.query.fields.index': 'Index',
      'log.query.fields.app_name': 'App Name',
      'log.query.fields.app_id': 'App ID',
      'log.query.fields.log_level': 'Level',
      'log.query.fields.logger_name': 'Logger Name',
      'log.query.fields.message': 'Message',
      'log.query.fields.timestamp': 'Timestamp',
      'log.query.fields.micro_app_name': 'Micro App',
      'log.query.fields.micro_app_type': 'Micro App Type',
      'log.query.fields.micro_app_instance_id': 'Instance ID',
      'log.query.fields.micro_app_lifecycle': 'Lifecycle',
    },
  },

  columns: {},

  forms: {},

  service: {},
} satisfies ModuleConfig;
