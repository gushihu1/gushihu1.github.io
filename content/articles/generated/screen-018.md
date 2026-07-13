---
title: "地图一些常用操作都是如何实现的"
date: 2026-07-08
category: "大屏项目功能"
tags: ["大屏项目功能"]
featured: false
draft: false
readingTime: "1 min"
sourceId: "frontend"
sourceFile: "面试2026.md"
sourceLine: 342
---

|                    | 天地图          | 高德地图         | 三方三维模型 | threejs模型                                                  | Cesium瓦片   |
| ------------------ | --------------- | ---------------- | ------------ | ------------------------------------------------------------ | ------------ |
| 打点               | Marker          | Marker           | 自有方法     |                                                              |              |
| 区域               | Polygon         | Polygon          |              |                                                              |              |
| 移动视角           | centerAndZoom   | setZoomAndCenter |              | 控制controls.target和camera.position，或者加上用户可以自主移动的插件 | camera.flyTo |
| 绘制路径           | Polyline        | Polyline         |              |                                                              |              |
| 点位聚合           | MarkerClusterer | MarkerClusterer  |              |                                                              |              |
| 空间分析与碰撞检测 | Turf.js         | GeometryUtil     |              |                                                              |              |
| 历史轨迹回放       | Turf.js         | MoveAnimation    |              |                                                              |              |
| 热力图与气泡图     | HeatmapOverlay  | HeatMap          |              |                                                              |              |
