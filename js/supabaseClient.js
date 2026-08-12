// ============================================================
// Supabase 클라이언트 초기화
// Supabase 대시보드 > Project Settings > API 에서 값 복사해서 교체
// ============================================================
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://sqepujlwtpdsavavjvoq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZXB1amx3dHBkc2F2YXZqdm9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0NTg0ODgsImV4cCI6MjEwMTAzNDQ4OH0.RBKTXfa9vxFjyzCCKWciP0OCvMkmCGlbD0VI3aE_wFg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
