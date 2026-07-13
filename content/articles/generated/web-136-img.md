---
title: "如何判断img加载完成"
date: 2026-07-08
category: "其他"
tags: ["其他"]
featured: false
draft: false
readingTime: "2 min"
sourceId: "frontend"
sourceFile: "面试2026.md"
sourceLine: 2405
---

```js
const img = new Image();
img.onload = () => { console.log('加载成功'); };
img.onerror = () => { console.log('加载失败'); };
img.src = "https://example.com/logo.png";
```

1. **致命痛点（面试高频拦截）**：**强缓存导致的异步时序错乱。** 如果该图片之前已经被浏览器强缓存（如 `Cache-Control: max-age=31536000`），那么在执行 `img.src = '...'` 的瞬间，浏览器会同步从内存（Memory Cache）或磁盘中提取出图片。如果你的 `onload` 监听写在 `src` 赋值的**后面**，由于事件循环的微任务/宏任务时序，图片的 `onload` 事件可能在你的监听函数还没绑定上之前就已经触发完毕了，从而导致回调永远不执行。
2. **规避规范**：在任何时候，**必须先绑定 `onload` / `onerror`，最后才能对 `src` 进行赋值。**

```js
// complete 是一个布尔值，代表图片当前的物理就绪状态
if (img.complete) {
    // 图片已经在缓存中，或者已经完全加载出来了，直接执行后续逻辑
    handleImageLoaded();
} else {
    // 图片还在下载中，降级走传统的事件监听
    img.onload = handleImageLoaded;
    img.onerror = handleImageError;
}
```

1. **加分细节**：当图片加载失败（触发 `onerror`）或者 `src` 为空时，浏览器的 `complete` 属性也会变为 `true`。因此，为了确保图片内容真正可用，通常要配合图片原生的物理宽高进行二次校验：`if (img.complete && img.naturalWidth > 0)`。
