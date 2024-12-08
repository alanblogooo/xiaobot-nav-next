const fs = require('fs');
const path = require('path');

// 获取当前时间戳
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

// 数据库文件路径
const dbPath = path.join(process.cwd(), 'data', 'database.db');
const backupDir = path.join(process.cwd(), 'data', 'backups');

// 确保备份目录存在
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

try {
  // 检查数据库文件是否存在
  if (!fs.existsSync(dbPath)) {
    console.error('数据库文件不存在！');
    process.exit(1);
  }

  // 创建备份
  const backupPath = path.join(backupDir, `database-${timestamp}.db`);
  fs.copyFileSync(dbPath, backupPath);
  console.log(`数据库已备份至: ${backupPath}`);

  // 只保留最近的 5 个备份
  const backups = fs.readdirSync(backupDir)
    .filter(file => file.startsWith('database-'))
    .sort()
    .reverse();

  if (backups.length > 5) {
    backups.slice(5).forEach(file => {
      fs.unlinkSync(path.join(backupDir, file));
    });
    console.log('已清理旧备份文件');
  }
} catch (error) {
  console.error('备份失败：', error);
  process.exit(1);
} 