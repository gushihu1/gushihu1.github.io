---
title: "Vue组件通讯"
date: 2026-07-14
category: "Vue"
tags: ["Vue"]
featured: false
draft: false
readingTime: "2 min"
---
1. 父子组件：单向数据流的绝对控制

   - **`Props` + `Emit`**：最基础的单向数据流闭环。父传子属性，子通过事件通知父修改。

   - **`v-model`（Vue 3 双向绑定语法糖）**：
     - *底层机制*：在 Vue 3 中，`v-model` 变成了 `modelValue` 属性与 `update:modelValue` 事件的组合拳。
     - *高级扩展*：支持绑定多个 `v-model`（如 `v-model:title`），极大地提升了封装复杂表单组件（如单兵控制台、大屏配置项）时的灵活性。

2. 兄弟与跨层级组件：解耦与按需注入
   - **`Provide` / `Inject`（依赖注入）**：
     - *适用场景*：常用于编写高复用的**底层组件库 / 插件**（如 Element Plus 的 Form 与 FormItem 之间的联动）。
     - *高频痛点（面试常考）*：默认情况下，`provide` 传出去的数据**不是响应式**的。如果希望子孙组件能感知变化，必须传一个 `computed` 或经过 `ref`/`reactive` 包裹的响应式对象。

3. 任意 / 全局组件：重型数据流治理

   - **Pinia / Vuex（状态机）**：
     - *适用场景*：跨多页面、多业务线共享的全局上下文（如当前登录的“用户信息”、“用户持有的动态权限菜单树”）。

   - **Mitt / EventBus（发布订阅模式）**：
     - *适用场景*：微前端子应用跨沙箱通信、或者完全解耦的边缘单向通知（如长连接推来一条特定消息，右下角弹窗通知）。

4. `Provide / Inject` 破坏了单向数据流

   1. 在 `provide` 响应式状态的同时，**必须提供一个主动修改该状态的函数**一并传下去。同时，在传值时可以配合 `readonly` 规避非预期篡改。

   2. ```js
      // 祖先组件 (Provider)
      const userInfo = ref({ name: 'admin' })
      const updateName = (newName) => { userInfo.value.name = newName }
      
      provide('user-context', {
        userInfo: readonly(userInfo), // 核心：使用 readonly 包裹，子组件敢直接改就会在控制台报错
        updateName // 只暴露出受控的修改渠道
      })
      ```
