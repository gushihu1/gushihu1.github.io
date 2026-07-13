---
title: "Vue和React"
date: 2026-07-08
category: "Vue"
tags: ["Vue"]
featured: false
draft: false
readingTime: "2 min"
sourceId: "frontend"
sourceFile: "面试2026.md"
sourceLine: 1447
---

1. 代码长相（编写方式）
   - **Vue：单文件组件（SFC）**。它把 HTML、JS、CSS 规规矩矩地写在一个 `.vue` 文件里，三个亲兄弟各占一个标签（`<template>`、`<script>`、`<style>`）。非常符合传统网页开发的习惯。
   - **React：一切皆是 JSX（JS 的扩展）**。它没有独立的 HTML 模板，而是把 HTML 直接“塞”进 JS 里面写。你表面上在写标签，本质上是在写 JavaScript 逻辑。

2. 数据绑定（改数据的方式）

   - **Vue：双向绑定（自动）**。你用 `v-model` 绑定一个输入框，用户在里面打字，JS 里的变量自动就变了；你在 JS 里改了变量，页面也自动刷新了。

   - **React：单向数据流（手动）**。数据只能从上往下流。你想改状态，必须人肉调用 `setState` 或者 `setValue`。输入框打字时，你得自己写一个监听事件去手动更新变量，否则输入框里的字连动都不会动。

3. 生态选型（官方管不管）

   - **Vue：官方“大包大揽”**。路由用官方的（Vue Router），状态管理用官方的（Pinia/Vuex）。你不用纠结，跟着官方全家桶走就行。

   - **React：官方“只管核心”**。React 官方自称只是一个“专注于 UI 的库”，而不是完整的框架。路由用民间的（React Router），状态管理百花齐放（Redux、Zustand、MobX），选型全靠开发者自己去社区里拼积木。
