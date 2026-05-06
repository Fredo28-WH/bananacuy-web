import { createClient } from '@supabase/supabase-js';
import { hash } from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper untuk cek apakah user yang request adalah superadmin
async function checkIsSuperAdmin() {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get('admin_session')?.value;
  
  if (!sessionValue) return false;
  
  try {
    const session = JSON.parse(sessionValue);
    return session.role === 'superadmin';
  } catch {
    return false;
  }
}

// GET: List semua admin
export async function GET() {
  if (!(await checkIsSuperAdmin())) {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
  }

  const { data, error } = await supabase
    .from('admins')
    .select('id, username, role, is_active, created_at')
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// POST: Tambah admin baru
export async function POST(request: NextRequest) {
  if (!(await checkIsSuperAdmin())) {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
  }

  const { username, password, role } = await request.json();

  if (!username || !password) {
    return NextResponse.json({ error: 'Username dan password wajib diisi' }, { status: 400 });
  }

  try {
    // Hash password dengan bcrypt
    const password_hash = await hash(password, 10);
    
    const { data, error } = await supabase
      .from('admins')
      .insert([
        { 
          username, 
          password_hash, 
          role: role || 'admin' 
        }
      ])
      .select('id, username, role')
      .single();

    if (error) throw error;
    
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal membuat admin' }, { status: 500 });
  }
}

// PUT: Update password admin
export async function PUT(request: NextRequest) {
  if (!(await checkIsSuperAdmin())) {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
  }

  const { id, newPassword } = await request.json();

  if (!id || !newPassword) {
    return NextResponse.json({ error: 'ID admin dan password baru wajib diisi' }, { status: 400 });
  }

  try {
    const password_hash = await hash(newPassword, 10);
    
    const { error } = await supabase
      .from('admins')
      .update({ password_hash })
      .eq('id', id);

    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal update admin' }, { status: 500 });
  }
}

// DELETE: Hapus admin
export async function DELETE(request: NextRequest) {
  if (!(await checkIsSuperAdmin())) {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID admin wajib diisi' }, { status: 400 });
  }

  const { error } = await supabase
    .from('admins')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
