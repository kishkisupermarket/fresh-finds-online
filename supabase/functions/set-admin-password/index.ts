import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data, error } = await supabase.auth.admin.updateUserById(
    '10921952-ba8d-419a-9146-b58f342ceb66',
    { password: '123456789' }
  )

  return new Response(JSON.stringify({ data, error }), {
    headers: { 'Content-Type': 'application/json' },
    status: error ? 500 : 200,
  })
})
