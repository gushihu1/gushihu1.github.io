---
title: "ts与js"
date: 2026-07-08
category: "JS"
tags: ["JS"]
featured: false
draft: false
readingTime: "1 min"
sourceId: "frontend"
sourceFile: "面试2026.md"
sourceLine: 1280
---

| **维度**     | **JavaScript (JS)**                                          | **TypeScript (TS)**                                          |
| ------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **错误发现** | **运行时**（Runtime）。常出现 `undefined is not a function`。 | **编译时**（Compile-time）。代码写错时编辑器直接飘红。       |
| **重构能力** | 极差。修改一个函数参数，需全局搜索，极易遗漏。               | **极强**。修改类型定义后，所有引用处都会报错，支持一键重构。 |
| **文档价值** | 弱。需写大量的 JSDoc 注释，且注释易与代码脱节。              | **代码即文档**。Interface 和 Type 定义了清晰的业务模型。     |
| **学习成本** | 低。                                                         | 中/高。需掌握泛型、断言、装饰器、联合类型等。                |
| **开发成本** | 低                                                           | 高                                                           |
