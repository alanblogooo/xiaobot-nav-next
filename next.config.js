/** @type {import('next').NextConfig} */
const nextConfig = {
  // 静态导出配置（用于 EdgeOne Pages、GitHub Pages 等）
  ...(process.env.EXPORT_MODE === 'static' && {
    output: 'export',
    trailingSlash: true,
  }),
  
  // 生产环境优化配置
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  images: process.env.EXPORT_MODE === 'static' ? {
    unoptimized: true
  } : {
    domains: [
      // 添加您的图片域名，例如：
      'example.com',
      'your-image-domain.com',
      'static.xiaobot.net'
    ],
  },
  
  webpack: (config, { isServer, dev }) => {
    // 在生产环境中排除大型包
    if (isServer) {
      config.externals = [
        ...config.externals,
        'puppeteer-core',
        'playwright',
        'playwright-core'
      ]
    }
    
    // 在生产环境中忽略 playwright 相关模块
    if (process.env.NODE_ENV === 'production') {
      config.resolve.alias = {
        ...config.resolve.alias,
        'playwright': false,
        'playwright-core': false,
      }
      
      // 完全禁用缓存
      config.cache = false
      
      // 优化构建输出
      config.optimization = {
        ...config.optimization,
        minimize: true,
        sideEffects: false,
        usedExports: true,
      }
    }
    
    return config
  }
}

module.exports = nextConfig
