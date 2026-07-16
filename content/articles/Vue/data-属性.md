---
title: "data-属性"
date: 2026-07-14
category: "Vue"
tags: ["Vue"]
featured: false
draft: false
readingTime: "2 min"
---
1. HTML5 规范引入 `data-*` 是为了在真实的 DOM 节点上无污染地绑定非标准自定义状态。
2. 声明与访问
   1. **物理命名规则**：必须全小写，多单词通过中划线连接，如 `data-user-id="1024"`。
   2. **映射映射转化**：当通过 `el.dataset` 访问时，浏览器底层 C++ 内核会将其强制转换为**驼峰命名（CamelCase）**：`el.dataset.userId`。
   3. **性能代价（大厂高频深度关注）**：每次调用 `el.dataset` 时，浏览器引擎都会在内存中**动态扫描并实时构建一个 Proxy/Map 实体字典**。在长列表或瀑布流高频遍历中，无脑调用 `el.dataset.xxx` 会引发不必要的垃圾回收（GC）与 CPU 损耗，工程化规范中通常建议退化采用原生的 **`el.getAttribute('data-user-id')`** 换取纯粹的字符串存取性能。
3. 在 Vue 3 的模板编译期（Compiler），当检测到某个节点上声明了固定的 `data-*` 属性时，Vue 3 会敏锐地判定这是一个**只读的静态节点（Static VNode）**，对其执行 **静态提升（Static Promotion）**。这意味着在页面组件重新 Patch、Diff 变动时，该节点在内存中只会被创建一次，**Diff 算法会无脑直接跳过它**，完全不参与运行时的 Diff 扫描，使得 Diff 开销完美正比于动态节点的总数，而非模板的大小。
4. Vue 样式隔离组件的底层底座。
   1. 为当前组件的所有虚拟 DOM 和真实 DOM 节点统一注入一个唯一的哈希自定义属性
   2. 它会重写你的 CSS 选择器，加上对应的属性选择器
