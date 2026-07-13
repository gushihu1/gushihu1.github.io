---
title: "MVVM"
date: 2026-07-08
category: "Vue"
tags: ["Vue"]
featured: false
draft: false
readingTime: "1 min"
sourceId: "frontend"
sourceFile: "面试2026.md"
sourceLine: 1439
---

1. **MVC（Model-View-Controller）的痛点**：MVC 的 View 和 Model 之间往往存在双向耦合，Controller 需要人肉编写大量的 DOM 操作代码。随着业务复杂，Controller 会变得臃肿不堪（Fat Controller），代码极难维护。
2. **MVVM （Model-View-ViewModel）的破局**：MVVM它引入了 **ViewModel** 这一核心桥梁，通过**自动化机制**彻底解耦了 View 和 Model。
3. **View（视图层）**：声明式的 HTML/模板。它只负责单纯的 UI 渲染和用户交互，**不承载任何复杂的业务逻辑或状态管理**。
4. **Model（模型层）**：纯粹的业务数据（JS 对象/从后端 API 获取的 JSON）以及对应的业务逻辑。
5. **ViewModel（视图模型层）**：MVVM 的核心。它是 **View 的抽象**，一方面将 Model 的纯数据转化为 View 容易渲染的形式，另一方面作为**数据绑定器（Data Binder）**，自动处理双向的流动。
