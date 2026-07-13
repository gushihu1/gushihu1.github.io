---
title: "flex"
date: 2026-07-08
category: "HTML和CSS"
tags: ["HTML和CSS"]
featured: false
draft: false
readingTime: "2 min"
sourceId: "frontend"
sourceFile: "面试2026.md"
sourceLine: 666
---

1. Flex 布局的核心是**双轴坐标系**模型。开启 `display: flex` 的元素成为 **Flex 容器（Container）**，其直属子元素自动成为 **Flex 项目（Item）**。

   - **主轴（Main Axis）**：默认是水平方向，由 `flex-direction: row` 决定。
   - **交叉轴（Cross Axis）**：垂直于主轴的方向，默认是竖直方向。

   > **资深细节**：Flex 项目的很多传统 CSS 属性会直接**失效**，例如 `float`、`clear`、`vertical-align` 以及外边距塌陷机制。

2. `flex` 属性

   1. 是 `flex-grow`、`flex-shrink` 和 `flex-basis` 的简写，默认值为 `0 1 auto`。
   2. 而 **`flex: 1` 实际代表的是 `1 1 0%`**
   3. flex-basis 的优先级绝对高于 width

3. 经典文字溢出撑破 Flex 容器

   1. flex: 1的Ellipsis 根本不生效，文字依然把右侧盒子疯狂撑大并挤出了屏幕。
   2. **底层成因**：Flex 项目的默认最小宽度属性 `min-width` 的值是 `auto`
   3. 必须在那个被撑破的 `flex: 1` 元素上加上一行 **`min-width: 0;`**

4. 常用属性

   1. flex-direction
   2. flex-wrap
   3. align-items
   4. justify-content
   5. align-self
   6. order
