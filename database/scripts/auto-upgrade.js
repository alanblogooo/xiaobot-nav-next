const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function autoUpgrade() {
  console.log('=== 自动升级程序 ===\n');
  
  try {
    // 1. 检查数据库文件
    console.log('检查数据库文件...');
    const dataDir = path.join(process.cwd(), 'database', 'data');
    const backupDir = path.join(dataDir, 'backups');
    const dbPath = path.join(dataDir, 'database.db');

    // 确保目录存在
    if (!fs.existsSync(dataDir)) {
      console.log('创建数据目录...');
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // 2. 自动备份现有数据库
    if (fs.existsSync(dbPath)) {
      console.log('发现现有数据库，创建备份...');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(backupDir, `database-${timestamp}.db`);
      fs.copyFileSync(dbPath, backupPath);
      console.log(`✓ 已创建备份：${backupPath}`);

      // 清理旧备份，只保留最近5个
      const backups = fs.readdirSync(backupDir)
        .filter(file => file.startsWith('database-'))
        .sort()
        .reverse();

      if (backups.length > 5) {
        backups.slice(5).forEach(file => {
          fs.unlinkSync(path.join(backupDir, file));
        });
      }
    } else {
      console.log('未发现数据库文件，将创建新数据库');
    }

    // 3. 更新数据库结构
    console.log('\n正在更新数据库...');
    execSync('npx prisma generate --schema=./database/prisma/schema.prisma', {
      stdio: 'inherit'
    });
    execSync('npx prisma migrate deploy --schema=./database/prisma/schema.prisma', {
      stdio: 'inherit'
    });
    console.log('✓ 数据库更新完成');

    console.log('\n=== 升级成功！===');
    console.log('\n您可以运行 npm start 启动应用\n');

  } catch (error) {
    console.error('\n升级失败！', error);
    console.log('\n如何恢复：');
    console.log('1. 使用您之前备份的数据库文件替换 database/data/database.db');
    console.log('2. 重新运行 npm start');
    process.exit(1);
  }
}

// 启动升级程序
autoUpgrade(); 