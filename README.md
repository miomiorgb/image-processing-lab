# 像素与频率 · 数字图像处理编程备考平台

数字图像处理实验一、二、三的学习与编程备考平台，包含知识网络、57条命令、35道原理题、18道程序练习、即时图像与流程反馈、错题复盘和30分钟模拟。各板块均标注建议用时，首轮总计约5小时。

## 文件

- `public/index.html`：备考平台入口；同目录的样式、脚本、样例图和PDF需一起发布。
- `public/legacy-map.html`：保留原实验一、二知识图谱。
- `public/数字图像处理_考场速查.pdf`：四页A4打印资料。
- `wrangler.jsonc`：Cloudflare Workers 静态资源部署配置。

## 部署

Cloudflare Workers 连接本仓库的 `main` 分支；构建命令留空，部署命令使用 `npx wrangler deploy`，项目根目录为仓库根目录。

## 更新

将备考平台dist的全部文件同步至public，提交到main分支，等待Cloudflare自动部署。

正式入口为 https://image.miolearn.cn/ ，公开访问无需登录。学习进度保存在当前浏览器的本地存储中，不会同步到服务器。练习引擎使用MATLAB教学语法子集，最终程序可下载到MATLAB复核。
