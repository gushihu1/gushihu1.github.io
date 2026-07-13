---
title: "==Hash和History=="
date: 2026-07-08
category: "其他"
tags: ["其他"]
featured: false
draft: false
readingTime: "1 min"
sourceId: "frontend"
sourceFile: "面试2026.md"
sourceLine: 2305
---

1. 路径格式不同，hash里面带有#号，history不带
2. 原理不同，hash是基于URL的hash，和锚点类似，histroy是基于HTML5的history API
3. hash利用window.location.hash读写内容，利用onhashchange监听
4. history通过API pushState和replaceState进行更改路由记录
5. hash不需要后端支持，history需要页面指向默认页面，如果不配置会导致刷新404等问题
