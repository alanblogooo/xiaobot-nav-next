/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: [
      // 添加您的图片域名，例如：
      'example.com',
      'your-image-domain.com',
      'static.xiaobot.net'
    ],
  },
  webpack: (config, { isServer }) => {
    // 让 webpack 忽略 puppeteer 相关文件
    if (isServer) {
      config.externals = [...config.externals, 'puppeteer-core']
    }
    return config
  }
}

module.exports = nextConfig
