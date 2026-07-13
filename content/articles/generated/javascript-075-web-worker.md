---
title: "Web Worker"
date: 2026-07-08
category: "JS"
tags: ["JS"]
featured: false
draft: false
readingTime: "1 min"
sourceId: "frontend"
sourceFile: "面试2026.md"
sourceLine: 1313
---

1. **痛点**：如果执行一段长达 2 秒的复杂计算（如大屏中的路径规划、数十万数据的过滤），主线程会被阻塞，导致页面完全卡死（无法点击、动画停止）。
2. **解决方案**：Web Worker 允许我们在浏览器后台创建一个真正的**并行线程**。它独立于主线程运行，执行完任务后再通过消息机制将结果返回。
3. 特点
   1. **同源限制**：Worker 线程运行的脚本文件必须与主线程脚本同源。
   2. **DOM 限制**：Worker 线程**无法操作 DOM**（没有 `window`、`document`、`parent` 对象）。
   3. **通信异步**：主线程与 Worker 之间的通信是异步的。
   4. **文件限制**：Worker 无法执行 `alert()` 或 `confirm()`，但可以使用 `XMLHttpRequest` (Ajax) 和 `IndexedDB`。
