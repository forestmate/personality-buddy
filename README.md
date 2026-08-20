# 人格搭子 · 互补匹配系统（GitHub 免费版）

一个**自带管理后台**的人格匹配应用。你可以在后台改题目、改人格名称、改文案、看用户数据，改动**全站立即生效**。

**已上线地址：**
- 🌐 前台（用户测试入口）：`https://forestmate.github.io/personality-buddy/`
- 🔐 管理后台：`https://forestmate.github.io/personality-buddy/admin.html`（登录需输入 GitHub 访问令牌）

---

## 架构（纯 GitHub，零服务器成本）

```
GitHub Pages 托管前端代码（forestmate/personality-buddy 仓库，main 分支）
        │
        │ 读写（GitHub API + 访问令牌）
        ▼
GitHub 数据仓库（forestmate/personality-buddy-data，私有）
   ├── config.json   ← 题目/人格/文案（后台修改的内容）
   ├── records.json  ← 用户测试记录
   └── seed.json     ← 出厂默认数据（"恢复默认"用）
```

- **前台**启动时读取 `config.json`，管理员后台的修改全站生效
- 用户测完，记录自动写入 `records.json`
- 数据就是你 GitHub 私有仓库里的文件，随时可导出、可备份

## 管理后台功能

| 模块 | 能做什么 |
|------|---------|
| 📊 数据看板 | 累计/今日测试人数、人格分布 TOP10 |
| ❓ 题目管理 | 增删改 30 道题，改维度/方向，恢复默认 |
| 🧬 人格名称 | 改 64 种人格的名称和标签 |
| 📝 文案模板 | 改结果页所有展示文案 |
| 🗂️ 测试记录 | 查看每条记录、按编码搜索、导出 CSV、清空 |
| 🔑 访问令牌 | 更换访问令牌的说明 |

## 后台登录方式

后台登录输入的是 **GitHub 访问令牌**（Token），验证通过即可进入：
1. 用当前部署内置的令牌
2. 或到 GitHub 重新生成一个（推荐 fine-grained，只授权 `personality-buddy-data` 仓库）

## 重新部署 / 修改代码

改完代码后推送 `main` 分支，GitHub Pages 自动更新（约 1 分钟）：
```bash
git add -A
git commit -m "更新"
git push origin main
```

## 更换访问令牌（安全升级）

1. GitHub → Settings → Developer settings → Personal access tokens → 生成一个 **fine-grained token**
   - 只授权 `forestmate/personality-buddy-data` 这一个仓库
   - 权限勾选 **Contents: Read and write**
2. 打开 `public/index.html`，找到 `WRITE_TOKEN`（拆段拼接的形式），换成新令牌（同样拆段拼接）
3. 推送 `main`，Pages 自动更新
4. 旧令牌在 GitHub 上删除/过期，立即失效

## 安全提示（重要）

- ⚠️ 本方案为"零成本验证版"：**访问令牌内置在前端代码中**，技术上有权限的人都能读写数据仓库。适合早期验证流量，**不适合存放敏感数据**
- 数据仓库是私有的，但拥有令牌=拥有数据仓库读写权
- 建议：流量起来后升级为「服务器 + 独立后端」方案，彻底解决安全与稳定性问题
