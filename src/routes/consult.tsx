import { Hono } from 'hono';
import type { Bindings } from '../lib/types';
import {
  INDUSTRIES, JOB_ROLES, AI_EXPERIENCE_LEVELS, EDU_GOALS,
  LECTURE_FORMATS, REGIONS,
} from '../lib/types';
import { uuid, getClientIp, safeJsonArray } from '../lib/utils';
import { generateCurriculum, matchInstructors } from '../lib/claude';

const app = new Hono<{ Bindings: Bindings }>();

// 상담 페이지 (챗봇 UI)
app.get('/', (c) => {
  return c.render(
    <>
      {/* 다크 미니 히어로 */}
      <section class="hero-dark">
        <div class="orb orb-1" style="width:280px;height:280px;top:-60px;right:10%;"></div>
        <div class="orb orb-2" style="width:240px;height:240px;bottom:-100px;left:-20px;"></div>
        <div class="orb orb-3" style="width:180px;height:180px;top:30%;right:40%;"></div>

        <div class="max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-10 sm:pt-16 sm:pb-12 text-center animate-slide-up">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-medium text-neon-cyan mb-5">
            <span class="live-dot" style="background:#00D9FF"></span>
            POWERED BY CLAUDE SONNET 4
          </div>
          <h1 class="font-display font-extrabold tracking-tight text-white text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">
            10분이면 <span class="text-gradient-neon">맞춤 커리큘럼</span>이<br class="hidden sm:block" />
            손에 들어옵니다
          </h1>
          <p class="mt-6 text-base sm:text-lg text-slate-300/90 max-w-2xl mx-auto leading-relaxed">
            7가지 질문에 답하면 Claude AI가 주차별 학습 로드맵과 추천 도구,<br class="hidden sm:block" />
            그리고 가장 잘 맞는 강사 3명을 자동 매칭해드립니다.
          </p>
          <div class="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400">
            <span class="inline-flex items-center gap-1.5"><i class="fas fa-circle-check text-emerald-400"></i> 회원가입 불필요</span>
            <span class="inline-flex items-center gap-1.5"><i class="fas fa-circle-check text-emerald-400"></i> 100% 익명 처리</span>
            <span class="inline-flex items-center gap-1.5"><i class="fas fa-circle-check text-emerald-400"></i> 베타 무료</span>
          </div>
        </div>
        <div class="gradient-divider"></div>
      </section>

      {/* 챗봇 */}
      <div class="max-w-3xl mx-auto px-4 sm:px-6 -mt-6 pb-16 relative z-10">
        <div id="consult-chat" class="glass-strong bg-ink-900/95 rounded-2xl shadow-2xl overflow-hidden border border-white/10">
          {/* 윈도우 헤더 */}
          <div class="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-black/20">
            <div class="code-dots"><span></span><span></span><span></span></div>
            <div class="text-[11px] text-slate-400 font-medium tracking-[0.2em]">AI CONSULT · CLAUDE SONNET 4</div>
            <div class="w-12"></div>
          </div>

          {/* 진행률 */}
          <div class="px-6 pt-4 pb-2 bg-black/10">
            <div class="flex justify-between text-[11px] text-slate-400 mb-1.5">
              <span id="step-label" class="font-semibold tracking-wider">시작</span>
              <span id="step-count" class="font-mono">0 / 7</span>
            </div>
            <div class="h-1 bg-white/5 rounded-full overflow-hidden">
              <div id="progress-bar" class="h-full bg-gradient-to-r from-neon-cyan via-neon-blue to-neon-violet transition-all duration-500" style="width: 0%"></div>
            </div>
          </div>

          {/* 메시지 영역 — 다크 톤 */}
          <div id="chat-messages" class="consult-msgs px-6 py-6 min-h-[440px] max-h-[60vh] overflow-y-auto flex flex-col gap-3"></div>

          {/* 입력 영역 — 다크 톤 */}
          <div id="chat-input-area" class="consult-input-area px-6 py-5 border-t border-white/10 bg-black/20"></div>
        </div>

        {/* 신뢰 라인 */}
        <div class="mt-5 flex items-center justify-center gap-5 text-[11px] text-brand-sub">
          <span class="inline-flex items-center gap-1.5"><i class="fas fa-shield-halved text-emerald-500"></i> 입력 정보는 커리큘럼 생성과 강사 매칭에만 사용</span>
          <span class="hidden sm:inline-flex items-center gap-1.5"><i class="fas fa-bolt text-amber-500"></i> 평균 응답 15초 이내</span>
        </div>
      </div>

      {/* 초기 데이터를 JS에 주입 */}
      <script
        type="application/json"
        id="consult-config"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          industries: INDUSTRIES,
          jobRoles: JOB_ROLES,
          aiLevels: AI_EXPERIENCE_LEVELS,
          eduGoals: EDU_GOALS,
          formats: LECTURE_FORMATS,
          regions: REGIONS,
        }) }}
      />
    </>,
    { title: 'AI 커리큘럼 상담', currentPath: '/consult' }
  );
});

// 상담 결과 생성 API
app.post('/api/generate', async (c) => {
  try {
    const ip = getClientIp(c.req.raw);
    const body = await c.req.json();

    // 어뷰징 방지: IP당 일일 제한
    const limitRow = await c.env.DB.prepare(
      `SELECT value FROM site_settings WHERE key = 'consultation_daily_limit_per_ip'`
    ).first<{ value: string }>();
    const dailyLimit = parseInt(limitRow?.value || '5');

    const today = new Date().toISOString().slice(0, 10);
    const usage = await c.env.DB.prepare(
      `SELECT COUNT(*) as cnt FROM consultations WHERE client_ip = ? AND date(created_at) = ?`
    ).bind(ip, today).first<{ cnt: number }>();

    if ((usage?.cnt || 0) >= dailyLimit) {
      return c.json({
        ok: false,
        error: `일일 상담 한도(${dailyLimit}회)에 도달했습니다. 내일 다시 이용해주세요.`,
      }, 429);
    }

    // Claude 일일 호출 한도 체크
    const claudeLimitRow = await c.env.DB.prepare(
      `SELECT value FROM site_settings WHERE key = 'claude_daily_call_limit'`
    ).first<{ value: string }>();
    const claudeDateRow = await c.env.DB.prepare(
      `SELECT value FROM site_settings WHERE key = 'claude_daily_count_date'`
    ).first<{ value: string }>();
    const claudeCountRow = await c.env.DB.prepare(
      `SELECT value FROM site_settings WHERE key = 'claude_daily_call_count'`
    ).first<{ value: string }>();

    const claudeLimit = parseInt(claudeLimitRow?.value || '500');
    let claudeCount = parseInt(claudeCountRow?.value || '0');
    if (claudeDateRow?.value !== today) {
      claudeCount = 0;
      await c.env.DB.prepare(
        `INSERT OR REPLACE INTO site_settings (key, value) VALUES ('claude_daily_count_date', ?)`
      ).bind(today).run();
    }
    if (claudeCount >= claudeLimit) {
      return c.json({ ok: false, error: '일일 AI 호출 한도에 도달했습니다. 잠시 후 다시 시도해주세요.' }, 429);
    }

    // Claude 호출
    const result = await generateCurriculum(c.env, body);
    if (!result.ok) {
      return c.json({ ok: false, error: result.error }, 502);
    }

    // 카운트 증가
    await c.env.DB.prepare(
      `INSERT OR REPLACE INTO site_settings (key, value) VALUES ('claude_daily_call_count', ?)`
    ).bind(String(claudeCount + 1)).run();

    // 강사 매칭
    const allApproved = await c.env.DB.prepare(
      `SELECT * FROM instructors WHERE status = 'approved'`
    ).all<any>();
    const matched = matchInstructors(
      result.keywords || [],
      allApproved.results || [],
      body.region
    );

    // 상담 로그 저장
    const id = uuid();
    await c.env.DB.prepare(`
      INSERT INTO consultations (
        id, industry, job_role, ai_experience, pain_point, goal,
        format_pref, budget, region, contact_email,
        generated_curriculum, matched_instructor_ids, client_ip
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      body.industry || null, body.job_role || null, body.ai_experience || null,
      body.pain_point || null, body.goal || null,
      body.format_pref || null, body.budget || null, body.region || null,
      body.contact_email || null,
      result.curriculum || null,
      JSON.stringify(matched.map(m => m.id)),
      ip
    ).run();

    // 추천 강사를 안전한 형태로 변환
    const instructorCards = matched.map(m => ({
      id: m.id,
      name: m.name,
      region: m.region,
      bio_short: m.bio_short,
      specialty_tags: safeJsonArray<string>(m.specialty_tags),
      is_vibe_coder: m.is_vibe_coder === 1,
      match_score: m.match_score,
    }));

    return c.json({
      ok: true,
      consultation_id: id,
      curriculum: result.curriculum,
      keywords: result.keywords,
      instructors: instructorCards,
    });
  } catch (e: any) {
    return c.json({ ok: false, error: e.message || '서버 오류' }, 500);
  }
});

export default app;
