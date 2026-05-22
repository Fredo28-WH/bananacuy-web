import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServer = createClient(supabaseUrl, supabaseKey);

async function checkIsAdmin() {
  const cookieStore = await cookies();
  return !!cookieStore.get('admin_session')?.value;
}

// GET: Fetch semua order untuk Admin
export async function GET() {
  if (!(await checkIsAdmin())) {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
  }

  const { data, error } = await supabaseServer
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// POST: Buat order baru (Digunakan saat checkout cart)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { buyer_name, buyer_address, buyer_location, items, total_amount, payment_proof_url } = body;

    const { data, error } = await supabaseServer
      .from('orders')
      .insert([
        {
          buyer_name,
          buyer_address,
          buyer_location,
          items,
          total_amount,
          payment_proof_url,
          status: 'pending' // Status default
        }
      ])
      .select('id')
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, id: data.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal menyimpan pesanan' }, { status: 500 });
  }
}

// PATCH: Update status order (Oleh admin)
export async function PATCH(request: NextRequest) {
  if (!(await checkIsAdmin())) {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
  }

  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'ID dan status wajib diisi' }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal update status' }, { status: 500 });
  }
}
