---
title: "三维搭建步骤"
date: 2026-07-08
category: "大屏项目功能"
tags: ["大屏项目功能"]
featured: false
draft: false
readingTime: "1 min"
sourceId: "frontend"
sourceFile: "面试2026.md"
sourceLine: 375
---

1. 首先创建DOM并对其进行threejs初始化
2. 添加环境光等光源
3. 初始化相机，并调整相机到预设的角度
4. 设置背景环境图片
5. 进行模型加载并监听加载进度
6. 添加控制器，让用户可以对模型拖拽，并设置一些限制，防止用户缩放太小或者拖到不想被看到的角度
7. 在需要进行打点的时候，通过射线检测用户点击位置，记录下点击点的三维坐标
8. 在需要展示点位的时候，通过CSS2DRenderer根据坐标把点位展示出来
9. 在页面关闭的时候需要对模型销毁，以防内存溢出
