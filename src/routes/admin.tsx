import { Hono } from 'hono';
import type { Bindings } from '../lib/types';
import { loginAdmin, logoutAdmin, getAdmin, ensureAdminSeed } from '../lib/auth';
import { safeJsonArray } from '../lib/utils';

const app = new Hono<{ Bindings: Bindings }>();

// 관리자 인증 미들웨어 (login 제외)
app.use('*', async (c, next) => {
  const path = c.req.path;
  if (path === '/admin/login' || path === '/admin/api/login' || path === '/admin/api/logout') {
    return next();
  }
  const admin = await getAdmin(c);
  if (!admin) return c.redirect('/admin/login');
  await next();
});

// ============================================
// 로그인 페이지
// ============================================
app.get('/login', (c) => {
  return c.render(
    <div class="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <div class="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary text-white items-center justify-center text-xl mb-4">
            <i class="fas fa-shield-halved"></i>
          </div>
          <h1 class="text-2xl font-bold">관리자 로그인</h1>
          <p class="text-sm text-brand-sub mt-2">한국인공지능교육센터 관리자 전용</p>
        </div>
        <form id="admin-login-form" class="bg-white rounded-2xl border border-slate-200 p-7 space-y-4">
          <div>
            <label class="label">이메일</label>
            <input type="email" name="email" class="input-field" required autofocus />
          </div>
          <div>
            <label class="label">비밀번호</label>
            <input type="password" name="password" class="input-field" required />
          </div>
          <div id="login-error" class="hidden error-text"></div>
          <button type="submit" class="btn btn-primary w-full text-base py-3">
            <i class="fas fa-sign-in-alt"></i> 로그인
          </button>
        </form>
      </div>
    </div>,
    { title: '관리자 로그인', currentPath: '/admin/login' }
  );
});

app.post('/api/login', async (c) => {
  await ensureAdminSeed(c);
  const { email, password } = await c.req.json();
  const r = await loginAdmin(c, email, password);
  if (!r.ok) return c.json({ ok: false, error: r.error }, 401);
  return c.json({ ok: true });
});

app.post('/api/logout', async (c) => {
  await logoutAdmin(c);
  return c.json({ ok: true });
});

// ============================================
// 관리자 대시보드
// ============================================
app.get('/', async (c) => c.redirect('/admin/dashboard'));

app.get('/dashboard', async (c) => {
  const stats = await c.env.DB.prepare(`
    SELECT
      (SELECT COUNT(*) FROM instructors) as total,
      (SELECT COUNT(*) FROM instructors WHERE status='pending') as pending,
      (SELECT COUNT(*) FROM instructors WHERE status='approved') as approved,
      (SELECT COUNT(*) FROM instructors WHERE status='rejected') as rejected,
      (SELECT COUNT(*) FROM instructors WHERE is_vibe_coder=1 AND status='approved') as vibe,
      (SELECT COUNT(*) FROM consultations) as consults,
      (SELECT COUNT(*) FROM contact_requests) as contacts,
      (SELECT COUNT(*) FROM contact_requests WHERE status='pending') as pending_contacts
  `).first<any>();

  const recentConsults = await c.env.DB.prepare(`
    SELECT id, industry, job_role, goal, created_at FROM consultations
    ORDER BY created_at DESC LIMIT 5
  `).all<any>();

  return c.render(
    <AdminLayout active="dashboard">
      <h1 class="text-2xl font-bold mb-6">대시보드</h1>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="전체 강사" value={stats?.total || 0} icon="fa-users" color="primary" />
        <StatCard label="승인 대기" value={stats?.pending || 0} icon="fa-clock" color="amber" highlight />
        <StatCard label="승인 강사" value={stats?.approved || 0} icon="fa-circle-check" color="emerald" />
        <StatCard label="바이브 코딩" value={stats?.vibe || 0} icon="fa-code" color="accent" />
        <StatCard label="누적 상담" value={stats?.consults || 0} icon="fa-comments" color="primary" />
        <StatCard label="문의 신청" value={stats?.contacts || 0} icon="fa-envelope" color="primary" />
        <StatCard label="처리 대기 문의" value={stats?.pending_contacts || 0} icon="fa-inbox" color="amber" highlight />
        <StatCard label="반려 강사" value={stats?.rejected || 0} icon="fa-circle-xmark" color="rose" />
      </div>

      <div class="bg-white rounded-xl border border-slate-200 p-6">
        <h2 class="text-lg font-bold mb-4">최근 상담</h2>
        {recentConsults.results && recentConsults.results.length > 0 ? (
          <div class="divide-y divide-slate-100">
            {recentConsults.results.map((r: any) => (
              <div class="py-3 flex justify-between text-sm">
                <div>
                  <div class="font-medium">{r.industry || '미지정'} · {r.job_role || '미지정'}</div>
                  <div class="text-xs text-brand-sub mt-0.5">{r.goal || '-'}</div>
                </div>
                <div class="text-xs text-brand-sub">{new Date(r.created_at).toLocaleString('ko-KR')}</div>
              </div>
            ))}
          </div>
        ) : (
          <p class="text-sm text-brand-sub">아직 상담 데이터가 없습니다.</p>
        )}
      </div>
    </AdminLayout>,
    { title: '관리자 대시보드' }
  );
});

// ============================================
// 강사 관리
// ============================================
app.get('/instructors', async (c) => {
  const filter = c.req.query('status') || 'all';
  let sql = `SELECT * FROM instructors`;
  if (filter !== 'all') sql += ` WHERE status = '${filter}'`;
  sql += ` ORDER BY status='pending' DESC, created_at DESC`;

  const rows = await c.env.DB.prepare(sql).all<any>();
  const list = rows.results || [];

  return c.render(
    <AdminLayout active="instructors">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">강사 관리</h1>
        <div class="flex gap-2 text-sm">
          {[
            { k: 'all', l: '전체' },
            { k: 'pending', l: '대기' },
            { k: 'approved', l: '승인' },
            { k: 'rejected', l: '반려' },
          ].map(t => (
            <a href={`/admin/instructors?status=${t.k}`}
               class={`px-3 py-1.5 rounded-lg ${filter === t.k ? 'bg-brand-primary text-white' : 'bg-white border border-slate-200'}`}>
              {t.l}
            </a>
          ))}
        </div>
      </div>

      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 text-left text-xs text-brand-sub">
            <tr>
              <th class="px-4 py-3">상태</th>
              <th class="px-4 py-3">이름</th>
              <th class="px-4 py-3">지역</th>
              <th class="px-4 py-3">전문 분야</th>
              <th class="px-4 py-3">바이브</th>
              <th class="px-4 py-3">신청일</th>
              <th class="px-4 py-3 text-right">작업</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            {list.length === 0 ? (
              <tr><td colspan={7} class="px-4 py-12 text-center text-brand-sub">데이터가 없습니다.</td></tr>
            ) : list.map((r: any) => {
              const tags = safeJsonArray<string>(r.specialty_tags);
              return (
                <tr>
                  <td class="px-4 py-3">
                    <span class={`badge badge-status-${r.status}`}>
                      {r.status === 'pending' ? '대기' : r.status === 'approved' ? '승인' : '반려'}
                    </span>
                  </td>
                  <td class="px-4 py-3 font-medium">
                    <div>{r.name}</div>
                    <div class="text-xs text-brand-sub">{r.email}</div>
                  </td>
                  <td class="px-4 py-3">{r.region}</td>
                  <td class="px-4 py-3">
                    <div class="flex flex-wrap gap-1">
                      {tags.slice(0, 2).map(t => <span class="badge badge-tag">{t}</span>)}
                      {tags.length > 2 && <span class="text-xs text-brand-sub">+{tags.length - 2}</span>}
                    </div>
                  </td>
                  <td class="px-4 py-3">{r.is_vibe_coder ? <i class="fas fa-check text-brand-accent"></i> : '-'}</td>
                  <td class="px-4 py-3 text-xs text-brand-sub">{new Date(r.created_at).toLocaleDateString('ko-KR')}</td>
                  <td class="px-4 py-3 text-right">
                    <a href={`/admin/instructors/${r.id}`} class="btn btn-secondary text-xs px-3 py-1.5">
                      상세
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminLayout>,
    { title: '강사 관리' }
  );
});

app.get('/instructors/:id', async (c) => {
  const id = c.req.param('id');
  const r = await c.env.DB.prepare('SELECT * FROM instructors WHERE id = ?').bind(id).first<any>();
  if (!r) return c.notFound();

  const tags = safeJsonArray<string>(r.specialty_tags);
  const audiences = safeJsonArray<string>(r.target_audience);
  const projects = safeJsonArray<any>(r.vibe_coding_projects);
  const editLink = r.edit_token ? `/instructor/edit/${r.edit_token}` : null;

  return c.render(
    <AdminLayout active="instructors">
      <a href="/admin/instructors" class="text-sm text-brand-sub hover:text-brand-primary mb-4 inline-flex items-center gap-1">
        <i class="fas fa-arrow-left"></i> 목록으로
      </a>
      <div class="bg-white rounded-xl border border-slate-200 p-6 sm:p-8">
        <div class="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div>
            <h1 class="text-2xl font-bold">{r.name}</h1>
            <div class="text-sm text-brand-sub mt-1">{r.email} · {r.phone || '전화 미입력'}</div>
            <div class="text-sm text-brand-sub mt-0.5">{r.region} · {r.lecture_format}</div>
          </div>
          <div class="flex gap-2 flex-wrap">
            <span class={`badge badge-status-${r.status}`}>
              {r.status === 'pending' ? '심사 대기' : r.status === 'approved' ? '승인됨' : '반려됨'}
            </span>
            {r.is_vibe_coder ? <span class="badge badge-vibe">바이브 코딩</span> : null}
          </div>
        </div>

        <div class="grid sm:grid-cols-2 gap-6 mb-6">
          <Section label="자기소개"><p>{r.bio_short}</p></Section>
          <Section label="강의 대상"><p>{audiences.join(', ')}</p></Section>
        </div>
        <Section label="전문 분야">
          <div class="flex flex-wrap gap-1.5">
            {tags.map(t => <span class="badge badge-tag">{t}</span>)}
          </div>
        </Section>
        <Section label="경력 요약">
          <p class="whitespace-pre-wrap">{r.career_summary}</p>
        </Section>
        {projects.length > 0 && (
          <Section label="바이브 코딩 포트폴리오">
            <div class="space-y-2">
              {projects.map((p: any) => (
                <div class="border border-slate-200 rounded p-3 text-sm">
                  <div class="font-bold">{p.name}</div>
                  <div class="text-brand-sub">{p.desc}</div>
                  <div class="text-xs text-brand-secondary mt-1">{p.tools}</div>
                  {p.url && <a href={p.url} target="_blank" class="text-xs text-brand-accent">{p.url}</a>}
                </div>
              ))}
            </div>
          </Section>
        )}
        {r.portfolio_url && <Section label="포트폴리오 URL"><a href={r.portfolio_url} target="_blank" class="text-brand-secondary break-all">{r.portfolio_url}</a></Section>}
        {r.sns_url && <Section label="SNS"><a href={r.sns_url} target="_blank" class="text-brand-secondary break-all">{r.sns_url}</a></Section>}
        {r.fee_range && <Section label={`강의료 (${r.fee_public ? '공개' : '비공개'})`}><p>{r.fee_range}</p></Section>}
        {editLink && (
          <Section label="강사 자가 수정 링크 (이메일로 전달)">
            <code class="text-xs bg-slate-100 p-2 rounded block break-all">{editLink}</code>
          </Section>
        )}

        {/* 작업 버튼 */}
        <div class="border-t border-slate-200 pt-6 mt-6">
          <h3 class="font-bold mb-3">관리 작업</h3>
          <div class="flex flex-wrap gap-2" id="instructor-actions" data-id={r.id} data-status={r.status}>
            {r.status !== 'approved' && (
              <button class="btn btn-primary" data-action="approve">
                <i class="fas fa-check"></i> 승인
              </button>
            )}
            {r.status !== 'rejected' && (
              <button class="btn btn-danger" data-action="reject">
                <i class="fas fa-xmark"></i> 반려
              </button>
            )}
            {r.status === 'approved' && (
              <button class="btn btn-secondary" data-action="hide">
                <i class="fas fa-eye-slash"></i> 비공개로
              </button>
            )}
            <button class="btn btn-ghost" data-action="delete">
              <i class="fas fa-trash"></i> 삭제
            </button>
          </div>
          {r.reject_reason && (
            <div class="mt-3 p-3 bg-rose-50 border border-rose-200 rounded text-sm">
              <strong>반려 사유:</strong> {r.reject_reason}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>,
    { title: `강사 상세 - ${r.name}` }
  );
});

// 강사 작업 API
app.post('/api/instructors/:id/action', async (c) => {
  const id = c.req.param('id');
  const { action, reason } = await c.req.json();

  if (action === 'approve') {
    await c.env.DB.prepare(`UPDATE instructors SET status='approved', reject_reason=NULL, updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(id).run();
  } else if (action === 'reject') {
    await c.env.DB.prepare(`UPDATE instructors SET status='rejected', reject_reason=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(reason || '관리자 반려', id).run();
  } else if (action === 'hide') {
    await c.env.DB.prepare(`UPDATE instructors SET status='pending', updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(id).run();
  } else if (action === 'delete') {
    await c.env.DB.prepare('DELETE FROM instructors WHERE id = ?').bind(id).run();
  } else {
    return c.json({ ok: false, error: '알 수 없는 작업' }, 400);
  }
  return c.json({ ok: true });
});

// ============================================
// 문의 관리
// ============================================
app.get('/contacts', async (c) => {
  const filter = c.req.query('status') || 'all';
  let sql = `
    SELECT cr.*, i.name as instructor_name, i.email as instructor_email
    FROM contact_requests cr
    JOIN instructors i ON i.id = cr.instructor_id
  `;
  if (filter !== 'all') sql += ` WHERE cr.status = '${filter}'`;
  sql += ` ORDER BY cr.created_at DESC`;
  const rows = await c.env.DB.prepare(sql).all<any>();
  const list = rows.results || [];

  return c.render(
    <AdminLayout active="contacts">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">문의 신청 관리</h1>
        <div class="flex gap-2 text-sm">
          {[
            { k: 'all', l: '전체' },
            { k: 'pending', l: '대기' },
            { k: 'forwarded', l: '전달됨' },
            { k: 'completed', l: '완료' },
            { k: 'rejected', l: '반려' },
          ].map(t => (
            <a href={`/admin/contacts?status=${t.k}`}
               class={`px-3 py-1.5 rounded-lg ${filter === t.k ? 'bg-brand-primary text-white' : 'bg-white border border-slate-200'}`}>
              {t.l}
            </a>
          ))}
        </div>
      </div>

      <div class="space-y-3">
        {list.length === 0 ? (
          <div class="bg-white border border-slate-200 rounded-xl p-12 text-center text-brand-sub">
            아직 문의가 없습니다.
          </div>
        ) : list.map((r: any) => (
          <div class="bg-white border border-slate-200 rounded-xl p-5">
            <div class="flex items-start justify-between flex-wrap gap-3 mb-3">
              <div>
                <div class="font-bold">
                  {r.requester_name}
                  {r.requester_org && <span class="text-sm text-brand-sub font-normal"> ({r.requester_org})</span>}
                </div>
                <div class="text-xs text-brand-sub mt-1">
                  → {r.instructor_name} ({r.instructor_email})
                </div>
                <div class="text-xs text-brand-sub mt-0.5">
                  {r.requester_email} {r.requester_phone ? `· ${r.requester_phone}` : ''}
                </div>
              </div>
              <span class={`badge ${
                r.status === 'pending' ? 'badge-status-pending' :
                r.status === 'forwarded' ? 'badge-status-approved' :
                r.status === 'completed' ? 'badge-status-approved' : 'badge-status-rejected'
              }`}>
                {r.status === 'pending' ? '대기' :
                 r.status === 'forwarded' ? '전달됨' :
                 r.status === 'completed' ? '완료' : '반려'}
              </span>
            </div>
            <div class="bg-slate-50 rounded-lg p-3 text-sm whitespace-pre-wrap mb-3">{r.message}</div>
            {r.admin_note && (
              <div class="text-xs text-brand-sub bg-amber-50 p-2 rounded mb-2">
                <strong>관리자 메모:</strong> {r.admin_note}
              </div>
            )}
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div class="text-xs text-brand-sub">{new Date(r.created_at).toLocaleString('ko-KR')}</div>
              <div class="flex gap-2 contact-actions" data-id={r.id}>
                {r.status === 'pending' && (
                  <>
                    <button class="btn btn-primary text-xs" data-action="forward">
                      <i class="fas fa-paper-plane"></i> 강사에게 전달
                    </button>
                    <button class="btn btn-danger text-xs" data-action="reject">반려</button>
                  </>
                )}
                {r.status === 'forwarded' && (
                  <button class="btn btn-secondary text-xs" data-action="complete">완료 처리</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>,
    { title: '문의 관리' }
  );
});

app.post('/api/contacts/:id/action', async (c) => {
  const id = c.req.param('id');
  const { action, note } = await c.req.json();
  if (action === 'forward') {
    await c.env.DB.prepare(`UPDATE contact_requests SET status='forwarded', admin_note=?, forwarded_at=CURRENT_TIMESTAMP WHERE id=?`).bind(note || null, id).run();
  } else if (action === 'reject') {
    await c.env.DB.prepare(`UPDATE contact_requests SET status='rejected', admin_note=? WHERE id=?`).bind(note || null, id).run();
  } else if (action === 'complete') {
    await c.env.DB.prepare(`UPDATE contact_requests SET status='completed' WHERE id=?`).bind(id).run();
  }
  return c.json({ ok: true });
});

// ============================================
// 상담 로그
// ============================================
app.get('/consultations', async (c) => {
  const rows = await c.env.DB.prepare(
    `SELECT * FROM consultations ORDER BY created_at DESC LIMIT 100`
  ).all<any>();
  const list = rows.results || [];

  return c.render(
    <AdminLayout active="consultations">
      <h1 class="text-2xl font-bold mb-6">상담 로그</h1>
      <div class="space-y-3">
        {list.length === 0 ? (
          <div class="bg-white border border-slate-200 rounded-xl p-12 text-center text-brand-sub">
            아직 상담 기록이 없습니다.
          </div>
        ) : list.map((r: any) => (
          <details class="bg-white border border-slate-200 rounded-xl">
            <summary class="p-4 cursor-pointer flex items-center justify-between">
              <div>
                <div class="font-medium text-sm">
                  {r.industry || '-'} · {r.job_role || '-'} · {r.ai_experience || '-'}
                </div>
                <div class="text-xs text-brand-sub mt-0.5">{r.goal || '-'}</div>
              </div>
              <div class="text-xs text-brand-sub">{new Date(r.created_at).toLocaleString('ko-KR')}</div>
            </summary>
            <div class="p-4 border-t border-slate-200 space-y-2 text-sm">
              {r.pain_point && <div><strong>고민:</strong> {r.pain_point}</div>}
              {r.format_pref && <div><strong>형태:</strong> {r.format_pref}</div>}
              {r.budget && <div><strong>예산:</strong> {r.budget}</div>}
              {r.region && <div><strong>지역:</strong> {r.region}</div>}
              {r.generated_curriculum && (
                <div class="mt-3">
                  <strong>생성된 커리큘럼:</strong>
                  <pre class="bg-slate-50 p-3 rounded mt-1 text-xs whitespace-pre-wrap">{r.generated_curriculum}</pre>
                </div>
              )}
            </div>
          </details>
        ))}
      </div>
    </AdminLayout>,
    { title: '상담 로그' }
  );
});

// ============================================
// 컴포넌트
// ============================================
function AdminLayout({ active, children }: { active: string; children: any }) {
  const items = [
    { k: 'dashboard', l: '대시보드', icon: 'fa-gauge', href: '/admin/dashboard' },
    { k: 'instructors', l: '강사 관리', icon: 'fa-users', href: '/admin/instructors' },
    { k: 'contacts', l: '문의 관리', icon: 'fa-envelope', href: '/admin/contacts' },
    { k: 'consultations', l: '상담 로그', icon: 'fa-comments', href: '/admin/consultations' },
  ];
  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div class="grid lg:grid-cols-[220px_1fr] gap-6">
        <aside>
          <div class="bg-white rounded-xl border border-slate-200 p-3 sticky top-20">
            <div class="px-3 py-2 mb-2 text-xs font-bold text-brand-sub tracking-wider">관리자 메뉴</div>
            <nav class="space-y-1">
              {items.map(it => (
                <a href={it.href}
                   class={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm ${active === it.k ? 'bg-brand-primary text-white' : 'hover:bg-slate-50 text-brand-ink'}`}>
                  <i class={`fas ${it.icon} w-4 text-center`}></i>
                  {it.l}
                </a>
              ))}
              <button id="logout-btn" class="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-slate-50 text-brand-sub">
                <i class="fas fa-sign-out-alt w-4 text-center"></i>
                로그아웃
              </button>
            </nav>
          </div>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, highlight }: any) {
  const colors: any = {
    primary: 'from-brand-primary to-brand-secondary',
    accent: 'from-brand-accent to-brand-secondary',
    amber: 'from-amber-500 to-orange-500',
    emerald: 'from-emerald-500 to-green-600',
    rose: 'from-rose-500 to-red-600',
  };
  return (
    <div class={`bg-white rounded-xl border ${highlight ? 'border-amber-300' : 'border-slate-200'} p-5`}>
      <div class="flex items-center justify-between mb-2">
        <div class="text-xs text-brand-sub">{label}</div>
        <div class={`w-8 h-8 rounded-lg bg-gradient-to-br ${colors[color] || colors.primary} text-white flex items-center justify-center text-sm`}>
          <i class={`fas ${icon}`}></i>
        </div>
      </div>
      <div class="text-2xl font-bold">{value.toLocaleString()}</div>
    </div>
  );
}

function Section({ label, children }: any) {
  return (
    <div class="mb-5">
      <div class="text-xs font-semibold text-brand-sub mb-1.5">{label}</div>
      <div class="text-sm">{children}</div>
    </div>
  );
}

export default app;
