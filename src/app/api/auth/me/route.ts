import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('admin_session');

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Tidak ada session' },
        { status: 401 }
      );
    }

    const admin = JSON.parse(sessionCookie.value);

    return NextResponse.json({
      success: true,
      admin,
    });
  } catch (error) {
    console.error('[ME ERROR]:', error);
    return NextResponse.json(
      { error: 'Session tidak valid' },
      { status: 401 }
    );
  }
}
