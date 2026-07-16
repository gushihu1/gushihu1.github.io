---
title: "promise"
date: 2026-07-14
category: "代码题"
tags: ["代码题"]
featured: false
draft: false
readingTime: "5 min"
---
```js
console.log('script start');

async function async1() {
    await async2();
    console.log('async1 end');
}

async function async2() {
    console.log('async2 end');
}

async1();

setTimeout(function() {
    console.log('setTimeout');
}, 0);

new Promise(resolve => {
    console.log('Promise');
    resolve();
}).then(function() {
    console.log('promise1');
}).then(function() {
    console.log('promise2');
});

console.log('script end');
```

```
script start
async2 end
Promise
script end
async1 end
promise1
promise2
setTimeout
```

1. **同步宏任务（第一轮执行栈）**：
   - 执行第一行，输出：`script start`。
   - 调用 `async1()`，代码进入 `async1` 内部。遇到 `await async2()`，会同步立刻执行 `async2()`，因此输出：`async2 end`。
   - **核心拐点（V8 规范）**：`await` 之后的代码（即 `console.log('async1 end')`）会被作为**微任务**（我们记为 **`Micro-A`**）塞入微任务队列。此时 `async1` 暂停挂起，控制权交回主线程。
   - 遇到 `setTimeout`，将其回调（宏任务）移交给 Web APIs 计时，就绪后放入下一轮宏任务队列（记为 **`Macro-S`**）。
   - 遇到 `new Promise` 构造函数，内部代码是同步执行的，输出：`Promise`。执行 `resolve()` 后，其第一个 `.then` 回调被放入微任务队列（记为 **`Micro-P1`**）。
   - 执行最后一行同步代码，输出：`script end`。
2. **第一轮宏任务结束，清空微任务队列**：
   - 此时微任务队列中有：`[Micro-A, Micro-P1]`。
   - 取出并执行 `Micro-A`，输出：`async1 end`。
   - 取出并执行 `Micro-P1`，输出：`promise1`。执行完毕后，由于该 Promise 决议，它后面的链式调用 `.then`（即输出 `promise2` 的回调，记为 **`Micro-P2`**）被动态追加到微任务队列尾部。
   - 检查微任务队列，此时还剩 `[Micro-P2]`。取出并执行，输出：`promise2`。微任务清空完毕！
3. **进入下一轮事件循环（执行宏任务）**：
   - 从宏任务队列中取出 `Macro-S`，执行 `setTimeout` 回调，输出：`setTimeout`。

```js
console.log('start');

Promise.resolve().then(() => {
    console.log('p1');
    Promise.resolve().then(() => {
        console.log('p2');
    });
}).then(() => {
    console.log('p3');
});

Promise.resolve().then(() => {
    console.log('p4');
});

console.log('end');
```

```
start
end
p1
p4
p2
p3
```

1. **同步宏任务**：
   - 输出：`start`。
   - 遇到第一个 `Promise.resolve().then`，将其回调（包含 `p1` 的函数，记为 **`Job-1`**）放入微任务队列。
   - 遇到第二个 `Promise.resolve().then`，将其回调（包含 `p4` 的函数，记为 **`Job-2`**）放入微任务队列。
   - 输出：`end`。
   - *注意：此时 `p3` 所在的长链 `.then` 还没决议，因为 `Job-1` 还没运行，所以 `p3` 此时并不在微任务队列中。*
2. ***清空微任务队列（当前队列：`[Job-1, Job-2]`）**：
   - 执行 `Job-1`：输出 `p1`。
     - 内部遇到 `Promise.resolve().then`（包含 `p2`），它的前序已经 Resolve，所以立即将 `p2` 回调（记为 **`Job-p2`**）追加进队列。
     - 关键点：`Job-1` 函数执行完毕并返回。此时，第一长链的第一个 `.then` 宣告执行成功，这触发了其后链式调用的 `.then`（包含 `p3`，记为 **`Job-p3`**）的决议，**`Job-p3` 被紧接着塞入微任务队列**。
     - 当前微任务队列状态更新为：`[Job-2, Job-p2, Job-p3]`。
   - 执行 `Job-2`：输出 `p4`。
   - 执行 `Job-p2`：输出 `p2`。
   - 执行 `Job-p3`：输出 `p3`。
