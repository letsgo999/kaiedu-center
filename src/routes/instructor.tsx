import { Hono } from 'hono';
import type { Bindings } from '../lib/types';
import {
  SPECIALTY_TAGS, REGIONS, TARGET_AUDIENCES, LECTURE_FORMATS,
} from '../lib/types';
import { uuid, safeJsonArray, isEmail, generateToken, isoExpiresIn } from '../lib/utils';

const app = new Hono<{ Bindings: Bindings }>();

// ============================================
// 강사 등록 페이지 (GET)
// ============================================
app.get('/register', (c) => {
  const stepLabels = ['기본 정보', '전문 분야', '경력 / 포트폴리오', '바이브 코딩'];
  return c.render(
    <>
      {/* 다크 미니 히어로 */}
      <section class="hero-dark">
        <div class="orb orb-1" style="width:260px;height:260px;top:-60px;right:5%;"></div>
        <div class="orb orb-2" style="width:220px;height:220px;bottom:-80px;left:5%;"></div>
        <div class="max-w-3xl mx-auto px-4 sm:px-6 pt-12 pb-10 sm:pt-14 sm:pb-12 text-center animate-slide-up">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-medium text-slate-200 mb-5">
            <i class="fas fa-user-plus text-[10px]"></i>
            INSTRUCTOR REGISTRATION
          </div>
          <h1 class="font-display font-extrabold tracking-tight text-white text-4xl sm:text-5xl leading-[1.1]">
            <span class="text-gradient-neon">AI 강사</span>로 등록하세요
          </h1>
          <p class="mt-5 text-slate-300/85 max-w-xl mx-auto leading-relaxed">
            관리자 심사 후 공개됩니다. 등록 시 입력한 이메일로<br class="hidden sm:block" />
            언제든 프로필을 수정할 수 있는 매직 링크를 보내드립니다.
          </p>
          <div class="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-400">
            <span class="inline-flex items-center gap-1.5"><i class="fas fa-circle-check text-emerald-400"></i> 등록비 무료</span>
            <span class="inline-flex items-center gap-1.5"><i class="fas fa-circle-check text-emerald-400"></i> 1~2일 내 심사</span>
            <span class="inline-flex items-center gap-1.5"><i class="fas fa-circle-check text-emerald-400"></i> 자가 수정 가능</span>
          </div>
        </div>
        <div class="gradient-divider"></div>
      </section>

      <div class="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        {/* 단계 표시 + 라벨 */}
        <div class="mb-8 reveal">
          <div class="flex items-center justify-center gap-3 sm:gap-5 mb-4">
            {[1,2,3,4].map(n => (
              <div class="flex items-center gap-3 sm:gap-5">
                <div class="flex flex-col items-center gap-2">
                  <div class={`step-dot ${n === 1 ? 'step-dot-active' : ''}`} data-step-dot={n}></div>
                  <div class="text-[10px] sm:text-[11px] tracking-wider font-bold text-slate-400 hidden sm:block">{stepLabels[n-1]}</div>
                </div>
                {n < 4 && <div class="w-10 sm:w-16 h-px bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 self-start mt-1.5"></div>}
              </div>
            ))}
          </div>
        </div>

      <form id="instructor-form" class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 reveal">
        {/* STEP 1 */}
        <div class="step-panel" data-step="1">
          <h2 class="text-xl font-bold mb-1">기본 정보</h2>
          <p class="text-sm text-brand-sub mb-6">필수 항목을 입력해주세요.</p>
          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="label label-req">이름 (실명)</label>
              <input type="text" name="name" class="input-field" placeholder="홍길동" required />
            </div>
            <div>
              <label class="label label-req">활동 지역</label>
              <select name="region" class="input-field" required>
                <option value="">선택</option>
                {REGIONS.map(r => <option value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label class="label label-req">이메일</label>
              <input type="email" name="email" class="input-field" placeholder="you@example.com" required />
              <div class="helper-text">수정 권한 매직 링크 발송에 사용됩니다.</div>
            </div>
            <div>
              <label class="label">전화번호</label>
              <input type="tel" name="phone" class="input-field" placeholder="010-0000-0000" />
            </div>
          </div>
          <div class="mt-4">
            <label class="label label-req">자기소개 한 줄 (최대 100자)</label>
            <input type="text" name="bio_short" maxlength={100} class="input-field" placeholder="예: 실무 자동화 200건 경험, 대기업 임직원 교육 전문" required />
            <div class="helper-text"><span data-count="bio_short">0</span>/100자 — 강사 카드에 노출됩니다.</div>
          </div>
        </div>

        {/* STEP 2 */}
        <div class="step-panel hidden" data-step="2">
          <h2 class="text-xl font-bold mb-1">전문 분야</h2>
          <p class="text-sm text-brand-sub mb-6">강의 가능한 분야와 대상을 모두 선택해주세요.</p>

          <div class="mb-6">
            <label class="label label-req">전문 분야 (복수 선택)</label>
            <div class="flex flex-wrap gap-2 mt-2" id="specialty-chips">
              {SPECIALTY_TAGS.map(tag => (
                <span class="chip" data-chip="specialty" data-value={tag}>{tag}</span>
              ))}
            </div>
            <input type="hidden" name="specialty_tags" />
          </div>

          <div class="mb-6">
            <label class="label label-req">강의 가능 대상 (복수 선택)</label>
            <div class="flex flex-wrap gap-2 mt-2" id="audience-chips">
              {TARGET_AUDIENCES.map(t => (
                <span class="chip" data-chip="audience" data-value={t}>{t}</span>
              ))}
            </div>
            <input type="hidden" name="target_audience" />
          </div>

          <div>
            <label class="label label-req">강의 형태</label>
            <div class="flex flex-wrap gap-3 mt-2">
              {LECTURE_FORMATS.map((f, i) => (
                <label class="radio-card">
                  <input type="radio" name="lecture_format" value={f} required={i === 0} />
                  <span class="text-sm font-medium">{f}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* STEP 3 */}
        <div class="step-panel hidden" data-step="3">
          <h2 class="text-xl font-bold mb-1">경력 & 포트폴리오</h2>
          <p class="text-sm text-brand-sub mb-6">경력 요약은 필수, 나머지는 선택입니다.</p>

          <div class="mb-4">
            <label class="label label-req">경력 요약 (최대 500자)</label>
            <textarea name="career_summary" maxlength={500} class="input-field" placeholder="주요 경력, 강의 경험, 전문 분야를 자유롭게 작성해주세요." required></textarea>
            <div class="helper-text"><span data-count="career_summary">0</span>/500자</div>
          </div>

          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="label">포트폴리오 URL</label>
              <input type="url" name="portfolio_url" class="input-field" placeholder="https://..." />
            </div>
            <div>
              <label class="label">SNS / 유튜브</label>
              <input type="url" name="sns_url" class="input-field" placeholder="https://youtube.com/..." />
            </div>
          </div>

          <div class="mt-4 grid sm:grid-cols-2 gap-4">
            <div>
              <label class="label">강의료 범위</label>
              <input type="text" name="fee_range" class="input-field" placeholder="예: 시간당 20~30만원" />
            </div>
            <div class="flex items-end">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="fee_public" value="1" />
                <span class="text-sm">강의료를 공개합니다</span>
              </label>
            </div>
          </div>
        </div>

        {/* STEP 4: 바이브 코딩 */}
        <div class="step-panel hidden" data-step="4">
          <h2 class="text-xl font-bold mb-1 flex items-center gap-2">
            <i class="fas fa-code text-brand-accent"></i>
            바이브 코딩 포트폴리오
          </h2>
          <p class="text-sm text-brand-sub mb-6">
            바이브 코딩 기반으로 직접 개발한 앱·서비스가 있다면 등록하세요.<br />
            <span class="text-brand-accent font-medium">1개 이상 등록 시 "바이브 코딩 가능" 배지가 자동으로 부여됩니다.</span> (선택 항목)
          </p>

          <div id="vibe-projects" class="space-y-4"></div>

          <button type="button" id="add-vibe-btn" class="mt-4 btn btn-secondary w-full">
            <i class="fas fa-plus"></i>
            바이브 코딩 프로젝트 추가
          </button>

          <div class="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <label class="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" name="agree" required class="mt-1" />
              <span class="text-sm text-amber-900">
                <strong>개인정보 수집 및 이용 동의 (필수)</strong> — 입력하신 정보는 강사 매칭 및 운영팀 심사 목적으로만 사용되며,
                관련 법령에 따라 안전하게 보관됩니다.
                <a href="/legal/privacy" target="_blank" class="underline">자세히 보기</a>
              </span>
            </label>
          </div>
        </div>

        {/* 네비게이션 */}
        <div class="mt-8 flex justify-between gap-3 pt-6 border-t border-slate-200">
          <button type="button" id="prev-step" class="btn btn-secondary hidden">
            <i class="fas fa-arrow-left"></i> 이전
          </button>
          <div class="flex-1"></div>
          <button type="button" id="next-step" class="btn btn-primary">
            다음 <i class="fas fa-arrow-right"></i>
          </button>
          <button type="submit" id="submit-btn" class="btn btn-neon hidden">
            <i class="fas fa-paper-plane"></i> 등록 신청
          </button>
        </div>
      </form>

      <p class="text-center text-xs text-brand-sub mt-6">
        등록 후 관리자 심사를 거쳐 승인되면 강사 목록에 노출됩니다. 보통 1~2 영업일 소요됩니다.
      </p>
    </div>
    </>,
    { title: '강사 등록', currentPath: '/instructor/register' }
  );
});

// ============================================
// 강사 등록 API (POST)
// ============================================
app.post('/api/register', async (c) => {
  try {
    const body = await c.req.json();
    const {
      name, region, email, phone, bio_short,
      specialty_tags, target_audience, lecture_format,
      career_summary, portfolio_url, sns_url, fee_range, fee_public,
      vibe_coding_projects, agree
    } = body;

    if (!agree) return c.json({ ok: false, error: '개인정보 수집 동의가 필요합니다.' }, 400);
    if (!name || !region || !email || !bio_short || !career_summary || !lecture_format) {
      return c.json({ ok: false, error: '필수 항목이 누락되었습니다.' }, 400);
    }
    if (!isEmail(email)) return c.json({ ok: false, error: '올바른 이메일 형식이 아닙니다.' }, 400);
    if (!Array.isArray(specialty_tags) || specialty_tags.length === 0) {
      return c.json({ ok: false, error: '전문 분야를 1개 이상 선택해주세요.' }, 400);
    }
    if (!Array.isArray(target_audience) || target_audience.length === 0) {
      return c.json({ ok: false, error: '강의 대상을 1개 이상 선택해주세요.' }, 400);
    }

    // 중복 이메일 체크
    const dup = await c.env.DB.prepare('SELECT id FROM instructors WHERE email = ?').bind(email).first();
    if (dup) return c.json({ ok: false, error: '이미 등록된 이메일입니다.' }, 400);

    const id = uuid();
    const vibeProjects = Array.isArray(vibe_coding_projects)
      ? vibe_coding_projects.filter((p: any) => p && p.name) : [];
    const isVibe = vibeProjects.length > 0 ? 1 : 0;

    const editToken = generateToken();
    const editTokenExpires = isoExpiresIn(60 * 24 * 30); // 30일

    await c.env.DB.prepare(`
      INSERT INTO instructors (
        id, name, region, email, phone, specialty_tags, target_audience,
        lecture_format, career_summary, portfolio_url, sns_url,
        vibe_coding_projects, fee_range, fee_public, bio_short,
        is_vibe_coder, status, edit_token, edit_token_expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
    `).bind(
      id, name, region, email, phone || null,
      JSON.stringify(specialty_tags), JSON.stringify(target_audience),
      lecture_format, career_summary, portfolio_url || null, sns_url || null,
      JSON.stringify(vibeProjects), fee_range || null, fee_public ? 1 : 0,
      bio_short, isVibe, editToken, editTokenExpires
    ).run();

    return c.json({ ok: true, id, edit_link: `${c.env.APP_BASE_URL || ''}/instructor/edit/${editToken}` });
  } catch (e: any) {
    return c.json({ ok: false, error: e.message || '서버 오류' }, 500);
  }
});

// ============================================
// 강사 목록 페이지
// ============================================
app.get('/list', async (c) => {
  const tag = c.req.query('tag') || '';
  const region = c.req.query('region') || '';
  const format = c.req.query('format') || '';
  const vibeOnly = c.req.query('vibe') === '1';
  const q = c.req.query('q') || '';

  let sql = `SELECT * FROM instructors WHERE status = 'approved'`;
  const params: any[] = [];
  if (region) { sql += ` AND region = ?`; params.push(region); }
  if (format) { sql += ` AND lecture_format = ?`; params.push(format); }
  if (vibeOnly) { sql += ` AND is_vibe_coder = 1`; }
  if (tag) { sql += ` AND specialty_tags LIKE ?`; params.push(`%${tag}%`); }
  if (q) {
    sql += ` AND (name LIKE ? OR bio_short LIKE ? OR career_summary LIKE ?)`;
    const qq = `%${q}%`; params.push(qq, qq, qq);
  }
  sql += ` ORDER BY is_vibe_coder DESC, created_at DESC LIMIT 100`;

  const rows = await c.env.DB.prepare(sql).bind(...params).all<any>();
  const list = rows.results || [];

  const totalCount = list.length;
  const vibeCount = list.filter((r: any) => r.is_vibe_coder === 1).length;
  const regionSet = new Set(list.map((r: any) => r.region));

  return c.render(
    <>
      {/* 다크 미니 히어로 */}
      <section class="hero-dark">
        <div class="orb orb-1" style="width:280px;height:280px;top:-60px;right:-40px;"></div>
        <div class="orb orb-2" style="width:240px;height:240px;bottom:-80px;left:10%;"></div>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-20 sm:pt-20 sm:pb-28">
          <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div class="animate-slide-up">
              <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-medium text-slate-200 mb-5">
                <span class="live-dot"></span>
                INSTRUCTOR DIRECTORY · 검증된 강사만
              </div>
              <h1 class="font-display font-extrabold tracking-tight text-white text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">
                내게 맞는 <span class="text-gradient-neon">AI 강사</span>를<br />
                지금 찾아보세요
              </h1>
              <p class="mt-5 text-slate-300/85 max-w-xl">
                전문 분야·지역·강의 형태로 필터링하고, 바이브 코딩 가능한 실전 강사를 한눈에 확인할 수 있습니다.
              </p>
            </div>
            <div class="flex items-center gap-3 animate-slide-up" style="animation-delay:0.15s">
              <a href="/consult" class="btn btn-neon">
                <i class="fas fa-comments"></i> AI 상담받고 추천받기
              </a>
              <a href="/instructor/register" class="btn btn-glass">
                <i class="fas fa-user-plus"></i> 강사 등록
              </a>
            </div>
          </div>

          {/* 통계 띠 */}
          <div class="mt-10 grid grid-cols-3 gap-4 max-w-2xl">
            <div class="glass px-5 py-4">
              <div class="text-[10px] tracking-[0.2em] text-slate-400 mb-1">TOTAL</div>
              <div class="text-2xl sm:text-3xl font-bold text-white stat-num">
                <span class="counter" data-count={totalCount}>{totalCount}</span>
                <span class="text-sm text-slate-400 font-medium ml-1">명</span>
              </div>
            </div>
            <div class="glass px-5 py-4">
              <div class="text-[10px] tracking-[0.2em] text-neon-cyan mb-1">VIBE CODER</div>
              <div class="text-2xl sm:text-3xl font-bold text-gradient-neon stat-num">
                <span class="counter" data-count={vibeCount}>{vibeCount}</span>
                <span class="text-sm text-slate-400 font-medium ml-1">명</span>
              </div>
            </div>
            <div class="glass px-5 py-4">
              <div class="text-[10px] tracking-[0.2em] text-slate-400 mb-1">REGIONS</div>
              <div class="text-2xl sm:text-3xl font-bold text-white stat-num">
                <span class="counter" data-count={regionSet.size}>{regionSet.size}</span>
                <span class="text-sm text-slate-400 font-medium ml-1">개 지역</span>
              </div>
            </div>
          </div>
        </div>
        <div class="gradient-divider"></div>
      </section>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* 필터 — 부동 + 그림자 */}
        <form method="get" class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-10 -mt-20 sm:-mt-24 relative z-10 reveal">
          <div class="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div class="relative">
              <i class="fas fa-search text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 text-xs"></i>
              <input type="text" name="q" value={q} placeholder="이름·키워드 검색" class="input-field pl-9" />
            </div>
            <select name="tag" class="input-field">
              <option value="">전체 분야</option>
              {SPECIALTY_TAGS.map(t => <option value={t} selected={tag === t}>{t}</option>)}
            </select>
            <select name="region" class="input-field">
              <option value="">전체 지역</option>
              {REGIONS.map(r => <option value={r} selected={region === r}>{r}</option>)}
            </select>
            <select name="format" class="input-field">
              <option value="">전체 형태</option>
              {LECTURE_FORMATS.map(f => <option value={f} selected={format === f}>{f}</option>)}
            </select>
            <div class="flex items-center gap-2">
              <label class={`flex items-center gap-2 text-sm flex-1 px-3 py-2 rounded-lg border cursor-pointer transition ${vibeOnly ? 'border-neon-cyan bg-cyan-50/50 text-brand-primary font-semibold' : 'border-slate-200 hover:border-slate-300'}`}>
                <input type="checkbox" name="vibe" value="1" checked={vibeOnly} class="accent-neon-cyan" />
                <i class="fas fa-code text-[10px]"></i>
                바이브만
              </label>
              <button class="btn btn-primary" aria-label="검색"><i class="fas fa-search"></i></button>
            </div>
          </div>
          {/* 활성 필터 배지 */}
          {(q || tag || region || format || vibeOnly) && (
            <div class="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span class="text-slate-500">활성 필터:</span>
              {q && <span class="badge badge-tag">"{q}"</span>}
              {tag && <span class="badge badge-tag">{tag}</span>}
              {region && <span class="badge badge-tag">{region}</span>}
              {format && <span class="badge badge-tag">{format}</span>}
              {vibeOnly && <span class="badge badge-vibe">바이브</span>}
              <a href="/instructor/list" class="text-brand-secondary hover:underline ml-1">전체 초기화</a>
            </div>
          )}
        </form>

        {/* 결과 헤더 */}
        <div class="flex items-center justify-between mb-6 reveal">
          <div class="text-sm text-brand-sub">
            <span class="font-semibold text-brand-ink">{totalCount}</span>명의 강사
          </div>
          <div class="text-xs text-brand-sub">
            <i class="fas fa-sort text-[10px] mr-1"></i> 바이브 코딩 우선 · 최근 등록순
          </div>
        </div>

        {list.length === 0 ? (
          <div class="text-center py-20 bg-white border border-slate-200 rounded-2xl reveal">
            <div class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-4">
              <i class="fas fa-search text-2xl text-slate-400"></i>
            </div>
            <p class="text-brand-ink font-semibold mb-1">조건에 맞는 강사가 아직 없습니다</p>
            <p class="text-sm text-brand-sub mb-6">필터를 조정하거나 AI 상담을 받아보세요.</p>
            <a href="/consult" class="btn btn-primary"><i class="fas fa-comments"></i> AI 상담 받기</a>
          </div>
        ) : (
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {list.map((row: any, idx: number) => {
              const tags = safeJsonArray<string>(row.specialty_tags);
              const audiences = safeJsonArray<string>(row.target_audience);
              return (
                <a
                  href={`/instructor/${row.id}`}
                  class={`reveal block group relative ${row.is_vibe_coder ? 'card-vibe' : 'bg-white border border-slate-200 rounded-2xl card-hover spotlight'} p-6`}
                  style={`transition-delay: ${Math.min(idx * 60, 360)}ms`}
                >
                  <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center gap-3">
                      {/* 이니셜 아바타 */}
                      <div class={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-sm ${row.is_vibe_coder ? 'bg-gradient-to-br from-neon-cyan to-neon-blue' : 'bg-gradient-to-br from-brand-primary to-brand-secondary'}`}>
                        {String(row.name || '?').charAt(0)}
                      </div>
                      <div class="leading-tight">
                        <div class="font-bold text-base text-brand-ink">{row.name}</div>
                        <div class="text-[11px] text-brand-sub mt-0.5">
                          <i class="fas fa-location-dot text-[9px]"></i> {row.region}
                        </div>
                      </div>
                    </div>
                    {row.is_vibe_coder ? (
                      <span class="badge badge-vibe">
                        <i class="fas fa-bolt text-[9px] mr-1"></i> VIBE
                      </span>
                    ) : null}
                  </div>

                  <p class="text-sm text-brand-ink leading-relaxed line-clamp-2 mb-4 min-h-[40px]">
                    {row.bio_short}
                  </p>

                  <div class="flex flex-wrap gap-1.5 mb-4 min-h-[24px]">
                    {tags.slice(0, 3).map(t => <span class="badge badge-tag">{t}</span>)}
                    {tags.length > 3 && <span class="badge badge-tag">+{tags.length - 3}</span>}
                  </div>

                  <div class="flex items-center justify-between pt-4 border-t border-slate-100 text-[11px] text-brand-sub">
                    <div class="flex items-center gap-2">
                      <i class="fas fa-chalkboard text-[10px]"></i>
                      <span>{row.lecture_format}</span>
                    </div>
                    <span class="text-brand-secondary font-semibold group-hover:translate-x-0.5 transition-transform">
                      자세히 <i class="fas fa-arrow-right text-[10px] ml-0.5"></i>
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </>,
    { title: '강사 찾기', currentPath: '/instructor/list' }
  );
});

// ============================================
// 강사 상세 페이지
// ============================================
app.get('/:id', async (c) => {
  const id = c.req.param('id');
  // 예약어 처리: register, list, edit, api 같은 건 다른 라우트에서 먼저 잡힘
  if (['register', 'list', 'api', 'edit'].includes(id)) return c.notFound();

  const row = await c.env.DB.prepare(
    `SELECT * FROM instructors WHERE id = ? AND status = 'approved'`
  ).bind(id).first<any>();

  if (!row) return c.notFound();

  const tags = safeJsonArray<string>(row.specialty_tags);
  const audiences = safeJsonArray<string>(row.target_audience);
  const projects = safeJsonArray<any>(row.vibe_coding_projects);

  return c.render(
    <>
      {/* 다크 시네마틱 히어로 */}
      <section class={`relative overflow-hidden ${row.is_vibe_coder ? 'hero-dark' : 'hero-dark'}`}>
        <div class="orb orb-1" style="width:320px;height:320px;top:-80px;right:-60px;"></div>
        <div class="orb orb-2" style="width:260px;height:260px;bottom:-100px;left:5%;"></div>
        {row.is_vibe_coder && <div class="orb orb-3" style="width:200px;height:200px;top:30%;right:30%;"></div>}

        <div class="relative max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-16 sm:pt-14 sm:pb-24">
          <a href="/instructor/list" class="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white mb-8 transition-colors">
            <i class="fas fa-arrow-left text-xs"></i> 강사 목록으로
          </a>

          <div class="grid lg:grid-cols-[auto_1fr] gap-8 items-start animate-slide-up">
            {/* 큰 이니셜 아바타 */}
            <div class={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-2xl ${row.is_vibe_coder ? 'bg-gradient-to-br from-neon-cyan via-neon-blue to-neon-violet' : 'bg-gradient-to-br from-brand-primary to-brand-secondary'}`}>
              {String(row.name || '?').charAt(0)}
              {row.is_vibe_coder && (
                <div class="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-ink-900 border-2 border-neon-cyan flex items-center justify-center">
                  <i class="fas fa-bolt text-neon-cyan text-sm"></i>
                </div>
              )}
            </div>

            <div>
              <div class="flex items-center gap-3 flex-wrap mb-3">
                {row.is_vibe_coder ? (
                  <span class="badge badge-vibe text-xs px-3 py-1">
                    <i class="fas fa-code text-[10px] mr-1.5"></i> VIBE CODER
                  </span>
                ) : (
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass text-xs text-slate-200">
                    <i class="fas fa-circle-check text-emerald-400 text-[10px]"></i> 검증된 강사
                  </span>
                )}
                <span class="text-[11px] text-slate-500 tracking-wider">VERIFIED · {new Date(row.updated_at || row.created_at).getFullYear()}</span>
              </div>

              <h1 class="font-display font-extrabold tracking-tight text-white text-4xl sm:text-5xl">
                {row.name}
              </h1>

              <div class="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-300">
                <span class="inline-flex items-center gap-1.5"><i class="fas fa-location-dot text-neon-cyan text-xs"></i>{row.region}</span>
                <span class="inline-flex items-center gap-1.5"><i class="fas fa-chalkboard text-neon-cyan text-xs"></i>{row.lecture_format}</span>
                {audiences.length > 0 && <span class="inline-flex items-center gap-1.5"><i class="fas fa-users text-neon-cyan text-xs"></i>{audiences.slice(0, 3).join(' · ')}</span>}
              </div>

              <p class="mt-6 text-lg text-slate-200 leading-relaxed max-w-2xl">{row.bio_short}</p>
            </div>
          </div>
        </div>
        <div class="gradient-divider"></div>
      </section>

      {/* 본문 */}
      <div class="max-w-5xl mx-auto px-4 sm:px-6 py-12 grid lg:grid-cols-[1fr_320px] gap-8">
        {/* 메인 컨텐츠 */}
        <div class="space-y-10">
          <section class="reveal">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 flex items-center justify-center">
                <i class="fas fa-tags text-brand-secondary text-sm"></i>
              </div>
              <h2 class="text-lg font-bold text-brand-ink">전문 분야</h2>
            </div>
            <div class="flex flex-wrap gap-2">
              {tags.map(t => <span class="badge badge-tag text-sm px-3 py-1.5">{t}</span>)}
            </div>
          </section>

          <section class="reveal">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 flex items-center justify-center">
                <i class="fas fa-briefcase text-brand-secondary text-sm"></i>
              </div>
              <h2 class="text-lg font-bold text-brand-ink">경력 요약</h2>
            </div>
            <div class="bg-white border border-slate-200 rounded-2xl p-6">
              <p class="text-brand-ink leading-relaxed whitespace-pre-wrap">{row.career_summary}</p>
            </div>
          </section>

          {projects.length > 0 && (
            <section class="reveal">
              <div class="flex items-center gap-2 mb-4">
                <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan/15 to-neon-blue/15 flex items-center justify-center">
                  <i class="fas fa-code text-neon-blue text-sm"></i>
                </div>
                <h2 class="text-lg font-bold text-brand-ink">바이브 코딩 포트폴리오</h2>
                <span class="badge badge-vibe ml-1">{projects.length}개</span>
              </div>
              <div class="grid sm:grid-cols-2 gap-4">
                {projects.map((p: any, idx: number) => (
                  <div class="showcase-card p-5 reveal" style={`transition-delay:${idx * 80}ms`}>
                    <div class="flex items-start justify-between mb-3">
                      <div class="showcase-icon">
                        <i class="fas fa-microchip"></i>
                      </div>
                      <span class="text-[10px] text-neon-cyan tracking-wider font-bold">PROJECT {String(idx + 1).padStart(2, '0')}</span>
                    </div>
                    <div class="font-bold text-white mb-1.5">{p.name}</div>
                    {p.tools && <div class="text-[11px] text-neon-cyan mb-3 font-mono">{p.tools}</div>}
                    {p.desc && <p class="text-sm text-slate-300 leading-relaxed line-clamp-3 mb-4">{p.desc}</p>}
                    <div class="flex gap-3 text-xs">
                      {p.url && <a href={p.url} target="_blank" rel="noopener" class="inline-flex items-center gap-1 text-neon-cyan hover:text-white transition-colors"><i class="fas fa-arrow-up-right-from-square text-[10px]"></i> 실행</a>}
                      {p.github && <a href={p.github} target="_blank" rel="noopener" class="inline-flex items-center gap-1 text-neon-cyan hover:text-white transition-colors"><i class="fab fa-github"></i> 코드</a>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {(row.portfolio_url || row.sns_url || (row.fee_public === 1 && row.fee_range)) && (
            <section class="reveal">
              <div class="flex items-center gap-2 mb-4">
                <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 flex items-center justify-center">
                  <i class="fas fa-link text-brand-secondary text-sm"></i>
                </div>
                <h2 class="text-lg font-bold text-brand-ink">기타 정보</h2>
              </div>
              <div class="bg-white border border-slate-200 rounded-2xl p-6 grid sm:grid-cols-2 gap-5">
                {row.portfolio_url && (
                  <div>
                    <div class="text-[11px] text-brand-sub font-semibold tracking-wider mb-1">PORTFOLIO</div>
                    <a href={row.portfolio_url} target="_blank" rel="noopener" class="text-brand-secondary hover:underline text-sm break-all">{row.portfolio_url}</a>
                  </div>
                )}
                {row.sns_url && (
                  <div>
                    <div class="text-[11px] text-brand-sub font-semibold tracking-wider mb-1">SNS / CHANNEL</div>
                    <a href={row.sns_url} target="_blank" rel="noopener" class="text-brand-secondary hover:underline text-sm break-all">{row.sns_url}</a>
                  </div>
                )}
                {row.fee_public === 1 && row.fee_range && (
                  <div>
                    <div class="text-[11px] text-brand-sub font-semibold tracking-wider mb-1">FEE RANGE</div>
                    <div class="text-sm font-medium text-brand-ink">{row.fee_range}</div>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* 사이드바 — 의뢰 CTA */}
        <aside class="lg:sticky lg:top-24 self-start">
          <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div class="text-[11px] tracking-[0.2em] text-brand-secondary font-bold mb-2">CONTACT</div>
            <h3 class="text-lg font-bold text-brand-ink mb-2">이 강사에게 의뢰하기</h3>
            <p class="text-sm text-brand-sub mb-5 leading-relaxed">
              한국인공지능교육센터가 의뢰를 검토 후 강사에게 안전하게 중개합니다.
            </p>
            <a href={`/contact/${row.id}`} class="btn btn-primary w-full text-base py-3">
              <i class="fas fa-paper-plane"></i> 의뢰 신청
            </a>
            <div class="mt-5 pt-5 border-t border-slate-100 space-y-2.5 text-xs text-brand-sub">
              <div class="flex items-start gap-2">
                <i class="fas fa-shield-halved text-emerald-500 mt-0.5"></i>
                <span>운영진 검토 후 전달</span>
              </div>
              <div class="flex items-start gap-2">
                <i class="fas fa-clock text-emerald-500 mt-0.5"></i>
                <span>1~3 영업일 내 회신</span>
              </div>
              <div class="flex items-start gap-2">
                <i class="fas fa-circle-dollar-to-slot text-emerald-500 mt-0.5"></i>
                <span>중개 수수료 무료 (베타)</span>
              </div>
            </div>
          </div>

          <div class="mt-4 text-center">
            <a href="/instructor/list" class="text-xs text-brand-sub hover:text-brand-primary">
              <i class="fas fa-arrow-left text-[10px]"></i> 다른 강사 둘러보기
            </a>
          </div>
        </aside>
      </div>
    </>,
    { title: row.name, currentPath: '/instructor' }
  );
});

// ============================================
// 강사 자가 수정 (매직 링크)
// ============================================
app.get('/edit/:token', async (c) => {
  const token = c.req.param('token');
  const row = await c.env.DB.prepare(
    `SELECT * FROM instructors WHERE edit_token = ?`
  ).bind(token).first<any>();

  if (!row) {
    return c.render(
      <div class="max-w-xl mx-auto px-4 py-20 text-center">
        <i class="fas fa-circle-exclamation text-5xl text-amber-500 mb-4"></i>
        <h1 class="text-2xl font-bold mb-2">유효하지 않은 링크</h1>
        <p class="text-brand-sub">수정 링크가 유효하지 않거나 만료되었습니다.</p>
      </div>, { title: '오류' }
    );
  }
  if (row.edit_token_expires_at && new Date(row.edit_token_expires_at).getTime() < Date.now()) {
    return c.render(
      <div class="max-w-xl mx-auto px-4 py-20 text-center">
        <i class="fas fa-clock text-5xl text-amber-500 mb-4"></i>
        <h1 class="text-2xl font-bold mb-2">링크가 만료되었습니다</h1>
        <p class="text-brand-sub mb-6">관리자에게 새 수정 링크 발송을 요청해주세요.</p>
        <a href="/" class="btn btn-primary">메인으로</a>
      </div>, { title: '만료' }
    );
  }

  const tags = safeJsonArray<string>(row.specialty_tags);
  const audiences = safeJsonArray<string>(row.target_audience);
  const projects = safeJsonArray<any>(row.vibe_coding_projects);

  return c.render(
    <div class="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 class="text-3xl font-bold mb-2">프로필 수정</h1>
      <p class="text-brand-sub mb-8">
        현재 상태:{' '}
        <span class={`badge badge-status-${row.status}`}>{
          row.status === 'pending' ? '심사 대기' :
          row.status === 'approved' ? '승인됨 (공개)' : '반려됨'
        }</span>
      </p>

      <form id="instructor-edit-form" class="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5"
            data-id={row.id} data-token={token}>
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="label">이름</label>
            <input type="text" name="name" value={row.name} class="input-field" required />
          </div>
          <div>
            <label class="label">활동 지역</label>
            <select name="region" class="input-field" required>
              {REGIONS.map(r => <option value={r} selected={row.region === r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label class="label">이메일 (변경 불가)</label>
            <input type="email" value={row.email} class="input-field" disabled />
          </div>
          <div>
            <label class="label">전화번호</label>
            <input type="tel" name="phone" value={row.phone || ''} class="input-field" />
          </div>
        </div>

        <div>
          <label class="label">자기소개 한 줄</label>
          <input type="text" name="bio_short" maxlength={100} value={row.bio_short} class="input-field" required />
        </div>

        <div>
          <label class="label">전문 분야</label>
          <div class="flex flex-wrap gap-2 mt-2" id="edit-specialty-chips">
            {SPECIALTY_TAGS.map(t => (
              <span class={`chip ${tags.includes(t) ? 'chip-selected' : ''}`} data-chip="specialty" data-value={t}>{t}</span>
            ))}
          </div>
          <input type="hidden" name="specialty_tags" value={JSON.stringify(tags)} />
        </div>

        <div>
          <label class="label">강의 대상</label>
          <div class="flex flex-wrap gap-2 mt-2" id="edit-audience-chips">
            {TARGET_AUDIENCES.map(t => (
              <span class={`chip ${audiences.includes(t) ? 'chip-selected' : ''}`} data-chip="audience" data-value={t}>{t}</span>
            ))}
          </div>
          <input type="hidden" name="target_audience" value={JSON.stringify(audiences)} />
        </div>

        <div>
          <label class="label">강의 형태</label>
          <div class="flex gap-3 mt-2">
            {LECTURE_FORMATS.map(f => (
              <label class="flex items-center gap-2 cursor-pointer px-4 py-2.5 border border-slate-300 rounded-lg">
                <input type="radio" name="lecture_format" value={f} checked={row.lecture_format === f} />
                <span class="text-sm">{f}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label class="label">경력 요약</label>
          <textarea name="career_summary" maxlength={500} class="input-field" required>{row.career_summary}</textarea>
        </div>

        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="label">포트폴리오 URL</label>
            <input type="url" name="portfolio_url" value={row.portfolio_url || ''} class="input-field" />
          </div>
          <div>
            <label class="label">SNS / 유튜브</label>
            <input type="url" name="sns_url" value={row.sns_url || ''} class="input-field" />
          </div>
        </div>

        <div>
          <h3 class="font-bold mb-2 flex items-center gap-2">
            <i class="fas fa-code text-brand-accent"></i> 바이브 코딩 포트폴리오
          </h3>
          <div id="edit-vibe-projects" class="space-y-3"
               data-initial={JSON.stringify(projects)}></div>
          <button type="button" id="edit-add-vibe-btn" class="mt-3 btn btn-secondary">
            <i class="fas fa-plus"></i> 프로젝트 추가
          </button>
        </div>

        <div class="pt-4 border-t border-slate-200">
          <button type="submit" class="btn btn-primary w-full text-base py-3.5">
            <i class="fas fa-save"></i> 저장
          </button>
          <p class="text-xs text-brand-sub mt-2 text-center">
            수정 후 관리자 재심사가 진행될 수 있습니다.
          </p>
        </div>
      </form>
    </div>,
    { title: '프로필 수정' }
  );
});

// 자가 수정 API
app.post('/api/edit/:token', async (c) => {
  try {
    const token = c.req.param('token');
    const row = await c.env.DB.prepare(
      'SELECT id, edit_token_expires_at FROM instructors WHERE edit_token = ?'
    ).bind(token).first<any>();
    if (!row) return c.json({ ok: false, error: '유효하지 않은 토큰' }, 404);
    if (row.edit_token_expires_at && new Date(row.edit_token_expires_at).getTime() < Date.now()) {
      return c.json({ ok: false, error: '만료된 토큰' }, 403);
    }

    const body = await c.req.json();
    const {
      name, region, phone, bio_short,
      specialty_tags, target_audience, lecture_format,
      career_summary, portfolio_url, sns_url, vibe_coding_projects,
    } = body;

    const vibe = Array.isArray(vibe_coding_projects)
      ? vibe_coding_projects.filter((p: any) => p && p.name) : [];
    const isVibe = vibe.length > 0 ? 1 : 0;

    await c.env.DB.prepare(`
      UPDATE instructors SET
        name = ?, region = ?, phone = ?, bio_short = ?,
        specialty_tags = ?, target_audience = ?, lecture_format = ?,
        career_summary = ?, portfolio_url = ?, sns_url = ?,
        vibe_coding_projects = ?, is_vibe_coder = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      name, region, phone || null, bio_short,
      JSON.stringify(specialty_tags || []), JSON.stringify(target_audience || []),
      lecture_format, career_summary, portfolio_url || null, sns_url || null,
      JSON.stringify(vibe), isVibe, row.id
    ).run();

    return c.json({ ok: true });
  } catch (e: any) {
    return c.json({ ok: false, error: e.message }, 500);
  }
});

export default app;
