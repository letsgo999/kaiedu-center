import { Hono } from 'hono';
import type { Bindings } from '../lib/types';
import { uuid, isEmail } from '../lib/utils';

const app = new Hono<{ Bindings: Bindings }>();

// 연락 신청 폼 페이지
app.get('/:instructorId', async (c) => {
  const id = c.req.param('instructorId');
  const inst = await c.env.DB.prepare(
    `SELECT id, name, region, bio_short FROM instructors WHERE id = ? AND status = 'approved'`
  ).bind(id).first<any>();
  if (!inst) return c.notFound();

  return c.render(
    <div class="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <a href={`/instructor/${id}`} class="inline-flex items-center gap-2 text-sm text-brand-sub hover:text-brand-primary mb-6">
        <i class="fas fa-arrow-left"></i> 강사 프로필로
      </a>

      <div class="mb-8">
        <h1 class="text-3xl font-bold mb-2">강사 의뢰 신청</h1>
        <div class="bg-brand-bg border border-slate-200 rounded-xl p-4 mt-4">
          <div class="text-xs text-brand-sub mb-1">의뢰 대상 강사</div>
          <div class="font-bold text-lg">{inst.name}</div>
          <div class="text-sm text-brand-sub">{inst.region} · {inst.bio_short}</div>
        </div>
      </div>

      <form id="contact-form" class="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5"
            data-instructor-id={inst.id}>
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="label label-req">이름</label>
            <input type="text" name="requester_name" class="input-field" required />
          </div>
          <div>
            <label class="label label-req">이메일</label>
            <input type="email" name="requester_email" class="input-field" required />
          </div>
          <div>
            <label class="label">전화번호</label>
            <input type="tel" name="requester_phone" class="input-field" placeholder="010-0000-0000" />
          </div>
          <div>
            <label class="label">소속 (회사/기관)</label>
            <input type="text" name="requester_org" class="input-field" placeholder="○○주식회사 / ○○대학교" />
          </div>
        </div>
        <div>
          <label class="label label-req">의뢰 내용</label>
          <textarea name="message" class="input-field" rows={6} placeholder="원하시는 강의 주제, 대상, 일정, 예산 등을 자유롭게 작성해주세요." required></textarea>
        </div>

        <div class="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
          <strong>안내:</strong> 의뢰 신청은 한국인공지능교육센터가 검토 후 강사에게 안전하게 전달됩니다.
          답변까지 1~3 영업일이 소요될 수 있습니다.
        </div>

        <label class="flex items-start gap-2 text-sm cursor-pointer">
          <input type="checkbox" required class="mt-1" />
          <span>개인정보 수집·이용에 동의합니다. (의뢰 처리 목적, 수집 후 6개월 보관)</span>
        </label>

        <button type="submit" class="btn btn-primary w-full text-base py-3.5">
          <i class="fas fa-paper-plane"></i> 의뢰 신청 제출
        </button>
      </form>
    </div>,
    { title: '의뢰 신청', currentPath: '/contact' }
  );
});

// 연락 신청 API
app.post('/api/submit', async (c) => {
  try {
    const body = await c.req.json();
    const { instructor_id, requester_name, requester_email, requester_phone, requester_org, message } = body;

    if (!instructor_id || !requester_name || !requester_email || !message) {
      return c.json({ ok: false, error: '필수 항목이 누락되었습니다.' }, 400);
    }
    if (!isEmail(requester_email)) {
      return c.json({ ok: false, error: '올바른 이메일 형식이 아닙니다.' }, 400);
    }

    const inst = await c.env.DB.prepare(
      `SELECT id FROM instructors WHERE id = ? AND status = 'approved'`
    ).bind(instructor_id).first();
    if (!inst) return c.json({ ok: false, error: '존재하지 않는 강사입니다.' }, 404);

    const id = uuid();
    await c.env.DB.prepare(`
      INSERT INTO contact_requests (
        id, instructor_id, requester_name, requester_email,
        requester_phone, requester_org, message, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `).bind(
      id, instructor_id, requester_name, requester_email,
      requester_phone || null, requester_org || null, message
    ).run();

    return c.json({ ok: true, id });
  } catch (e: any) {
    return c.json({ ok: false, error: e.message || '서버 오류' }, 500);
  }
});

export default app;
