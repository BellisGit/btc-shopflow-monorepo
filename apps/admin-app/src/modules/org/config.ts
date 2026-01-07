/**
 * 组织与账号模块配置
 * 包含国际化配置、表格列配置和表单配置
 */

import type { PageConfig } from '../../../../../types/locale';
import type { TableColumn, FormItem } from '@btc/shared-components';
import { service } from '@services/eps';

export default {
  // 国际化配置
  locale: {
    org: {
        tenants: {
          title: '租户列表',
          tenant_name: '租户名称',
          tenant_code: '租户编码',
          tenant_type: '租户类型',
          description: '描述',
        },
        departments: {
          title: '部门列表',
          department_name: '部门名称',
          dept_code: '部门编码',
          parent_id: '上级部门',
          sort: '排序',
          import_tips: '请下载模板并填入部门信息后导入',
          import_empty: '导入数据为空，请检查模板内容',
          import_unsupported: '当前环境未配置部门导入接口',
          import_success: '导入成功',
          import_failed: '导入失败，请检查文件格式或内容',
        },
        users: {
          title: '用户列表',
          username: '用户名',
          real_name: '中文名',
          position: '职位',
          dept_id: '部门',
          status: '状态',
          search_placeholder: '请输入用户名或姓名',
        },
        dept: {
          list: '部门列表',
          unassigned: '未分配部门',
        },
        role: {
          list: '角色列表',
          unassigned: '未分配角色',
        },
        user_role_assign: {
          actions: {
            assign: '新增绑定',
            modify_bind: '改绑',
            multi_unbind: '批量解绑',
            unbind: '解绑',
          },
          columns: {
            username: '用户名',
            role_name: '角色名称',
            role_code: '角色编码',
            rid: '角色ID',
            domain_id: '域ID',
            description: '描述',
            status: '状态',
          },
          drawer: {
            title: '批量角色绑定',
            subtitle: '选择授权主体与角色',
            role_section_title: '选择角色',
            role_selected_title: '已选择角色',
            role_keyword_placeholder: '搜索角色名称或编码',
            role_pagination: '角色列表分页',
            roleEmpty: '请先选择角色',
            subject_section_title: '选择授权主体',
            subject_selected_title: '已选择主体',
            subject_keyword_placeholder: '搜索姓名或账号',
            subject_pagination: '主体列表分页',
            subject_empty: '请先选择主体',
            search_user: '搜索用户',
            select_user_first: '请先选择用户',
          },
          messages: {
            bindSuccess: '绑定成功',
            unbindSuccess: '解绑成功',
            modifyBindSuccess: '改绑成功',
            unbindConfirm: '确定要解绑用户 {username} 的角色 {roleName} 吗？',
            unbindBatchConfirm: '确定要解绑选中的 {count} 条记录吗？',
            selectRows: '请至少选择一条记录',
            selectUsers: '请至少选择一个用户',
            selectRoles: '请至少选择一个角色',
            submitSuccess: '角色分配请求已提交',
            loadRolesFailed: '加载可分配角色失败',
            sameRole: '新角色与当前角色相同，无需修改',
          },
          search_placeholder: '请输入用户名、角色ID或域ID',
          user: {
            username: '账号',
            real_name: '姓名',
            status: '状态',
          },
        },
      },
    },

  // 表格列配置
  columns: {
    'org.tenants': [
      { type: 'selection', width: 60 },
      { type: 'index', label: 'common.index', width: 60 },
      { prop: 'tenantName', label: 'org.tenants.tenant_name' },
      { prop: 'tenantCode', label: 'org.tenants.tenant_code' },
      { prop: 'tenantType', label: 'org.tenants.tenant_type' },
      {
        prop: 'status',
        label: 'org.user.status',
        width: 120,
        dict: [
          { label: '启用', value: 'ACTIVE', type: 'success' },
          { label: '禁用', value: 'INACTIVE', type: 'danger' },
        ],
        dictColor: true,
      },
    ] as TableColumn[],

    'org.departments': [
      { type: 'selection', width: 60 },
      { type: 'index', label: 'common.index', width: 60 },
      { prop: 'name', label: 'org.departments.department_name', minWidth: 150 },
      { prop: 'deptCode', label: 'org.departments.dept_code', width: 120 },
      {
        prop: 'parentId',
        label: 'org.departments.parent_id',
        width: 120,
        formatter: (row: any) => {
          // formatter 需要在页面中动态处理，这里只定义结构
          return row.parentId;
        },
      },
      { prop: 'sort', label: 'org.departments.sort', width: 80 },
    ] as TableColumn[],

    'org.users': [
      { type: 'selection', width: 60 },
      { prop: 'username', label: 'org.users.username', width: 120 },
      { prop: 'realName', label: 'org.users.real_name', minWidth: 100 },
      { prop: 'position', label: 'org.users.position', minWidth: 100 },
      {
        prop: 'name',
        label: 'org.users.dept_id',
        width: 120,
      },
      {
        prop: 'status',
        label: 'org.users.status',
        width: 100,
        dict: [
          { label: '激活', value: 'ACTIVE', type: 'success' },
          { label: '禁用', value: 'INACTIVE', type: 'danger' },
        ],
        dictColor: true,
      },
    ] as TableColumn[],

    'org.user_role_assign': [
      { type: 'selection', width: 60 },
      { type: 'index', label: 'common.index', width: 60 },
      { prop: 'name', label: 'org.user_role_assign.columns.username', minWidth: 160, showOverflowTooltip: true },
      { prop: 'realName', label: 'org.user_role_assign.user.real_name', minWidth: 120, showOverflowTooltip: true },
      { prop: 'roleName', label: 'org.user_role_assign.columns.role_name', minWidth: 180, showOverflowTooltip: true },
      {
        type: 'op',
        label: 'crud.table.operation',
        minWidth: 126,
        width: 126,
        align: 'center',
        fixed: 'right' as const,
        buttons: [
          {
            label: 'org.user_role_assign.actions.unbind',
            type: 'danger',
            icon: 'unbind',
            onClick: 'handleUnbind', // 使用字符串标识符，在页面中通过 onClickHandlers 传入
          },
        ],
      },
    ] as TableColumn[],
  },

  // 表单配置
  forms: {
    'org.tenants': [
      { prop: 'tenantName', label: 'org.tenants.tenant_name', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'tenantCode', label: 'org.tenants.tenant_code', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'tenantType', label: 'org.tenants.tenant_type', span: 12, component: { name: 'el-input' } },
      { prop: 'description', label: 'org.tenants.description', span: 24, component: { name: 'el-input', props: { type: 'textarea' } } },
    ] as FormItem[],

    'org.departments': [
      { prop: 'name', label: 'org.departments.department_name', span: 12, required: true, component: { name: 'el-input' } },
      { prop: 'deptCode', label: 'org.departments.dept_code', span: 12, required: true, component: { name: 'el-input' } },
      {
        prop: 'parentId',
        label: 'org.departments.parent_id',
        span: 12,
        component: {
          name: 'el-select',
          props: {
            placeholder: '请选择上级部门',
            clearable: true,
            filterable: true,
          },
          // options 需要在页面中动态传入
        },
      },
      {
        prop: 'sort',
        label: 'org.departments.sort',
        span: 12,
        value: 0,
        component: {
          name: 'el-input-number',
          props: { min: 0, style: { width: '100%' } },
        },
      },
    ] as FormItem[],

    'org.users': [
      {
        prop: 'username',
        label: 'org.users.username',
        span: 12,
        component: {
          name: 'el-input',
          props: {
            readonly: true,
            placeholder: '系统自动生成',
          },
        },
      },
      {
        prop: 'realName',
        label: 'org.users.real_name',
        span: 12,
        component: {
          name: 'el-input',
          props: {
            readonly: true,
            placeholder: '暂无数据',
          },
        },
      },
      {
        prop: 'position',
        label: 'org.users.position',
        span: 12,
        component: {
          name: 'el-input',
          props: {
            readonly: true,
            placeholder: '暂无数据',
          },
        },
      },
      {
        prop: 'deptId',
        label: 'org.users.dept_id',
        span: 12,
        required: true,
        component: {
          name: 'btc-cascader',
          props: {
            placeholder: '请选择部门',
            showCount: true,
            clearable: true,
            filterable: true,
            // options 需要在页面中动态传入
          },
        },
      },
      {
        prop: 'status',
        label: 'org.users.status',
        span: 12,
        value: 'ACTIVE',
        component: {
          name: 'el-radio-group',
          options: [
            { label: '激活', value: 'ACTIVE' },
            { label: '禁用', value: 'INACTIVE' },
          ],
        },
      },
    ] as FormItem[],
  },

  // 服务配置
  service: {
    tenant: service.admin?.iam?.tenant,
    department: service.admin?.iam?.department,
    user: service.admin?.iam?.user,
    // BtcTableGroup 需要的左右服务
    sysdepartment: service.admin?.iam?.department,
    sysuser: service.admin?.iam?.user,
  },
} satisfies PageConfig;
