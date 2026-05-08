-- KAIEDU 초기 스키마 (D1 / SQLite)
-- 한국인공지능교육센터 AI 강사 풀 & 커리큘럼 매칭 플랫폼

-- ============================================
-- 1. 강사 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS instructors (
  id TEXT PRIMARY KEY,                       -- UUID
  name TEXT NOT NULL,                        -- 실명
  region TEXT NOT NULL,                      -- 시/도
  email TEXT NOT NULL UNIQUE,                -- 이메일 (UNIQUE)
  phone TEXT,                                -- 전화 (선택)
  specialty_tags TEXT NOT NULL DEFAULT '[]', -- JSON 배열 (전문분야 태그)
  target_audience TEXT NOT NULL DEFAULT '[]',-- JSON 배열 (강의 대상)
  lecture_format TEXT NOT NULL,              -- 온라인/오프라인/혼합
  career_summary TEXT NOT NULL,              -- 경력 요약 (~500자)
  resume_file_url TEXT,                      -- 이력서 파일 URL (R2)
  portfolio_url TEXT,                        -- 포트폴리오 URL
  vibe_coding_projects TEXT NOT NULL DEFAULT '[]', -- JSON 배열 (바이브 코딩)
  fee_range TEXT,                            -- 강의료 범위
  fee_public INTEGER NOT NULL DEFAULT 0,     -- 강의료 공개여부 (0/1)
  sns_url TEXT,                              -- SNS/유튜브
  bio_short TEXT NOT NULL,                   -- 자기소개 한 줄 (100자)
  status TEXT NOT NULL DEFAULT 'pending',    -- pending/approved/rejected
  reject_reason TEXT,                        -- 반려 사유
  is_vibe_coder INTEGER NOT NULL DEFAULT 0,  -- 바이브 코딩 배지 (0/1)
  edit_token TEXT,                           -- 매직 링크용 토큰
  edit_token_expires_at TEXT,                -- 토큰 만료 시각
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_instructors_status ON instructors(status);
CREATE INDEX IF NOT EXISTS idx_instructors_region ON instructors(region);
CREATE INDEX IF NOT EXISTS idx_instructors_is_vibe_coder ON instructors(is_vibe_coder);
CREATE INDEX IF NOT EXISTS idx_instructors_email ON instructors(email);

-- ============================================
-- 2. 상담 로그 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS consultations (
  id TEXT PRIMARY KEY,
  industry TEXT,
  job_role TEXT,
  ai_experience TEXT,
  pain_point TEXT,
  goal TEXT,
  format_pref TEXT,
  budget TEXT,
  region TEXT,                               -- 수요자 지역 (강사 매칭용)
  contact_email TEXT,                        -- 결과 발송용 (선택)
  generated_curriculum TEXT,                 -- AI 생성 커리큘럼 전문
  matched_instructor_ids TEXT DEFAULT '[]',  -- JSON 배열
  client_ip TEXT,                            -- 어뷰징 방지용
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_consultations_created_at ON consultations(created_at);
CREATE INDEX IF NOT EXISTS idx_consultations_client_ip ON consultations(client_ip);

-- ============================================
-- 3. 연락(문의) 신청 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS contact_requests (
  id TEXT PRIMARY KEY,
  instructor_id TEXT NOT NULL,
  requester_name TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  requester_phone TEXT,
  requester_org TEXT,                        -- 소속 기관/회사
  message TEXT NOT NULL,                     -- 의뢰 내용
  status TEXT NOT NULL DEFAULT 'pending',    -- pending/forwarded/rejected/completed
  admin_note TEXT,                           -- 관리자 메모
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  forwarded_at TEXT,
  FOREIGN KEY (instructor_id) REFERENCES instructors(id)
);

CREATE INDEX IF NOT EXISTS idx_contact_requests_instructor ON contact_requests(instructor_id);
CREATE INDEX IF NOT EXISTS idx_contact_requests_status ON contact_requests(status);

-- ============================================
-- 4. 관리자 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,               -- bcrypt 또는 PBKDF2 해시
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at TEXT
);

-- ============================================
-- 5. 관리자 세션 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS admin_sessions (
  id TEXT PRIMARY KEY,                       -- 세션 토큰
  admin_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES admins(id)
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON admin_sessions(admin_id);

-- ============================================
-- 6. 사이트 설정 테이블 (운영자가 조절 가능한 값)
-- ============================================
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
