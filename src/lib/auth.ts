import { hash, compare } from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from './prisma';
import type { User } from '@/types';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key');

export async function hashPassword(password: string) {
  return await hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return await compare(password, hashedPassword);
}

export async function signToken(payload: Record<string, unknown>) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return null;
    }

    const payload = await verifyToken(token);
    if (!payload || typeof payload.userId !== 'number') {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId as number },
      select: {
        id: true,
        username: true,
        isRoot: true,
        createdAt: true,
      },
    });

    return user ? {
      ...user,
      id: user.id.toString()
    } : null;
  } catch (error) {
    return null;
  }
}

export function setAuthCookie(token: string) {
  return {
    name: 'auth-token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  };
}