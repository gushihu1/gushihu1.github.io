---
title: "vite和webpack区别"
date: 2026-07-08
category: "项目搭建"
tags: ["项目搭建"]
featured: false
draft: false
readingTime: "1 min"
sourceId: "frontend"
sourceFile: "面试2026.md"
sourceLine: 557
---

1. vite是新一代的构建工具，拥有速度快等优点
2. 开发环境热更新原理不同
   1. webpack是一个打包工具，先全部打包，再启动的方式，整体打包会浪费很多时间
   2. vite通过浏览器原生ES modules的方式，给浏览器一个入口文件，并在本地启用一个服务器，浏览器需要什么模块，会向服务器请求，服务器收到请求，会打包浏览器需要的模块返回，是按需进行构建加载
      1. 而且vite会提前通过 esbuild 进行预构建第三方依赖，使后续的启动变快，同时处理了一些三方库的兼容问题
3. 热更新方式
   1. webpack需要重新打包对应的文件及其依赖
   2. vite直接通过es modules的热模块替换
4. 生产构建有差异，但是不如开发环境这么明显
   1. webpack打包方式和开发环境类似，只是在配置上做了一定的优化
   2. vite是通过rollup进行打包
