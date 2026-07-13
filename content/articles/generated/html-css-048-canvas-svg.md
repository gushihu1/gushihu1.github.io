---
title: "canvas与svg"
date: 2026-07-08
category: "HTML和CSS"
tags: ["HTML和CSS"]
featured: false
draft: false
readingTime: "2 min"
sourceId: "frontend"
sourceFile: "面试2026.md"
sourceLine: 849
---

| **维度**           | **Canvas (<canvas>)**                                        | **SVG (<svg>)**                                              |
| ------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **画面呈现本质**   | **位移点阵（位图）**。放大后会产生像素锯齿、模糊。           | **数学矢量公式**。无限缩放绝对不失真。                       |
| **DOM 节点开销**   | 极低（整个画布仅包含 1 个 DOM 元素）。                       | 极高（每个独立的线条、圆都是 1 个 DOM 元素）。               |
| **事件监听与交互** | 较难。无法直接绑定 DOM 事件，必须通过**鼠标坐标碰撞检测**和插值解算。 | 极易。支持原生的 CSS `:hover` 伪类以及 JS 的 `addEventListener`。 |
| **CSS / 动效支持** | 无法应用 CSS。动效必须通过 JS 脚本在每一帧里重绘（`requestAnimationFrame`）。 | 完美支持 CSS 样式、变量以及 CSS Keyframes 动画、SMIL 动画。  |
| **文本与 SEO**     | 弱。文本被完全像素化（像素死锁），爬虫无法收录。             | 强。纯文本标签，对原生的 **WAI-ARIA 无障碍树**和搜索引擎友好。 |
| **工业级典型代表** | 游戏引擎（PixiJS、Phaser）、大地图（Cesium、Three.js）、重型大屏。 | 复杂的 ICON 图标、高精度的拓扑图（G6/X6）、印刷级海报。      |
