---
title: "nextTick"
date: 2026-07-14
category: "Vue"
tags: ["Vue"]
featured: false
draft: false
readingTime: "2 min"
---
1. Vue 实现 `nextTick` 的核心逻辑是：

   1. **数据变化**：Vue 监听到数据修改。
   2. **开启队列**：Vue 不会立即更新 DOM，而是开启一个队列，并缓存在同一事件循环中发生的所有数据变更。
   3. **刷新队列**：通过一个异步方法（`nextTick` 的底层实现）来清空队列并执行实际的 DOM 更新。
   4. **执行回调**：用户通过 `nextTick(cb)` 传入的 `cb` 会被推入这个异步队列的末尾，因此它能拿到更新后的 DOM。

2. 实现优先级

   1. `Promise` (微任务)
   2. `MutationObserver` (微任务)
   3. `setImmediate` (宏任务)
   4. `setTimeout` (宏任务)

3. 简易实现

   1. ```js
      const callbacks = []; // 存储回调函数的队列
      let pending = false;  // 标记是否正在等待执行
      
      function flushCallbacks() {
        pending = false;
        const copies = callbacks.slice(0);
        callbacks.length = 0;
        for (let i = 0; i < copies.length; i++) {
          copies[i]();
        }
      }
      
      export function nextTick(cb) {
        // 1. 将回调压入队列
        callbacks.push(() => {
          if (cb) cb();
        });
      
        // 2. 如果当前没有正在等待的任务，开启微任务异步锁
        if (!pending) {
          pending = true;
          Promise.resolve().then(flushCallbacks);
        }
      }
      ```
