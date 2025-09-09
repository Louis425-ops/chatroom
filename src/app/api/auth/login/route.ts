import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, signToken, setAuthCookie } from '@/lib/auth';
import type { LoginRequest, ApiResponse, AuthResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { username, password }: LoginRequest = await request.json();

    if (!username || !password) {
      return NextResponse.json<ApiResponse<null>>({
        message: 'Username and password are required',
        code: 400,
        data: null,
      }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json<ApiResponse<null>>({
        message: 'Invalid username or password',
        code: 401,
        data: null,
      }, { status: 401 });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json<ApiResponse<null>>({
        message: 'Invalid username or password',
        code: 401,
        data: null,
      }, { status: 401 });
    }

    // Create JWT token
    const token = await signToken({ 
      userId: user.id, 
      username: user.username,
      isRoot: user.isRoot 
    });

    // Prepare user data (without password)
    const userData = {
      id: user.id.toString(),
      username: user.username,
      isRoot: user.isRoot,
      createdAt: user.createdAt,
    };

    const response = NextResponse.json<ApiResponse<AuthResponse>>({
      message: 'Login successful',
      code: 0,
      data: {
        user: userData,
        token,
      },
    });

    // Set auth cookie
    const cookieOptions = setAuthCookie(token);
    response.cookies.set(cookieOptions);

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json<ApiResponse<null>>({
      message: 'Internal server error',
      code: 500,
      data: null,
    }, { status: 500 });
  }
}