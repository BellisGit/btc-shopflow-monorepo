// Entity interface definitions
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
      

interface BaseUserEntity {
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
           * 部门id
           */
          deptId?: any;
        
          /**
           * 头像
           */
          avatar?: any;
        
          /**
           * 手机号
           */
          phone?: any;
        
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
      

interface EmailEntity {
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
      

interface PhoneEntity {
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
      

    // Service interface definitions
    interface Service {
      request: (options: any) => Promise<any>;
      [key: string]: any;
    }