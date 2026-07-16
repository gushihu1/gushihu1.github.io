---
title: "APP唤起其他应用的指定页面"
date: 2026-07-14
category: "移动端项目功能"
tags: ["移动端项目功能"]
featured: false
draft: false
readingTime: "1 min"
---
1. 首先在manifest.json里面需要配置对应的scheme
2. 先通过plus.runtime.isApplicationExist判断APP是否安装
3. 如果没有安装进行其他兼容操作
4. 如果安装了，根据相应的scheme链接打开对应的页面
