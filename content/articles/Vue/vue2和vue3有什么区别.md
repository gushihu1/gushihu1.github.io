---
title: "vue2和vue3有什么区别"
date: 2026-07-14
category: "Vue"
tags: ["Vue"]
featured: false
draft: false
readingTime: "1 min"
---
1. 双向绑定的方式不一样了，Object.defineProperty 和 Proxy，在对象中defineProperty只能监听到已经有的属性，无法对后续添加的属性进行监听，所以说需要后面再次添加的属性需要 $set 进行再次添加响应，对于数组是重写了部分常用的方法来进行监听，对于直接通过下标修改和未重写的方法修改数组，是无法进行响应的，也需要用$set，proxy可以直接对整个对象进行监听，无论是开始就有还是后续添加的属性，都能在变化的时候监听到
2. Vue3新增了组合式API，可以更方便的对逻辑进行抽离和复用，同时还兼容老的选项是API
3. Vue3对TS有了更好的支持
4. v-if 和 v-for 优先级不同了，vue2中 v-for 优先级高，可以循环之后判断每个节点是否展示，vue3中 v-if 优先级高，会先判断是否展示当前for循环节点，而且无法再获取到for循环的内容了
5. 工具上不同，Vue3基本上都用pinia+vite
6. 生命周期命名做了改动
7. 可以多个根节点
8. 新增teleport组件，可以传递组件到指定位置
