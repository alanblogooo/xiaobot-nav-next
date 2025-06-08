#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 开始静态构建...');

// 文件路径
const originalConfigPath = path.join(process.cwd(), 'next.config.js');
const staticConfigPath = path.join(process.cwd(), 'next.config.static.js');
const backupConfigPath = path.join(process.cwd(), 'next.config.js.backup');
const apiPath = path.join(process.cwd(), 'src/app/api');
const apiBackupPath = path.join(process.cwd(), 'api-backup-temp');

try {
  // 备份原始配置
  if (fs.existsSync(originalConfigPath)) {
    fs.copyFileSync(originalConfigPath, backupConfigPath);
    console.log('✅ 已备份原始配置文件');
  }
  
  // 备份API目录
  if (fs.existsSync(apiPath)) {
    if (fs.existsSync(apiBackupPath)) {
      fs.rmSync(apiBackupPath, { recursive: true, force: true });
    }
    fs.renameSync(apiPath, apiBackupPath);
    console.log('✅ 已临时移除API目录');
  }
  
  // 使用静态配置
  fs.copyFileSync(staticConfigPath, originalConfigPath);
  console.log('✅ 已切换到静态导出配置');
  
  // 执行构建
  console.log('📦 开始构建...');
  execSync('next build', { stdio: 'inherit' });
  console.log('✅ 构建完成！');
  
} catch (error) {
  console.error('❌ 构建失败:', error.message);
  process.exit(1);
} finally {
  // 恢复API目录
  if (fs.existsSync(apiBackupPath)) {
    if (fs.existsSync(apiPath)) {
      fs.rmSync(apiPath, { recursive: true, force: true });
    }
    fs.renameSync(apiBackupPath, apiPath);
    console.log('✅ 已恢复API目录');
  }
  
  // 恢复原始配置
  if (fs.existsSync(backupConfigPath)) {
    fs.copyFileSync(backupConfigPath, originalConfigPath);
    fs.unlinkSync(backupConfigPath);
    console.log('✅ 已恢复原始配置文件');
  }
}

console.log('🎉 静态构建完成！输出目录: out/'); 