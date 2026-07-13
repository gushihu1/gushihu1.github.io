---
title: "事件循环"
date: 2026-07-08
category: "JS"
tags: ["JS"]
featured: false
draft: false
readingTime: "1 min"
sourceId: "frontend"
sourceFile: "面试2026.md"
sourceLine: 1305
---

1. 执行顺序遵循：
   1. 同步代码 -> 执行栈清空 -> 执行所有微任务 -> 取出一个宏任务执行 -> 再次执行所有微任务...
2. 任务分类
   - **宏任务 (Macrotask)**: `script`全部代码、`setTimeout`、`setInterval`、`I/O`、`UI Rendering`。
   - **微任务 (Microtask)**: `Promise.then/catch/finally`、`MutationObserver`、`process.nextTick` (Node.js)。
