import { Hono } from 'hono';
import type { Bindings } from '../lib/types';

const app = new Hono<{ Bindings: Bindings }>();

// 센터 소개
app.get('/about', (c) => {
  return c.render(
    <>
      {/* 다크 미니 히어로 */}
      <section class="hero-dark">
        <div class="orb orb-1" style="width:300px;height:300px;top:-60px;right:5%;"></div>
        <div class="orb orb-2" style="width:240px;height:240px;bottom:-100px;left:10%;"></div>
        <div class="orb orb-3" style="width:200px;height:200px;top:30%;right:30%;"></div>
        <div class="max-w-4xl mx-auto px-4 sm:px-6 pt-14 pb-16 sm:pt-20 sm:pb-20 animate-slide-up">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-medium text-slate-200 mb-6">
            <i class="fas fa-microchip text-[10px]"></i>
            ABOUT KAIEDU
          </div>
          <h1 class="font-display font-extrabold tracking-tight text-white text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">
            대한민국 AI 교육의<br />
            <span class="text-gradient-neon">표준을 설계합니다</span>
          </h1>
          <p class="mt-7 text-lg text-slate-300/90 leading-relaxed max-w-3xl">
            한국인공지능교육센터(KAIEDU)는 2025년 5월 설립된 신생 교육 매칭 플랫폼입니다.<br class="hidden sm:block" />
            AI 강의가 가능한 인력과 AI 교육이 필요한 기업·기관·개인을 연결하는<br class="hidden sm:block" />
            <span class="text-white">국내 최초의 통합 매칭 서비스</span>를 지향합니다.
          </p>
        </div>
        <div class="gradient-divider"></div>
      </section>

      <div class="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
        <section class="bg-white border border-slate-200 rounded-2xl p-8 mb-8 reveal shadow-sm">
          <div class="flex items-center gap-2 mb-5">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white">
              <i class="fas fa-bullseye text-sm"></i>
            </div>
            <h2 class="text-xl font-bold text-brand-ink">우리가 해결하는 문제</h2>
          </div>
          <p class="text-brand-ink leading-relaxed mb-5">
            정부 예산이 공격적으로 집행되고 있음에도 불구하고, 실질적으로 기업·기관에 파견할 수 있는
            훈련된 AI 강사 인력이 절대적으로 부족합니다. 기술 변화 속도가 너무 빨라 강사 스스로도
            최신 트렌드를 따라가기 어려운 상황입니다.
          </p>
          <div class="grid sm:grid-cols-2 gap-4 mt-6">
            <div class="relative p-5 rounded-xl bg-gradient-to-br from-brand-primary/5 to-brand-secondary/5 border border-brand-primary/10">
              <div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-brand-primary to-brand-secondary rounded-l-xl"></div>
              <div class="text-[11px] tracking-[0.2em] text-brand-secondary font-bold mb-1.5">SUPPLY · 공급 측</div>
              <p class="text-sm text-brand-ink leading-relaxed">AI 강의 가능 인력이 자신을 홍보하고 기관에 발견될 수 있는 채널 제공</p>
            </div>
            <div class="relative p-5 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-100">
              <div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-neon-cyan to-neon-blue rounded-l-xl"></div>
              <div class="text-[11px] tracking-[0.2em] text-neon-blue font-bold mb-1.5">DEMAND · 수요 측</div>
              <p class="text-sm text-brand-ink leading-relaxed">자신에게 맞는 커리큘럼과 강사를 한 번에 찾는 경험 제공</p>
            </div>
          </div>
        </section>

        <section class="bg-white border border-slate-200 rounded-2xl p-8 mb-8 reveal shadow-sm">
          <div class="flex items-center gap-2 mb-6">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-blue flex items-center justify-center text-white">
              <i class="fas fa-star text-sm"></i>
            </div>
            <h2 class="text-xl font-bold text-brand-ink">차별화 포인트</h2>
          </div>
          <div class="space-y-5">
            <Diff num="01" title="AI 전문 강사 특화">
              범용 튜터 플랫폼이 아닌, AI 교육에만 집중한 국내 유일의 매칭 서비스
            </Diff>
            <Diff num="02" title="바이브 코딩 포트폴리오 섹션">
              실제로 AI 도구로 앱·서비스를 만들어본 강사를 별도 검증·표시하는 국내 최초 시스템
            </Diff>
            <Diff num="03" title="AI 챗봇 기반 커리큘럼 자동 생성">
              Claude API를 활용해 수요자 상황에 맞는 학습 로드맵을 즉시 생성
            </Diff>
            <Diff num="04" title="실시간 트렌드 반영">
              최신 LLM과 직접 연동되어 빠르게 변하는 AI 트렌드를 자동으로 커리큘럼에 반영
            </Diff>
          </div>
        </section>

        <section class="relative rounded-3xl overflow-hidden bg-ink-900 p-10 sm:p-12 reveal">
          <div class="orb orb-1" style="top:-100px;right:-50px;width:280px;height:280px;"></div>
          <div class="orb orb-3" style="bottom:-80px;left:20%;width:200px;height:200px;"></div>
          <div class="relative">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-[11px] font-medium text-neon-cyan mb-5">
              <span class="live-dot" style="background:#00D9FF"></span>
              BETA · 100% FREE
            </div>
            <h2 class="text-2xl sm:text-3xl font-bold mb-4 text-white tracking-tight">함께 만들어갑니다</h2>
            <p class="text-slate-300 leading-relaxed mb-7 max-w-2xl">
              베타 기간 동안 강사 등록과 커리큘럼 상담 모두 100% 무료로 제공합니다.<br class="hidden sm:block" />
              여러분의 참여가 곧 대한민국 AI 교육 생태계의 표준이 됩니다.
            </p>
            <div class="flex flex-wrap gap-3">
              <a href="/instructor/register" class="btn btn-neon">
                <i class="fas fa-user-plus"></i> 강사로 참여하기
              </a>
              <a href="/consult" class="btn btn-glass">
                <i class="fas fa-comments"></i> 상담 시작하기
              </a>
            </div>
          </div>
        </section>
      </div>
    </>,
    { title: '센터 소개', currentPath: '/about' }
  );
});

function Diff({ num, title, children }: any) {
  return (
    <div class="flex gap-5 group">
      <div class="shrink-0">
        <div class="text-gradient-neon font-extrabold text-2xl tracking-tight w-14">{num}</div>
        <div class="h-px w-10 bg-gradient-to-r from-neon-cyan to-transparent mt-2 group-hover:w-14 transition-all"></div>
      </div>
      <div>
        <div class="font-bold mb-1.5 text-brand-ink">{title}</div>
        <p class="text-sm text-brand-sub leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

// 이용약관
app.get('/legal/terms', (c) => {
  return c.render(
    <div class="max-w-3xl mx-auto px-4 sm:px-6 py-12 prose-curriculum">
      <h1 class="text-3xl font-bold mb-2">이용약관</h1>
      <p class="text-sm text-brand-sub mb-8">시행일: 2025년 5월 1일</p>
      <div class="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-5 text-sm leading-relaxed">
        <section>
          <h2 class="font-bold mb-2">제1조 (목적)</h2>
          <p>본 약관은 한국인공지능교육센터(이하 "센터")가 운영하는 kaiedu.center 플랫폼(이하 "서비스")을 이용함에 있어
          센터와 회원의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.</p>
        </section>
        <section>
          <h2 class="font-bold mb-2">제2조 (용어의 정의)</h2>
          <p>"강사"란 본 서비스에 자신의 프로필을 등록하고 강의 의뢰를 받고자 하는 개인을 말합니다.
          "수요자"란 AI 교육이 필요한 개인 또는 기관을 말합니다.</p>
        </section>
        <section>
          <h2 class="font-bold mb-2">제3조 (서비스의 제공)</h2>
          <p>센터는 강사 프로필 게시, AI 기반 커리큘럼 추천, 강사 매칭 중개 등의 서비스를 제공합니다.
          베타 기간 동안 모든 서비스는 무료로 제공됩니다.</p>
        </section>
        <section>
          <h2 class="font-bold mb-2">제4조 (강사의 의무)</h2>
          <p>강사는 본인의 실명과 진실된 경력 정보를 제공해야 하며, 허위 사실 등록 시 등록이 거부되거나 사후 삭제될 수 있습니다.</p>
        </section>
        <section>
          <h2 class="font-bold mb-2">제5조 (의뢰 중개)</h2>
          <p>수요자의 강사 의뢰는 센터의 검토를 거쳐 강사에게 전달됩니다. 센터는 강의 계약 자체의 당사자가 아니며,
          강의 품질·내용·금전 거래에 대한 직접적 책임을 지지 않습니다.</p>
        </section>
        <section>
          <h2 class="font-bold mb-2">제6조 (지적재산권)</h2>
          <p>강사가 등록한 포트폴리오·자료의 저작권은 강사 본인에게 귀속됩니다.
          센터는 서비스 운영 목적으로만 해당 자료를 게시·노출합니다.</p>
        </section>
        <section>
          <h2 class="font-bold mb-2">제7조 (면책)</h2>
          <p>센터는 천재지변, 시스템 장애, 제3자의 불법행위 등 센터의 통제 범위를 벗어난 사유로 인한 손해에 대해 책임을 지지 않습니다.</p>
        </section>
        <section>
          <h2 class="font-bold mb-2">제8조 (약관의 변경)</h2>
          <p>본 약관은 센터의 정책에 따라 변경될 수 있으며, 변경 시 사이트 내 공지를 통해 알립니다.</p>
        </section>
      </div>
    </div>,
    { title: '이용약관' }
  );
});

// 개인정보처리방침
app.get('/legal/privacy', (c) => {
  return c.render(
    <div class="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 class="text-3xl font-bold mb-2">개인정보처리방침</h1>
      <p class="text-sm text-brand-sub mb-8">시행일: 2025년 5월 1일</p>
      <div class="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-5 text-sm leading-relaxed">
        <section>
          <h2 class="font-bold mb-2">1. 수집하는 개인정보 항목</h2>
          <ul class="list-disc pl-5 space-y-1">
            <li>강사 등록 시: 이름, 이메일, 전화번호(선택), 활동 지역, 경력 정보, 포트폴리오</li>
            <li>의뢰 신청 시: 이름, 이메일, 전화번호(선택), 소속(선택), 의뢰 내용</li>
            <li>커리큘럼 상담 시: 업종, 직무, AI 경험 수준, 핵심 고민, 교육 목표 (식별정보 미수집)</li>
            <li>자동 수집: 접속 IP (어뷰징 방지 목적)</li>
          </ul>
        </section>
        <section>
          <h2 class="font-bold mb-2">2. 개인정보의 수집·이용 목적</h2>
          <ul class="list-disc pl-5 space-y-1">
            <li>강사 프로필 게시 및 매칭</li>
            <li>수요자-강사 간 의뢰 중개</li>
            <li>맞춤형 AI 커리큘럼 생성 (입력 정보는 Claude API에 전달됨)</li>
            <li>서비스 운영 통계 및 품질 개선</li>
          </ul>
        </section>
        <section>
          <h2 class="font-bold mb-2">3. 개인정보의 보유·이용 기간</h2>
          <ul class="list-disc pl-5 space-y-1">
            <li>강사 정보: 회원이 삭제 요청 시까지</li>
            <li>의뢰 신청 정보: 처리 완료 후 6개월</li>
            <li>상담 로그: 익명화 후 운영 통계 목적으로 보관</li>
          </ul>
        </section>
        <section>
          <h2 class="font-bold mb-2">4. 개인정보의 제3자 제공</h2>
          <p>센터는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만 다음의 경우는 예외로 합니다:</p>
          <ul class="list-disc pl-5 space-y-1 mt-2">
            <li>이용자가 사전에 동의한 경우 (예: 강사에게 의뢰자 정보 전달)</li>
            <li>법령의 규정에 의거한 경우</li>
          </ul>
        </section>
        <section>
          <h2 class="font-bold mb-2">5. 개인정보 처리 위탁</h2>
          <p>커리큘럼 생성을 위해 입력 정보는 Anthropic Inc.(Claude API)에 전송됩니다. 이름·이메일 등 개인 식별정보는 전송되지 않습니다.</p>
        </section>
        <section>
          <h2 class="font-bold mb-2">6. 이용자의 권리</h2>
          <p>이용자는 언제든 자신의 개인정보 열람·수정·삭제·처리정지를 요청할 수 있습니다. 강사의 경우 등록 시 발급된 매직 링크를 통해 직접 수정 가능합니다.</p>
        </section>
        <section>
          <h2 class="font-bold mb-2">7. 개인정보 보호책임자</h2>
          <ul class="list-none pl-0 space-y-1">
            <li>책임자: 최규문 (대표)</li>
            <li>이메일: letsgo999@gmail.com</li>
            <li>전화: 010-2216-8775</li>
          </ul>
        </section>
        <section>
          <h2 class="font-bold mb-2">8. 쿠키 사용</h2>
          <p>관리자 로그인 세션 유지에만 쿠키가 사용되며, 일반 이용자에게는 쿠키가 사용되지 않습니다.</p>
        </section>
      </div>
    </div>,
    { title: '개인정보처리방침' }
  );
});

export default app;
