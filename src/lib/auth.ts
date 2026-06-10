// 관리자 인증 유틸
import type { Context } from 'hono';
import type { Bindings } from './types';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { generateToken, isoExpiresIn, hashPassword, verifyPassword, uuid } from './utils';

const SESSION_COOKIE = 'kaiedu_admin_session';
const SESSION_DURATION_MIN = 60 * 24 * 7; // 7일

export async function ensureAdminSeed(c: Context<{ Bindings: Bindings }>) {
  // 보안: 평문 fallback 제거. Cloudflare Secret에서만 주입받음.
  const email = c.env.ADMIN_EMAIL;
  const pwd = c.env.ADMIN_INITIAL_PASSWORD;

  // Secret이 미설정이면 시드 작업 자체를 스킵 (절대 평문 기본값 사용 금지)
  if (!email || !pwd) {
    console.warn('[auth] ADMIN_EMAIL / ADMIN_INITIAL_PASSWORD Secret 미설정 — admin seed skip');
    return;
  }

  // 최소 강도 검증 (12자 이상)
  if (pwd.length < 12) {
    console.warn('[auth] ADMIN_INITIAL_PASSWORD 너무 짧음 (12자 이상 권장) — 시드는 진행하나 즉시 변경 필요');
  }

  const existing = await c.env.DB.prepare(
    'SELECT id FROM admins WHERE email = ?'
  ).bind(email).first();

  if (!existing) {
    const hash = await hashPassword(pwd);
    await c.env.DB.prepare(
      'INSERT INTO admins (id, email, password_hash, name) VALUES (?, ?, ?, ?)'
    ).bind(uuid(), email, hash, '관리자').run();
  }
}

export async function loginAdmin(
  c: Context<{ Bindings: Bindings }>,
  email: string,
  password: string
): Promise<{ ok: boolean; error?: string }> {
  await ensureAdminSeed(c);
  const admin = await c.env.DB.prepare(
    'SELECT id, password_hash FROM admins WHERE email = ?'
  ).bind(email).first<{ id: string; password_hash: string }>();

  if (!admin) return { ok: false, error: '계정을 찾을 수 없습니다.' };
  const valid = await verifyPassword(password, admin.password_hash);
  if (!valid) return { ok: false, error: '비밀번호가 일치하지 않습니다.' };

  const token = generateToken();
  const expires = isoExpiresIn(SESSION_DURATION_MIN);
  await c.env.DB.prepare(
    'INSERT INTO admin_sessions (id, admin_id, expires_at) VALUES (?, ?, ?)'
  ).bind(token, admin.id, expires).run();

  await c.env.DB.prepare(
    'UPDATE admins SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).bind(admin.id).run();

  setCookie(c, SESSION_COOKIE, token, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    maxAge: SESSION_DURATION_MIN * 60,
  });
  return { ok: true };
}

export async function logoutAdmin(c: Context<{ Bindings: Bindings }>) {
  const token = getCookie(c, SESSION_COOKIE);
  if (token) {
    await c.env.DB.prepare('DELETE FROM admin_sessions WHERE id = ?').bind(token).run();
  }
  deleteCookie(c, SESSION_COOKIE, { path: '/' });
}

export async function getAdmin(c: Context<{ Bindings: Bindings }>): Promise<{ id: string; email: string } | null> {
  const token = getCookie(c, SESSION_COOKIE);
  if (!token) return null;
  const row = await c.env.DB.prepare(`
    SELECT a.id, a.email, s.expires_at
    FROM admin_sessions s JOIN admins a ON a.id = s.admin_id
    WHERE s.id = ?
  `).bind(token).first<{ id: string; email: string; expires_at: string }>();
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await c.env.DB.prepare('DELETE FROM admin_sessions WHERE id = ?').bind(token).run();
    return null;
  }
  return { id: row.id, email: row.email };
}

export async function requireAdmin(c: Context<{ Bindings: Bindings }>): Promise<Response | { id: string; email: string }> {
  const admin = await getAdmin(c);
  if (!admin) return c.redirect('/admin/login');
  return admin;
}
