import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('admin_session');

    console.log('[LOGOUT] Success');

    return NextResponse.json({
      success: true,
      message: 'Logout berhasil',
    });
  } catch (error) {
    console.error('[LOGOUT ERROR]:', error);
    return NextResponse.json(
      { error: 'Gagal logout' },
      { status: 500 }
    );
  }
}
