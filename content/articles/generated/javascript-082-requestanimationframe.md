---
title: "requestAnimationFrame"
date: 2026-07-08
category: "JS"
tags: ["JS"]
featured: false
draft: false
readingTime: "1 min"
sourceId: "frontend"
sourceFile: "面试2026.md"
sourceLine: 1401
---

1. 在下次重绘（Repaint）之前，调用这个函数来更新动画。
   1. **频率对齐**：它会自动跟随浏览器的刷新频率（通常是 **60fps**，即每 **16.6ms** 执行一次）。
   2. **任务类型**：虽然它看起来像异步回调，但在事件循环中，它处于一个特殊的阶段——**位于微任务之后，渲染阶段之前**。
2. 为什么不用 setTimeout/setInterval 做动画？
   1. **执行时机不确定**：`setTimeout` 属于宏任务，必须等待执行栈清空。如果前面的任务耗时过长，动画回调就会被推迟，导致**掉帧（Jank）**。
   2. **刷新率不匹配**：`setTimeout` 只能手动指定时间（如 16ms），但不同设备的屏幕刷新率不同（有的 120Hz）。rAF 能够**自动感知刷新率**，确保每一帧只执行一次。
   3. **资源浪费**：当页面处于后台或被隐藏（Tab 切换）时，`setTimeout` 依然会继续执行；而 rAF 会**自动暂停**，极大节省了 CPU 和电池寿命。
