// ============================================================
// Edge Function: manage-users
// 관리자/판매자 계정 생성·삭제 (service role key 사용, 서버에서만 실행)
// ============================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('인증 정보가 없습니다');

    // 호출자가 로그인된 사용자인지 확인
    const callerClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await callerClient.auth.getUser();
    if (userErr || !user) throw new Error('인증 실패');

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // 호출자가 관리자인지 확인 (판매자는 이 기능 사용 불가)
    const { data: callerProfile } = await admin.from('profiles').select('role').eq('id', user.id).single();
    if (callerProfile?.role !== 'admin') throw new Error('관리자만 사용할 수 있습니다');

    const body = await req.json();
    const { action } = body;

    if (action === 'create') {
      const { email, password, name, phone, role } = body;
      if (!['admin', 'seller'].includes(role)) throw new Error('잘못된 role 입니다');
      if (!email || !password || !name) throw new Error('이메일, 비밀번호, 이름은 필수입니다');

      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (createErr) throw createErr;

      const { error: profileErr } = await admin.from('profiles').insert({
        id: created.user.id,
        role,
        name,
        phone: phone || null,
        status: 'active',
      });
      if (profileErr) {
        await admin.auth.admin.deleteUser(created.user.id); // 실패 시 롤백
        throw profileErr;
      }

      return new Response(JSON.stringify({ id: created.user.id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'delete') {
      const { userId } = body;
      if (!userId) throw new Error('userId가 필요합니다');
      if (userId === user.id) throw new Error('본인 계정은 삭제할 수 없습니다');

      const { error: delErr } = await admin.auth.admin.deleteUser(userId);
      if (delErr) throw delErr;
      // profiles 행은 FK on delete cascade로 자동 삭제됨

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('알 수 없는 action 입니다');
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
