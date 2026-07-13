---
title: "defer和async"
date: 2026-07-08
category: "JS"
tags: ["JS"]
featured: false
draft: false
readingTime: "1 min"
sourceId: "frontend"
sourceFile: "面试2026.md"
sourceLine: 1394
---

1. defer，异步下载，延迟执行在HTML解析完成后按顺序执行，能保证他们之间的依赖关系能正确处理
2. async，异步下载，下载完立马进行解析，可能会阻塞HTML的解析
