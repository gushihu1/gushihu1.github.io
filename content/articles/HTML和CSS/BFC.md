---
title: "BFC"
date: 2026-07-14
category: "HTML和CSS"
tags: ["HTML和CSS"]
featured: false
draft: false
readingTime: "2 min"
---
1. BFC 是标准的块级标准文档流在常规排版时，于内存和渲染树（Render Tree）中开辟的一个“完全独立且封闭”的封闭隔离渲染区域
2. 处于 BFC 容器内部的子元素，**其排版结果在任何情况下都绝对不会波及或干扰到外部的盒子**；同理，外部的任何盒流规则也别想染指 BFC 内部的边界。
3. 如何“激活”一个 BFC 容器
   1. 根元素（html）
   2. **浮动流强开**：元素设置了 `float: left / right`（非 none）
   3. **定位流脱离**：元素设置了绝对定位或固定定位（`position: absolute / fixed`）
   4. **块级格式局部变异**：
      - `display: inline-block`（行内块元素）
      - `display: flex / inline-flex`（Flex 弹性流自动托管，其直属子项目天然类似 BFC）
      - `display: grid / inline-grid`（Grid 网格流）
      - `display: table-cell / table-caption`
   5. **溢出裁剪局限（最常用、无样式副作用）**：设置了 `overflow: hidden / auto / scroll`（属性值非 visible）。
   6. 现代 CSS 的演进：display: flow-root
