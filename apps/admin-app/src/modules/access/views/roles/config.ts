/**
 * 角色列表页面配置
 */
import type { TableColumn, FormItem } from '@btc/shared-components';
import { service } from '../../../../services/eps';

// 角色列表列配置
export const roleColumns: TableColumn[] = [
  { type: 'selection', width: 60 },
  { type: 'index', label: '序号', width: 60 },
  { prop: 'roleName', label: '角色名称', minWidth: 150 },
  { prop: 'roleCode', label: '角色编码', width: 120 },
  {
    prop: 'roleType',
    label: '角色类型',
    width: 120,
    dict: [
      { label: '管理员', value: 'ADMIN', type: 'danger' },
      { label: '业务员', value: 'BUSINESS', type: 'success' },
      { label: '访客', value: 'GUEST', type: 'info' }
    ],
    dictColor: true
  },
  {
    prop: 'parentId',
    label: '父级角色',
    width: 120,
    formatter: (row: any, column: any, cellValue: any, index: number) => {
      // 这里需要根据 parentId 查找对应的角色名称
      // 暂时显示 parentId，后续会在组件中处理
      return cellValue === '0' ? '无' : cellValue;
    }
  },
  {
    prop: 'domainId',
    label: '所属域',
    width: 120,
    formatter: (row: any, column: any, cellValue: any, index: number) => {
      // 这里需要根据 domainId 查找对应的域名称
      // 暂时显示 domainId，后续会在组件中处理
      return cellValue || '未分配';
    }
  },
  { prop: 'description', label: '描述', minWidth: 200, showOverflowTooltip: true },
  { prop: 'createdAt', label: '创建时间', width: 160, sortable: true }
];

// 角色表单配置
export const getRoleFormItems = (domainOptions: any[] = [], roleOptions: any[] = []): FormItem[] => {
  const formItems: FormItem[] = [
    {
      prop: 'roleName',
      label: '角色名称',
      span: 12,
      required: true,
      component: {
        name: 'el-input',
        props: {
          placeholder: '请输入角色名称'
        }
      }
    },
    {
      prop: 'roleCode',
      label: '角色编码',
      span: 12,
      required: true,
      component: {
        name: 'el-input',
        props: {
          placeholder: '请输入角色编码'
        }
      }
    },
    {
      prop: 'roleType',
      label: '角色类型',
      span: 12,
      required: true,
      component: {
        name: 'el-select',
        props: {
          placeholder: '请选择角色类型',
          clearable: true
        },
        options: [
          { label: '管理员', value: 'ADMIN' },
          { label: '业务员', value: 'BUSINESS' },
          { label: '访客', value: 'GUEST' }
        ]
      }
    },
    {
      prop: 'parentId',
      label: '父级角色',
      span: 12,
      component: {
        name: 'btc-cascader',
        props: {
          placeholder: '请选择父级角色',
          options: roleOptions,
          clearable: true,
          filterable: true
        }
      }
    },
    {
      prop: 'domainId',
      label: '所属域',
      span: 12,
      component: {
        name: 'btc-cascader',
        props: {
          placeholder: '请选择所属域',
          options: domainOptions,
          clearable: true,
          filterable: true
        }
      }
    },
    {
      prop: 'description',
      label: '描述',
      span: 24,
      component: {
        name: 'el-input',
        props: {
          type: 'textarea',
          rows: 3,
          placeholder: '请输入角色描述'
        }
      }
    }
  ];

  return formItems;
};

// 服务配置
export const services = {
  sysdomain: service.admin?.iam?.domain,
  sysrole: service.admin?.iam?.role
};
