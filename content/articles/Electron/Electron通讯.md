---
title: "Electron通讯"
date: 2026-07-14
category: "Electron"
tags: ["Electron"]
featured: false
draft: false
readingTime: "1 min"
---
1. #### Preload.js（预加载脚本）与上下文隔离（Context Isolation）

   - **为什么需要？** 在早期版本中，渲染进程可以直接调用 Node.js 的 `fs` 模块，这会导致致命的 XSS 安全漏洞（恶意网页可以直接删除用户本地文件） 。
   - **工作原理**：Preload 脚本在渲染进程网页加载之前执行 。它既能访问 Node.js 的 API，又能访问浏览器的 `window` 对象 。
   - **最佳实践**：通过 `contextBridge.exposeInMainWorld`，将精细化、安全的通道挂载到 `window` 上，严格遵循**最小权限原则**，从而在渲染层和 Node.js 环境之间筑起一道安全防火墙 。

2. 由于进程间内存不共享，主进程与渲染进程之间的数据传递必须通过 IPC 通道 。

   - **通信方向**：
     - `ipcRenderer.send` > `ipcMain.on`（渲染进程向主进程发送单向通知）。
     - `ipcRenderer.invoke` > `ipcMain.handle`（**推荐的异步双向通信**，返回 Promise，不阻塞 UI） 。
