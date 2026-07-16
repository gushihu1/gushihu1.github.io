---
title: "script标签放在header和body底部有什么区别"
date: 2026-07-14
category: "JS"
tags: ["JS"]
featured: false
draft: false
readingTime: "1 min"
---
1. 浏览器的解析是按顺序进行执行的，这样把script放在前面会阻塞HTML文档解析
2. 放在底部可以确保把整个页面结构先渲染出来，减少用户等待
