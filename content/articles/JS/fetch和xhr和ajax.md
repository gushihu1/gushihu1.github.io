---
title: "fetch和xhr和ajax"
date: 2026-07-14
category: "JS"
tags: ["JS"]
featured: false
draft: false
readingTime: "1 min"
---
1. Ajax它不是一种具体的技术，而是一个组合拳概念。
   1. 核心是“局部刷新”，通过在后台与服务器进行少量数据交换，使网页实现异步更新。

| **维度**     | **XHR**                                 | **Fetch**                                 |
| ------------ | --------------------------------------- | ----------------------------------------- |
| **底层实现** | 基于事件模型 (`onreadystatechange`)     | 基于 Promise 模型                         |
| **语法风格** | 配置冗长，不易阅读                      | 链式调用，语义化强                        |
| **进度监控** | **原生支持** (Upload/Download progress) | 较难实现（需读取 Body 的 ReadableStream） |
| **跨域处理** | 依赖 CORS 或 JSONP                      | 依赖 CORS，支持 `no-cors` 模式            |
| **超时中断** | 属性设置 `xhr.timeout`                  | 需配合 `AbortController`                  |
