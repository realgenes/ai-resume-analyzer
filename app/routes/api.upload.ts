import { getSupabaseAdmin, verifySupabaseToken } from "~/lib/supabaseAdmin.server";

export async function action({ request }: { request: Request }) {
  if (request.method !== 'POST') {
  return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
  }

  try {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) return new Response(JSON.stringify({ error: 'Missing Authorization' }), { status: 401 });

    const user = await verifySupabaseToken(token);
    const uid = user.id;

    const form = await request.formData();
    const bucket = String(form.get('bucket') || '').trim();
    const path = String(form.get('path') || '').trim();
    const file = form.get('file') as File | null;

    if (!bucket || !file) {
      return new Response(JSON.stringify({ error: 'bucket and file are required' }), { status: 400 });
    }

    const sanitizedName = path || `${Date.now()}-${file.name}`;
    const fullPath = `${uid}/${sanitizedName}`;
    const buf = Buffer.from(await file.arrayBuffer());

    const { data, error } = await getSupabaseAdmin().storage
      .from(bucket)
      .upload(fullPath, buf, {
        upsert: false,
        cacheControl: '3600',
        contentType: file.type || 'application/octet-stream',
      });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    return new Response(JSON.stringify({ path: data.path }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Upload failed' }), { status: 500 });
  }
}
