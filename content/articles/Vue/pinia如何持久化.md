---
title: "pinia如何持久化"
date: 2026-07-14
category: "Vue"
tags: ["Vue"]
featured: false
draft: false
readingTime: "1 min"
---
1. 使用插件 pinia-plugin-persistedstate
   1. **配置极其简单**：在定义 Store 时，只需简单开启 `persist: true` 即可实现持久化 。
   2. **自动拦截与同步**：插件会自动拦截 Store 中 Actions 的状态变更，并实时将最新的 State 同步到设定的存储介质中 。
   3. 可以选择localStorage或者sessionStorage
   4. 在uniapp或其他存储环境中，也能自定义如何存储和取值
   5. 支持通过配置 `paths` 来选择性地持久化某些特定的 State 字段，而非整个 Store
