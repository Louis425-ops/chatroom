import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import type { MessageAddArgs, ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json<ApiResponse<null>>({
        message: 'Authentication required',
        code: 401,
        data: null,
      }, { status: 401 });
    }

    const { roomId, content, sender }: MessageAddArgs = await request.json();

    if (!roomId || !content || !sender) {
      return NextResponse.json<ApiResponse<null>>({
        message: 'Room ID, content, and sender are required',
        code: 400,
        data: null,
      }, { status: 400 });
    }

    // Check if the sender matches the current user
    if (sender !== currentUser.username) {
      return NextResponse.json<ApiResponse<null>>({
        message: 'You can only send messages as yourself',
        code: 403,
        data: null,
      }, { status: 403 });
    }

    // Check if room exists
    const room = await prisma.room.findUnique({
      where: { id: parseInt(roomId) },
    });

    if (!room) {
      return NextResponse.json<ApiResponse<null>>({
        message: 'Room not found',
        code: 404,
        data: null,
      }, { status: 404 });
    }

    // Create the message with current timestamp
    await prisma.message.create({
      data: {
        content,
        sender,
        roomId: parseInt(roomId),
        time: Date.now(),
      },
    });

    return NextResponse.json<ApiResponse<null>>({
      message: 'Message sent successfully',
      code: 0,
      data: null,
    });

  } catch (error) {
    console.error('Message creation error:', error);
    return NextResponse.json<ApiResponse<null>>({
      message: 'Internal server error',
      code: 500,
      data: null,
    }, { status: 500 });
  }
}