---
title: "视差滚动"
date: 2026-07-08
category: "HTML和CSS"
tags: ["HTML和CSS"]
featured: false
draft: false
readingTime: "1 min"
sourceId: "frontend"
sourceFile: "面试2026.md"
sourceLine: 880
---

1. 这个我们一般不会手写，都是用强大的动画库来实现，如GSAP
2. 如果手写的话
   1. 对于简单的可以使用纯CSS来完成。
      1. 利用 CSS 3D 变换中的 **`perspective`（透视/视距）** 和 **`translateZ`（Z 轴物理平移）**
      2. 为了让远处的元素在视觉上不缩水变形，再通过 **`scale()`（等比缩放）** 对其进行物理反向补偿
   2. 复杂的使用JS来完成。
      1. 通过 **`passive: true` 解耦原生滚动阻断**，引入 **`requestAnimationFrame` 做高精度帧率对齐**
