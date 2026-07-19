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

## 本地导入和维护文章

开发环境打开：

```text
http://127.0.0.1:3000/admin/import
```

“内容导入”只在本机开发模式显示，开发服务器默认仅监听 `127.0.0.1`。页面可以选择 Markdown 文件、拆分标题级别、分类和导入根目录，也可以直接输入新目录。导入根目录选择 `.` 时表示直接使用 `content/articles`。

页面默认开启“按标题自动分目录”。例如按四级标题拆文章、目录标题级别选择三级时：

```text
content/articles/<导入根目录>/
├─ Vue/
│  ├─ pinia如何持久化.md
│  └─ Vue生命周期.md
├─ JS/
│  └─ 事件循环.md
└─ 其他/
   └─ 没有三级父标题的文章.md
```

自动目录只使用指定级别的一个父标题，不生成多层标题目录。缺少该级标题、标题为空或清理后无效时进入固定的 `其他` 目录；页面中的“固定分类”只修改文章 frontmatter 的 `category`，不会改变自动目录。

导入器按照“文章目标目录 + 标题文件名 + 内容”处理文章：

- 没有同名文件：新增。
- 同名且标题、分类、标签和正文一致：跳过。
- 同名但内容不同：选择保留现有、使用新内容或同时保留。
- 原始资料中删除的章节：不会删除已有文章。

生成文件使用文章标题命名；同一目录重名时自动生成 `标题-2.md`、`标题-3.md`，不同目录允许同名。已有平铺文章或旧编号文章只有在根目录内找到唯一匹配时才会安全移动；多个候选会显示警告并保留旧文件。这些文件可以继续作为普通文章直接编辑，后续导入不会整批删除目录。

### 命令行导入

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

导入普通 Markdown 时，通过 `--source` 指定文件，并使用 `--output` 选择保存目录：

```bash
npm run knowledge:import -- --source "D:\资料\AI知识库.md" --output ai --category AI --level 3
npm run knowledge:import -- --source "D:\资料\后端知识库.md" --output backend --category 后端 --level 4
npm run knowledge:import -- --source "D:\资料\面试.md" --output . --level 4 --folder-level 3
```

参数说明：

- `--output`：`content/articles` 下的导入根目录，默认为 `generated`；传 `.` 直接使用 `content/articles`。
- `--folder-level`：按指定父标题级别自动分目录，支持 1 到 5 且必须低于 `--level`。命令行不传此参数时保持平铺导入。
- `--conflict`：批量冲突策略，支持 `ask`、`keep`、`replace`、`keepBoth` 和 `error`。
- `--id`：保留用于兼容旧命令；当前匹配规则不依赖来源标识。
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
npm run knowledge:check -- --source "D:\资料\AI知识库.md" --output ai --category AI --level 3
```

`knowledge:check` 只显示新增、一致、冲突、移动/改名、目录分布和匹配警告，不写入任何文件。命令行遇到冲突时会逐篇询问；非交互环境必须通过 `--conflict` 明确指定策略。原始 Markdown 始终不会被修改。

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

标题使用 `==标题==` 标记的文章会进入首页精选区域。首页按现有文章排序取第一篇作为主精选，其余最多五篇进入“文章精选”列表，不再读取文章的 `featured` 字段决定精选状态。

## 个人笔记

开发环境可以通过页头的个人笔记入口访问 `/notes`。个人笔记存放在 `content/private-notes`，可以直接在同一个 Obsidian Vault 中维护：

```md
---
title: 临时想法
---

这里记录不会公开发布的内容。
```

该目录已加入 `.gitignore`，不会进入 Nuxt Content 集合、知识图谱或生产内容数据库。个人笔记页面和读取接口同时限制为开发环境及本机访问；生产环境直接访问 `/notes` 或对应接口会返回 404。

## 添加项目

在 `content/projects` 新增 Markdown。除通用字段外，项目还需要：

```yaml
role: 项目角色
period: 2024.01 — 2025.01
stack: [Vue 3, TypeScript]
```

项目与作品是两个独立集合。项目不需要配置作品，也不会自动出现在作品页。

## 添加作品

在 `content/showcases` 新增 Markdown。作品图片可以存放在 `public/images/showcases/<作品文件名>/`；已有项目图片也可以继续复用原路径。

```yaml
title: 数据驾驶舱界面
description: 核心指标与趋势分析界面
date: 2024-01-01
tags: [Vue 3, ECharts]
featured: false
draft: false
gallery:
  - src: /images/projects/data-cockpit/overview.webp
    alt: 数据驾驶舱首页
    caption: 核心指标与趋势分析
```

`caption` 是可选字段，`src` 和 `alt` 必填。建议使用经过压缩和脱敏处理的 WebP 或 JPEG 图片。作品与项目默认彼此独立，需要关联时在作品正文加入 Wiki Link。

## 关联内容与知识图谱

推荐直接使用 Obsidian 打开整个 `content` 目录作为 Vault，并开启 Obsidian 的“自动更新内部链接”。文章、项目和作品通过正文中的 Wiki Link 建立公开关联：

```md
[[虚拟DOM]]
[[Vue/虚拟DOM|Vue 虚拟 DOM]]
[[projects/data-cockpit|社区全域驾驶舱]]
```

短文件名在全 Vault 唯一时可以直接使用。不同目录存在同名文件时必须补充目录，例如两个 `promise.md` 需要写成 `[[JS/promise]]` 或 `[[代码题/promise]]`。关联只需在一侧声明，目标详情会自动显示反向引用；重复、自身、失效、歧义和指向草稿的链接不会进入公开图谱。

开发环境会标记失效链接但不会中断 Nuxt Content 数据库初始化。构建和生成前会自动运行严格检查，也可以手动执行：

```bash
npm run knowledge:links:check
```

当前只支持 `[[...]]` 内容链接，不支持 `![[...]]` 附件嵌入，图片继续使用标准 Markdown。`/knowledge` 页面会展示文章、项目、作品和文章分类之间的只读关系网络；分类由 `category` 生成，标签不会自动推断内容关系。

## 修改个人信息

统一编辑 `app/data/profile.ts`。邮箱、履历、教育信息、技术栈与专业技能都由这里生成。

## 调整特效

- 导航右侧按钮可全局关闭动态效果。
- `prefers-reduced-motion` 用户会自动获得低动态版本。
- 粒子为客户端组件，不阻塞服务端首屏渲染。

部署前请将 `nuxt.config.ts` 中的 `site.url` 修改为真实域名。
