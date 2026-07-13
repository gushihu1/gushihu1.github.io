---
title: "v-modal"
date: 2026-07-08
category: "Vue"
tags: ["Vue"]
featured: false
draft: false
readingTime: "2 min"
sourceId: "frontend"
sourceFile: "面试2026.md"
sourceLine: 1693
---

1. `v-model` 本质上不是真正的双向绑定，而是 Vue 编译器在编译阶段为组件自动生成的 **Props 传递 + Event 监听** 的复合语法糖。它的底层核心是维持 **单向数据流**。

2. **Vue 2 的实现**： 默认情况下，`v-model` 对应一个名为 `value` 的 Prop 和名为 `input` 的自定义事件

3. 在 Vue 3 中，可以通过给 `v-model` 传入参数来显式改写属性名。

4. 原生 `input` 的输入法（IME）优化拦截

   1. **底层核心原理**：Vue 在处理原生 `input` 元素时，为了提供极致的体验，内部做了一层极其精妙的 **IME（Input Method Editor）遮罩拦截**。

      **技术细节**：

      1. 当用户在使用中文拼音、日文假名等输入法时，浏览器会触发 **`compositionstart`** 事件，标志着组合输入的开始。
      2. 此时，Vue 会在底层为该 DOM 节点打上一个状态锁（`el.composing = true`），**强行切断 `input` 事件对响应式变量的同步更新**。
      3. 只有当用户最终按下空格或回车，确认了汉字汉字并将其填入输入框时，浏览器会触发 **`compositionend`** 事件。
      4. Vue 捕捉到这一契机，将锁解开（`el.composing = false`），并主动触发一次合法的 `input` 事件更新，从而规避了拼音字母未拼完就频繁触发响应式计算、甚至高频拉取后端搜索接口的性能灾难。
