import { jsxRenderer } from 'hono/jsx-renderer'

type RenderProps = {
  title?: string;
  description?: string;
  currentPath?: string;
}

export const renderer = jsxRenderer(({ children, title, description, currentPath }: any) => {
  const pageTitle = title
    ? `${title} | 한국인공지능교육센터`
    : '한국인공지능교육센터 — 대한민국 AI 교육의 표준을 설계합니다';
  const pageDesc = description
    || 'AI 강사 풀 & 맞춤 커리큘럼 매칭 플랫폼. 실무 자동화부터 바이브 코딩까지 — 한국인공지능교육센터(KAIEDU)에서 만나보세요.';
  const path = currentPath || '/';
  const siteUrl = 'https://kaiedu.center';
  const ogImage = `${siteUrl}/static/og-image.png`;
  const canonicalUrl = `${siteUrl}${path}`;

  return (
    <html lang="ko">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta name="keywords" content="AI 교육, 인공지능 강사, AI 커리큘럼, 바이브 코딩, AI 강의, 기업교육, ChatGPT 강사, Claude 강사, AI 자동화, 한국인공지능교육센터, KAIEDU" />
        <meta name="author" content="한국인공지능교육센터" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph (Facebook, KakaoTalk, LinkedIn, LINE) */}
        <meta property="og:site_name" content="한국인공지능교육센터" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="ko_KR" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:secure_url" content={ogImage} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="한국인공지능교육센터 (KAIEDU) — AI · EDUCATION · FUTURE" />

        {/* Twitter / X Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
        <meta name="twitter:image" content={ogImage} />
        <meta name="twitter:image:alt" content="한국인공지능교육센터 (KAIEDU)" />

        {/* KakaoTalk extra hint */}
        <meta name="thumbnail" content={ogImage} />

        <link rel="icon" type="image/svg+xml" href="/static/favicon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script src="https://cdn.tailwindcss.com"></script>
        <link
          href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css"
          rel="stylesheet"
        />
        <link href="/static/style.css" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                theme: {
                  extend: {
                    colors: {
                      brand: {
                        primary: '#1B3F7A',
                        secondary: '#2E5EAA',
                        accent: '#00A8E8',
                        bg: '#F8FAFF',
                        ink: '#1A1A2E',
                        sub: '#666666',
                      },
                      neon: {
                        cyan: '#00D9FF',
                        blue: '#5B8DEF',
                        violet: '#B794F6',
                      },
                      ink: {
                        950: '#060818',
                        900: '#0A0E27',
                        800: '#0F172A',
                        700: '#1E293B',
                      },
                    },
                    fontFamily: {
                      sans: ['Noto Sans KR', 'Inter', 'sans-serif'],
                      display: ['Inter', 'Noto Sans KR', 'sans-serif'],
                    },
                  },
                },
              };
            `,
          }}
        />
      </head>
      <body class="font-sans bg-brand-bg text-brand-ink antialiased">
        <Header currentPath={path} />
        <main>{children}</main>
        <Footer />
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
      </body>
    </html>
  );
})

function Header({ currentPath }: { currentPath: string }) {
  const linkCls = (href: string, exact = false) => {
    const active = exact ? currentPath === href : currentPath.startsWith(href);
    return `text-sm font-medium transition-colors ${
      active ? 'text-brand-primary' : 'text-brand-ink/70 hover:text-brand-primary'
    }`;
  };
  return (
    <header class="sticky top-0 z-40 bg-white/85 backdrop-blur border-b border-slate-200/60">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <a href="/" class="flex items-center gap-2.5 group">
          <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:shadow-md transition-shadow">
            <i class="fas fa-microchip text-base"></i>
          </div>
          <div class="hidden sm:block leading-tight">
            <div class="text-[15px] font-bold text-brand-primary tracking-tight">한국인공지능교육센터</div>
            <div class="text-[10px] text-brand-sub tracking-widest font-medium">KOREA AI EDUCATION CENTER</div>
          </div>
          <div class="sm:hidden text-base font-bold text-brand-primary">KAIEDU</div>
        </a>
        <nav class="hidden md:flex items-center gap-7">
          <a href="/instructor/list" class={linkCls('/instructor/list')}>강사 찾기</a>
          <a href="/consult" class={linkCls('/consult')}>AI 커리큘럼 상담</a>
          <a href="/instructor/register" class={linkCls('/instructor/register')}>강사 등록</a>
          <a href="/about" class={linkCls('/about')}>센터 소개</a>
        </nav>
        <div class="flex items-center gap-2">
          <a
            href="/consult"
            class="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-primary text-white text-sm font-semibold hover:bg-brand-secondary transition-colors shadow-sm"
          >
            <i class="fas fa-comments text-xs"></i>
            상담 시작
          </a>
          <button
            id="mobile-menu-btn"
            class="md:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100"
            aria-label="메뉴"
          >
            <i class="fas fa-bars"></i>
          </button>
        </div>
      </div>
      <div id="mobile-menu" class="hidden md:hidden border-t border-slate-200 bg-white">
        <div class="px-4 py-3 flex flex-col gap-1">
          <a href="/instructor/list" class="px-3 py-2.5 rounded-lg hover:bg-slate-50 text-sm">강사 찾기</a>
          <a href="/consult" class="px-3 py-2.5 rounded-lg hover:bg-slate-50 text-sm">AI 커리큘럼 상담</a>
          <a href="/instructor/register" class="px-3 py-2.5 rounded-lg hover:bg-slate-50 text-sm">강사 등록</a>
          <a href="/about" class="px-3 py-2.5 rounded-lg hover:bg-slate-50 text-sm">센터 소개</a>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer class="mt-24 bg-slate-900 text-slate-300">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid md:grid-cols-3 gap-8">
        <div>
          <div class="flex items-center gap-2.5 mb-3">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center text-white">
              <i class="fas fa-microchip text-sm"></i>
            </div>
            <div class="font-bold text-white">한국인공지능교육센터</div>
          </div>
          <p class="text-sm text-slate-400 leading-relaxed">
            대한민국 AI 교육의 표준을 설계합니다.<br />
            AI 강사 풀 &amp; 맞춤 커리큘럼 매칭 플랫폼.
          </p>
        </div>
        <div>
          <div class="text-sm font-semibold text-white mb-3">사업자 정보</div>
          <div class="text-xs text-slate-400 leading-7">
            상호: 한국인공지능교육센터<br />
            대표자: 최규문<br />
            사업자등록번호: <span class="text-slate-500">사업자등록 진행 중</span><br />
            주소: 서울특별시 양천구 공항대로 638, 302호<br />
            대표 이메일: letsgo999@gmail.com<br />
            대표 전화: 010-2216-8775
          </div>
        </div>
        <div>
          <div class="text-sm font-semibold text-white mb-3">바로가기</div>
          <ul class="space-y-2 text-xs text-slate-400">
            <li><a href="/instructor/list" class="hover:text-white transition-colors">강사 찾기</a></li>
            <li><a href="/consult" class="hover:text-white transition-colors">AI 커리큘럼 상담</a></li>
            <li><a href="/instructor/register" class="hover:text-white transition-colors">강사 등록</a></li>
            <li><a href="/about" class="hover:text-white transition-colors">센터 소개</a></li>
            <li><a href="/legal/terms" class="hover:text-white transition-colors">이용약관</a></li>
            <li><a href="/legal/privacy" class="hover:text-white transition-colors">개인정보처리방침</a></li>
          </ul>
        </div>
      </div>
      <div class="border-t border-slate-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>© 2025 한국인공지능교육센터 (Korea AI Education Center). All rights reserved.</div>
          <div>
            <a href="/admin/login" class="hover:text-slate-300">관리자</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
