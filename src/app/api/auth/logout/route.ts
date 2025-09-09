import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';

export async function POST() {
  try {
    const response = NextResponse.json<ApiResponse<null>>({
      message: 'Logged out successfully',
      code: 0,
      data: null,
    });

    // Clear auth cookie
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json<ApiResponse<null>>({
      message: 'Internal server error',
      code: 500,
      data: null,
    }, { status: 500 });
  }
}