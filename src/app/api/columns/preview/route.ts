import { NextResponse } from "next/server"
import { chromium } from 'playwright'

export const dynamic = 'force-dynamic'

interface ColumnInfo {
  url: string
  name: string
  description: string
  readerCount: number
  contentCount: number
  avatar: string
  author: string
}

export async function POST(request: Request) {
  try {
    const { urls } = await request.json()
    
    if (!urls || !Array.isArray(urls)) {
      return NextResponse.json({ error: "无效的URL列表" }, { status: 400 })
    }

    // 限制最多50个URL
    if (urls.length > 50) {
      return NextResponse.json({ error: "最多支持50个专栏链接" }, { status: 400 })
    }

    const results: ColumnInfo[] = []
    
    // 启动浏览器
    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    })
    
    try {
      for (const url of urls) {
        try {
          // 验证URL格式
          if (!url.includes('xiaobot.net/p/')) {
            console.warn(`跳过无效URL: ${url}`)
            continue
          }

          const page = await browser.newPage()
          
          // 设置超时时间
          await page.setDefaultTimeout(30000)
          
          // 访问页面
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
          
          // 等待页面关键元素加载，使用更宽松的条件
          try {
            await page.waitForSelector('body', { timeout: 5000 })
            // 等待统计信息或标题任一可见即可
            await Promise.race([
              page.waitForSelector('.stats', { timeout: 8000 }),
              page.waitForSelector('h1', { timeout: 8000 }),
              page.waitForSelector('.paper-info', { timeout: 8000 })
            ])
          } catch {
            console.warn(`页面元素等待超时，继续尝试抓取: ${url}`)
          }
          
          // 额外等待确保内容稳定
          await new Promise(resolve => setTimeout(resolve, 3000))
          
          // 抓取专栏信息
          const columnInfo = await page.evaluate(() => {
            // 获取专栏名称 - 使用多种方法确保准确性
            let name = ''
            
            try {
              // 方法1：从document.title获取（通常是专栏名称）
              if (document.title && !document.title.includes('小报童') && !document.title.includes('登录')) {
                name = document.title.trim()
              }
              
              // 方法2：如果title不对，查找包含专栏信息的区域
              if (!name) {
                const paperInfoElement = document.querySelector('.paper-info')
                if (paperInfoElement) {
                  const fullText = paperInfoElement.textContent || ''
                  // 查找专栏标题（通常在统计数据后面）
                  const match = fullText.match(/\d+读者\d+内容([^拆解作者]{2,50})/)
                  if (match && match[1]) {
                    name = match[1].trim()
                  }
                }
              }
              
              // 方法3：备用方案，从h1标签获取（但要避免文章标题）
              if (!name) {
                const h1Elements = document.querySelectorAll('h1')
                if (h1Elements.length > 0) {
                  // 如果有多个h1，尝试找到最短的（通常是专栏标题）
                  let shortestH1 = h1Elements[0]
                  for (const h1 of h1Elements) {
                    const text = h1.textContent?.trim() || ''
                    if (text.length < (shortestH1.textContent?.trim() || '').length && text.length > 3) {
                      shortestH1 = h1
                    }
                  }
                  name = shortestH1.textContent?.trim() || ''
                }
              }
            } catch (e) {
              console.warn('获取专栏名称时出错:', e)
            }
            
            // 获取作者 - 从第一个出现的.name元素（通常是专栏作者）
            let author = ''
            try {
              const authorElement = document.querySelector('.name')
              if (authorElement) {
                author = authorElement.textContent?.trim() || ''
              }
              
              // 如果没找到，从页面文本中提取作者信息
              if (!author) {
                const bodyText = document.querySelector('body')?.textContent || ''
                const authorMatch = bodyText.match(/作者[^，,。\n]*?([^，,。\n\s]+学长|[^，,。\n\s]+)[^。]*?，/)
                if (authorMatch && authorMatch[1]) {
                  author = authorMatch[1].trim()
                }
              }
            } catch (e) {
              console.warn('获取作者信息时出错:', e)
            }
            
            // 获取描述 - 优先从右侧专栏信息区域提取详细介绍
            let description = ''
            
            try {
              // 方法1：从.paper-info区域的.intro段落获取完整介绍（最准确）
              const introElement = document.querySelector('.paper-info p.intro')
              if (introElement) {
                const introText = introElement.textContent?.trim() || ''
                // 清理HTML实体和多余空白
                description = introText.replace(/\s+/g, ' ').trim()
              }
              
              // 方法2：如果没有.intro，尝试其他右侧专栏选择器
              if (!description) {
                const rightSideSelectors = [
                  '.paper-info p:not(.intro)',  // paper-info下的其他段落
                  '.paper-info div:last-child', // paper-info的最后一个div
                  '.intro',                     // 介绍区域
                  '.description',               // 描述区域
                  '[class*="intro"]',           // 包含intro的类名
                  '[class*="desc"]'             // 包含desc的类名
                ]
                
                for (const selector of rightSideSelectors) {
                  const elements = document.querySelectorAll(selector)
                  for (const element of elements) {
                    const text = element.textContent?.trim() || ''
                    // 获取包含详细介绍的文本（通常较长且包含作者信息）
                    if (text.length > 200 && 
                        (text.includes('作者') || text.includes('价值') || text.includes('订阅')) &&
                        !text.includes('读者数') && 
                        !text.includes('内容数')) {
                      description = text.replace(/\s+/g, ' ').trim()
                      break
                    }
                  }
                  if (description) break
                }
              }
              
              // 方法2：如果上面没找到，从专栏信息区域提取完整描述
              if (!description) {
                const paperInfoElement = document.querySelector('.paper-info')
                if (paperInfoElement) {
                  const fullText = paperInfoElement.textContent || ''
                  
                  // 从paper-info区域智能提取完整介绍
                  const lines = fullText.split('\n').map(line => line.trim()).filter(line => line.length > 0)
                  const descLines = []
                  
                  for (let i = 0; i < lines.length; i++) {
                    const line = lines[i]
                    
                    // 跳过统计信息、价格、按钮等无关内容
                    if (line.includes('读者') || 
                        line.includes('内容') || 
                        line.includes('元') || 
                        line.includes('原价') ||
                        line.includes('现价') ||
                        line.includes('分享') ||
                        line.includes('订阅后') ||
                        line.includes('立即') ||
                        line.includes('微信') ||
                        line.includes('企业服务') ||
                        line.length < 10) {
                      continue
                    }
                    
                    // 收集所有有意义的描述性文本
                    // 排除作者姓名行和标题行
                    if (!line.includes(name) && 
                        !line.includes(author) &&
                        !line.match(/^[^，。]*学长$/) &&
                        !line.match(/^\d+年/) &&
                        line.length > 15) {
                      descLines.push(line)
                    }
                  }
                  
                  if (descLines.length > 0) {
                    // 取前几个最有意义的句子作为描述
                    description = descLines.slice(0, 3).join(' ').substring(0, 600).trim()
                  }
                }
              }
              
                             // 方法3：备用方案，从页面左侧内容区获取
               if (!description) {
                 const paragraphs = document.querySelectorAll('p')
                 for (const p of paragraphs) {
                   const text = p.textContent?.trim() || ''
                   if (text.length > 50 && !text.includes('购买') && !text.includes('立即') && !text.includes('元')) {
                     description = text.substring(0, 300).trim()
                     break
                   }
                 }
               }
               
               // 方法4：如果页面需要登录，尝试从页面任何可见文本中提取简介
               if (!description) {
                 const bodyText = document.body.textContent || ''
                 if (bodyText.includes('登录')) {
                   // 页面需要登录，使用基础信息
                   description = `${name} - 由${author}创作的专栏`
                 } else {
                   // 尝试从任何长文本中提取
                   const allTexts = document.querySelectorAll('*')
                   for (const element of allTexts) {
                     const text = element.textContent?.trim() || ''
                     if (text.length > 100 && 
                         text.length < 500 &&
                         !text.includes('读者') && 
                         !text.includes('内容') && 
                         !text.includes('元') &&
                         element.children.length === 0) { // 确保是叶子节点
                       description = text.substring(0, 300).trim()
                       break
                     }
                   }
                 }
               }
              
            } catch (e) {
              console.warn('获取描述信息时出错:', e)
            }
            
            // 获取头像 - 查找第一个头像图片
            let avatar = ''
            try {
              const avatarElement = document.querySelector('img[src*="qlogo"], img[src*="avatar"], img[src*="head"], img')
              if (avatarElement) {
                avatar = (avatarElement as HTMLImageElement).src || ''
              }
            } catch (e) {
              console.warn('获取头像时出错:', e)
            }
            
            // 获取统计数据 - 从.stats区域
            let readerCount = 0
            let contentCount = 0
            
            try {
              const statsElement = document.querySelector('.stats')
              if (statsElement) {
                const statsText = statsElement.textContent || ''
                
                // 提取读者数
                const readerMatch = statsText.match(/(\d+)\s*读者/)
                if (readerMatch && readerMatch[1]) {
                  readerCount = parseInt(readerMatch[1]) || 0
                }
                
                // 提取内容数
                const contentMatch = statsText.match(/(\d+)\s*内容/)
                if (contentMatch && contentMatch[1]) {
                  contentCount = parseInt(contentMatch[1]) || 0
                }
              }
            } catch (e) {
              console.warn('获取统计数据时出错:', e)
            }
            
            return {
              name,
              author,
              description,
              avatar,
              readerCount,
              contentCount
            }
          })
          
          if (columnInfo.name) {
            results.push({
              url,
              ...columnInfo
            })
          }
          
          await page.close()
          
          // 添加延迟避免请求过快
          await new Promise(resolve => setTimeout(resolve, 1000))
          
        } catch (error) {
          console.error(`抓取失败 ${url}:`, error)
          // 继续处理下一个URL
          continue
        }
      }
    } finally {
      await browser.close()
    }
    
    return NextResponse.json(results)
    
  } catch (error) {
    console.error('抓取过程出错:', error)
    return NextResponse.json(
      { error: "抓取失败，请稍后重试" }, 
      { status: 500 }
    )
  }
} 