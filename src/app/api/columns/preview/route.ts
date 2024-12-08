import { NextResponse } from 'next/server';
import puppeteer, { Browser } from 'puppeteer-core';

export async function POST(request: Request) {
  let browser: Browser | null = null;
  try {
    const { urls } = await request.json();

    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: '请提供有效的专栏地址列表' },
        { status: 400 }
      );
    }

    if (urls.length > 50) {
      return NextResponse.json(
        { error: '一次最多预览50个专栏' },
        { status: 400 }
      );
    }

    browser = await puppeteer.launch({
      headless: true,
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      args: ['--no-sandbox']
    });

    const results = await Promise.all(
      urls.map(async (url) => {
        const page = await browser!.newPage();
        try {
          await page.setViewport({ width: 1280, height: 800 });
          
          console.log('正在访问页面:', url);
          await page.goto(url, {
            waitUntil: 'networkidle0',
            timeout: 30000
          });

          console.log('等待页面加载完成...');
          await page.waitForSelector('.paper-info', { timeout: 10000 });

          const data = await page.evaluate(() => {
            const title = document.querySelector('.paper-info .paper_title h1')?.textContent?.trim() || '';
            const intro = document.querySelector('.paper-info .intro')?.textContent?.trim() || '';
            const avatar = document.querySelector('.paper-info .avatar')?.getAttribute('src') || '';
            
            const stats = document.querySelectorAll('.paper-info .stats .stat');
            let readerCount = 0;
            let contentCount = 0;
            
            stats.forEach(stat => {
              const num = parseInt(stat.querySelector('.num')?.textContent?.trim() || '0', 10);
              const type = stat.querySelector('.type')?.textContent?.trim() || '';
              if (type === '读者') readerCount = num;
              if (type === '内容') contentCount = num;
            });

            let author = '未知作者';
            
            const postAuthor = document.querySelector('.posts .post .header .user .info .name_container .name')?.textContent?.trim();
            if (postAuthor) {
              author = postAuthor;
            }
            
            if (author === '未知作者') {
              const authorElement = document.querySelector('.paper-info .author-name, .paper-info .user-name');
              if (authorElement?.textContent) {
                author = authorElement.textContent.trim();
              }
            }
            
            if (author === '未知作者' && intro) {
              const patterns = [
                /作者[：:]\s*([^，。,]+)/,
                /作者[是为]\s*([^，。,]+)/,
                /作者\s*([^，。,]+)/,
                /by\s+([^，。,]+)/i,
                /([^，。,]+)\s*著/,
              ];
              
              for (const pattern of patterns) {
                const match = intro.match(pattern);
                if (match && match[1]) {
                  author = match[1].trim();
                  break;
                }
              }
            }
            
            if (author === '未知作者') {
              const possibleAuthorElements = document.querySelectorAll('.paper-info .name, .paper-info .user');
              Array.from(possibleAuthorElements).some(el => {
                const text = el.textContent?.trim();
                if (text && text.length < 20) {
                  author = text;
                  return true;
                }
                return false;
              });
            }

            return { 
              name: title,
              description: intro,
              readerCount,
              contentCount,
              avatar,
              author
            };
          });

          console.log('抓取到的数据:', data);
          return { ...data, url };
        } catch (error) {
          console.error(`抓取错误 ${url}:`, error);
          return null;
        } finally {
          await page.close();
        }
      })
    );

    const validResults = results.filter((result): result is NonNullable<typeof result> => result !== null);
    console.log('有效结果:', validResults);

    return NextResponse.json(validResults);
  } catch (error) {
    console.error('预览失败:', error);
    return NextResponse.json(
      { error: '预览失败' },
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
} 