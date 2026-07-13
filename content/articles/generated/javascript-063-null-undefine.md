---
title: "null和undefine"
date: 2026-07-08
category: "JS"
tags: ["JS"]
featured: false
draft: false
readingTime: "1 min"
sourceId: "frontend"
sourceFile: "面试2026.md"
sourceLine: 1141
---

| **特性**        | **undefined**                            | **null**                             |
| --------------- | ---------------------------------------- | ------------------------------------ |
| **语义定义**    | “缺少值” —— 系统层面的缺失               | “预期没有值” —— 业务层面的空对象指针 |
| **触发方式**    | 引擎自动赋值（变量未赋值、函数无返回值） | 开发者手动赋值                       |
| **内存管理**    | 不参与垃圾回收（因为它通常是初始状态）   | **显式释放内存**，辅助垃圾回收 (GC)  |
| **typeof 类型** | `'undefined'`                            | `'object'` (JS 历史遗留 Bug)         |
