import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import type { ApiResponse, User } from '@/types';

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json<ApiResponse<null>>({
        message: 'Not authenticated',
        code: 401,
        data: null,
      }, { status: 401 });
    }

    return NextResponse.json<ApiResponse<User>>({
      message: 'User retrieved successfully',
      code: 0,
      data: user,
    });

  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json<ApiResponse<null>>({
      message: 'Internal server error',
      code: 500,
      data: null,
    }, { status: 500 });
  }
}