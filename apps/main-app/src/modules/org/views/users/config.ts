/**
 * 用户列表页面配置
 */
import type { TableColumn, FormItem } from '@btc/shared-components';
import { service } from '../../../../services/eps';


// 用户列表列配置
export const userColumns: TableColumn[] = [
  { type: 'selection', width: 60 },
  { prop: 'username', label: '用户名', width: 120 },
  { prop: 'realName', label: '中文名', minWidth: 100 },
  { prop: 'position', label: '职位', minWidth: 100 },
  {
    prop: 'name',
    label: '部门',
    width: 120,
  },
  {
    prop: 'roleId',
    label: '角色',
    width: 120,
  },
  {
    prop: 'status',
    label: '状态',
    width: 100,
    dict: [
      { label: '激活', value: 'ACTIVE', type: 'success' },
      { label: '禁用', value: 'INACTIVE', type: 'danger' }
    ],
    dictColor: true
  },
];

// 用户表单配置
export const getUserFormItems = (departmentOptions: any[] = [], roleOptions: any[] = []): FormItem[] => {
  const formItems = [
    {
      prop: 'username',
      label: '用户名',
      span: 12,
      component: {
        name: 'el-input',
        props: {
          readonly: true,
          placeholder: '系统自动生成'
        }
      }
    },
    {
      prop: 'realName',
      label: '中文名',
      span: 12,
      component: {
        name: 'el-input',
        props: {
          readonly: true,
          placeholder: '暂无数据'
        }
      }
    },
    {
      prop: 'position',
      label: '职位',
      span: 12,
      component: {
        name: 'el-input',
        props: {
          readonly: true,
          placeholder: '暂无数据'
        }
      }
    },
    {
      prop: 'deptId',
      label: '部门',
      span: 12,
      required: true,
      component: {
        name: 'btc-cascader',
        props: {
          placeholder: '请选择部门',
          options: departmentOptions,
          showCount: true,
          clearable: true,
          filterable: true
        }
      }
    },
    {
      prop: 'roleId',
      label: '角色',
      span: 12,
      component: {
        name: 'btc-cascader',
        props: {
          placeholder: '请选择角色',
          options: roleOptions,
          showCount: true,
          clearable: true,
          filterable: true
        }
      }
    },
    {
      prop: 'status',
      label: '状态',
      span: 12,
      value: 'ACTIVE',
      component: {
        name: 'el-radio-group',
        options: [
          { label: '激活', value: 'ACTIVE' },
          { label: '禁用', value: 'INACTIVE' },
        ]
      }
    }
  ];

  return formItems;
};

// 服务配置 - 直接传递服务对象，让组件自动处理参数
export const services = {
  sysdepartment: service.system?.iam?.department,
  sysrole: service.system?.iam?.role,
  sysuser: service.system?.iam?.user
};
