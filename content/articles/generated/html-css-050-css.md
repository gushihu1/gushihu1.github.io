---
title: "CSS优化"
date: 2026-07-08
category: "HTML和CSS"
tags: ["HTML和CSS"]
featured: false
draft: false
readingTime: "1 min"
sourceId: "frontend"
sourceFile: "面试2026.md"
sourceLine: 870
---

1. 关键渲染路径层：切断阻塞，提速白屏指标
   1. 首屏关键 CSS 内联
   2. 合理配置流控加载：Preload 预加载
2. 选择器自右向左匹配机制优化
   1. 推广 **BEM 命名规范**（如 `.user-table__btn--active`），利用高内聚的**单一类名选择器直接直达目标**
3. 避免触发回流，尽量只触发重绘
4. 换肤操作使用最新的CSS变量
