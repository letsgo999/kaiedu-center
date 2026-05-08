-- KAIEDU 시드 데이터 (로컬 개발/데모용)

-- 사이트 기본 설정
INSERT OR REPLACE INTO site_settings (key, value) VALUES
  ('consultation_daily_limit_per_ip', '5'),
  ('claude_daily_call_limit', '500'),
  ('claude_daily_call_count', '0'),
  ('claude_daily_count_date', date('now'));

-- 데모 강사 데이터 (승인 상태)
INSERT OR IGNORE INTO instructors (
  id, name, region, email, phone,
  specialty_tags, target_audience, lecture_format,
  career_summary, bio_short,
  vibe_coding_projects, is_vibe_coder,
  status, created_at, updated_at
) VALUES
(
  'demo-001', '김지훈', '서울', 'kim.demo@example.com', '010-0000-0001',
  '["ChatGPT 활용","업무자동화","프롬프트 엔지니어링"]',
  '["기업","공공기관"]',
  '혼합',
  '대기업 HRD 부서에서 5년간 AI 교육을 담당했으며, 삼성·LG·현대 등 대기업 임직원 대상 ChatGPT 활용 교육 200회 이상 진행. 실무 자동화 사례 중심의 강의를 제공합니다.',
  '실무 자동화 200건 경험, 대기업 임직원 교육 전문',
  '[]', 0,
  'approved', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
  'demo-002', '박서연', '경기', 'park.demo@example.com', '010-0000-0002',
  '["바이브 코딩","AI 에이전트 개발","RAG 시스템"]',
  '["기업","대학","일반인"]',
  '온라인',
  '바이브 코딩 얼리어답터로서 직접 12개 이상의 AI 앱을 출시한 경험. Claude/ChatGPT/Cursor를 활용한 노코드+AI 개발 강의 진행 중. 실전 프로젝트 기반 교육이 강점.',
  '바이브 코딩 12개 앱 출시, 실전 프로젝트 기반',
  '[{"name":"AI 회의록 요약기","desc":"실시간 회의 음성을 받아 자동 요약","tools":"Claude API + Whisper","url":"https://example.com/demo1"},{"name":"고객 응대 챗봇","desc":"중소기업용 고객 응대 자동화","tools":"OpenAI + RAG","url":"https://example.com/demo2"}]',
  1,
  'approved', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
  'demo-003', '이수진', '부산', 'lee.demo@example.com', '010-0000-0003',
  '["이미지 생성 AI","영상 AI","AI 마케팅"]',
  '["기업","일반인"]',
  '오프라인',
  '디자인 에이전시 출신으로 Midjourney·Stable Diffusion·Runway 등 생성형 비주얼 AI 도구를 활용한 마케팅 콘텐츠 제작 교육에 특화. 부산·경남권 중심으로 활동.',
  '디자인 에이전시 출신, 비주얼 AI 마케팅 전문',
  '[]', 0,
  'approved', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);
