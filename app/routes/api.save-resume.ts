import { getSupabaseAdmin } from "~/lib/supabaseAdmin.server";
import { verifyIdToken } from "~/lib/firebaseAdmin.server";

export async function action({ request }: { request: Request }) {
  if (request.method !== 'POST') {
  return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
  }
  try {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) return new Response(JSON.stringify({ error: 'Missing Authorization' }), { status: 401 });

    const decoded = await verifyIdToken(token);
    const uid = decoded.uid;

    const body = await request.json();
    const now = new Date().toISOString();

  const { data, error } = await getSupabaseAdmin()
      .from('resumes')
      .insert([
        {
          ...body,
          user_id: uid,
          created_at: now,
          updated_at: now,
        },
      ])
      .select()
      .single();

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });

  return new Response(JSON.stringify({ id: data.id }), { status: 200 });
  } catch (err: any) {
  return new Response(JSON.stringify({ error: err?.message || 'Save failed' }), { status: 500 });
  }
}
