---
title: "less和scss"
date: 2026-07-08
category: "HTML和CSS"
tags: ["HTML和CSS"]
featured: false
draft: false
readingTime: "1 min"
sourceId: "frontend"
sourceFile: "面试2026.md"
sourceLine: 735
---

1. 他们都是css的预处理器
2. 都支持变量，嵌套写法，混合，函数
3. 语法差异
   1. 变量声明，less中使用@，scss中使用$
   2. 混合方式，less中使用直接定义引入，scss通过关键字@mixin，@include的定义引入，更加清晰明了
   3. 一些内置函数不太一样
   4. scss 支持 @if @else @each 判断和循环
4. 父选择器都是 &
