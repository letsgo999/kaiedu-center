import { Hono } from 'hono';
import { renderer } from './renderer';
import type { Bindings } from './lib/types';

import home from './routes/home';
import instructor from './routes/instructor';
import consult from './routes/consult';
import contact from './routes/contact';
import admin from './routes/admin';
import staticPages from './routes/static-pages';

const app = new Hono<{ Bindings: Bindings }>();

// robots.txt — 모든 검색엔진/AI 크롤러 허용
app.get('/robots.txt', (c) => {
  const body = `# 한국인공지능교육센터 (KAIEDU) — robots.txt
# 모든 검색 엔진 및 AI 크롤러 전면 허용

User-agent: *
Allow: /
Disallow: /admin/
Disallow: /instructor/edit/
Disallow: /api/

User-agent: Googlebot
Allow: /

User-agent: Googlebot-Image
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Yeti
Allow: /

User-agent: NaverBot
Allow: /

User-agent: Daum
Allow: /

User-agent: DuckDuckBot
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: CCBot
Allow: /

User-agent: Applebot
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Bytespider
Allow: /

User-agent: FacebookBot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: LinkedInBot
Allow: /

User-agent: KakaoTalk-scrap
Allow: /

User-agent: kakaotalk-scrap
Allow: /

Sitemap: https://kaiedu.center/sitemap.xml
`;
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
});

// sitemap.xml — 검색엔진 색인 가속
app.get('/sitemap.xml', (c) => {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://kaiedu.center/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>https://kaiedu.center/static/og-image.png</image:loc>
      <image:title>한국인공지능교육센터 (KAIEDU)</image:title>
    </image:image>
  </url>
  <url>
    <loc>https://kaiedu.center/instructor/list</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://kaiedu.center/instructor/register</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://kaiedu.center/consult</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://kaiedu.center/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://kaiedu.center/legal/terms</loc>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://kaiedu.center/legal/privacy</loc>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>`;
  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
});

app.use(renderer);

app.route('/', home);
app.route('/instructor', instructor);
app.route('/consult', consult);
app.route('/contact', contact);
app.route('/admin', admin);
app.route('/', staticPages);

// 404
app.notFound((c) => c.render(
  <div class="max-w-xl mx-auto px-4 py-24 text-center">
    <div class="text-7xl font-extrabold text-brand-primary/20 mb-4">404</div>
    <h1 class="text-2xl font-bold mb-3">페이지를 찾을 수 없습니다</h1>
    <p class="text-brand-sub mb-8">요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
    <a href="/" class="btn btn-primary"><i class="fas fa-home"></i> 메인으로</a>
  </div>, { title: '404' }
));

// 에러
app.onError((err, c) => {
  console.error('[ERROR]', err);
  return c.render(
    <div class="max-w-xl mx-auto px-4 py-24 text-center">
      <i class="fas fa-circle-exclamation text-5xl text-rose-500 mb-4"></i>
      <h1 class="text-2xl font-bold mb-3">서버 오류가 발생했습니다</h1>
      <p class="text-brand-sub mb-2">잠시 후 다시 시도해주세요.</p>
      <p class="text-xs text-brand-sub mb-8">{err.message}</p>
      <a href="/" class="btn btn-primary"><i class="fas fa-home"></i> 메인으로</a>
    </div>, { title: '오류' }
  );
});

export default app;
