// Claude API 호출 모듈
import type { Bindings } from './types';

const CLAUDE_MODEL = 'claude-sonnet-4-20250514';
const CLAUDE_API = 'https://api.anthropic.com/v1/messages';

const SYSTEM_PROMPT = `당신은 한국인공지능교육센터(KAIEDU)의 AI 교육 커리큘럼 전문가입니다.
사용자의 업종, 직무, AI 경험 수준, 핵심 고민, 교육 목표를 바탕으로 실무 중심의 맞춤형 AI 교육 커리큘럼을 설계합니다.

반드시 한국어로 응답하고, 아래 마크다운 형식을 정확히 따르세요:

## 📚 [커리큘럼 제목]

**학습 기간**: [총 기간 및 시간]

### 🎯 주차별 학습 로드맵

**1주차: [주제]**
- 학습 목표: ...
- 추천 도구: ...

**2주차: [주제]**
- 학습 목표: ...
- 추천 도구: ...

(4~8주 분량)

### 🛠 추천 AI 도구
- 도구1: 사용 목적
- 도구2: 사용 목적

### ✨ 기대 성과
- 구체적이고 측정 가능한 성과 3~5개

### 🔑 핵심 키워드
[강사 매칭에 사용할 전문분야 키워드 3~5개를 콤마로 구분해 마지막 줄에 출력]
KEYWORDS: 키워드1, 키워드2, 키워드3
`;

export type CurriculumInput = {
  industry?: string;
  job_role?: string;
  ai_experience?: string;
  pain_point?: string;
  goal?: string;
  format_pref?: string;
  budget?: string;
};

export async function generateCurriculum(env: Bindings, input: CurriculumInput): Promise<{
  ok: boolean;
  curriculum?: string;
  keywords?: string[];
  error?: string;
}> {
  if (!env.ANTHROPIC_API_KEY) {
    return { ok: false, error: 'Anthropic API 키가 설정되지 않았습니다.' };
  }

  const userPrompt = `업종: ${input.industry || '미지정'}
직무: ${input.job_role || '미지정'}
AI 경험: ${input.ai_experience || '미지정'}
핵심 고민: ${input.pain_point || '미지정'}
교육 목표: ${input.goal || '미지정'}
선호 형태: ${input.format_pref || '미지정'}
예산: ${input.budget || '미지정'}

위 정보를 바탕으로 이 사용자에게 가장 적합한 AI 교육 커리큘럼을 설계해주세요.`;

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 30000);

    const res = await fetch(CLAUDE_API, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      signal: ctrl.signal,
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });
    clearTimeout(timer);

    if (!res.ok) {
      const errText = await res.text();
      return { ok: false, error: `Claude API 오류 (${res.status}): ${errText.slice(0, 200)}` };
    }

    const data: any = await res.json();
    const text: string = data.content?.[0]?.text || '';
    if (!text) return { ok: false, error: '응답이 비어 있습니다.' };

    const keywordsMatch = text.match(/KEYWORDS:\s*(.+?)(?:\n|$)/);
    const keywords = keywordsMatch
      ? keywordsMatch[1].split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const curriculum = text.replace(/KEYWORDS:\s*.+?(?:\n|$)/, '').trim();
    return { ok: true, curriculum, keywords };
  } catch (e: any) {
    if (e.name === 'AbortError') return { ok: false, error: '응답 시간 초과 (30초). 잠시 후 다시 시도해주세요.' };
    return { ok: false, error: e.message || '알 수 없는 오류' };
  }
}

// 강사 매칭 점수 계산
export function matchInstructors(
  curriculumKeywords: string[],
  instructors: any[],
  preferredRegion?: string
): any[] {
  const scored = instructors.map(inst => {
    let tags: string[] = [];
    try { tags = JSON.parse(inst.specialty_tags || '[]'); } catch {}

    let score = 0;
    for (const kw of curriculumKeywords) {
      for (const tag of tags) {
        if (tag.includes(kw) || kw.includes(tag)) {
          score += 10;
          break;
        }
      }
    }
    if (inst.is_vibe_coder === 1) score += 20;
    if (preferredRegion && (inst.region === preferredRegion || inst.region === '전국 원격')) {
      score += 5;
    }

    return { ...inst, match_score: score };
  });

  return scored
    .filter(s => s.match_score > 0)
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 3);
}
