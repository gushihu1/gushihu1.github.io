---
title: "git常用命令"
date: 2026-07-08
category: "其他"
tags: ["其他"]
featured: false
draft: false
readingTime: "4 min"
sourceId: "frontend"
sourceFile: "面试2026.md"
sourceLine: 2172
---

```powershell
git init                              # 在当前目录初始化一个全新的本地 Git 仓库
git clone <url>                       # 克隆远程仓库到本地
git config --global user.name "你的名字" # 配置全局用户名
git config --global user.gemail "邮箱"   # 配置全局邮箱
git config --list                     # 查看当前所有的 Git 配置信息

git status                            # 查看当前工作区的修改状态（哪些未暂存/未提交）
git diff                              # 查看工作区与暂存区的具体代码差异
git add <filename>                    # 将指定文件的修改添加到暂存区
git add .                             # 将当前目录下所有修改添加到暂存区
git commit -m "feat: 新增登录功能"     # 将暂存区内容提交到本地仓库（规范的 commit message 很重要）
git commit -am "fix: 修复Bug"         # 【快捷键】跳过 add，直接将已追踪文件的修改暂存并提交

git branch                            # 列出所有本地分支
git branch -r                         # 列出所有远程分支
git branch <branch-name>              # 创建一个新分支，但仍留在当前分支
git checkout <branch-name>            # 切换到指定分支
git checkout -b <branch-name>         # 【常用】创建并直接切换到该新分支
git merge <branch-name>               # 将指定分支的代码合并到当前分支
git branch -d <branch-name>           # 删除一个已经合并过的本地分支
git branch -D <branch-name>           # 强制删除一个未合并的本地分支

git fetch origin                      # 从远程仓库获取最新版本，但不自动合并到本地当前分支
git pull origin <branch-name>         # 从远程拉取最新代码并直接合并到本地当前分支（相当于 fetch + merge）
git push origin <branch-name>         # 将本地分支的提交推送到远程仓库
git push -u origin <branch-name>      # 第一次推送时关联本地与远程分支，后续只需直接输入 git push

git reset --soft HEAD~1           # 撤销上一次 commit，但保留代码在“暂存区”（方便修改后重新提交）
git reset --mixed HEAD~1          # （默认行为）撤销上一次 commit，代码退回到“工作区”
git reset --hard HEAD~1           # 撤销上一次 commit，且彻底删除该提交的代码！
git revert <commit-id>            # 用一次新的提交来“反向对冲”掉指定的提交，不会污染公共历史记录

git commit --amend -m "正确的提交信息" # 修正最近一次的 commit，避免产生两条零碎的记录

git stash                         # 把当前工作区和暂存区的未提交修改“藏”起来
git checkout master               # 切换去修复 Bug... 修复完回到 feature 分支
git stash list                    # 查看所有的临时存储记录
git stash pop                     # 恢复最近一次存储的代码，并把这条存储记录从列表中删除
git stash apply                   # 恢复存储的代码，但保留存储列表记录
git stash drop                    # 删除最近一次的存储记录

git cherry-pick <commit-id>       # 精准复制某一个特定的 commit 到当前分支

git log                           # 查看详细的提交历史记录
git log --oneline                 # 以单行精简模式查看历史记录
git log --graph --oneline --all   # 图形化展示所有分支的合并分支走向（非常直观）
git blame <filename>              # 逐行显示指定文件的修改历史、作者和提交时间（精准定位是谁写出了这个 Bug）
```
