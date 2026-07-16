---
title: "获取DOM"
date: 2026-07-14
category: "Vue"
tags: ["Vue"]
featured: false
draft: false
readingTime: "2 min"
---
1. 在 Vue 3 中，不再推荐使用 Vue 2 框架中具有模糊底层指向的 `this.$refs.xxx`，而是通过将**变量名称与模板中的 `ref` 属性保持同名**来进行精准的依赖绑定

   1. ```vue
      <template>
        <div ref="chartRef" class="chart-container"></div>
      </template>
      
      <script setup>
      import { ref, onMounted } from 'vue'
      
      // 2. 核心：声明一个与模板 ref 同名的响应式 Ref 变量，且初始值必须为 null
      const chartRef = ref(null)
      
      onMounted(() => {
        // 3. 在组件挂载（mounted）后，Vue 会自动把真实的 DOM 实例赋给变量的 .value
        if (chartRef.value) {
          console.log('成功获取真实 DOM 节点:', chartRef.value)
          // 此时可安全执行外部插件初始化：myChart.init(chartRef.value)
        }
      })
      </script>
      ```

2. 改变数据后，立刻获取 DOM 还是旧的

   1. **深层机理**：Vue 的 DOM 更新采用的是**异步批处理机制（Async Update Queue）**。当你修改了状态机制，Vue 只会把当前组件标记为“待更新”并推入一个微任务队列中。此时紧挨着状态修改的下一行同步 JS 代码开始执行，真实 DOM 此时尚未开始重绘。
   2. 采用 **`nextTick`** 将依赖 DOM 状态的后续逻辑强制包裹。`nextTick` 的底层是一个微任务。它会等待当前同步代码清空、Vue 渲染引擎完成虚拟 DOM Tree 到真实 DOM 的映射和重绘之后再执行。
