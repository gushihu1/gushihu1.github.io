---
title: "Vue Router传参"
date: 2026-07-08
category: "Vue"
tags: ["Vue"]
featured: false
draft: false
readingTime: "2 min"
sourceId: "frontend"
sourceFile: "面试2026.md"
sourceLine: 1575
---

| **维度**     | **Query 传参**                      | **Params 传参（显式/动态路径参数）**   | **Params 传参（隐式/已弃用临时参数）**           |
| ------------ | ----------------------------------- | -------------------------------------- | ------------------------------------------------ |
| **URL 表现** | `domain.com/user?id=123`            | `domain.com/user/123`                  | `domain.com/user`（地址栏不显示参数）            |
| **路由配置** | 无需特殊配置：`path: '/user'`       | 必须定义占位符：`path: '/user/:id'`    | 过去配合 `name` 传递：`path: '/user'`            |
| **刷新页面** | **参数不丢失**（从浏览器 URL 解析） | **参数不丢失**（从路径占位符解析）     | **刷新立即丢失**（Vue Router 4 中已被正式移除）  |
| **获取方式** | `route.query.id`                    | `route.params.id`                      | 无法再直接依赖底层状态栈传递隐式数据             |
| **RFC语义**  | 适合搜索、分页、过滤等非决定性参数  | 适合具有主从属、唯一标识性质的确定资源 | 不推荐，破坏了“状态应当可被 URL 还原”的 SPA 原则 |

1. **路由解耦（`props: true`）** 在配置路由表时，开启 `props: true` 策略。这样 Vue Router 会自动将 `params` 或 `query` 映射为组件的入参 Props。

   1. ```js
      // 路由配置
      {
        path: '/user/:id',
        component: UserDetail,
        props: true // 核心：开启参数自动 Props 转化
      }
      ```

   2. ```vue
      <script setup>
      defineProps({
        id: String // 就像普通 Props 一样接收参数，大幅提升组件的纯净度度与可复用性
      })
      </script>
      ```
