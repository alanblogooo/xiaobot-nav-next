# 升级指南

本指南将帮助您安全地升级到新版本。

## 升级前准备

1. **备份数据**
   ```bash
   # 在旧版本目录中执行备份
   npm run backup
   ```
   备份文件将保存在 `database/data/backups` 目录中

2. **记录环境变量**
   - 保存当前 `.env` 文件的内容
   - 主要是 ADMIN_USERNAME 和 ADMIN_PASSWORD 的设置

## 升级步骤

1. **停止运行中的程序**
   ```bash
   # 如果使用 PM2
   pm2 stop xiaobot-nav
   
   # 如果是直接运行
   # 使用 Ctrl+C 或其他方式停止程序
   ```

2. **安装新版本**
   ```bash
   # 1. 解压新版本安装包
   unzip xiaobot-nav-new.zip -d /tmp/new-version
   
   # 2. 备份旧版本(可选)
   mv xiaobot-nav xiaobot-nav-old
   
   # 3. 移动新版本到目标位置
   mv /tmp/new-version xiaobot-nav
   cd xiaobot-nav
   
   # 4. 复制数据库文件
   mkdir -p database/data
   cp ../xiaobot-nav-old/database/data/database.db database/data/
   
   # 5. 复制环境变量文件
   cp ../xiaobot-nav-old/.env .env
   ```

3. **更新依赖并升级**
   ```bash
   # 安装依赖
   npm install
   
   # 运行自动升级程序
   npm run auto-upgrade
   ```

4. **启动新版本**
   ```bash
   # 构建新版本
   npm run build
   
   # 启动程序
   npm run start
   # 或者使用 PM2
   pm2 start npm --name xiaobot-nav -- start
   ```

## 验证升级

1. 访问 [http://localhost:9520](http://localhost:9520) 确认系统正常运行
2. 检查管理员登录是否正常
3. 验证数据是否完整

## 回滚方法

如果升级后出现问题,可以按以下步骤回滚:

1. **停止新版本**
   ```bash
   # 如果使用 PM2
   pm2 stop xiaobot-nav
   
   # 如果直接运行,使用 Ctrl+C 停止
   ```

2. **恢复数据库**
   ```bash
   # 进入数据目录
   cd database/data
   
   # 从最近的备份恢复
   cp backups/database-[最新备份时间戳].db database.db
   ```

3. **切换回旧版本**
   如果保留了旧版本目录:
   ```bash
   cd ../xiaobot-nav-old
   npm run start
   # 或使用 PM2
   pm2 start npm --name xiaobot-nav -- start
   ```

## 常见问题

1. **数据库升级失败**
   - 检查错误信息
   - 确认数据库文件权限
   - 使用备份文件恢复
   - 重新运行 `npm run auto-upgrade`

2. **环境变量问题**
   - 确认 .env 文件是否正确复制
   - 检查 ADMIN_USERNAME 和 ADMIN_PASSWORD 设置

3. **启动失败**
   - 检查 Node.js 版本是否符合要求
   - 确认所有依赖安装成功
   - 查看错误日志

## 技术支持

如遇问题,请准备以下信息联系技术支持:
1. 升级前后的版本号
2. 错误信息或日志
3. 数据库备份文件
4. 执行的具体步骤 