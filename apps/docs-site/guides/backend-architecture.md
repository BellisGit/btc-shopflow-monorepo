---
title: 后端架构概览
type: guide
project: backend
owner: dev-team
created: '2025-10-14'
updated: '2025-10-14'
publish: true
tags:
- overview
- backend
- architecture
- microservices
sidebar_label: 后端架构
sidebar_order: 5
sidebar_group: guides-backend
---

# 后端架构概览

## 架构概述

BTC车间流程管理系统采用微服务架构，通过服务拆分实现高内聚、低耦合的系统设计。

## 服务架构

### 核心服务
- **网关服务**: API网关，统一入口
- **系统服务**: 用户、角色、权限管理
- **管理服务**: 系统管理和配置
- **通用服务**: 公共功能和工具

### 业务服务
- **调度服务**: 任务调度和流程管理
- **通知服务**: 消息推送和通知
- **搜索服务**: 全文搜索功能
- **上传服务**: 文件上传和管理

## 技术栈

### 后端技术
- **框架**: Spring Boot + Spring Cloud
- **数据库**: MySQL + Redis
- **消息队列**: RabbitMQ
- **搜索引擎**: Elasticsearch

### 部署架构
- **容器化**: Docker + Kubernetes
- **服务发现**: Eureka
- **配置管理**: Config Server
- **链路追踪**: Zipkin

## 服务间通信

### 同步通信
- **HTTP/REST**: 服务间API调用
- **负载均衡**: Ribbon + Feign
- **熔断降级**: Hystrix

### 异步通信
- **消息队列**: 事件驱动架构
- **消息确认**: 可靠消息传递
- **死信队列**: 异常消息处理

## 数据管理

### 数据一致性
- **分布式事务**: Seata
- **数据同步**: Canal
- **缓存策略**: Redis + 本地缓存

### 数据安全
- **数据加密**: AES加密
- **访问控制**: RBAC权限模型
- **审计日志**: 操作记录和追踪

## 监控运维

### 系统监控
- **指标监控**: Prometheus + Grafana
- **日志聚合**: ELK Stack
- **健康检查**: Actuator

### 性能优化
- **连接池**: HikariCP
- **缓存优化**: 多级缓存策略
- **数据库优化**: 索引和查询优化

## 扩展性设计

### 水平扩展
- **无状态设计**: 支持多实例部署
- **数据库分片**: 读写分离
- **缓存集群**: Redis Cluster

### 垂直扩展
- **服务拆分**: 按业务域拆分
- **资源隔离**: 独立部署和扩容
- **故障隔离**: 服务间故障不传播

---

**架构状态**: 生产环境
**维护团队**: 后端团队
**最后更新**: 2025-10-14
