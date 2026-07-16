---
title: "echart性能优化"
date: 2026-07-14
category: "Echarts"
tags: ["Echarts"]
featured: false
draft: false
readingTime: "2 min"
---
1. 开启 appendData 分片加载。对于散点图（scatter）、线图（line）等，如果数据量极其庞大，不应该一次性 `setOption`。ECharts 提供了 `appendData` 接口，支持分批次、增量渲染数据，避免阻塞浏览器主线程。

   ```js
   // 首次初始化空图表或只渲染第一批数据
   myChart.setOption({ series: [{ type: 'scatter', data: [] }] });
   
   // 后续分批追加数据
   myChart.appendData({
     seriesIndex: 0,
     data: chunkData // 每次只追加一小部分数据
   });
   ```

2. 启用大规模渐进式渲染（progressive）。在配置项中，针对支持的图表类型（如散点图、平行坐标系），可以通过设置 `progressive` 让 ECharts 自动将数据分片，在多帧内渐进式渲染。

   ```js
   series: [{
     type: 'scatter',
     progressive: 2000, // 每次渲染 2000 个点
     progressiveThreshold: 3000 // 当数据量超过 3000 时自动开启渐进式渲染
   }]
   ```

3. 采样降级算法（sampling）。如果折线图的点过于密集（例如单条线有 10 万个点，但屏幕横向分辨率只有 1920 像素），多出的点重叠在一起毫无意义。通过 `sampling` 开启过滤。

   ```js
   series: [{
     type: 'line',
     data: hugeData,
     sampling: 'lttb' // 可选 'average'(平均)、'max'(最大)、'min'、'lttb'(最大程度保持折线形状的算法，推荐)
   }]
   ```

4. 使用 shallowRef 或 直接定义为普通变量

5. 大屏适配或窗口缩放时需要触发 `myChart.resize()`，必须加防抖或节流，避免高频重绘引发掉帧。

6. 数据量大的时候使用 setOption 的性能控制（notMerge）

7. 当组件被卸载、路由切换或弹窗关闭时，必须显式调用 `dispose()` 销毁实例，释放内存并解绑事件。
