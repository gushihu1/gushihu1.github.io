---
title: "this"
date: 2026-07-08
category: "JS"
tags: ["JS"]
featured: false
draft: false
readingTime: "1 min"
sourceId: "frontend"
sourceFile: "面试2026.md"
sourceLine: 1156
---

1. **默认绑定**：

   - 在非严格模式下，普通函数独立调用时，`this` 指向全局对象（浏览器中是 `window`） 。
   - 在严格模式（`'use_config'`）下，`this` 指向 `undefined`。

2. **隐式绑定**：

   - 当函数作为对象的方法被调用时，`this` 指向该对象。
   - **注意隐式丢失**：如果将对象的方法赋值给一个变量后再调用，`this` 会丢失并指向全局对象。

3. **显式绑定**：

   - 通过 `call()`、`apply()` 或 `bind()` 手动指定 `this` 的指向 。
   - `bind` 会返回一个永久绑定了 `this` 的新函数，而 `call` 和 `apply` 是立即执行。

4. **new 绑定**：

   - 使用 `new` 关键字调用构造函数时，`this` 指向新创建的实例对象 。

5. 优先级顺序

   当多个规则同时出现时，遵循以下优先级（由高到低）：

   > **`new` 绑定 > 显式绑定 (`call/apply/bind`) > 隐式绑定 > 默认绑定**

6. 总结

   1. 主要看是谁调用，谁调用指向谁
   2. new关键字构造时，指向新的实例
   3. 显示绑定的时候指向所绑定的内容
