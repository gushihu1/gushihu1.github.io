---
title: "Vue Router"
date: 2026-07-08
category: "Vue"
tags: ["Vue"]
featured: false
draft: false
readingTime: "5 min"
sourceId: "frontend"
sourceFile: "面试2026.md"
sourceLine: 1501
---

1. 有两种模式。Hash 和 History

2. 路由懒加载（Code Splitting）

   1. ```js
      const UserDashboard = () => import(/* webpackChunkName: "user" */ '../views/UserDashboard.vue')
      ```

3. 路由滚动行为定制（scrollBehavior）

   1. 在大屏可视化或长列表电商系统中，当用户在列表页滚动到一半，点击进入详情页，再点击**后退**返回列表页时，良好的体验是**恢复之前的滚动位置**，而点击导航跳转时则应**滚动到顶部**：

   ```js
   const router = createRouter({
     history: createWebHistory(),
     routes,
     scrollBehavior(to, from, savedPosition) {
       if (savedPosition) {
         // 后退/前进时，保持原有滚动位置
         return savedPosition
       } else {
         // 新导航，滚动到顶部
         return { top: 0 }
       }
     }
   })
   ```

4. 动态路由缓存结合（KeepAlive）

   1. 在需要缓存的动态路由上，在 `meta` 中配置 `keepAlive: true`。

5. 全局守卫（Global Guards）

   直接挂载在 `router` 实例上，对全量路由生效。

   - **`beforeEach(to, from, next)`**：**前置核心**。每次路由切换的首道关卡，常用于全局的 Token 校验、白名单放行、动态路由的按需加载。
   - **`beforeResolve(to, from, next)`**：**解析守卫**。在导航被确认之前，且在**所有组件内守卫和异步路由组件被解析之后**调用。常用于获取用户权限之后、确保组件加载完毕前的最后一次数据拉取。
   - **`afterEach(to, from)`**：**后置钩子**。导航确认后的善后工作，没有 `next`。常用于全局 Loading 进度条的关闭、切换页面 `document.title`、高频数据埋点上报。

6. 路由独享守卫（Per-Route Guards）

   直接定义在具体的 `routes` 配置项中。

   - **`beforeEnter(to, from, next)`**：针对单一路由的访问隔离。例如：只有从特定优惠券活动页跳过来的用户才能进入下单页，或者特定管理页面需要二级密码鉴权。

7. 组件内守卫（In-Component Guards）

   直接写在 Vue 组件的配置项或组合式 API（`onBeforeRouteLeave`等）中。

   - **`beforeRouteLeave`**：组件离开守卫。**极其高频的实战场景**：拦截用户未保存表单直接退出的行为，弹出“内容未保存，是否确认离开？”的提示。
   - **`beforeRouteUpdate`**：组件复用守卫。当路由路径改变，但渲染的组件被复用时触发（例如从 `/user/1` 切换到 `/user/2`）。此时组件不会重新挂载，必须在此钩子里监听参数变化并重新拉取接口。
   - **`beforeRouteEnter`**：组件进入守卫。**特例：此时组件实例尚未创建，因此内部绝对拿不到 `this`**。若要操作实例，必须通过 `next(vm => { /* 此时可用 vm 访问实例 */ })` 的回调。

8. 导航守卫的洋葱执行模型

   1. **触发导航**：路由发生改变。
   2. **失活组件拦截**：在即将离开的组件 A 中调用 **`beforeRouteLeave`**（拦截未保存表单）。
   3. **全局前置初审**：调用全局的 **`beforeEach`**（执行全局 Token 校验，没有则拦截去登录）。
   4. **组件复用判定**：如果是重用组件，调用 `beforeRouteUpdate`。
   5. **路由独享终审**：在对应的路由配置里调用 **`beforeEnter`**。
   6. **解析组件**：解析异步路由组件（实现 Code Splitting 懒加载）。
   7. **目标组件内审**：在即将激活的组件 B 里调用 **`beforeRouteEnter`**（注意：此时无 `this`）。
   8. **全局解析确认**：调用全局的 **`beforeResolve`**（此时组件和动态路由都已就绪）。
   9. **导航确认**：导航被彻底确认。
   10. **全局后置善后**：调用全局的 **`afterEach`**（关闭顶部 Loading 条，修改 Title）。
   11. **DOM 渲染挂载**：触发组件 B 的生命周期（`beforeCreate` -> `created` -> `beforeMount` -> `mounted`），并在 `beforeRouteEnter` 的 `next` 回调中将其实例 `vm` 传回。

9. **动态映射与动态注入**：拿到后端返回的菜单树后（通常包含路由组件的相对路径 `componentPath`），利用 Vite 的 `import.meta.glob` 动态匹配前端的 views 目录。将其转化为标准的 Vue Router 路由配置对象后，调用 **`router.addRoute('layout', dynamicRoute)`** 按需挂载。

10. **KeepAlive 缓存组件的生命周期冲突**： 当一个路由组件被 `<keep-alive>` 包裹时，它在离开时**不会**触发 `unmounted`。它的内部定时器或 WebSocket 会常驻内存，导致内存泄漏。此时需要配合组件内守卫 `beforeRouteLeave` 或 Vue 的 `onDeactivated` 钩子，显式地在离开路由时进行销毁与解绑。
