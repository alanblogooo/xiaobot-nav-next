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

### 安装步骤

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

# 修改 .env 文件中的配置
NEXT_PUBLIC_USERNAME=admin  # 管理员用户名
AUTH_PASSWORD=password      # 管理员密码
```

4. 初始化数据库
```bash
# 创建数据库目录
mkdir -p database/data

# 生成 Prisma Client
npm run db:generate

# 应用数据库迁移
npm run db:push
```

5. 启动开发服务器
```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 项目结构

```
xiaobot-nav/
├── database/               # 数据库相关文件
│   ├── data/              # SQLite 数据库文件
│   └── prisma/            # Prisma 配置和模型
├── src/
│   ├── app/               # Next.js 应用路由
│   ├── components/        # React 组件
│   ├── lib/              # 工具函数和库
│   ├── hooks/            # React Hooks
│   └── services/         # 服务层代码
└── public/               # 静态资源
```

### 开发命令

```bash
# 开发环境
npm run dev

# 构建生产版本
npm run build

# 启动生产服务
npm run start

# 代码检查
npm run lint

# 生成 Prisma Client
npm run db:generate

# 应用数据库迁移
npm run db:push
```

## 部署

1. 构建项目
```bash
npm run build
```

2. 启动生产服务器
```bash
npm run start
```

## 注意事项

- 数据库文件位于 `database/data/database.db`
- 请确保数据库目录具有正确的读写权限
- 生产环境部署前请修改管理员密码
- 建议定期备份数据库文件

## 许可证

MIT
