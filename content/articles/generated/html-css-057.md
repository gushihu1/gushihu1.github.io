---
title: "背景颜色填充区域"
date: 2026-07-08
category: "HTML和CSS"
tags: ["HTML和CSS"]
featured: false
draft: false
readingTime: "1 min"
sourceId: "frontend"
sourceFile: "面试2026.md"
sourceLine: 994
---

1. 在 CSS 中，控制背景颜色的填充区域主要通过 **`background-clip`** 属性来实现

   1. `border-box` (默认值)

2. 实现“镂空文字”或“渐变文字”

   1. `background-clip` 的一个特殊值：**`text`**

   2. ```css
      .text-gradient {
        /* 1. 设置渐变背景 */
        background-image: linear-gradient(to right, red, blue);
        
        /* 2. 核心：将背景裁剪为文字形状 */
        -webkit-background-clip: text;
        
        /* 3. 核心：将文字本身设置为透明，让背景透出来 */
        color: transparent;
      }
      ```
