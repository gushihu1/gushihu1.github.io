---
title: "移动端不同机型的兼容问题"
date: 2026-07-08
category: "移动端项目功能"
tags: ["移动端项目功能"]
featured: false
draft: false
readingTime: "1 min"
sourceId: "frontend"
sourceFile: "面试2026.md"
sourceLine: 286
---

##### 不同端

可以通过条件编译适配不同端，不同的端执行不同的代码

##### 移动端输入框适配输入法弹起

1. onKeyboardHeightChange进行监听输入法是否弹起，且获得输入法的高度
2. 通过获得的高度进行调整元素的位置

##### 安全区域

1. constant  env

##### 图片模糊问题（dpr 差异）

1. 使用 `srcset` 或通过媒体查询结合背景图，根据不同的 `devicePixelRatio` 加载 2x 或 3x 的图片

##### 时间格式化（iOS 的大坑）

1. iOS 只支持 `/` 分隔符，不支持`-` 写法，需要使用库或者把`-` 替换成`/` 

##### 点击延迟

##### drp

##### 点击穿透

##### 圆角bug
