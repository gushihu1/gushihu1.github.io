---
title: "js为什么是单线程"
date: 2026-07-14
category: "JS"
tags: ["JS"]
featured: false
draft: false
readingTime: "1 min"
---
1. 避免 DOM 操作的冲突
2. **锁机制（Locking）**：为了防止多个线程同时修改同一块内存，必须引入复杂的加锁机制。
3. **死锁（Deadlock）**：不当的锁使用会导致线程互相等待，系统卡死。
4. **同步开销**：线程间的上下文切换和数据同步会消耗大量资源，对于轻量级的网页交互来说，得不偿失。
5. 为了解决这个问题，JS 引入了 **非阻塞 I/O** 和 **事件循环（Event Loop）** 机制
