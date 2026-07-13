# 刘梦涛的技术博客

基于 Nuxt 4、Nuxt Content、Nuxt UI、Motion for Vue、tsParticles 与 ECharts 构建的个人技术博客。

## 启动

```bash
npm install
npm run dev
```

生产检查：

```bash
npm run typecheck
npm run build
npm run generate
```

## 导入知识笔记

现有前端知识库默认来源是：

```text
C:\Users\15252\Desktop\面试\面试2026.md
```

源文件更新后执行：

```bash
npm run knowledge:import
npm run knowledge:check
```

默认命令会使用 `interview` 预设，继续保留面试资料的内容范围和隐私排除规则。

导入普通 Markdown 时，通过 `--source` 指定文件，并使用唯一的 `--id` 区分资料来源：

```bash
npm run knowledge:import -- -- --source "D:\资料\AI知识库.md" --id ai --category AI --level 3
npm run knowledge:import -- -- --source "D:\资料\后端知识库.md" --id backend --category 后端 --level 4
```

参数说明：

- `--id`：资料的固定来源标识，建议使用简短英文。重新导入时只更新相同标识的文章，不影响其他来源。
- `--category`：生成文章的博客分类；不指定时会使用拆分标题的上一级标题。
- `--level`：按几级标题拆分，支持 2 到 6，默认按四级标题。
- `--preset generic`：强制使用通用模式。非 `面试2026.md` 文件默认自动使用通用模式。

普通资料只需要使用标准 Markdown 标题结构。例如按三级标题拆分：

```md
## 大模型应用

### RAG 基础流程

正文内容。

### 向量数据库

正文内容。
```

检查某个来源时必须传入与导入时相同的参数：

```bash
npm run knowledge:check -- -- --source "D:\资料\AI知识库.md" --id ai --category AI --level 3
```

导入器会逐字符检查生成正文与原始章节是否一致。不要直接编辑 `content/articles/generated`；原始 Markdown 不会被修改。删除源文件中的某个知识点后，以相同参数重新导入，对应生成文章会自动删除，其他资料来源不会受到影响。

查看所有参数：

```bash
npm run knowledge:help
```

## 手动添加文章

在 `content/articles` 新增 Markdown 文件：

```md
---
title: 文章标题
description: 可选摘要
date: 2026-07-12
category: Vue
tags: [Vue 3, 工程化]
featured: false
draft: false
readingTime: 6 min
---

正文内容
```

文件保存后会自动获得详情路由，并进入文章搜索与标签筛选。`draft: true` 的文章不会出现在文章列表中。

## 添加项目

在 `content/projects` 新增 Markdown。除通用字段外，项目还需要：

```yaml
role: 项目角色
period: 2024.01 — 2025.01
stack: [Vue 3, TypeScript]
```

## 修改个人信息

统一编辑 `app/data/profile.ts`。邮箱、履历、教育信息、技术栈与专业技能都由这里生成。

## 调整特效

- 导航右侧按钮可全局关闭动态效果。
- `prefers-reduced-motion` 用户会自动获得低动态版本。
- 粒子为客户端组件，不阻塞服务端首屏渲染。

部署前请将 `nuxt.config.ts` 中的 `site.url` 修改为真实域名。
