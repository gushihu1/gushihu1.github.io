---
title: "pinia和vuex有什么区别"
date: 2026-07-08
category: "Vue"
tags: ["Vue"]
featured: false
draft: false
readingTime: "1 min"
sourceId: "frontend"
sourceFile: "面试2026.md"
sourceLine: 1859
---

1. 架构模式的彻底革新（最显著的区别）
   - **Vuex (树状/嵌套架构)**：
     - 使用 `Modules` 树状结构，需要根据路径调用
   - **Pinia (扁平化架构)**：
     - **Store 是独立且扁平的**：不再有 `Modules` 的概念。每一个 Store 都是一个独立的实例。
2. **去 Mutation 化**：只有 `State`, `Getters` 和 `Actions`。所有的状态变更（无论同步还是异步）都在 `Actions` 中处理。
3. **直接修改**：支持像操作普通响应式对象一样直接修改状态（如 `store.count++`），或者使用 `$patch` 批量修改，极大地提升了开发效率 。
4. 对TS的支持更好
5. 另外还可以直接写成组合式API的形式，在store中进行一些watch或者其他操作
