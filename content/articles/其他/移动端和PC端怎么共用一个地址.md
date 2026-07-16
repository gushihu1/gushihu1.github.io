---
title: "移动端和PC端怎么共用一个地址"
date: 2026-07-14
category: "其他"
tags: ["其他"]
featured: false
draft: false
readingTime: "1 min"
---
1. 识别是什么端，通过navigator.userAgent
2. 如果页面差距过大，功能什么的也有很多差别，可以使用不同的代码就通过不同的端跳转到不同的页面路径
3. 如果页面功能差距不大，或者功能相同，只是展示不同，可以使用同一套代码，就要考虑通过布局样式来进行不同的适配
4. 因为移动端设备比较多，不同的设备屏幕大小还不相同所以需要不同移动端的适配
   1. 设置视窗 meta viewport
   2. 媒体查询 @media
   3. 流体布局，flex 百分比 rem 等等
   4. 通过插件 postcss-pxtorem postcss-px-to-viewport
