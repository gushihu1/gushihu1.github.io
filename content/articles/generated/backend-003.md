---
title: "登录重构都改了什么，涉及到什么问题"
date: 2026-07-08
category: "后台项目功能"
tags: ["后台项目功能"]
featured: false
draft: false
readingTime: "1 min"
sourceId: "frontend"
sourceFile: "面试2026.md"
sourceLine: 166
---

1. 以前我们的系统是单租户系统，现在需要把系统改造成多租户的系统，而且多个租户之间可以直接进行切换操作
2. 用户通过账号密码或者短信等方式登录后，先登录上他的账号，获取到用户的token和refreshToken，然后通过接口获取到他有权限的租户，用户点击选择需要登录的租户，再带入租户的信息进行二次登录操作，获取到租户的token和refreshToken，获取其他基础信息，再进入到首页就完成了登录操作
3. 在用户切换账户的时候也是传入用户的token，再带入选择的租户的信息重新进行登录操作，更新用户的token等基础信息，如果用户token过期，通过用户refreshToken获取新的token再进行登录操作，如果refreshToken也过期，就返回登录页面让用户重新登录
4. 在租户token到期的时候，先拦截失败的和未完成的请求，通过refreshToken重新获取，在获取到新token时重试失败和拦截请求，就完成了token的无感刷新
5. 在请求中，我们还需要通过请求拦截器在请求头中加入Tenant-ID信息，让后台知道是什么租户
