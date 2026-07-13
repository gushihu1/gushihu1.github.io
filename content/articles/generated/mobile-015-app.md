---
title: "APP和小程序支付流程"
date: 2026-07-08
category: "移动端项目功能"
tags: ["移动端项目功能"]
featured: false
draft: false
readingTime: "1 min"
sourceId: "frontend"
sourceFile: "面试2026.md"
sourceLine: 317
---

##### 微信支付

1. 先通过接口把需要支付的订单信息发送给后台
2. 后台从微信那边获取到微信支付订单信息和签名信息返回前端
3. 我们通过微信的支付接口就可以直接调用支付
4. 通过向后端查询支付结果确认订单状态
5. 展示对应结果页面
