// Edge Function: chỉ ADMIN mới gọi được AI. Khóa API nằm trong secrets, không nằm trong web.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
const origin = Deno.env.get('ALLOWED_ORIGIN') ?? '*';
const cors = { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
const out = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, 'content-type': 'application/json' } });
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } });
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return out({ error: 'Chưa đăng nhập' }, 401);
    const { data: adm } = await sb.from('admins').select('uid').maybeSingle();
    if (!adm) return out({ error: 'Không có quyền quản trị' }, 403);
    const { prompt } = await req.json();
    if (typeof prompt !== 'string' || prompt.length > 6000) return out({ error: 'Yêu cầu không hợp lệ' }, 400);
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'claude-sonnet-5-5', max_tokens: 8000, messages: [{ role: 'user', content: prompt + '\nChỉ trả JSON hợp lệ, không giải thích, không dùng ```.' }] }),
    });
    const j = await r.json();
    const t = (j.content?.[0]?.text ?? '').replace(/```json|```/g, '').trim();
    return out(JSON.parse(t));
  } catch (e) { return out({ error: String(e) }, 500); }
});
