---
title: "动画实现"
date: 2026-07-08
category: "HTML和CSS"
tags: ["HTML和CSS"]
featured: false
draft: false
readingTime: "2 min"
sourceId: "frontend"
sourceFile: "面试2026.md"
sourceLine: 706
---

1. 原生动画

   1. 通过@keyframes 定义动画，可以通过不同百分比定义不同时间的状态

   2. 通过animation属性使用

      ```css
      .element {
        animation-name: bounce; /* 动画名称（必须与@keyframes名一致） */
        animation-duration: 2s; /* 动画持续时间 */
        animation-timing-function: ease-in-out; /* 速度曲线 */
        animation-delay: 0.5s; /* 开始前的延迟 */
        animation-iteration-count: infinite; /* 播放次数：数字 或 infinite */
        animation-direction: alternate; /* 播放方向：normal, reverse, alternate等 */
        animation-fill-mode: both; /* 动画外状态：forwards, backwards, both */
        animation-play-state: running; /* 播放状态：running 或 paused */
      }
      ```

2. 动画库

   1. animate.css
   2. gsap
      1. gsap.to(元素, 状态)
      2. timeline() 创建时间线
      3. 还可以利用插件实现一些效果，如scrollTrigger可以根据滚动实现一些效果
