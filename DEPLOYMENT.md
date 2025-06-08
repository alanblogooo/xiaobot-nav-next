# Vercel 部署说明

## 环境配置

### 开发环境
- 使用本地 SQLite 数据库 (`database/data/database.db`)
- 支持完整的增删改查功能
- 包含 Playwright 预览功能

### 生产环境 (Vercel)
- 只支持查询功能
- 数据库文件需要在部署时包含在代码中
- Playwright 预览功能不可用

## 部署步骤

1. **准备数据库**
   ```bash
   # 在开发环境中完成数据的增删改操作
   npm run dev
   ```

2. **提交到 Git**
   ```bash
   git add .
   git commit -m "更新数据库数据"
   git push
   ```

3. **部署到 Vercel**
   - Vercel 会自动检测到 `vercel.json` 配置
   - 构建时不会安装 Playwright (使用 `npm run build`)
   - 数据库文件会作为静态资源包含在部署中

## 环境变量

### 可选环境变量 (用于 Turso 云数据库)
如果你想使用云数据库而不是本地文件，可以设置：
- `TURSO_DATABASE_URL`: Turso 数据库 URL
- `TURSO_AUTH_TOKEN`: Turso 认证令牌

### 管理员环境变量 (开发环境使用)
- `ADMIN_USERNAME`: 管理员用户名
- `ADMIN_PASSWORD`: 管理员密码

## 工作流程

1. **开发环境**: 管理数据 → 本地数据库更新
2. **Git**: 提交包含数据库文件的代码
3. **Vercel**: 自动部署，只提供查询服务

## 注意事项

- 数据库文件大小限制：建议不超过 10MB
- Vercel 函数超时：设置为 30 秒
- 预览功能仅在开发环境可用
- 所有写操作都保留在代码中，但 Vercel 上不会执行 