---
title: "居中方法"
date: 2026-07-08
category: "HTML和CSS"
tags: ["HTML和CSS"]
featured: false
draft: false
readingTime: "1 min"
sourceId: "frontend"
sourceFile: "面试2026.md"
sourceLine: 765
---

1. Flex 弹性盒模型方案

   1. ```css
      .parent {
        display: flex;
        justify-content: center; /* 主轴居中 */
        align-items: center;     /* 交叉轴居中 */
      }
      ```

   2. ```css
      .child { margin: auto; }
      ```

2. Absolute + Transform 方案

   1. ```css
      .parent {
        position: relative; /* 建立包含块底座 */
      }
      .child {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%); /* 核心：相对于自身宽高的负向平移 */
      }
      ```

3. Line-height 
