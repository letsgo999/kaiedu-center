// KAIEDU 클라이언트 JS
(function () {
  'use strict';

  // ==========================================
  // Scroll Reveal (IntersectionObserver)
  // ==========================================
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    // IO 미지원: 즉시 표시
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  // ==========================================
  // Spotlight (mouse-tracking)
  // ==========================================
  document.querySelectorAll('.spotlight').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      el.style.setProperty('--mx', x + '%');
      el.style.setProperty('--my', y + '%');
    });
  });

  // ==========================================
  // Counter (숫자 카운트업)
  // ==========================================
  const counters = document.querySelectorAll('.counter');
  if (counters.length && 'IntersectionObserver' in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = parseInt(el.getAttribute('data-count') || '0', 10);
        const dur = 1200;
        const start = performance.now();
        const from = 0;
        function step(now) {
          const t = Math.min(1, (now - start) / dur);
          // easeOutCubic
          const eased = 1 - Math.pow(1 - t, 3);
          const v = Math.round(from + (target - from) * eased);
          el.textContent = v.toLocaleString();
          if (t < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        cio.unobserve(el);
      });
    }, { threshold: 0.4 });
    counters.forEach((el) => cio.observe(el));
  }

  // ==========================================
  // Tilt (3D 카드 기울기) — .tilt 요소
  // ==========================================
  document.querySelectorAll('.tilt').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateY(${px * 6}deg) rotateX(${-py * 6}deg) translateY(-2px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });

  // ==========================================
  // 토스트
  // ==========================================
  function toast(msg, type) {
    type = type || 'info';
    const el = document.createElement('div');
    el.className = 'toast toast-' + type;
    el.textContent = msg;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('toast-show'));
    setTimeout(() => {
      el.classList.remove('toast-show');
      setTimeout(() => el.remove(), 300);
    }, 3500);
  }
  window.kaieduToast = toast;

  // ==========================================
  // 모바일 메뉴
  // ==========================================
  const menuBtn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', () => menu.classList.toggle('hidden'));
  }

  // ==========================================
  // 글자 수 카운터
  // ==========================================
  document.querySelectorAll('[data-count]').forEach(span => {
    const name = span.getAttribute('data-count');
    const target = document.querySelector('[name="' + name + '"]');
    if (!target) return;
    const update = () => span.textContent = (target.value || '').length;
    target.addEventListener('input', update);
    update();
  });

  // ==========================================
  // 칩 선택기 (멀티)
  // ==========================================
  function setupChips(containerId, hiddenName) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const hidden = container.parentElement.querySelector('input[name="' + hiddenName + '"]');
    if (!hidden) return;

    let initial = [];
    try { initial = JSON.parse(hidden.value || '[]'); } catch {}
    container.querySelectorAll('.chip').forEach(chip => {
      const v = chip.getAttribute('data-value');
      if (initial.includes(v)) chip.classList.add('chip-selected');
      chip.addEventListener('click', () => {
        chip.classList.toggle('chip-selected');
        const selected = Array.from(container.querySelectorAll('.chip-selected'))
          .map(c => c.getAttribute('data-value'));
        hidden.value = JSON.stringify(selected);
      });
    });
  }
  setupChips('specialty-chips', 'specialty_tags');
  setupChips('audience-chips', 'target_audience');
  setupChips('edit-specialty-chips', 'specialty_tags');
  setupChips('edit-audience-chips', 'target_audience');

  // ==========================================
  // 강사 등록 다단계 폼
  // ==========================================
  const form = document.getElementById('instructor-form');
  if (form) {
    let currentStep = 1;
    const totalSteps = 4;
    const prevBtn = document.getElementById('prev-step');
    const nextBtn = document.getElementById('next-step');
    const submitBtn = document.getElementById('submit-btn');

    function showStep(n) {
      currentStep = n;
      form.querySelectorAll('.step-panel').forEach(p => {
        p.classList.toggle('hidden', parseInt(p.dataset.step) !== n);
      });
      document.querySelectorAll('[data-step-dot]').forEach(d => {
        const s = parseInt(d.dataset.stepDot);
        d.classList.remove('step-dot-active', 'step-dot-done');
        if (s < n) d.classList.add('step-dot-done');
        else if (s === n) d.classList.add('step-dot-active');
      });
      prevBtn.classList.toggle('hidden', n === 1);
      nextBtn.classList.toggle('hidden', n === totalSteps);
      submitBtn.classList.toggle('hidden', n !== totalSteps);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function validateStep(n) {
      if (n === 1) {
        const fields = ['name', 'region', 'email', 'bio_short'];
        for (const f of fields) {
          const el = form.querySelector('[name="' + f + '"]');
          if (!el || !el.value.trim()) {
            toast('필수 항목을 입력해주세요: ' + f, 'error');
            el && el.focus();
            return false;
          }
        }
        const email = form.querySelector('[name="email"]').value;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          toast('이메일 형식을 확인해주세요', 'error');
          return false;
        }
      }
      if (n === 2) {
        const tags = JSON.parse(form.querySelector('[name="specialty_tags"]').value || '[]');
        const aud = JSON.parse(form.querySelector('[name="target_audience"]').value || '[]');
        if (tags.length === 0) { toast('전문 분야를 1개 이상 선택해주세요', 'error'); return false; }
        if (aud.length === 0) { toast('강의 대상을 1개 이상 선택해주세요', 'error'); return false; }
        if (!form.querySelector('[name="lecture_format"]:checked')) {
          toast('강의 형태를 선택해주세요', 'error'); return false;
        }
      }
      if (n === 3) {
        const cs = form.querySelector('[name="career_summary"]').value.trim();
        if (!cs) { toast('경력 요약을 입력해주세요', 'error'); return false; }
      }
      return true;
    }

    nextBtn && nextBtn.addEventListener('click', () => {
      if (!validateStep(currentStep)) return;
      if (currentStep < totalSteps) showStep(currentStep + 1);
    });
    prevBtn && prevBtn.addEventListener('click', () => {
      if (currentStep > 1) showStep(currentStep - 1);
    });

    // 바이브 코딩 프로젝트 동적 추가
    const vibeContainer = document.getElementById('vibe-projects');
    const addVibeBtn = document.getElementById('add-vibe-btn');
    function vibeCard(idx, data) {
      data = data || {};
      const div = document.createElement('div');
      div.className = 'border border-slate-200 rounded-lg p-4 bg-slate-50 animate-fade-in';
      div.innerHTML = `
        <div class="flex justify-between items-center mb-3">
          <strong class="text-sm">프로젝트 #${idx + 1}</strong>
          <button type="button" class="text-rose-500 text-xs hover:underline" data-remove>삭제</button>
        </div>
        <div class="grid sm:grid-cols-2 gap-3">
          <input data-vibe="name" class="input-field" placeholder="앱/프로젝트 이름" value="${data.name || ''}" />
          <input data-vibe="tools" class="input-field" placeholder="사용 AI 도구 (예: Claude + Cursor)" value="${data.tools || ''}" />
        </div>
        <textarea data-vibe="desc" class="input-field mt-3" rows="2" maxlength="200" placeholder="간단 설명 (200자)">${data.desc || ''}</textarea>
        <div class="grid sm:grid-cols-2 gap-3 mt-3">
          <input data-vibe="url" type="url" class="input-field" placeholder="실행 URL (선택)" value="${data.url || ''}" />
          <input data-vibe="github" type="url" class="input-field" placeholder="GitHub/배포 링크 (선택)" value="${data.github || ''}" />
        </div>
      `;
      div.querySelector('[data-remove]').addEventListener('click', () => div.remove());
      return div;
    }
    addVibeBtn && addVibeBtn.addEventListener('click', () => {
      const idx = vibeContainer.children.length;
      vibeContainer.appendChild(vibeCard(idx));
    });

    // 제출
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validateStep(currentStep)) return;
      if (!form.querySelector('[name="agree"]').checked) {
        toast('개인정보 수집 동의가 필요합니다', 'error'); return;
      }
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span> 등록 중...';

      const fd = new FormData(form);
      const vibeProjects = [];
      vibeContainer.querySelectorAll('[data-vibe="name"]').forEach((nameEl) => {
        const card = nameEl.closest('div.border');
        const name = nameEl.value.trim();
        if (!name) return;
        vibeProjects.push({
          name,
          tools: card.querySelector('[data-vibe="tools"]').value.trim(),
          desc: card.querySelector('[data-vibe="desc"]').value.trim(),
          url: card.querySelector('[data-vibe="url"]').value.trim(),
          github: card.querySelector('[data-vibe="github"]').value.trim(),
        });
      });

      const payload = {
        name: fd.get('name'),
        region: fd.get('region'),
        email: fd.get('email'),
        phone: fd.get('phone'),
        bio_short: fd.get('bio_short'),
        specialty_tags: JSON.parse(fd.get('specialty_tags') || '[]'),
        target_audience: JSON.parse(fd.get('target_audience') || '[]'),
        lecture_format: fd.get('lecture_format'),
        career_summary: fd.get('career_summary'),
        portfolio_url: fd.get('portfolio_url'),
        sns_url: fd.get('sns_url'),
        fee_range: fd.get('fee_range'),
        fee_public: fd.get('fee_public') === '1',
        vibe_coding_projects: vibeProjects,
        agree: fd.get('agree') === 'on',
      };

      try {
        const r = await axios.post('/instructor/api/register', payload);
        if (r.data.ok) {
          form.outerHTML = `
            <div class="bg-white rounded-2xl border border-emerald-200 p-12 text-center">
              <i class="fas fa-circle-check text-5xl text-emerald-500 mb-4"></i>
              <h2 class="text-2xl font-bold mb-3">등록 신청이 완료되었습니다</h2>
              <p class="text-brand-sub mb-6">
                관리자 심사 후 승인되면 강사 목록에 노출됩니다.<br />
                보통 1~2 영업일이 소요됩니다.
              </p>
              <p class="text-sm text-brand-sub bg-slate-50 rounded-lg p-4 mb-6">
                <strong>프로필 수정 링크</strong> (이 주소를 보관해두시면 언제든 프로필을 수정할 수 있습니다):<br />
                <code class="text-xs break-all bg-white px-2 py-1 rounded mt-2 inline-block">${location.origin}${r.data.edit_link}</code>
              </p>
              <a href="/" class="btn btn-primary">메인으로</a>
            </div>
          `;
        } else {
          toast(r.data.error || '등록 실패', 'error');
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> 등록 신청';
        }
      } catch (err) {
        toast((err.response && err.response.data && err.response.data.error) || '서버 오류', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> 등록 신청';
      }
    });

    showStep(1);
  }

  // ==========================================
  // 강사 자가 수정 폼
  // ==========================================
  const editForm = document.getElementById('instructor-edit-form');
  if (editForm) {
    const editVibeContainer = document.getElementById('edit-vibe-projects');
    const editAddBtn = document.getElementById('edit-add-vibe-btn');
    let initialProjects = [];
    try { initialProjects = JSON.parse(editVibeContainer.dataset.initial || '[]'); } catch {}

    function editVibeCard(idx, data) {
      data = data || {};
      const div = document.createElement('div');
      div.className = 'border border-slate-200 rounded-lg p-4 bg-slate-50';
      div.innerHTML = `
        <div class="flex justify-between items-center mb-3">
          <strong class="text-sm">프로젝트 #${idx + 1}</strong>
          <button type="button" class="text-rose-500 text-xs hover:underline" data-remove>삭제</button>
        </div>
        <div class="grid sm:grid-cols-2 gap-3">
          <input data-vibe="name" class="input-field" placeholder="이름" value="${escapeAttr(data.name)}" />
          <input data-vibe="tools" class="input-field" placeholder="사용 AI 도구" value="${escapeAttr(data.tools)}" />
        </div>
        <textarea data-vibe="desc" class="input-field mt-3" rows="2" maxlength="200" placeholder="설명">${escapeText(data.desc)}</textarea>
        <div class="grid sm:grid-cols-2 gap-3 mt-3">
          <input data-vibe="url" type="url" class="input-field" placeholder="실행 URL" value="${escapeAttr(data.url)}" />
          <input data-vibe="github" type="url" class="input-field" placeholder="GitHub" value="${escapeAttr(data.github)}" />
        </div>
      `;
      div.querySelector('[data-remove]').addEventListener('click', () => div.remove());
      return div;
    }
    function escapeAttr(s) { return String(s || '').replace(/"/g, '&quot;'); }
    function escapeText(s) { return String(s || '').replace(/</g, '&lt;'); }

    initialProjects.forEach((p, i) => editVibeContainer.appendChild(editVibeCard(i, p)));
    editAddBtn && editAddBtn.addEventListener('click', () => {
      editVibeContainer.appendChild(editVibeCard(editVibeContainer.children.length));
    });

    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const token = editForm.dataset.token;
      const fd = new FormData(editForm);
      const vibe = [];
      editVibeContainer.querySelectorAll('[data-vibe="name"]').forEach((el) => {
        const card = el.closest('div.border');
        const name = el.value.trim();
        if (!name) return;
        vibe.push({
          name,
          tools: card.querySelector('[data-vibe="tools"]').value.trim(),
          desc: card.querySelector('[data-vibe="desc"]').value.trim(),
          url: card.querySelector('[data-vibe="url"]').value.trim(),
          github: card.querySelector('[data-vibe="github"]').value.trim(),
        });
      });
      const payload = {
        name: fd.get('name'),
        region: fd.get('region'),
        phone: fd.get('phone'),
        bio_short: fd.get('bio_short'),
        specialty_tags: JSON.parse(fd.get('specialty_tags') || '[]'),
        target_audience: JSON.parse(fd.get('target_audience') || '[]'),
        lecture_format: fd.get('lecture_format'),
        career_summary: fd.get('career_summary'),
        portfolio_url: fd.get('portfolio_url'),
        sns_url: fd.get('sns_url'),
        vibe_coding_projects: vibe,
      };
      try {
        const r = await axios.post('/instructor/api/edit/' + token, payload);
        if (r.data.ok) toast('프로필이 저장되었습니다', 'success');
        else toast(r.data.error, 'error');
      } catch (err) {
        toast('저장 실패', 'error');
      }
    });
  }

  // ==========================================
  // AI 커리큘럼 상담 챗봇
  // ==========================================
  const chat = document.getElementById('consult-chat');
  if (chat) {
    const cfgEl = document.getElementById('consult-config');
    const cfg = JSON.parse(cfgEl.textContent);
    const msgs = document.getElementById('chat-messages');
    const inputArea = document.getElementById('chat-input-area');
    const stepLabel = document.getElementById('step-label');
    const stepCount = document.getElementById('step-count');
    const progressBar = document.getElementById('progress-bar');

    const steps = [
      { key: 'industry', q: '안녕하세요! 한국인공지능교육센터 AI 상담사입니다. 먼저 어떤 분야에서 일하고 계세요?', type: 'choice', options: cfg.industries },
      { key: 'job_role', q: '직무가 어떻게 되세요?', type: 'choice', options: cfg.jobRoles },
      { key: 'ai_experience', q: 'AI 활용 경험이 어느 정도 되세요?', type: 'choice', options: cfg.aiLevels },
      { key: 'pain_point', q: '가장 해결하고 싶은 업무 고민이나 관심사를 자유롭게 적어주세요.', type: 'text', placeholder: '예: 보고서 작성에 너무 많은 시간이 듭니다. AI로 자동화하고 싶습니다.' },
      { key: 'goal', q: '교육 목표가 무엇인가요?', type: 'choice', options: cfg.eduGoals },
      { key: 'format_pref', q: '선호하는 교육 형태는?', type: 'choice', options: cfg.formats },
      { key: 'budget', q: '예산이나 일정이 있으시면 알려주세요. (선택사항, 없으면 "건너뛰기" 클릭)', type: 'text-optional', placeholder: '예: 5월 중 시작, 1인당 50만원 이내' },
    ];

    const answers = {};
    let stepIdx = 0;

    function addMsg(text, who) {
      const div = document.createElement('div');
      div.className = 'chat-msg chat-msg-' + who + ' animate-fade-in';
      div.textContent = text;
      msgs.appendChild(div);
      msgs.scrollTop = msgs.scrollHeight;
    }

    function updateProgress() {
      const pct = Math.round((stepIdx / steps.length) * 100);
      progressBar.style.width = pct + '%';
      stepCount.textContent = stepIdx + ' / ' + steps.length;
      stepLabel.textContent = stepIdx === 0 ? '시작' : stepIdx >= steps.length ? '완료' : 'STEP ' + stepIdx;
    }

    function renderInput() {
      inputArea.innerHTML = '';
      if (stepIdx >= steps.length) return;
      const s = steps[stepIdx];
      if (s.type === 'choice') {
        const wrap = document.createElement('div');
        wrap.className = 'flex flex-wrap gap-2';
        s.options.forEach(opt => {
          const btn = document.createElement('button');
          btn.className = 'chip';
          btn.textContent = opt;
          btn.addEventListener('click', () => answer(opt));
          wrap.appendChild(btn);
        });
        inputArea.appendChild(wrap);
      } else {
        const wrap = document.createElement('div');
        wrap.className = 'flex gap-2';
        const ta = document.createElement('input');
        ta.type = 'text';
        ta.className = 'input-field flex-1';
        ta.placeholder = s.placeholder || '';
        ta.addEventListener('keydown', e => {
          if (e.key === 'Enter') { e.preventDefault(); submit(); }
        });
        const btn = document.createElement('button');
        btn.className = 'btn btn-primary';
        btn.innerHTML = '<i class="fas fa-paper-plane"></i>';
        btn.addEventListener('click', submit);
        function submit() {
          const v = ta.value.trim();
          if (s.type === 'text' && !v) return;
          answer(v || '(없음)');
        }
        wrap.appendChild(ta);
        wrap.appendChild(btn);
        if (s.type === 'text-optional') {
          const skip = document.createElement('button');
          skip.className = 'btn btn-secondary';
          skip.textContent = '건너뛰기';
          skip.addEventListener('click', () => answer('(건너뛰기)'));
          wrap.appendChild(skip);
        }
        inputArea.appendChild(wrap);
        setTimeout(() => ta.focus(), 100);
      }
    }

    function answer(value) {
      const s = steps[stepIdx];
      answers[s.key] = value;
      addMsg(value, 'user');
      stepIdx++;
      updateProgress();
      if (stepIdx < steps.length) {
        setTimeout(() => {
          addMsg(steps[stepIdx].q, 'bot');
          renderInput();
        }, 400);
      } else {
        generateResult();
      }
    }

    async function generateResult() {
      inputArea.innerHTML = '';
      addMsg('답변 감사합니다! AI가 맞춤 커리큘럼을 설계하는 중입니다... (최대 30초)', 'bot');
      const loadingDiv = document.createElement('div');
      loadingDiv.className = 'chat-msg chat-msg-bot animate-fade-in';
      loadingDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Claude가 분석 중...';
      msgs.appendChild(loadingDiv);

      try {
        const r = await axios.post('/consult/api/generate', answers);
        loadingDiv.remove();
        if (!r.data.ok) {
          addMsg('⚠ ' + (r.data.error || '오류가 발생했습니다.'), 'bot');
          renderRetryButton();
          return;
        }
        renderResult(r.data);
      } catch (err) {
        loadingDiv.remove();
        const msg = (err.response && err.response.data && err.response.data.error) || '네트워크 오류';
        addMsg('⚠ ' + msg, 'bot');
        renderRetryButton();
      }
    }

    function renderRetryButton() {
      inputArea.innerHTML = '';
      const btn = document.createElement('button');
      btn.className = 'btn btn-primary';
      btn.innerHTML = '<i class="fas fa-rotate"></i> 다시 시도';
      btn.addEventListener('click', () => location.reload());
      inputArea.appendChild(btn);
    }

    function renderResult(data) {
      const resultDiv = document.createElement('div');
      resultDiv.className = 'chat-msg chat-msg-bot animate-fade-in';
      resultDiv.style.maxWidth = '100%';
      resultDiv.innerHTML = `
        <div class="prose-curriculum">${markdownToHtml(data.curriculum || '')}</div>
        ${data.instructors && data.instructors.length > 0 ? `
          <div class="mt-6 pt-6 border-t border-slate-200">
            <h3 class="font-bold text-base mb-3"><i class="fas fa-users text-brand-secondary"></i> 추천 강사 (${data.instructors.length}명)</h3>
            <div class="grid sm:grid-cols-${Math.min(data.instructors.length, 3)} gap-3">
              ${data.instructors.map(i => `
                <a href="/instructor/${i.id}" class="block p-3 border border-slate-200 rounded-lg hover:border-brand-secondary transition">
                  <div class="flex items-start justify-between mb-1">
                    <strong class="text-sm">${escapeHtml(i.name)}</strong>
                    ${i.is_vibe_coder ? '<span class="badge badge-vibe text-[10px]">바이브</span>' : ''}
                  </div>
                  <div class="text-[11px] text-brand-sub mb-1">${escapeHtml(i.region)}</div>
                  <div class="text-xs text-brand-ink line-clamp-2">${escapeHtml(i.bio_short)}</div>
                  <div class="text-[10px] text-brand-secondary mt-2">매칭 점수: ${i.match_score}</div>
                </a>
              `).join('')}
            </div>
          </div>
        ` : '<div class="mt-6 pt-6 border-t border-slate-200 text-sm text-brand-sub">현재 매칭되는 강사가 없습니다. 곧 더 많은 강사가 등록될 예정입니다.</div>'}
      `;
      msgs.appendChild(resultDiv);
      msgs.scrollTop = msgs.scrollHeight;

      inputArea.innerHTML = `
        <div class="flex gap-2 flex-wrap">
          <a href="/instructor/list" class="btn btn-primary"><i class="fas fa-users"></i> 모든 강사 보기</a>
          <button class="btn btn-secondary" onclick="location.reload()"><i class="fas fa-rotate"></i> 다시 상담</button>
        </div>
      `;
    }

    function escapeHtml(s) {
      return String(s || '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function markdownToHtml(md) {
      let html = escapeHtml(md);
      html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
      html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
      html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
      html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
      html = html.replace(/(<li>.*<\/li>\n?)+/g, m => '<ul>' + m + '</ul>');
      html = html.split('\n\n').map(p => {
        if (/^<(h[1-3]|ul|li)/.test(p.trim())) return p;
        return p.trim() ? '<p>' + p.replace(/\n/g, '<br>') + '</p>' : '';
      }).join('');
      return html;
    }

    // 시작
    setTimeout(() => {
      addMsg(steps[0].q, 'bot');
      renderInput();
      updateProgress();
    }, 200);
  }

  // ==========================================
  // 연락 신청 폼
  // ==========================================
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(contactForm);
      const payload = {
        instructor_id: contactForm.dataset.instructorId,
        requester_name: fd.get('requester_name'),
        requester_email: fd.get('requester_email'),
        requester_phone: fd.get('requester_phone'),
        requester_org: fd.get('requester_org'),
        message: fd.get('message'),
      };
      const btn = contactForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> 전송 중...';
      try {
        const r = await axios.post('/contact/api/submit', payload);
        if (r.data.ok) {
          contactForm.outerHTML = `
            <div class="bg-white rounded-2xl border border-emerald-200 p-12 text-center">
              <i class="fas fa-circle-check text-5xl text-emerald-500 mb-4"></i>
              <h2 class="text-2xl font-bold mb-3">의뢰 신청이 접수되었습니다</h2>
              <p class="text-brand-sub mb-6">
                한국인공지능교육센터에서 검토 후 강사에게 안전하게 전달해드립니다.<br />
                답변까지 1~3 영업일이 소요될 수 있습니다.
              </p>
              <a href="/instructor/list" class="btn btn-primary">강사 더 둘러보기</a>
            </div>
          `;
        } else {
          toast(r.data.error || '전송 실패', 'error');
          btn.disabled = false;
          btn.innerHTML = '<i class="fas fa-paper-plane"></i> 의뢰 신청 제출';
        }
      } catch (err) {
        toast('전송 실패', 'error');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> 의뢰 신청 제출';
      }
    });
  }

  // ==========================================
  // 관리자: 로그인
  // ==========================================
  const loginForm = document.getElementById('admin-login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(loginForm);
      const errEl = document.getElementById('login-error');
      errEl.classList.add('hidden');
      try {
        const r = await axios.post('/admin/api/login', { email: fd.get('email'), password: fd.get('password') });
        if (r.data.ok) location.href = '/admin/dashboard';
        else { errEl.textContent = r.data.error; errEl.classList.remove('hidden'); }
      } catch (err) {
        errEl.textContent = (err.response && err.response.data && err.response.data.error) || '로그인 실패';
        errEl.classList.remove('hidden');
      }
    });
  }

  // 로그아웃
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await axios.post('/admin/api/logout');
      location.href = '/admin/login';
    });
  }

  // ==========================================
  // 관리자: 강사 작업
  // ==========================================
  const instActions = document.getElementById('instructor-actions');
  if (instActions) {
    instActions.addEventListener('click', async (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      const id = instActions.dataset.id;
      let reason = null;
      if (action === 'reject') {
        reason = prompt('반려 사유를 입력하세요 (강사에게 전달됩니다):', '');
        if (reason === null) return;
      }
      if (action === 'delete' && !confirm('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;

      btn.disabled = true;
      try {
        const r = await axios.post('/admin/api/instructors/' + id + '/action', { action, reason });
        if (r.data.ok) {
          toast('처리 완료', 'success');
          setTimeout(() => {
            if (action === 'delete') location.href = '/admin/instructors';
            else location.reload();
          }, 600);
        } else toast(r.data.error || '실패', 'error');
      } catch (err) {
        toast('서버 오류', 'error');
      }
      btn.disabled = false;
    });
  }

  // ==========================================
  // 관리자: 문의 작업
  // ==========================================
  document.querySelectorAll('.contact-actions').forEach(el => {
    el.addEventListener('click', async (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      const id = el.dataset.id;
      let note = null;
      if (action === 'forward') {
        note = prompt('관리자 메모 (선택, 강사 전달 시 참고용):', '');
      } else if (action === 'reject') {
        note = prompt('반려 사유 (선택):', '');
        if (note === null) return;
      }
      btn.disabled = true;
      try {
        const r = await axios.post('/admin/api/contacts/' + id + '/action', { action, note });
        if (r.data.ok) {
          toast('처리 완료', 'success');
          setTimeout(() => location.reload(), 600);
        }
      } catch (err) {
        toast('서버 오류', 'error');
      }
    });
  });

})();
