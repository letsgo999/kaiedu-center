// KAIEDU 타입 정의

export type Bindings = {
  DB: D1Database;
  ANTHROPIC_API_KEY: string;
  ADMIN_EMAIL: string;
  ADMIN_INITIAL_PASSWORD: string;
  RESEND_API_KEY?: string;
  APP_BASE_URL: string;
}

export type Instructor = {
  id: string;
  name: string;
  region: string;
  email: string;
  phone?: string | null;
  specialty_tags: string[];
  target_audience: string[];
  lecture_format: string;
  career_summary: string;
  resume_file_url?: string | null;
  portfolio_url?: string | null;
  vibe_coding_projects: VibeCodingProject[];
  fee_range?: string | null;
  fee_public: boolean;
  sns_url?: string | null;
  bio_short: string;
  status: 'pending' | 'approved' | 'rejected';
  reject_reason?: string | null;
  is_vibe_coder: boolean;
  created_at: string;
  updated_at: string;
}

export type VibeCodingProject = {
  name: string;
  desc: string;
  tools: string;
  url?: string;
  github?: string;
}

export type Consultation = {
  id: string;
  industry?: string;
  job_role?: string;
  ai_experience?: string;
  pain_point?: string;
  goal?: string;
  format_pref?: string;
  budget?: string;
  region?: string;
  contact_email?: string;
  generated_curriculum?: string;
  matched_instructor_ids: string[];
  client_ip?: string;
  created_at: string;
}

export type ContactRequest = {
  id: string;
  instructor_id: string;
  requester_name: string;
  requester_email: string;
  requester_phone?: string;
  requester_org?: string;
  message: string;
  status: 'pending' | 'forwarded' | 'rejected' | 'completed';
  admin_note?: string;
  created_at: string;
  forwarded_at?: string;
}

// 전문 분야 태그 마스터
export const SPECIALTY_TAGS = [
  'ChatGPT 활용',
  '업무자동화',
  '프롬프트 엔지니어링',
  '이미지 생성 AI',
  '영상 AI',
  '데이터 분석',
  'AI 마케팅',
  '바이브 코딩',
  'AI 에이전트 개발',
  'LLM 파인튜닝',
  'RAG 시스템',
  'AI 챗봇 구축',
  '디지털 트랜스포메이션',
];

// 시/도 마스터
export const REGIONS = [
  '전국 원격', '서울', '경기', '인천', '강원', '충북', '충남', '대전',
  '세종', '전북', '전남', '광주', '경북', '경남', '대구', '울산', '부산', '제주'
];

// 강의 대상
export const TARGET_AUDIENCES = ['기업', '공공기관', '대학', '일반인'];

// 강의 형태
export const LECTURE_FORMATS = ['온라인', '오프라인', '혼합'];

// 업종
export const INDUSTRIES = ['제조', 'IT', '금융', '의료', '교육', '공공', '기타'];

// 직무
export const JOB_ROLES = ['마케팅', '인사', '기획', '영업', '개발', '관리', '기타'];

// AI 경험
export const AI_EXPERIENCE_LEVELS = ['전혀 없음', '가끔 써봄', '실무 활용 중'];

// 교육 목표
export const EDU_GOALS = ['업무 효율화', '직접 개발', '팀 교육', '취업·전직'];
