---
title: "重绘与回流"
date: 2026-07-08
category: "HTML和CSS"
tags: ["HTML和CSS"]
featured: false
draft: false
readingTime: "3 min"
sourceId: "frontend"
sourceFile: "面试2026.md"
sourceLine: 1017
---

| **特性**     | **回流（Reflow / Layout）**                                  | **重绘（Repaint）**                                        |
| ------------ | ------------------------------------------------------------ | ---------------------------------------------------------- |
| **本质定义** | 浏览器需要重新计算元素的**几何属性**（位置和大小）。         | 元素的几何属性未变，只需重新绘制其**外观属性**。           |
| **触发原因** | 影响页面布局、结构、几何尺寸的操作。                         | 仅影响视觉表现、不影响整体布局的操作。                     |
| **性能开销** | **极高**。因为一个元素的几何变化往往会引发连锁反应，导致其子元素、兄弟元素乃至整个页面的重新计算。 | **较低**。不需要重新计算布局，直接由渲染引擎进行像素填充。 |
| **因果关系** | **回流必将引起重绘**。因为位置或大小变了，必然要重新画到屏幕上。 | **重绘不一定会引起回流**。                                 |

1. 触发回流（Reflow）的常见场景：
   1. **DOM 操作**：添加、删除、移动 DOM 节点。
   2. **几何属性改变**：修改元素的 `width`、`height`、`padding`、`margin`、`border` 等。
   3. **位置与布局改变**：修改 `top`、`left`、`float`、`display` 等。
   4. **页面尺寸/环境变化**：浏览器窗口大小改变（`resize` 事件）、字体大小（`font-size`）改变。
   5. **激活伪类**：例如 `:hover` 修改了边框大小。
   6. **获取某些特定的属性（致命痛点）**：
      - 为了给出准确的值，浏览器必须**强行刷新渲染队列**，立刻执行一次回流。
      - 常见属性：`offsetTop`, `offsetLeft`, `offsetWidth`, `offsetHeight`, `scrollTop`, `scrollLeft`, `scrollWidth`, `scrollHeight`, `clientTop`, `clientLeft`, `clientWidth`, `clientHeight`, `getComputedStyle()`。

2. 触发重绘（Repaint）的常见场景：
   1. 修改颜色类属性：`color`、`background-color`。
   2. 修改文本/边框样式：`border-style`、`outline`。
   3. 修改能见度与视觉效果：`visibility: hidden`（注意：`display: none` 会触发回流）、`box-shadow`。
