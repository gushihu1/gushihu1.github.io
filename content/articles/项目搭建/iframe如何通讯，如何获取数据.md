---
title: "iframe如何通讯，如何获取数据"
date: 2026-07-14
category: "项目搭建"
tags: ["项目搭建"]
featured: false
draft: false
readingTime: "1 min"
---
1. 发送
   1. 父页面 window.postMessage
   2. 子页面 window.top.postMessage
2. 接收 监听 message 事件
   1. 而且需要校验数据来源event.origin 

3. websocket
