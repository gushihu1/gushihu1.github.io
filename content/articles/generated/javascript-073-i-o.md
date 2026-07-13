---
title: "非阻塞 I/O"
date: 2026-07-08
category: "JS"
tags: ["JS"]
featured: false
draft: false
readingTime: "1 min"
sourceId: "frontend"
sourceFile: "面试2026.md"
sourceLine: 1300
---

1. 主线程将 I/O 任务交给浏览器内核或 Node.js 的底层线程池处理，自己则立即返回去处理执行栈中的下一个任务
2. 当 I/O 任务完成后，其对应的**回调函数**会被推入任务队列
