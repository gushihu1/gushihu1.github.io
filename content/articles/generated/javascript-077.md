---
title: "深拷贝和浅拷贝"
date: 2026-07-08
category: "JS"
tags: ["JS"]
featured: false
draft: false
readingTime: "2 min"
sourceId: "frontend"
sourceFile: "面试2026.md"
sourceLine: 1353
---

- **浅拷贝 (Shallow Copy)**：仅拷贝对象的第一层属性 。如果属性是基本类型，则拷贝值；如果属性是引用类型，拷贝的是指向堆内存的**指针** 。因此，修改新对象的引用属性会直接影响原对象。
- **深拷贝 (Deep Copy)**：在堆内存中递归开辟一块全新的空间，将原对象的所有属性（无论嵌套多深）完整地拷贝过去 。新旧对象完全隔离，互不影响。
  - JSON.parse(JSON.stringify()) 
    - **Symbol 和 undefined**：在序列化过程中会被直接忽略（丢弃） 。
    - **BigInt**：会直接抛出 `TypeError` 错误，导致程序崩溃 。
    - **函数 (Function)**：无法序列化，会被丢失 。
    - **循环引用**：如果对象内部存在循环引用，会报错 `Converting circular structure to JSON`。
  - 递归深拷贝
    - **利用 `Reflect.ownKeys()`**：确保能获取包括 `Symbol` 在内的所有键名 。传统的 `for...in` 或 `Object.keys()` 无法获取不可枚举属性和 **Symbol** 类型的键名 
    - **引入 `WeakMap` 解决循环引用**：通过记录已拷贝的对象，防止递归进入死循环，同时利用 `WeakMap` 的弱引用特性，避免因内存未释放导致的**内存泄漏** 。
    - **特殊类型处理**：针对 `Date`、`RegExp`、`Map`、`Set` 等内置对象，需通过对应的构造函数进行重新实例化 。
