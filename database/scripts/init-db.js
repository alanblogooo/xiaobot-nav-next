const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 确保数据目录存在
const dataDir = path.join(process.cwd(), 'database', 'data');
if (!fs.existsSync(dataDir)) {
  console.log('创建数据目录...');
  fs.mkdirSync(dataDir, { recursive: true });
}

// 确保备份目录存在
const backupDir = path.join(dataDir, 'backups');
if (!fs.existsSync(backupDir)) {
  console.log('创建备份目录...');
  fs.mkdirSync(backupDir, { recursive: true });
}

// 检查数据库文件是否已存在
const dbPath = path.join(dataDir, 'database.db');
if (fs.existsSync(dbPath)) {
  console.log('数据库文件已存在，将创建备份...');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `database-${timestamp}.db`);
  fs.copyFileSync(dbPath, backupPath);
  console.log(`已创建备份：${backupPath}`);
}

try {
  // 应用数据库迁移
  console.log('正在初始化数据库...');
  execSync('npm run db:migrate', { stdio: 'inherit' });
  console.log('数据库初始化完成！');

  // 运行种子数据
  console.log('正在填充种子数据...');
  execSync('npm run db:seed', { stdio: 'inherit' });
  console.log('种子数据填充完成！');

  // 显示下一步操作
  console.log('\n接下来你可以：');
  console.log('1. 运行 "npm run dev" 启动开发服务器');
  console.log('2. 运行 "npm run build" 构建生产版本');
  console.log('3. 运行 "npm run backup" 备份数据库');
} catch (error) {
  console.error('数据库初始化失败：', error);
  process.exit(1);
} 