# 升级指南

## 升级步骤

1. **备份数据库文件**
   - 找到当前版本中的 `database/data/database.db` 文件
   - 将此文件复制到安全的位置

2. **安装新版本**
   - 删除所有旧版本文件
   - 解压新版本代码到原位置
   - 创建目录：`database/data`
   - 将备份的 `database.db` 文件复制到 `database/data` 目录

3. **运行升级**
   ```bash
   npm install        # 安装依赖
   npm run auto-upgrade   # 运行升级程序
   npm start         # 启动应用
   ```

## 目录结构

```
your-app/
└── database/
    └── data/
        ├── database.db     # 这是需要备份的数据库文件
        └── backups/        # 自动备份目录（升级时自动创建）
```

## 回滚方法

如果升级后出现问题：

1. 停止应用
2. 用备份的数据库文件替换 `database/data/database.db`
3. 重新启动应用：`npm start`

## 常见问题

1. **找不到数据库文件？**
   - 数据库文件位于 `database/data/database.db`
   - 这是一个普通文件，可以直接复制

2. **升级失败？**
   - 确保正确复制了数据库文件
   - 检查文件权限
   - 使用备份文件恢复

3. **数据丢失？**
   - 使用之前备份的数据库文件恢复
   - 查看 `database/data/backups` 目录中的自动备份

## 技术支持

如有问题，请准备以下信息：
1. 错误信息截图
2. 数据库文件备份
3. 联系技术支持 