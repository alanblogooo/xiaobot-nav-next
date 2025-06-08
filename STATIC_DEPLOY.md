# 静态部署指南

## EdgeOne Pages 部署

当使用 EdgeOne Pages 或其他静态托管平台（如 GitHub Pages）时，需要将 Next.js 项目导出为静态文件。

### 快速修复方案

如果你的项目已经部署到 EdgeOne Pages 但出现 404 错误，请按以下步骤操作：

1. **更新构建命令**
   在 EdgeOne Pages 控制台中，将构建命令修改为：
   ```bash
   npm run build:static
   ```

2. **设置输出目录**
   将输出目录设置为：
   ```
   out
   ```

3. **重新部署**
   保存设置并重新部署项目

### 工作原理

- 项目使用 `EXPORT_MODE=static` 环境变量来触发静态导出模式
- 在静态导出模式下，Next.js 会：
  - 设置 `output: 'export'`
  - 启用 `trailingSlash: true`
  - 禁用图片优化 `images.unoptimized: true`
- 构建输出将生成在 `out` 目录中

### 注意事项

1. **API 路由限制**：静态导出不支持 API 路由，所有 API 功能将不可用
2. **服务端功能**：SSR、ISR 等服务端功能将被禁用
3. **图片优化**：Next.js 的图片优化功能将被禁用
4. **数据库访问**：后台管理等需要数据库的功能将不可用

### 适用场景

- 纯展示性网站
- 不需要后台管理功能
- 只需要查看专栏信息的场景

### 如果需要完整功能

如果你需要使用后台管理、API 路由等完整功能，建议使用：
- Vercel
- Netlify
- Railway 
- Render
- 自建服务器

这些平台支持 Next.js 的完整功能。 