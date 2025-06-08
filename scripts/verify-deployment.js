const fs = require('fs');
const path = require('path');

console.log('🔍 验证 Vercel 部署配置...\n');

// 检查数据库文件
const dbPath = path.join(__dirname, '../database/data/database.db');
if (fs.existsSync(dbPath)) {
  const stats = fs.statSync(dbPath);
  const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);
  console.log(`✅ 数据库文件存在: ${sizeInMB} MB`);
  
  if (stats.size > 10 * 1024 * 1024) {
    console.log(`⚠️  警告: 数据库文件较大 (${sizeInMB} MB)，可能影响部署`);
  }
} else {
  console.log('❌ 数据库文件不存在');
}

// 检查 Vercel 配置
const vercelConfigPath = path.join(__dirname, '../vercel.json');
if (fs.existsSync(vercelConfigPath)) {
  console.log('✅ vercel.json 配置文件存在');
} else {
  console.log('❌ vercel.json 配置文件不存在');
}

// 检查 package.json 配置
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

console.log('\n📦 依赖检查:');
if (packageJson.dependencies['@libsql/client']) {
  console.log('✅ @libsql/client 已安装');
} else {
  console.log('❌ @libsql/client 未安装');
}

if (packageJson.dependencies['better-sqlite3']) {
  console.log('⚠️  警告: better-sqlite3 仍在依赖中，建议移除');
} else {
  console.log('✅ better-sqlite3 已移除');
}

if (packageJson.dependencies['playwright']) {
  console.log('⚠️  警告: playwright 在生产依赖中，建议移至 devDependencies');
} else {
  console.log('✅ playwright 不在生产依赖中');
}

console.log('\n🛠️  构建脚本:');
if (packageJson.scripts.build === 'next build') {
  console.log('✅ 生产构建脚本正确 (不包含 playwright)');
} else {
  console.log('⚠️  生产构建脚本包含额外内容');
}

// 检查环境变量示例
console.log('\n🔐 环境变量:');
const envExamplePath = path.join(__dirname, '../.env.example');
if (fs.existsSync(envExamplePath)) {
  console.log('✅ .env.example 文件存在');
} else {
  console.log('ℹ️  建议创建 .env.example 文件说明环境变量');
}

// 检查部署文档
const deployDocPath = path.join(__dirname, '../DEPLOYMENT.md');
if (fs.existsSync(deployDocPath)) {
  console.log('✅ 部署文档存在');
} else {
  console.log('❌ 部署文档不存在');
}

console.log('\n📋 部署检查清单:');
console.log('□ 在开发环境中完成数据管理');
console.log('□ 提交包含数据库文件的代码到 Git');
console.log('□ 推送到 GitHub');
console.log('□ 连接 Vercel 项目');
console.log('□ 部署完成后测试查询功能');

console.log('\n✅ 验证完成！');
console.log('💡 提示: 部署后只有查询功能可用，增删改请在开发环境操作'); 