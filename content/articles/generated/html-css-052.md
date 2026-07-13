---
title: "精灵图"
date: 2026-07-08
category: "HTML和CSS"
tags: ["HTML和CSS"]
featured: false
draft: false
readingTime: "1 min"
sourceId: "frontend"
sourceFile: "面试2026.md"
sourceLine: 890
---

1. 将所有的图标拼接在一张大图上。在 CSS 中，给目标盒子设置固定的宽高（作为遮罩视窗），将该大图指定为 `background-image`。随后，利用 **`background-position`** 的负向坐标平移，将想要显示的图标精准挪到盒子的视窗内部
2. 精灵图要解决的本质痛点
   1. 减少 TCP 三次握手与首部开销
   2. 突破浏览器的并发连接数限制
3. HTTP/2 的多路复用（Multiplexing）机制
   1. 在现代的 HTTP/2 协议中，引入了 **多路复用（二进制分帧层）** 技术。它允许浏览器在**同一个 TCP 连接通道上，同时、并发且无阻塞地发送和接收成百上千个独立的请求与响应**。
4. 精灵图在现代工程中的缺点
   1. 维护困难，在使用的时候需要一个一个对齐
   2. 缓存问题，即使仅改变一个图标，也需要重新下载新图
   3. 即使只使用一个图标，浏览器也需要对整个图片进行解析
5. 现代方案
   1. 首选方案：IconFont（字体图标）
   2. 终极标准：内联 SVG / SVG Sprite（SVG 符号化）
