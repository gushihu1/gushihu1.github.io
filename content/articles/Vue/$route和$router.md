---
title: "$route和$router"
date: 2026-07-14
category: "Vue"
tags: ["Vue"]
featured: false
draft: false
readingTime: "2 min"
---
| **维度**                  | **$router (Router 实例)**                           | **$route (Route 状态对象)**                           |
| ------------------------- | --------------------------------------------------- | ----------------------------------------------------- |
| **角色定义**              | **管理者 / 动作发起者**（Active Controller）        | **数据源 / 状态容器**（Passive State）                |
| **底层类型**              | `Router` 类的单例对象                               | 经过 Vue 响应式包装的 `RouteLocationNormalized` 对象  |
| **数量特征**              | 整个应用生命周期中**有且仅有一个**（单例模式）      | 随着 URL 的切换而**频繁创建、销毁和更新**（快照模式） |
| **核心 API**              | `push()`, `replace()`, `addRoute()`, `beforeEach()` | `path`, `query`, `params`, `meta`, `matched`          |
| **Vue 3 组合式 API 映射** | 通过 `useRouter()` 获取                             | 通过 `useRoute()` 获取                                |
| **职责边界**              | 负责“**怎么去**”（编程式导航调度）                  | 负责“**我是谁，我在哪，我带了什么**”（读取数据）      |
