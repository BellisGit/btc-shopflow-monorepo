/**
 * 财务应用级国际化配置
 * 只包含基础的应用信息和菜单配置，作为父级模板
 * 详细的页面配置应该在页面级 config.ts 中
 */

import type { LocaleConfig } from '../../../../types/locale';

export default {
  'zh-CN': {
    app: {
      name: '财务管理系统',
      title: '财务管理系统',
      description: '财务管理、会计核算、成本控制',
      version: '版本 1.0.0',
      welcome: '欢迎使用财务管理系统',
    },
    menu: {
      finance: {
        inventory_management: '盘点管理',
        inventory_management_result: '盘点结果',
        home: '财务首页',
        overview: '财务概览',
        payables: '应付账款',
        receivables: '应收账款',
        reports: '财务报表',
      },
    },
    page: {
      finance: {
        home: {
          todo: {
            title: '今日待办（{date}）',
            subtitle: '关注今日关键任务，合理安排财务审核与核算工作。',
            searchPlaceholder: '按事项或责任人搜索',
            columns: {
              task: '事项',
              owner: '责任人',
              priority: '优先级',
              status: '状态',
              time: '截止时间',
            },
            items: {
              invoice: '处理待审核发票并录入系统',
              reconciliation: '完成银行对账并处理差异',
              report: '完成月度财务报表审核',
              budget: '审核部门预算申请并反馈意见',
              review: '审核成本核算数据并输出报告',
            },
            priority: {
              high: '高',
              medium: '中',
              low: '低',
            },
            status: {
              pending: '待处理',
              in_progress: '进行中',
              done: '已完成',
            },
          },
        },
        inventory: {
          result: {
            detail: {
              title: '盘点结果详情',
            },
            fields: {
              material_code: '物料编码',
              position: '仓位',
              unit_cost: '单位成本',
              book_qty: '账面数量',
              actual_qty: '实际数量',
              diff_qty: '差异数量',
              variance_cost: '差异金额',
            },
            search_placeholder: '搜索盘点结果',
          },
        },
        placeholder: {
          inventory_management: '盘点管理页面内容待建设',
        },
      },
      inventory: {
        check: {
          list: '盘点列表',
        },
      },
    },
    common: {
      // 错误消息
      error: {
        render_failed: '渲染失败',
        unmount_failed: '卸载失败',
        unmount_previous_failed: '卸载前一个实例失败',
        cannot_display_loading: '无法显示应用级 loading',
        load_shared_resources_failed: '加载共享资源失败，继续使用本地资源',
        load_shared_resources_progress: '加载共享资源进度',
        mount_failed: '挂载到 layout-app 失败',
        mount_success: '成功挂载到 layout-app',
        viewport_found: '找到 #subapp-viewport，准备挂载',
        viewport_timeout: '等待 #subapp-viewport 超时，尝试独立渲染',
        diagnostic_info: '诊断信息',
        standalone_failed: '独立运行失败',
        init_layout_app_failed: '初始化 layout-app 失败',
        import_init_layout_app_failed: '导入 init-layout-app 失败',
      },
      // 系统相关
      system: {
        finance_module: '财务模块',
      },
      // 盘点模块相关
      inventory: {
        result: {
          fields: {
            material_code: '物料编码',
            position: '仓位',
            unit_cost: '单位成本',
            book_qty: '账面数量',
            actual_qty: '实际数量',
            diff_qty: '差异数量',
            variance_cost: '差异金额',
          },
        },
      },
    },
  },
  'en-US': {
    app: {
      name: 'Finance Management System',
      title: 'Finance Management System',
      description: 'Finance management, accounting, cost control',
      version: 'Version 1.0.0',
      welcome: 'Welcome to Finance Management System',
    },
    menu: {
      finance: {
        inventory_management: 'Inventory Management',
        inventory_management_result: 'Inventory Result',
        home: 'Finance Home',
        overview: 'Finance Overview',
        payables: 'Payables',
        receivables: 'Receivables',
        reports: 'Financial Reports',
      },
    },
    page: {
      finance: {
        home: {
          todo: {
            title: "Today's Tasks ({date})",
            subtitle: "Keep an eye on today's priorities for finance review and accounting work.",
            searchPlaceholder: 'Search by task or owner',
            columns: {
              task: 'Task',
              owner: 'Owner',
              priority: 'Priority',
              status: 'Status',
              time: 'Due Time',
            },
            items: {
              invoice: 'Process pending invoices and enter into system',
              reconciliation: 'Complete bank reconciliation and handle discrepancies',
              report: 'Complete monthly financial report review',
              budget: 'Review department budget requests and provide feedback',
              review: 'Review cost accounting data and prepare summary',
            },
            priority: {
              high: 'High',
              medium: 'Medium',
              low: 'Low',
            },
            status: {
              pending: 'Pending',
              in_progress: 'In Progress',
              done: 'Done',
            },
          },
        },
        inventory: {
          result: {
            detail: {
              title: 'Inventory Result Details',
            },
            fields: {
              material_code: 'Material Code',
              position: 'Position',
              unit_cost: 'Unit Cost',
              book_qty: 'Book Quantity',
              actual_qty: 'Actual Quantity',
              diff_qty: 'Difference Quantity',
              variance_cost: 'Variance Cost',
            },
            search_placeholder: 'Search inventory results',
          },
        },
        placeholder: {
          inventory_management: 'Inventory management page is under construction',
        },
      },
      inventory: {
        check: {
          list: 'Check List',
        },
      },
    },
    common: {
      // 错误消息
      error: {
        render_failed: 'Render failed',
        unmount_failed: 'Unmount failed',
        unmount_previous_failed: 'Failed to unmount previous instance',
        cannot_display_loading: 'Cannot display app-level loading',
        load_shared_resources_failed: 'Failed to load shared resources, continue using local resources',
        load_shared_resources_progress: 'Loading shared resources progress',
        mount_failed: 'Failed to mount to layout-app',
        mount_success: 'Successfully mounted to layout-app',
        viewport_found: 'Found #subapp-viewport, preparing to mount',
        viewport_timeout: 'Timeout waiting for #subapp-viewport, trying standalone render',
        diagnostic_info: 'Diagnostic information',
        standalone_failed: 'Standalone run failed',
        init_layout_app_failed: 'Failed to initialize layout-app',
        import_init_layout_app_failed: 'Failed to import init-layout-app',
      },
      // 系统相关
      system: {
        finance_module: 'Finance Module',
      },
      // 盘点模块相关
      inventory: {
        result: {
          fields: {
            material_code: 'Material Code',
            position: 'Position',
            unit_cost: 'Unit Cost',
            book_qty: 'Book Quantity',
            actual_qty: 'Actual Quantity',
            diff_qty: 'Difference Quantity',
            variance_cost: 'Variance Cost',
          },
        },
      },
    },
  },
} satisfies LocaleConfig;
