# 小报童导航

一个基于 Next.js 14 开发的小报童专栏导航和管理系统。

## 功能特点

- 专栏管理：添加、编辑、删除专栏
- 批量操作：支持批量导入、删除、修改分类、上下架
- 分类管理：对专栏进行分类管理
- 邀请码管理：管理小报童邀请返利码

## 技术栈

- Next.js 14
- TypeScript
- Prisma
- SQLite
- Tailwind CSS
- shadcn/ui

## 开始使用

### 环境要求

- Node.js 18.17 或更高版本
- npm 9.0 或更高版本
- Git

### 生产环境部署

1. 配置环境变量
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件
vim .env
```

确保 .env 文件包含以下配置：
```env
# 管理员登录凭据
ADMIN_USERNAME=your_username
ADMIN_PASSWORD=your_password
```

2. 设置文件权限
```bash
# 确保 .env 文件权限正确
chmod 644 .env
```

3. 构建和启动
```bash
# 清理旧的构建文件
rm -rf .next

# 安装依赖
npm install

# 构建 (这一步会加载 .env 的环境变量)
npm run build

# 启动服务 (使用 PM2)
pm2 start npm --name xiaobot-nav -- start
```

4. 验证环境变量
```bash
# 进入项目目录
cd xiaobot-nav

# 验证 .env 文件存在
ls -la .env

# 检查环境变量是否被加载
pm2 logs xiaobot-nav
```

### 环境变量故障排除

如果环境变量未正确加载：

1. 确认 .env 文件位置和内容
```bash
pwd  # 应该显示项目根目录
cat .env  # 检查内容是否正确
```

2. 使用 PM2 显式加载环境变量
```bash
pm2 start npm --name xiaobot-nav -- start --env-file .env
```

3. 或者使用 ecosystem.config.js 配置 PM2
```bash
# 创建 PM2 配置文件
echo 'module.exports = {
  apps: [{
    name: "xiaobot-nav",
    script: "npm",
    args: "start",
    env: {
      NODE_ENV: "production",
      ADMIN_USERNAME: "admin",
      ADMIN_PASSWORD: "admin"
    }
  }]
}' > ecosystem.config.js

# 使用配置文件启动
pm2 start ecosystem.config.js
```

### 首次部署步骤

1. 克隆项目
```bash
git clone https://github.com/alanblogooo/xiaobot-nav.git
cd xiaobot-nav
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
# 复制环境变量模板文件
cp .env.example .env
```

编辑 .env 文件，设置以下必需的环境变量：
```env
# 管理员登录凭据
ADMIN_USERNAME=your_username    # 管理员用户名
ADMIN_PASSWORD=your_password    # 管理员密码
```

4. 初始化数据库
```bash
# 初始化数据库(包含创建目录、生成Client和迁移)
npm run init
```


5. 构建并启动应用
```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm run start
```

现在可以访问 [http://localhost:9520](http://localhost:9520) 查看应用。

### 开发环境设置

如果您需要在开发环境中运行项目：

1. 完成上述 1-4 步骤

2. 启动开发服务器
```bash
npm run dev
```

### 项目结构

```
xiaobot-nav/
├── database/               # 数据库相关文件
│   ├── data/              # SQLite 数据库文件
│   ├── prisma/            # Prisma 配置和模型
│   └── scripts/           # 数据库脚本
├── src/
│   ├── app/              # Next.js 应用路由
│   │   ├── api/         # API 路由
│   │   └── (routes)/    # 页面路由
│   ├── components/      # React 组件
│   ├── lib/            # 工具函数和库
│   ├── hooks/          # React Hooks
│   └── services/       # 服务层代码
├── public/             # 静态资源
└── middleware.ts       # Next.js 中间件
```

### 常用开发命令

```bash
# 开发环境
npm run dev

# 构建生产版本
npm run build

# 启动生产服务
npm run start

# 代码检查
npm run lint

# 数据库相关命令
npm run prisma:generate    # 生成 Prisma Client
npm run prisma:migrate     # 应用数据库迁移
npm run prisma:studio     # 启动 Prisma Studio 查看数据
npm run prisma:migrate:dev # 开发环境数据库迁移
npm run prisma:seed       # 填充示例数据

# 数据库维护
npm run init            # 初始化数据库
npm run backup         # 备份数据库
npm run auto-upgrade   # 自动升级数据库
```

## 部署注意事项

1. 数据库相关：
   - 数据库文件默认位于 `database/data/database.db`
   - 确保数据库目录具有正确的读写权限
   - 建议定期备份数据库文件
   - 首次部署时必须手动创建 database/data 目录

2. 环境变量：
   - 生产环境必须设置 ADMIN_USERNAME 和 ADMIN_PASSWORD
   - 请使用安全的密码，避免使用默认值
   - 不要将 .env 文件提交到代码仓库

3. 权限设置：
   - 确保运行应用的用户对以下目录有读写权限：
     - database/data/
     - .next/
     - node_modules/

4. 性能优化：
   - 启用 Node.js 的 --optimize_for_size 标志可减少内存使用
   - 考虑使用 PM2 等进程管理器
   - 建议配置 Nginx 反向代理

## 故障排除

常见问题：

1. 数据库连接错误
   - 检查 DATABASE_URL 配置
   - 验证数据库目录权限
   - 确保已运行数据库迁移命令

2. 登录失败
   - 确认环境变量 ADMIN_USERNAME 和 ADMIN_PASSWORD 已正确设置
   - 检查 .env 文件是否被正确加载

3. 构建失败
   - 清理 .next 目录后重新构建
   - 确保 Node.js 版本符合要求
   - 检查依赖项是否完整安装

## 升级注意事项

请参考 UPGRADE.md 文件


## 许可证

MIT
