---
title: "APP热更新如何实现"
date: 2026-07-08
category: "uniapp"
tags: ["uniapp"]
featured: false
draft: false
readingTime: "1 min"
sourceId: "frontend"
sourceFile: "面试2026.md"
sourceLine: 1982
---

1. 首先在打包的时候确定版本号，然后打一个wgt热更新包，传到服务器
2. 在APP启动的时候调用接口获取最新版本号，和当前版本号进行对比，如果满足条件就下载最新的wgt包
3. 下载完成后进行安装，然后重启一下APP就完成更新了
