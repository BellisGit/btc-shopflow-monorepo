// Entity interface definitions
    interface test {
        /**
         * Any key-value pairs
         */
        [key: string]: any;
      }
      

interface position {
          /**
           * 主键ID
           */
          id?: any;
        
          /**
           * 域ID
           */
          domainId?: any;
        
          /**
           * 部门ID
           */
          deptId?: any;
        
          /**
           * 仓位
           */
          position?: any;
        
          /**
           * 描述
           */
          description?: any;
        
          /**
           * 创建时间
           */
          createdAt?: any;
        
          /**
           * 更新时间
           */
          updatedAt?: any;
        
          /**
           * 域名称
           */
          name?: any;
        
          /**
           * 页码
           */
          page?: any;
        
          /**
           * 每页数量
           */
          size?: any;
        
          /**
           * 关键词
           */
          keyword?: any;
        
        /**
         * Any key-value pairs
         */
        [key: string]: any;
      }
      

interface check {
          /**
           * 主键ID
           */
          id?: any;
        
          /**
           * 关联盘点任务
           */
          baseId?: any;
        
          /**
           * 物料编码
           */
          materialCode?: any;
        
          /**
           * 物料名称
           */
          materialName?: any;
        
          /**
           * 物料规格
           */
          specification?: any;
        
          /**
           * 计量单位
           */
          unit?: any;
        
          /**
           * 批次号
           */
          batchNo?: any;
        
          /**
           * 账面数量
           */
          bookQty?: any;
        
          /**
           * 实际数量
           */
          actualQty?: any;
        
          /**
           * 仓位
           */
          storageLocation?: any;
        
          /**
           * 差异数量
           */
          diffQty?: any;
        
          /**
           * 差异率
           */
          diffRate?: any;
        
          /**
           * 盘点人
           */
          checkerId?: any;
        
          /**
           * 是否有差异
           */
          isDiff?: any;
        
          /**
           * 明细备注
           */
          remark?: any;
        
          /**
           * 创建时间
           */
          createdAt?: any;
        
          /**
           * 删除时间
           */
          deletedAt?: any;
        
          /**
           * materialCode
           */
          materialCode?: any;
        
          /**
           * position
           */
          position?: any;
        
        /**
         * Any key-value pairs
         */
        [key: string]: any;
      }
      

interface approval {
          /**
           * 序号
           */
          id?: any;
        
          /**
           * 域ID
           */
          domainId?: any;
        
          /**
           * 盘点编号
           */
          checkNo?: any;
        
          /**
           * 状态
           */
          status?: any;
        
          /**
           * 确认人
           */
          confirmer?: any;
        
          /**
           * 确认时间
           */
          createdAt?: any;
        
          /**
           * name
           */
          name?: any;
        
          /**
           * checkNo
           */
          checkNo?: any;
        
        /**
         * Any key-value pairs
         */
        [key: string]: any;
      }
      

interface bom {
          /**
           * 主键ID
           */
          id?: any;
        
          /**
           * 流程ID
           */
          processId?: any;
        
          /**
           * 盘点序号
           */
          checkNo?: any;
        
          /**
           * 域ID
           */
          domainId?: any;
        
          /**
           * 父级
           */
          parentNode?: any;
        
          /**
           * 子级
           */
          childNode?: any;
        
          /**
           * 子级数量
           */
          childQty?: any;
        
          /**
           * 创建时间
           */
          createdAt?: any;
        
          /**
           * 更新时间
           */
          updatedAt?: any;
        
          /**
           * checkType
           */
          checkType?: any;
        
          /**
           * domainId
           */
          domainId?: any;
        
          /**
           * parentNode
           */
          parentNode?: any;
        
          /**
           * childNode
           */
          childNode?: any;
        
          /**
           * checkType
           */
          checkType?: any;
        
        /**
         * Any key-value pairs
         */
        [key: string]: any;
      }
      

interface data {
          /**
           * 主键ID
           */
          id?: any;
        
          /**
           * 物料号
           */
          partName?: any;
        
          /**
           * 数量
           */
          partQty?: any;
        
          /**
           * 仓位
           */
          position?: any;
        
          /**
           * 域code
           */
          domainCode?: any;
        
          /**
           * 流程ID
           */
          processId?: any;
        
          /**
           * 盘点序号
           */
          checkNo?: any;
        
          /**
           * 创建时间
           */
          createdAt?: any;
        
          /**
           * 更新时间
           */
          updatedAt?: any;
        
          /**
           * checkType
           */
          checkType?: any;
        
          /**
           * partName
           */
          partName?: any;
        
          /**
           * position
           */
          position?: any;
        
          /**
           * domainId
           */
          domainId?: any;
        
          /**
           * checkType
           */
          checkType?: any;
        
        /**
         * Any key-value pairs
         */
        [key: string]: any;
      }
      

interface datasource {
          /**
           * 主键ID
           */
          id?: any;
        
          /**
           * 盘点序号
           */
          checkNo?: any;
        
          /**
           * 流程ID
           */
          processId?: any;
        
          /**
           * 物料号
           */
          partName?: any;
        
          /**
           * 数量
           */
          partQty?: any;
        
          /**
           * 扫码人
           */
          checker?: any;
        
          /**
           * 仓位
           */
          position?: any;
        
          /**
           * 创建时间
           */
          createdAt?: any;
        
          /**
           * deleted_at
           */
          deleted_at?: any;
        
          /**
           * checkNo
           */
          checkNo?: any;
        
          /**
           * position
           */
          position?: any;
        
          /**
           * checker
           */
          checker?: any;
        
          /**
           * partName
           */
          partName?: any;
        
        /**
         * Any key-value pairs
         */
        [key: string]: any;
      }
      

interface check {
          /**
           * 主键ID
           */
          id?: any;
        
          /**
           * 盘点编号
           */
          checkNo?: any;
        
          /**
           * 域Code
           */
          domainCode?: any;
        
          /**
           * 盘点类型
           */
          checkType?: any;
        
          /**
           * 盘点状态
           */
          checkStatus?: any;
        
          /**
           * 开始时间
           */
          startTime?: any;
        
          /**
           * 结束时间
           */
          endTime?: any;
        
          /**
           * 盘点人
           */
          checker?: any;
        
          /**
           * 备注
           */
          remark?: any;
        
          /**
           * 剩余时长(秒)
           */
          remainingSeconds?: any;
        
          /**
           * 创建时间
           */
          createdAt?: any;
        
          /**
           * 更新时间
           */
          updatedAt?: any;
        
          /**
           * 删除时间
           */
          deletedAt?: any;
        
          /**
           * checkNo
           */
          checkNo?: any;
        
          /**
           * checkType
           */
          checkType?: any;
        
          /**
           * checkStatus
           */
          checkStatus?: any;
        
          /**
           * checker
           */
          checker?: any;
        
        /**
         * Any key-value pairs
         */
        [key: string]: any;
      }
      

interface diff {
          /**
           * 主键ID
           */
          id?: any;
        
          /**
           * 盘点流程ID
           */
          checkNo?: any;
        
          /**
           * 物料编码
           */
          materialCode?: any;
        
          /**
           * 仓位
           */
          position?: any;
        
          /**
           * 差异数量
           */
          diffQty?: any;
        
          /**
           * 账面数量
           */
          bookQty?: any;
        
          /**
           * 实际数量
           */
          btcQty?: any;
        
          /**
           * 处理人
           */
          processPerson?: any;
        
          /**
           * 处理时间
           */
          processTime?: any;
        
          /**
           * 处理备注
           */
          processRemark?: any;
        
          /**
           * 删除时间
           */
          deletedAt?: any;
        
          /**
           * 创建时间
           */
          createdAt?: any;
        
          /**
           * actualQty
           */
          actualQty?: any;
        
          /**
           * checkNo
           */
          checkNo?: any;
        
          /**
           * position
           */
          position?: any;
        
          /**
           * materialCode
           */
          materialCode?: any;
        
        /**
         * Any key-value pairs
         */
        [key: string]: any;
      }
      

interface subProcess {
          /**
           * 主键ID
           */
          id?: any;
        
          /**
           * 子流程编码
           */
          subProcessNo?: any;
        
          /**
           * 主流程编号
           */
          checkNo?: any;
        
          /**
           * 流程状态
           */
          checkStatus?: any;
        
          /**
           * 开始时间
           */
          startTime?: any;
        
          /**
           * 结束时间
           */
          endTime?: any;
        
          /**
           * 剩余时间
           */
          remainingSeconds?: any;
        
          /**
           * 父级流程
           */
          parentProcessNo?: any;
        
          /**
           * 创建时间
           */
          createdAt?: any;
        
          /**
           * 更新时间
           */
          updatedAt?: any;
        
          /**
           * checkNo
           */
          checkNo?: any;
        
        /**
         * Any key-value pairs
         */
        [key: string]: any;
      }
      

interface ticket {
          /**
           * domainId
           */
          domainId?: any;
        
          /**
           * position
           */
          position?: any;
        
          /**
           * partName
           */
          partName?: any;
        
        /**
         * Any key-value pairs
         */
        [key: string]: any;
      }
      

interface material {
          /**
           * 主键ID
           */
          id?: any;
        
          /**
           * 物料编码
           */
          materialCode?: any;
        
          /**
           * 物料名称
           */
          materialName?: any;
        
          /**
           * 物料类型
           */
          materialType?: any;
        
          /**
           * 规格
           */
          specification?: any;
        
          /**
           * 材质
           */
          materialTexture?: any;
        
          /**
           * 单位
           */
          unit?: any;
        
          /**
           * 供应商编码
           */
          supplierCode?: any;
        
          /**
           * 供应商名称
           */
          supplierName?: any;
        
          /**
           * 单价
           */
          unitPrice?: any;
        
          /**
           * 税率
           */
          taxRate?: any;
        
          /**
           * 总价
           */
          totalPrice?: any;
        
          /**
           * 条形码
           */
          barCode?: any;
        
          /**
           * 安全库存
           */
          safetyStock?: any;
        
          /**
           * 存储要求
           */
          storageRequirement?: any;
        
          /**
           * 过期周期
           */
          expireCycle?: any;
        
          /**
           * 创建时间
           */
          createdAt?: any;
        
          /**
           * 更新时间
           */
          updatedAt?: any;
        
          /**
           * 备注
           */
          remark?: any;
        
          /**
           * 删除时间
           */
          deletedAt?: any;
        
          /**
           * 页码
           */
          page?: any;
        
          /**
           * 每页数量
           */
          size?: any;
        
          /**
           * 关键词
           */
          keyword?: any;
        
        /**
         * Any key-value pairs
         */
        [key: string]: any;
      }
      

interface bom {
          /**
           * 父节点
           */
          parentNode?: any;
        
          /**
           * 子节点
           */
          childNode?: any;
        
          /**
           * 子节点数量
           */
          childQty?: any;
        
          /**
           * parentNode
           */
          parentNode?: any;
        
          /**
           * childNode
           */
          childNode?: any;
        
        /**
         * Any key-value pairs
         */
        [key: string]: any;
      }
      

interface data {
          /**
           * 库存代码
           */
          stockCode?: any;
        
          /**
           * 仓库
           */
          warehouse?: any;
        
          /**
           * 总数量
           */
          totalQty?: any;
        
          /**
           * 单位成本
           */
          unitCost?: any;
        
          /**
           * stockCode
           */
          stockCode?: any;
        
          /**
           * warehouse
           */
          warehouse?: any;
        
        /**
         * Any key-value pairs
         */
        [key: string]: any;
      }
      

interface checkTicket {
        /**
         * Any key-value pairs
         */
        [key: string]: any;
      }
      

interface profile {
          /**
           * ID
           */
          id?: any;
        
          /**
           * 员工ID
           */
          employeeId?: any;
        
          /**
           * 姓名
           */
          name?: any;
        
          /**
           * 真实姓名
           */
          realName?: any;
        
          /**
           * 职位
           */
          position?: any;
        
          /**
           * 邮箱
           */
          email?: any;
        
          /**
           * 初始密码
           */
          initPass?: any;
        
          /**
           * 部门Code
           */
          deptCode?: any;
        
          /**
           * 头像
           */
          avatar?: any;
        
          /**
           * 手机号
           */
          phone?: any;
        
          /**
           * 部门id
           */
          deptId?: any;
        
          /**
           * 页码
           */
          page?: any;
        
          /**
           * 每页数量
           */
          size?: any;
        
          /**
           * 关键词
           */
          keyword?: any;
        
        /**
         * Any key-value pairs
         */
        [key: string]: any;
      }
      

interface email {
          /**
           * 页码
           */
          page?: any;
        
          /**
           * 每页数量
           */
          size?: any;
        
          /**
           * 关键词
           */
          keyword?: any;
        
        /**
         * Any key-value pairs
         */
        [key: string]: any;
      }
      

interface phone {
          /**
           * 页码
           */
          page?: any;
        
          /**
           * 每页数量
           */
          size?: any;
        
          /**
           * 关键词
           */
          keyword?: any;
        
        /**
         * Any key-value pairs
         */
        [key: string]: any;
      }
      

interface deletelog {
        /**
         * Any key-value pairs
         */
        [key: string]: any;
      }
      

interface config {
        /**
         * Any key-value pairs
         */
        [key: string]: any;
      }
      

interface operation {
        /**
         * Any key-value pairs
         */
        [key: string]: any;
      }
      

interface request {
        /**
         * Any key-value pairs
         */
        [key: string]: any;
      }
      

interface action {
          /**
           * 行为ID
           */
          id?: any;
        
          /**
           * 行为编码
           */
          actionCode?: any;
        
          /**
           * 行为中文名
           */
          actionNameCn?: any;
        
          /**
           * 行为英文名
           */
          actionNameEn?: any;
        
          /**
           * 行为类型
           */
          actionType?: any;
        
          /**
           * HTTP方法
           */
          httpMethod?: any;
        
          /**
           * 行为说明
           */
          description?: any;
        
          /**
           * 图标
           */
          icon?: any;
        
          /**
           * 颜色标识
           */
          color?: any;
        
          /**
           * 排序
           */
          sortOrder?: any;
        
          /**
           * 是否危险操作
           */
          isDanger?: any;
        
          /**
           * 创建时间
           */
          createdAt?: any;
        
          /**
           * 更新时间
           */
          updatedAt?: any;
        
          /**
           * 删除时间
           */
          deletedAt?: any;
        
        /**
         * Any key-value pairs
         */
        [key: string]: any;
      }
      

interface dept {
          /**
           * 部门ID
           */
          id?: any;
        
          /**
           * 租户Code
           */
          tenantCode?: any;
        
          /**
           * 部门编码
           */
          deptCode?: any;
        
          /**
           * 部门名
           */
          name?: any;
        
          /**
           * 上级部门ID
           */
          parentId?: any;
        
          /**
           * 创建时间
           */
          createdAt?: any;
        
          /**
           * 更新时间
           */
          updatedAt?: any;
        
          /**
           * 排序
           */
          sort?: any;
        
          /**
           * 删除时间
           */
          deletedAt?: any;
        
          /**
           * parentName
           */
          parentName?: any;
        
        /**
         * Any key-value pairs
         */
        [key: string]: any;
      }
      

interface domain {
          /**
           * 域ID
           */
          id?: any;
        
          /**
           * 租户Code
           */
          tenantCode?: any;
        
          /**
           * 域编码
           */
          domainCode?: any;
        
          /**
           * 域名称
           */
          name?: any;
        
          /**
           * 域类型
           */
          domainType?: any;
        
          /**
           * 域说明
           */
          description?: any;
        
          /**
           * 创建时间
           */
          createdAt?: any;
        
          /**
           * 更新时间
           */
          updatedAt?: any;
        
          /**
           * 删除时间
           */
          deletedAt?: any;
        
        /**
         * Any key-value pairs
         */
        [key: string]: any;
      }
      

interface menu {
          /**
           * 菜单ID
           */
          id?: any;
        
          /**
           * 租户Code
           */
          tenantCode?: any;
        
          /**
           * 所属模块Code
           */
          moduleCode?: any;
        
          /**
           * 域Code
           */
          domainCode?: any;
        
          /**
           * 菜单编码
           */
          menuCode?: any;
        
          /**
           * 菜单中文名
           */
          menuNameCn?: any;
        
          /**
           * 菜单英文名
           */
          menuNameEn?: any;
        
          /**
           * 菜单类型
           */
          menuType?: any;
        
          /**
           * 菜单路径
           */
          menuPath?: any;
        
          /**
           * 组件路径
           */
          componentPath?: any;
        
          /**
           * 图标
           */
          icon?: any;
        
          /**
           * 父菜单ID
           */
          parentMenuId?: any;
        
          /**
           * 排序
           */
          sortOrder?: any;
        
          /**
           * 是否可见
           */
          visible?: any;
        
          /**
           * 创建时间
           */
          createdAt?: any;
        
          /**
           * 更新时间
           */
          updatedAt?: any;
        
          /**
           * 删除时间
           */
          deletedAt?: any;
        
          /**
           * 路由缓存
           */
          routerCache?: any;
        
          /**
           * 文件路径
           */
          filePath?: any;
        
        /**
         * Any key-value pairs
         */
        [key: string]: any;
      }
      

interface module {
          /**
           * 模块ID
           */
          id?: any;
        
          /**
           * 租户Code
           */
          tenantCode?: any;
        
          /**
           * 所属域Code
           */
          domainCode?: any;
        
          /**
           * 模块编码
           */
          moduleCode?: any;
        
          /**
           * 模块名称
           */
          moduleName?: any;
        
          /**
           * 模块类型
           */
          moduleType?: any;
        
          /**
           * 模块说明
           */
          description?: any;
        
          /**
           * 创建时间
           */
          createdAt?: any;
        
          /**
           * 更新时间
           */
          updatedAt?: any;
        
          /**
           * 删除时间
           */
          deletedAt?: any;
        
        /**
         * Any key-value pairs
         */
        [key: string]: any;
      }
      

interface permission {
          /**
           * 权限ID
           */
          id?: any;
        
          /**
           * 租户Code
           */
          tenantCode?: any;
        
          /**
           * 所属模块Code
           */
          moduleCode?: any;
        
          /**
           * 所属插件Code
           */
          pluginCode?: any;
        
          /**
           * 权限 Code
           */
          permissionCode?: any;
        
          /**
           * 权限编码
           */
          permCode?: any;
        
          /**
           * 权限名称
           */
          permName?: any;
        
          /**
           * 权限类型
           */
          permType?: any;
        
          /**
           * 权限分类
           */
          permCategory?: any;
        
          /**
           * 权限说明
           */
          description?: any;
        
          /**
           * 创建时间
           */
          createdAt?: any;
        
          /**
           * 更新时间
           */
          updatedAt?: any;
        
          /**
           * 删除时间
           */
          deletedAt?: any;
        
        /**
         * Any key-value pairs
         */
        [key: string]: any;
      }
      

interface plugin {
          /**
           * 插件ID
           */
          id?: any;
        
          /**
           * 域编码
           */
          domainCode?: any;
        
          /**
           * 插件编码
           */
          pluginCode?: any;
        
          /**
           * 插件名称
           */
          pluginName?: any;
        
          /**
           * 插件类型
           */
          pluginType?: any;
        
          /**
           * 插件分类
           */
          pluginCategory?: any;
        
          /**
           * 插件版本
           */
          version?: any;
        
          /**
           * 插件作者
           */
          author?: any;
        
          /**
           * 插件说明
           */
          description?: any;
        
          /**
           * 配置模式
           */
          configSchema?: any;
        
          /**
           * 默认配置
           */
          defaultConfig?: any;
        
          /**
           * 状态
           */
          status?: any;
        
          /**
           * 安装路径
           */
          installPath?: any;
        
          /**
           * 依赖插件
           */
          dependencies?: any;
        
          /**
           * 创建人
           */
          createdBy?: any;
        
          /**
           * 创建时间
           */
          createdAt?: any;
        
          /**
           * 更新时间
           */
          updatedAt?: any;
        
          /**
           * 删除时间
           */
          deletedAt?: any;
        
        /**
         * Any key-value pairs
         */
        [key: string]: any;
      }
      

interface resource {
          /**
           * 资源ID
           */
          id?: any;
        
          /**
           * 资源编码
           */
          resourceCode?: any;
        
          /**
           * 资源中文名
           */
          resourceNameCn?: any;
        
          /**
           * 资源英文名
           */
          resourceNameEn?: any;
        
          /**
           * 资源类型
           */
          resourceType?: any;
        
          /**
           * 数据库表名
           */
          tableName?: any;
        
          /**
           * 资源说明
           */
          description?: any;
        
          /**
           * 创建时间
           */
          createdAt?: any;
        
          /**
           * 更新时间
           */
          updatedAt?: any;
        
          /**
           * 删除时间
           */
          deletedAt?: any;
        
          /**
           * resourceCode
           */
          resourceCode?: any;
        
          /**
           * resourceNameCn
           */
          resourceNameCn?: any;
        
          /**
           * resourceNameEn
           */
          resourceNameEn?: any;
        
          /**
           * resourceType
           */
          resourceType?: any;
        
          /**
           * tableName
           */
          tableName?: any;
        
        /**
         * Any key-value pairs
         */
        [key: string]: any;
      }
      

interface role {
          /**
           * 角色ID
           */
          id?: any;
        
          /**
           * 租户Code
           */
          tenantCode?: any;
        
          /**
           * 所属域Code
           */
          domainCode?: any;
        
          /**
           * 角色编码
           */
          roleCode?: any;
        
          /**
           * 角色名称
           */
          roleName?: any;
        
          /**
           * 角色类型
           */
          roleType?: any;
        
          /**
           * 角色说明
           */
          description?: any;
        
          /**
           * 创建时间
           */
          createdAt?: any;
        
          /**
           * 更新时间
           */
          updatedAt?: any;
        
          /**
           * 删除时间
           */
          deletedAt?: any;
        
          /**
           * 父级ID
           */
          parentId?: any;
        
          /**
           * ids
           */
          ids?: any;
        
          /**
           * roleName
           */
          roleName?: any;
        
          /**
           * userCode
           */
          userCode?: any;
        
          /**
           * domainCode
           */
          domainCode?: any;
        
        /**
         * Any key-value pairs
         */
        [key: string]: any;
      }
      

interface rolepermission {
          /**
           * ID
           */
          id?: any;
        
          /**
           * 租户Code
           */
          tenantCode?: any;
        
          /**
           * 角色Code
           */
          roleCode?: any;
        
          /**
           * 权限Code
           */
          permissionCode?: any;
        
          /**
           * 创建时间
           */
          createdAt?: any;
        
          /**
           * 删除时间
           */
          deletedAt?: any;
        
        /**
         * Any key-value pairs
         */
        [key: string]: any;
      }
      

interface tenant {
          /**
           * 租户ID
           */
          id?: any;
        
          /**
           * 租户编码
           */
          tenantCode?: any;
        
          /**
           * 租户名称
           */
          tenantName?: any;
        
          /**
           * 租户中文名
           */
          tenantNameZh?: any;
        
          /**
           * 租户类型
           */
          tenantType?: any;
        
          /**
           * 状态
           */
          status?: any;
        
          /**
           * 创建时间
           */
          createdAt?: any;
        
          /**
           * 更新时间
           */
          updatedAt?: any;
        
          /**
           * 删除时间
           */
          deletedAt?: any;
        
        /**
         * Any key-value pairs
         */
        [key: string]: any;
      }
      

interface user {
          /**
           * 用户ID
           */
          id?: any;
        
          /**
           * 用户编码
           */
          userCode?: any;
        
          /**
           * 租户Code
           */
          tenantCode?: any;
        
          /**
           * 登录名
           */
          username?: any;
        
          /**
           * 密码哈希
           */
          passwordHash?: any;
        
          /**
           * 状态
           */
          status?: any;
        
          /**
           * 最后登录时间
           */
          lastLoginAt?: any;
        
          /**
           * 最后登录IP
           */
          lastLoginIp?: any;
        
          /**
           * 登录次数
           */
          loginCount?: any;
        
          /**
           * 创建时间
           */
          createdAt?: any;
        
          /**
           * 更新时间
           */
          updatedAt?: any;
        
          /**
           * 删除时间
           */
          deletedAt?: any;
        
          /**
           * deptCode
           */
          deptCode?: any;
        
          /**
           * roleCode
           */
          roleCode?: any;
        
          /**
           * ids
           */
          ids?: any;
        
          /**
           * username
           */
          username?: any;
        
        /**
         * Any key-value pairs
         */
        [key: string]: any;
      }
      

interface userrole {
          /**
           * id
           */
          id?: any;
        
          /**
           * 用户Code
           */
          userCode?: any;
        
          /**
           * 角色Code
           */
          roleCode?: any;
        
          /**
           * 租户Code
           */
          tenantCode?: any;
        
          /**
           * 创建时间
           */
          createdAt?: any;
        
          /**
           * name
           */
          name?: any;
        
          /**
           * realName
           */
          realName?: any;
        
          /**
           * roleName
           */
          roleName?: any;
        
          /**
           * userCode
           */
          userCode?: any;
        
          /**
           * domainCode
           */
          domainCode?: any;
        
          /**
           * roleName
           */
          roleName?: any;
        
        /**
         * Any key-value pairs
         */
        [key: string]: any;
      }
      

interface dictData {
          /**
           * 序号
           */
          id?: any;
        
          /**
           * 字段名称
           */
          fieldName?: any;
        
          /**
           * 字典值
           */
          dictValue?: any;
        
          /**
           * 字典标签
           */
          dictLabel?: any;
        
          /**
           * 创建时间
           */
          createdAt?: any;
        
          /**
           * 更新时间
           */
          updatedAt?: any;
        
          /**
           * 删除时间
           */
          deletedAt?: any;
        
        /**
         * Any key-value pairs
         */
        [key: string]: any;
      }
      

interface dictInfo {
          /**
           * 主键ID
           */
          id?: any;
        
          /**
           * 实体类名
           */
          entityClass?: any;
        
          /**
           * 字段名称
           */
          fieldName?: any;
        
          /**
           * 域ID
           */
          domainId?: any;
        
          /**
           * 备注
           */
          remark?: any;
        
          /**
           * 创建人
           */
          createdBy?: any;
        
          /**
           * 创建时间
           */
          createdAt?: any;
        
          /**
           * 最后修改时间
           */
          updatedAt?: any;
        
          /**
           * 删除时间
           */
          deletedAt?: any;
        
          /**
           * entityClass
           */
          entityClass?: any;
        
        /**
         * Any key-value pairs
         */
        [key: string]: any;
      }
      

interface financeResult {
          /**
           * materialCode
           */
          materialCode?: any;
        
          /**
           * position
           */
          position?: any;
        
          /**
           * checkNo
           */
          checkNo?: any;
        
        /**
         * Any key-value pairs
         */
        [key: string]: any;
      }
      

    // Service interface definitions
    interface Service {
      request: (options: any) => Promise<any>;
      [key: string]: any;
    }