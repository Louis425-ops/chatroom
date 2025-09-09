import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import type { RegisterRequest, ApiResponse, User } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { username, password }: RegisterRequest = await request.json();

    if (!username || !password) {
      return NextResponse.json<ApiResponse<null>>({
        message: 'Username and password are required',
        code: 400,
        data: null,
      }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json<ApiResponse<null>>({
        message: 'Password must be at least 6 characters long',
        code: 400,
        data: null,
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json<ApiResponse<null>>({
        message: 'Username already exists',
        code: 409,
        data: null,
      }, { status: 409 });
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    
    // First user becomes root
    const userCount = await prisma.user.count();
    const isRoot = userCount === 0;

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        isRoot,
      },
      select: {
        id: true,
        username: true,
        isRoot: true,
        createdAt: true,
      },
    });

    return NextResponse.json<ApiResponse<User>>({
      message: 'User created successfully',
      code: 0,
      data: {
        ...user,
        id: user.id.toString(),
      },
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json<ApiResponse<null>>({
      message: 'Internal server error',
      code: 500,
      data: null,
    }, { status: 500 });
  }
}