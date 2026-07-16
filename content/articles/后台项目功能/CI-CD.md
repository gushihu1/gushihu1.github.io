---
title: "CI/CD"
date: 2026-07-14
category: "后台项目功能"
tags: ["后台项目功能"]
featured: false
draft: false
readingTime: "1 min"
---
1. 整个流水线我们主要基于 GitLab CI 进行编排，当有新代码提交之后，自动进行打包
2. 打包完成后，测试环境自动部署，正式环境通过API自动推送到后台，等待管理员确认之后然后进行发布
