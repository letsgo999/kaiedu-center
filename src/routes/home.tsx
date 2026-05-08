import { Hono } from 'hono';
import type { Bindings } from '../lib/types';

const app = new Hono<{ Bindings: Bindings }>();

app.get('/', async (c) => {
  const stats = await c.env.DB.prepare(`
    SELECT
      (SELECT COUNT(*) FROM instructors WHERE status = 'approved') as instructor_count,
      (SELECT COUNT(*) FROM consultations) as consultation_count,
      (SELECT COUNT(*) FROM instructors WHERE is_vibe_coder = 1 AND status = 'approved') as vibe_count
  `).first<{ instructor_count: number; consultation_count: number; vibe_count: number }>().catch(() => null);

  // 바이브 코딩 강사 미리보기 (쇼케이스용)
  const vibeRows = await c.env.DB.prepare(`
    SELECT id, name, region, bio_short, vibe_coding_projects, specialty_tags
    FROM instructors WHERE status='approved' AND is_vibe_coder = 1
    ORDER BY created_at DESC LIMIT 3
  `).all<any>().catch(() => ({ results: [] as any[] }));
  const vibeList = vibeRows.results || [];

  return c.render(
    <>
      {/* ============================================
          HERO — 다크 시네마틱 + 인터랙티브
          ============================================ */}
      <section class="hero-dark">
        {/* 떠다니는 오브 */}
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-24 sm:pb-32">
          <div class="grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-center">
            {/* LEFT — 카피 */}
            <div class="animate-slide-up">
              {/* 라이브 배지 */}
              <div class="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full glass text-xs font-medium text-slate-200 mb-7">
                <span class="live-dot"></span>
                <span>2025년 5월 베타 오픈 · 100% 무료 운영 중</span>
              </div>

              <h1 class="font-display font-extrabold tracking-tight leading-[0.98] text-[2.6rem] sm:text-6xl lg:text-7xl text-white">
                <span class="block">대한민국 AI 교육의</span>
                <span class="block mt-2 text-gradient-neon">표준을 설계합니다</span>
              </h1>

              <p class="mt-8 text-base sm:text-lg text-slate-300/90 leading-relaxed max-w-xl">
                훈련된 AI 강사를 한 자리에. 내 상황에 꼭 맞는 커리큘럼을 10분 만에.<br class="hidden sm:block" />
                <span class="text-slate-400">공급과 수요를 한 번에 잇는 국내 최초 AI 교육 매칭 플랫폼.</span>
              </p>

              <div class="mt-10 flex flex-col sm:flex-row gap-3">
                <a href="/consult" class="btn btn-neon text-base px-7 py-3.5">
                  <i class="fas fa-comments mr-1"></i>
                  AI 커리큘럼 상담 받기
                  <i class="fas fa-arrow-right text-xs ml-1"></i>
                </a>
                <a href="/instructor/register" class="btn btn-glass text-base px-7 py-3.5">
                  <i class="fas fa-user-plus mr-1"></i>
                  AI 강사로 등록하기
                </a>
              </div>

              {/* 통계 */}
              {stats && (
                <div class="mt-14 grid grid-cols-3 gap-8 max-w-lg">
                  <HeroStat n={stats.instructor_count} label="등록 강사" unit="명" />
                  <HeroStat n={stats.consultation_count} label="누적 상담" unit="건" />
                  <HeroStat n={stats.vibe_count} label="바이브 코딩" unit="명" highlight />
                </div>
              )}

              {/* 신뢰 라인 */}
              <div class="mt-10 pt-8 border-t border-white/10 flex items-center gap-5 text-xs text-slate-400">
                <div class="flex -space-x-2">
                  {['from-cyan-400 to-blue-500','from-blue-500 to-violet-500','from-violet-500 to-pink-500'].map(g => (
                    <div class={`w-8 h-8 rounded-full bg-gradient-to-br ${g} border-2 border-ink-900 flex items-center justify-center text-[10px] font-bold text-white`}>
                      <i class="fas fa-user"></i>
                    </div>
                  ))}
                </div>
                <span class="leading-tight">
                  <strong class="text-slate-200">기업·공공기관·대학</strong> AI 교육 담당자분들이<br />
                  지금 이 순간 활용 중입니다
                </span>
              </div>
            </div>

            {/* RIGHT — 미니 챗봇 미리보기 */}
            <div class="hidden lg:block animate-slide-up" style="animation-delay: 0.15s">
              <div class="glass-strong p-1.5 rounded-2xl shadow-2xl">
                {/* 윈도우 헤더 */}
                <div class="flex items-center justify-between px-4 py-3 border-b border-white/10">
                  <div class="code-dots"><span></span><span></span><span></span></div>
                  <div class="text-[11px] text-slate-400 font-medium tracking-wider">AI CONSULT · LIVE PREVIEW</div>
                  <div class="w-12"></div>
                </div>

                {/* 진행 바 */}
                <div class="px-4 pt-3 pb-1">
                  <div class="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span>STEP 3</span>
                    <span>3 / 7</span>
                  </div>
                  <div class="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-neon-cyan to-neon-blue rounded-full" style="width: 42%"></div>
                  </div>
                </div>

                {/* 메시지 */}
                <div class="px-5 py-4 space-y-3 flex flex-col min-h-[280px]">
                  <div class="mini-chat-msg mini-chat-bot" style="animation-delay: 0.3s">
                    어떤 분야에서 일하고 계세요?
                  </div>
                  <div class="mini-chat-msg mini-chat-user" style="animation-delay: 0.6s">
                    제조업 / HRD 담당자
                  </div>
                  <div class="mini-chat-msg mini-chat-bot" style="animation-delay: 0.9s">
                    AI 활용 경험은 어떠세요?
                  </div>
                  <div class="mini-chat-msg mini-chat-user" style="animation-delay: 1.2s">
                    ChatGPT 가끔 사용
                  </div>
                  <div class="mini-chat-msg mini-chat-bot" style="animation-delay: 1.5s">
                    <span class="text-xs text-neon-cyan font-medium">Claude가 분석 중</span>
                    <span class="inline-flex gap-1 ml-1">
                      <span class="w-1 h-1 bg-neon-cyan rounded-full animate-pulse"></span>
                      <span class="w-1 h-1 bg-neon-cyan rounded-full animate-pulse" style="animation-delay:0.2s"></span>
                      <span class="w-1 h-1 bg-neon-cyan rounded-full animate-pulse" style="animation-delay:0.4s"></span>
                    </span>
                  </div>
                </div>

                {/* 하단 안내 */}
                <div class="px-4 py-3 border-t border-white/10 flex items-center justify-between">
                  <div class="text-[11px] text-slate-500">
                    <i class="fas fa-shield-halved text-neon-cyan/70 mr-1"></i>
                    AI가 맞춤 로드맵 생성
                  </div>
                  <a href="/consult" class="text-xs font-semibold text-neon-cyan hover:text-white transition-colors">
                    상담 시작 →
                  </a>
                </div>
              </div>

              {/* 결과 미리보기 카드 (떠 있는) */}
              <div class="mt-6 ml-12 glass-strong p-4 rounded-xl shadow-xl animate-slide-up" style="animation-delay: 1.8s">
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-blue flex items-center justify-center text-white text-xs">
                    <i class="fas fa-check"></i>
                  </div>
                  <div class="text-xs font-bold text-white">결과 — 8주 학습 로드맵 + 추천 강사 3명</div>
                </div>
                <div class="text-[11px] text-slate-400 leading-relaxed">
                  ChatGPT 활용 · 업무자동화 · RAG 시스템 매칭 완료
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="gradient-divider"></div>
      </section>

      {/* ============================================
          핵심 가치 3 (라이트)
          ============================================ */}
      <section class="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
        <div class="text-center max-w-2xl mx-auto mb-14 reveal">
          <div class="text-brand-secondary font-semibold text-xs tracking-[0.2em] mb-2">WHY KAIEDU</div>
          <h2 class="text-3xl sm:text-5xl font-bold tracking-tight text-brand-ink">
            왜 <span class="text-gradient-brand">KAIEDU</span>인가
          </h2>
          <p class="mt-4 text-brand-sub">단순 강사 디렉토리가 아닙니다. AI가 직접 커리큘럼을 설계합니다.</p>
        </div>
        <div class="grid md:grid-cols-3 gap-6">
          <ValueCard
            icon="fa-bolt"
            iconBg="from-amber-400 to-orange-500"
            title="10분 맞춤 로드맵"
            desc="업종·직무·고민만 답하면 Claude AI가 주차별 학습 로드맵과 추천 도구를 즉시 설계합니다."
            delay="0"
          />
          <ValueCard
            icon="fa-code"
            iconBg="from-cyan-400 to-blue-600"
            title="바이브 코딩 강사 풀"
            desc="실제로 AI 앱을 만들어본 강사만 별도 배지로 표시. 국내 유일의 바이브 코딩 검증 시스템."
            delay="100"
            featured
          />
          <ValueCard
            icon="fa-shield-halved"
            iconBg="from-emerald-400 to-teal-600"
            title="검증된 매칭"
            desc="모든 강사는 운영진이 직접 심사·승인. 의뢰는 센터가 중개해 안전하게 연결합니다."
            delay="200"
          />
        </div>
      </section>

      {/* ============================================
          바이브 코딩 쇼케이스 — 다크 섹션 (차별화)
          ============================================ */}
      <section class="relative bg-ink-900 text-slate-200 overflow-hidden">
        <div class="absolute inset-0 opacity-50 pointer-events-none">
          <div class="orb orb-1" style="top: 10%; right: -100px;"></div>
          <div class="orb orb-2" style="bottom: -50px; left: 30%;"></div>
        </div>
        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 reveal">
            <div>
              <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-medium text-neon-cyan mb-4">
                <i class="fas fa-code text-[10px]"></i>
                국내 유일 · VIBE CODING
              </div>
              <h2 class="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.1]">
                실제로 <span class="text-gradient-neon">AI 앱을 만들어본</span><br />
                강사만 모았습니다
              </h2>
              <p class="mt-5 text-slate-400 max-w-xl">
                "들어본 사람"이 아니라 "직접 만든 사람"이 가르칩니다.<br />
                바이브 코딩 강사들의 실제 프로젝트를 미리 확인해보세요.
              </p>
            </div>
            <a href="/instructor/list?vibe=1" class="btn btn-glass self-start lg:self-end">
              전체 바이브 강사 보기
              <i class="fas fa-arrow-right text-xs ml-1"></i>
            </a>
          </div>

          <div class="grid md:grid-cols-3 gap-5">
            {vibeList.length > 0 ? vibeList.map((row: any, idx: number) => {
              let projects: any[] = [];
              try { projects = JSON.parse(row.vibe_coding_projects || '[]'); } catch {}
              let tags: string[] = [];
              try { tags = JSON.parse(row.specialty_tags || '[]'); } catch {}
              const featured = projects[0];
              return (
                <a href={`/instructor/${row.id}`} class={`showcase-card p-6 reveal animate-slide-up`} style={`animation-delay: ${idx * 100}ms`}>
                  <div class="flex items-start justify-between mb-5">
                    <div class="showcase-icon">
                      <i class="fas fa-microchip"></i>
                    </div>
                    <span class="badge badge-vibe">VIBE CODER</span>
                  </div>
                  <div class="text-white font-bold text-lg mb-1">{row.name}</div>
                  <div class="text-xs text-slate-500 mb-4">
                    <i class="fas fa-location-dot text-[9px] mr-1"></i>{row.region}
                  </div>
                  <p class="text-sm text-slate-300 line-clamp-2 mb-5 min-h-[40px]">{row.bio_short}</p>
                  {featured && (
                    <div class="bg-black/30 border border-white/5 rounded-lg p-3 mb-3">
                      <div class="text-[10px] text-neon-cyan tracking-wider font-bold mb-1">FEATURED PROJECT</div>
                      <div class="text-sm text-white font-semibold mb-1">{featured.name}</div>
                      <div class="text-xs text-slate-400 line-clamp-1">{featured.tools}</div>
                    </div>
                  )}
                  <div class="flex flex-wrap gap-1.5">
                    {tags.slice(0, 2).map(t => (
                      <span class="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">{t}</span>
                    ))}
                  </div>
                </a>
              );
            }) : (
              <div class="md:col-span-3 text-center py-16 glass rounded-2xl">
                <i class="fas fa-rocket text-4xl text-neon-cyan/40 mb-4"></i>
                <p class="text-slate-300 font-medium mb-1">곧 첫 바이브 코딩 강사가 등록됩니다</p>
                <p class="text-sm text-slate-500 mb-6">바이브 코딩 강사 1호로 등록하시겠어요?</p>
                <a href="/instructor/register" class="btn btn-neon">
                  <i class="fas fa-bolt"></i> 1호 강사로 등록
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================
          작동 방식 (라이트)
          ============================================ */}
      <section class="bg-gradient-to-b from-white to-brand-bg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
          <div class="text-center max-w-2xl mx-auto mb-14 reveal">
            <div class="text-brand-secondary font-semibold text-xs tracking-[0.2em] mb-2">HOW IT WORKS</div>
            <h2 class="text-3xl sm:text-5xl font-bold tracking-tight text-brand-ink">3분이면 충분합니다</h2>
            <p class="mt-4 text-brand-sub">복잡한 회원가입 없이, 질문에 답하는 것만으로 끝납니다.</p>
          </div>
          <div class="grid md:grid-cols-3 gap-6 relative">
            <div class="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-brand-secondary/30 to-transparent"></div>
            <StepCard num="01" title="질문에 답하기" desc="업종·직무·AI 경험·고민·목표 등 7가지 질문에 답하세요. 회원가입 없이 익명으로 진행됩니다." delay="0" />
            <StepCard num="02" title="AI 커리큘럼 받기" desc="Claude Sonnet이 주차별 학습 로드맵과 추천 도구를 30초 안에 생성합니다." delay="120" />
            <StepCard num="03" title="강사 추천 + 연결" desc="태그·지역·바이브 코딩 점수 기반 매칭. 의뢰는 센터가 검토 후 안전하게 중개합니다." delay="240" />
          </div>
        </div>
      </section>

      {/* ============================================
          CTA — 다크
          ============================================ */}
      <section class="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div class="relative rounded-3xl overflow-hidden bg-ink-900 p-10 sm:p-16">
          <div class="orb orb-1" style="top: -100px; right: -50px; width: 280px; height: 280px;"></div>
          <div class="orb orb-3" style="bottom: -80px; left: 20%; width: 220px; height: 220px;"></div>
          <div class="relative max-w-2xl">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-[11px] font-medium text-neon-cyan mb-5">
              <span class="live-dot" style="background: #00D9FF;"></span>
              지금 시작 가능
            </div>
            <h2 class="text-3xl sm:text-5xl font-bold mb-5 leading-[1.1] text-white tracking-tight">
              지금 시작하세요.<br />
              <span class="text-gradient-neon">베타 기간 100% 무료</span>입니다.
            </h2>
            <p class="text-slate-300 mb-9 text-base sm:text-lg leading-relaxed">
              AI 교육이 필요한 기업·기관·개인 모두 환영합니다.<br />
              AI를 가르칠 수 있는 강사도 무료로 등록 가능합니다.
            </p>
            <div class="flex flex-col sm:flex-row gap-3">
              <a href="/consult" class="btn btn-neon text-base px-7 py-3.5">
                <i class="fas fa-comments mr-1"></i>
                상담 시작하기
              </a>
              <a href="/instructor/list" class="btn btn-glass text-base px-7 py-3.5">
                <i class="fas fa-users mr-1"></i>
                강사 둘러보기
              </a>
            </div>
          </div>
        </div>
      </section>
    </>,
    { title: '대한민국 AI 교육의 표준을 설계합니다', currentPath: '/' }
  );
});

function HeroStat({ n, label, unit, highlight }: { n: number; label: string; unit: string; highlight?: boolean }) {
  return (
    <div>
      <div class={`stat-num text-3xl sm:text-4xl font-bold ${highlight ? 'text-gradient-neon' : 'text-white'}`}>
        <span class="counter" data-count={n}>{n.toLocaleString()}</span>
        <span class="text-base ml-1 text-slate-400 font-medium">{unit}</span>
      </div>
      <div class="text-xs text-slate-500 mt-1.5 tracking-wide">{label}</div>
    </div>
  );
}

function ValueCard({ icon, iconBg, title, desc, delay, featured }: any) {
  return (
    <div class={`reveal spotlight card-hover p-7 bg-white border ${featured ? 'border-neon-cyan/40 shadow-lg shadow-neon-cyan/5' : 'border-slate-200/70'} rounded-2xl`} style={`transition-delay: ${delay}ms`}>
      <div class={`w-12 h-12 rounded-xl bg-gradient-to-br ${iconBg} text-white flex items-center justify-center text-xl mb-5 shadow-lg`}>
        <i class={`fas ${icon}`}></i>
      </div>
      <h3 class="text-lg font-bold mb-2 flex items-center gap-2">
        {title}
        {featured && <span class="text-[10px] font-bold tracking-wider text-neon-blue bg-neon-cyan/10 px-2 py-0.5 rounded-full">UNIQUE</span>}
      </h3>
      <p class="text-sm text-brand-sub leading-relaxed">{desc}</p>
    </div>
  );
}

function StepCard({ num, title, desc, delay }: any) {
  return (
    <div class="reveal relative bg-white p-7 rounded-2xl border border-slate-200/70 card-hover" style={`transition-delay: ${delay}ms`}>
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary text-white flex items-center justify-center font-bold text-sm shadow-md">
          {num}
        </div>
        <div class="text-[11px] font-bold tracking-[0.15em] text-brand-secondary">STEP {num}</div>
      </div>
      <h3 class="text-lg font-bold mb-2">{title}</h3>
      <p class="text-sm text-brand-sub leading-relaxed">{desc}</p>
    </div>
  );
}

export default app;
