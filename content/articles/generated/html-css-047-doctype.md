---
title: "Doctype作用"
date: 2026-07-08
category: "HTML和CSS"
tags: ["HTML和CSS"]
featured: false
draft: false
readingTime: "1 min"
sourceId: "frontend"
sourceFile: "面试2026.md"
sourceLine: 839
---

1. ```HTML
   <!DOCTYPE html>
   ```

2. 虽然它在 HTML5 时代已经不再承载过往 DTD 外部定义文件的网络指向职责，但它作为**‘标准渲染模式’与‘怪异渲染模式’的分流硬开关**

3. 一旦进入怪异模式，可能导致现代 CSS 样式规则、响应式计算失效，导致排版彻底乱套
