import { createClient } from '@supabase/supabase-js';
import { compare } from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Buat Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseKey) {
      console.error('[LOGIN ERROR] Supabase URL atau Key tidak ditemukan di environment variables.');
      return NextResponse.json({ error: 'Konfigurasi server belum lengkap' }, { status: 500 });
    }

    const { username, password } = await request.json();

    // Validasi input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username dan password harus diisi' },
        { status: 400 }
      );
    }

    // Query admin dari Supabase
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .eq('is_active', true)
      .single();

    if (error || !admin) {
      console.log('[LOGIN] Admin tidak ditemukan:', username);
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    // Verifikasi password dengan bcrypt
    const passwordMatch = await compare(password, admin.password_hash);

    if (!passwordMatch) {
      console.log('[LOGIN] Password salah untuk:', username);
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    // Login berhasil! Buat session data
    const sessionData = {
      id: admin.id,
      username: admin.username,
      role: admin.role,
      loginTime: new Date().toISOString(),
    };

    // Simpan session di HttpOnly cookie (lebih aman)
    const cookieStore = await cookies();
    cookieStore.set('admin_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 hari
      path: '/',
    });

    console.log('[LOGIN] Success untuk:', username);

    // Return user data (tanpa password)
    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('[LOGIN ERROR]:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat login' },
      { status: 500 }
    );
  }
}
