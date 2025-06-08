# 部署说明

## 环境要求

- Node.js 18.17 或更高版本
- npm 9.0 或更高版本

## 支持的部署平台

### Vercel
1. 推送代码到 Git 仓库
2. 在 Vercel 控制台连接你的仓库
3. 自动检测 Next.js 项目并部署

### Netlify  
1. 推送代码到 Git 仓库
2. 在 Netlify 控制台连接你的仓库
3. 自动检测 Next.js 项目并部署

### Railway
1. 推送代码到 Git 仓库
2. 在 Railway 控制台连接你的仓库
3. 自动检测 Next.js 项目并部署

### Render
1. 推送代码到 Git 仓库
2. 在 Render 控制台创建新的 Web Service
3. 连接你的仓库并部署

### EdgeOne Pages / GitHub Pages（静态部署）
1. 推送代码到 Git 仓库
2. 在平台控制台连接你的仓库
3. 设置构建命令：`npm run build:static`
4. 设置输出目录：`out`
5. 部署

### 自建服务器
1. 克隆代码到服务器
2. 安装依赖：`npm install`
3. 构建项目：`npm run build`
4. 启动服务：`npm start`

可选择使用 PM2 进程管理：
```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start npm --name "xiaobot-nav" -- start

# 设置开机自启
pm2 save
pm2 startup
```

## 环境变量

管理员登录配置：
- `ADMIN_USERNAME`: 管理员用户名
- `ADMIN_PASSWORD`: 管理员密码

## 注意事项

- 项目使用本地 SQLite 数据库（`database/data/database.db`）
- 数据库文件包含在项目中，会一起部署
- 生产环境建议只提供查询功能
- 预览功能在某些平台可能不可用 