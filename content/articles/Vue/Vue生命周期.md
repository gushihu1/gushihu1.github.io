---
title: "Vue生命周期"
date: 2026-07-14
category: "Vue"
tags: ["Vue"]
featured: false
draft: false
readingTime: "3 min"
---
| **阶段**     | **Vue 2 Options API** | **Vue 3 Composition API (setup 内)** | **底层核心微观行为**                                         |
| ------------ | --------------------- | ------------------------------------ | ------------------------------------------------------------ |
| **初始化**   | `beforeCreate`        | **不需要** (直接写在 `setup`)        | 实例刚创建，**数据劫持（Proxy/defineProperty）尚未开始**，拿不到 `data` / `props`。 |
| **数据就绪** | `created`             | **不需要** (直接写在 `setup`)        | **数据劫持已完成**，响应式数据、`computed`、`methods` 已就绪。但 **DOM 尚未挂载**。 |
| **挂载前**   | `beforeMount`         | `onBeforeMount`                      | 虚拟 DOM 树已构建完成，相关的**渲染副作用（Render Effect）准备首次执行**。 |
| **挂载完成** | `mounted`             | `onMounted`                          | **真实 DOM 已挂载到页面上**，可以进行 DOM 操作（如初始化 ECharts 实例、获取节点宽高）。 |
| **更新前**   | `beforeUpdate`        | `onBeforeUpdate`                     | 响应式数据发生改变，此时**数据已新，但视图未新**。准备进入虚拟 DOM 的 Diff 阶段。 |
| **更新完成** | `updated`             | `onUpdated`                          | 虚拟 DOM 完成 Diff 算法比对并打补丁（Patch），**真实 DOM 已经完成重绘渲染**。 |
| **销毁前**   | `beforeDestroy`       | `onBeforeUnmount`                    | 组件卸载前触发。此时**实例完全可用**，是清除定时器、解绑全局事件监听的**黄金时机**。 |
| **销毁完成** | `destroyed`           | `onUnmounted`                        | 组件已被完全卸载，所有的子实例被销毁，所有的**响应式依赖监听（Watcher/Effect）已被停止**。 |

1. **挂载链路**：
   1. 父 `beforeCreate`
   2. 父 `created`
   3. 父 `beforeMount`
   4. 子 `beforeCreate` 
   5. 子 `created`
   6. 子 `beforeMount` 
   7. **子 `mounted`**
   8. **父 `mounted`**。
2. **更新链路**：
   1. 父 `beforeUpdate`
   2. 子 `beforeUpdate`
   3. **子 `updated`**
   4. **父 `updated`**。
3. **销毁链路**：
   1. 父 `beforeUnmount` 
   2. 子 `beforeUnmount`
   3. **子 `unmounted`**
   4. **父 `unmounted`**。
4. 当组件被 `<keep-alive>` 包裹时，它在切出时不会被真正销毁（不走 `unmounted`），而是进入**缓存状态**。Vue 为其特制了两个高级钩子：
   - `onActivated`：组件被激活（切回）时触发。**场景**：大屏系统切回时，重新建立 WebSocket 连接或重开定时器。
   - `onDeactivated`：组件被缓存（切走）时触发。**场景**：切走时，主动暂停页面的高频轮询，断开 WebSocket，释放 CPU。
