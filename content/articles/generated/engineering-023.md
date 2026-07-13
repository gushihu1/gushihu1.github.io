---
title: "公共请求如何封装，防止重复请求"
date: 2026-07-08
category: "项目搭建"
tags: ["项目搭建"]
featured: false
draft: false
readingTime: "1 min"
sourceId: "frontend"
sourceFile: "面试2026.md"
sourceLine: 412
---

1. 把一些接口公共部分统一进行处理
2. 请求拦截器，一般处理token
3. 如果有特殊需要，如token无感刷新，当token失效的时候，对请求进行拦截，线进行刷新token操作，等获取到新的token再进行接口请求和失败接口重试（拦截通过cancelToken取消请求）
4. 还有如防止重复提交和重复请求的时候，判断接口和参数一致，拦截后续操作，或者返回已经获取到数据
5. 返回拦截器，统一判断状态码，包括HTTP状态码和业务状态码，如果状态码正常，则返回数据部分，如果是报错，则进行统一报错的处理，如果是未登录，则进行跳转登录操作，如果是登录过期，则进行token刷新操作，如果refreshtoken也过期，则进行登录操作
