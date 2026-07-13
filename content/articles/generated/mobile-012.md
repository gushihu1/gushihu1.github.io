---
title: "三方登录是怎么做的"
date: 2026-07-08
category: "移动端项目功能"
tags: ["移动端项目功能"]
featured: false
draft: false
readingTime: "1 min"
sourceId: "frontend"
sourceFile: "面试2026.md"
sourceLine: 273
---

1. 基本都是在链接中传入一个授权code
2. 然后把code发给后台，后台拿着信息去对应的平台校验
3. 成功后返回给前端一个token，就能成功登录
