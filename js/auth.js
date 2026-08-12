// ============================================================
// 인증 공통 모듈
// ============================================================
import { supabase } from './supabaseClient.js';

/** 이메일/비밀번호 로그인 */
export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

/** 로그아웃 */
export async function logout() {
  await supabase.auth.signOut();
  window.location.href = '/index.html';
}

/** 현재 로그인한 사용자의 profile(role, name, status) 조회 */
export async function getCurrentProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * 페이지 진입 가드.
 * requiredRole: 'admin' | 'seller' | null(로그인만 확인)
 * 조건 불충족 시 적절한 페이지로 리다이렉트하고 null 반환.
 * 통과 시 profile 객체 반환.
 */
export async function requireAuth(requiredRole = null) {
  const profile = await getCurrentProfile();

  if (!profile) {
    window.location.href = '/index.html';
    return null;
  }

  if (profile.status === 'inactive') {
    alert('비활성화된 계정입니다. 관리자에게 문의하세요.');
    await logout();
    return null;
  }

  if (requiredRole && profile.role !== requiredRole) {
    // 역할이 다르면 각자의 홈으로 리다이렉트
    window.location.href = profile.role === 'admin'
      ? '/admin/dashboard.html'
      : '/seller/dashboard.html';
    return null;
  }

  return profile;
}
