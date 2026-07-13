---
title: "tabbar页面如何配置"
date: 2026-07-08
category: "移动端项目功能"
tags: ["移动端项目功能"]
featured: false
draft: false
readingTime: "1 min"
sourceId: "frontend"
sourceFile: "面试2026.md"
sourceLine: 221
---

1. tabbar配置可以为不同的社区让他们自定义展示想要展示的内容
2. 我们规定必须有首页和我的页面，而且可以添加0-3个额外的tabbar，除了我的页面不可配置外，其他页面包括首页都可以自定义配置想要的内容，如活动，应用，轮播图，资讯等内容
3. 移动端我们先在uniapp的pages中配置5个tabbar位置
4. 然后通过uview的tabbar组件根据后端返回数据动态加载tabbar
5. 每个页面中使用封装的组件根据数据进行加载对应的模块
6. 模块中再根据信息加载具体数据
