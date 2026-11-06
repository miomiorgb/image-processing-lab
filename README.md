# 像素与频率 · 数字图像处理学习地图

数字图像处理实验一、实验二的交互学习网页，包含知识网络、学习路线、公式与代码、参数演示、实验结果和自测。

## 文件

- `public/index.html`：可离线打开的完整静态网页，图片、样式和脚本均已内嵌。
- `wrangler.jsonc`：Cloudflare Workers 静态资源部署配置。

## 部署

Cloudflare Workers 连接本仓库的 `main` 分支；构建命令留空，部署命令使用 `npx wrangler deploy`，项目根目录为仓库根目录。

## 更新

替换 `public/index.html`，提交到 `main` 分支，等待 Cloudflare 自动部署。

学习进度保存在当前浏览器的本地存储中，不会同步到服务器。
