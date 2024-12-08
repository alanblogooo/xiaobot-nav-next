import { NextResponse } from 'next/server';
import { chromium } from 'playwright';
import type { Browser } from 'playwright';
import { execSync } from 'child_process';

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

    try {
      console.log('正在启动浏览器...');
      browser = await chromium.launch({
        headless: true,
        args: [
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-sandbox',
          '--disable-setuid-sandbox'
        ]
      }).catch(async (error) => {
        console.error('浏览器启动失败，尝试重新安装:', error);
        try {
          execSync('npx playwright install chromium', { stdio: 'inherit' });
          // 重新尝试启动
          return await chromium.launch({
            headless: true,
            args: [
              '--disable-dev-shm-usage',
              '--disable-gpu',
              '--no-sandbox',
              '--disable-setuid-sandbox'
            ]
          });
        } catch (installError) {
          console.error('浏览器安装失败:', installError);
          throw new Error('浏览器安装失败，请联系管理员');
        }
      });

      if (!browser) {
        throw new Error('浏览器启动失败');
      }

      console.log('浏览器启动成功');
    } catch (error: unknown) {
      console.error('启动浏览器失败:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      return NextResponse.json(
        { error: `启动浏览器失败：${errorMessage}` },
        { status: 500 }
      );
    }

    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      ignoreHTTPSErrors: true
    });

    const results = await Promise.all(
      urls.map(async (url) => {
        const page = await context.newPage();
        try {
          console.log('正在访问��面:', url);
          await page.goto(url, {
            waitUntil: 'networkidle',
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
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '未知错误';
          console.error(`抓取错误 ${url}:`, errorMessage);
          return null;
        } finally {
          await page.close();
        }
      })
    );

    await context.close();
    const validResults = results.filter((result): result is NonNullable<typeof result> => result !== null);
    console.log('有效结果:', validResults);

    return NextResponse.json(validResults);
  } catch (error: unknown) {
    console.error('预览失败:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { error: `预览失败：${errorMessage}` },
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
} 